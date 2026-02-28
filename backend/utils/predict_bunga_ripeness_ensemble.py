import os
import json
import sys
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


def validate_image_is_black_pepper(image_path):
    """
    Validate that the image actually contains a black pepper bunga.
    Uses color analysis to detect if image looks like a pepper plant.
    
    Returns: (is_valid, confidence, reason_if_invalid)
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False, 0, "Could not read image"
        
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        
        total_pixels = img.shape[0] * img.shape[1]
        
        # Count natural colors found in peppers
        red_pixels = (cv2.countNonZero(cv2.inRange(h, 0, 20)) + 
                     cv2.countNonZero(cv2.inRange(h, 160, 180)))
        green_pixels = cv2.countNonZero(cv2.inRange(h, 60, 100))
        yellow_pixels = cv2.countNonZero(cv2.inRange(h, 20, 40))
        
        # Pepper/bunga colors combined
        pepper_color_pixels = red_pixels + green_pixels + yellow_pixels
        pepper_color_ratio = pepper_color_pixels / total_pixels
        
        # Check if image has significant natural-looking colors
        if pepper_color_ratio < 0.10:
            return False, pepper_color_ratio, f"Image lacks natural pepper colors. Found only {pepper_color_ratio*100:.1f}% natural colors. This might not be a black pepper."
        
        # More refined skin detection - avoid false positives with red peppers
        # Real human skin: Hue 0-20°, Saturation 35-65%, Value 40-100%
        # Ripe peppers have much higher saturation (60-100%) and value (80-255%)
        skin_like = 0
        for i in range(len(h)):
            for j in range(len(h[0])):
                hue = h[i, j]
                sat = s[i, j]
                val = v[i, j]
                # More specific skin tone detection (lower saturation, lower value than peppers)
                if (hue < 20 or hue > 160) and (35 < sat < 65) and (50 < val < 150):
                    skin_like += 1
        
        skin_ratio = skin_like / total_pixels
        # Increased threshold to 30% since peppers naturally have red tones
        if skin_ratio > 0.30:
            return False, skin_ratio, f"Image appears to contain human skin ({skin_ratio*100:.1f}%). Please send an image of a black pepper bunga."
        
        return True, pepper_color_ratio, "Valid pepper image"
    
    except Exception as e:
        return False, 0, f"Validation error: {str(e)}"


def run_single_model_inference(model_path, image_path):
    """
    Run inference on a single YOLOv8 model.
    Returns: (ripeness, confidence, detection_count)
    """
    try:
        if not model_path.exists():
            return None, 0, 0
        
        model = YOLO(str(model_path))
        results = model.predict(image_path, conf=0.25, verbose=False)
        result = results[0]
        
        detections = result.boxes
        detection_count = len(detections) if detections is not None else 0
        
        if detection_count == 0:
            return None, 0, 0
        
        confidences = []
        ripe_count = 0
        unripe_count = 0
        
        for detection in detections:
            conf = float(detection.conf[0])
            cls = int(detection.cls[0])
            class_name = result.names[cls]
            confidences.append(conf)
            
            # Classify based on class name
            # 'Ripe' or 'RIPE' = ripe, anything else = unripe
            if class_name.upper() == 'RIPE':
                ripe_count += 1
            else:
                unripe_count += 1
        
        avg_confidence = np.mean(confidences)
        
        # Determine ripeness
        ripeness = 'Ripe' if ripe_count >= unripe_count else 'Unripe'
        confidence_percent = avg_confidence * 100
        
        return ripeness, confidence_percent, detection_count
    
    except Exception as e:
        print(f"Model inference error: {str(e)}", file=__import__('sys').stderr)
        return None, 0, 0


def predict_bunga_ripeness_ensemble(image_path):
    """
    Predict black pepper bunga ripeness using ensemble of v1 and v2 models.
    
    Process:
    1. Validate image is black pepper
    2. Load v1 and v2 models
    3. Run inference on both models
    4. Average confidence: (v1_conf + v2_conf) / 2
    5. Majority vote for ripeness
    6. Return ensemble result
    
    Returns: {
        success: bool,
        is_black_pepper: bool,
        ripeness: str ('Ripe', 'Unripe'),
        confidence: float (0-100),
        model_type: str,
        additional_info: str,
        all_predictions: dict,
        ensemble_details: dict
    }
    """
    try:
        # STEP 1: Validate that image is actually a black pepper
        is_valid_pepper, pepper_confidence, validation_reason = validate_image_is_black_pepper(image_path)
        if not is_valid_pepper:
            return {
                'error': validation_reason,
                'success': False,
                'is_black_pepper': False,
                'message': 'Image validation failed. Please ensure you\'re uploading a clear picture of black pepper bunga.'
            }
        
        # STEP 2: Setup model paths
        backend_dir = Path(__file__).parent.parent
        workspace_root = backend_dir.parent
        
        v1_model_path = workspace_root / 'ml_models' / 'ripebunga2' / 'bunga_ripeness_v1' / 'weights' / 'best.pt'
        v2_model_path = workspace_root / 'ml_models' / 'ripebunga2' / 'bunga_ripeness_v2' / 'weights' / 'best.pt'
        
        if not v1_model_path.exists() or not v2_model_path.exists():
            missing = []
            if not v1_model_path.exists():
                missing.append(f'v1: {v1_model_path}')
            if not v2_model_path.exists():
                missing.append(f'v2: {v2_model_path}')
            
            return {
                'error': f'Ensemble models not found: {", ".join(missing)}',
                'success': False,
                'is_black_pepper': False
            }
        
        # STEP 3: Run inference on both models
        ripeness_v1, conf_v1, det_v1 = run_single_model_inference(v1_model_path, image_path)
        ripeness_v2, conf_v2, det_v2 = run_single_model_inference(v2_model_path, image_path)
        
        # Check if at least one model detected something
        if det_v1 == 0 and det_v2 == 0:
            return {
                'error': 'No pepper bunches detected in image by any model',
                'success': False,
                'is_black_pepper': True,
                'message': 'Could not find any black pepper bunga. Please ensure the entire bunch is visible.'
            }
        
        # STEP 4: Ensemble logic - Average confidence & majority vote
        valid_confidences = []
        ripeness_votes = []
        
        if det_v1 > 0 and ripeness_v1 is not None:
            valid_confidences.append(conf_v1)
            ripeness_votes.append(ripeness_v1)
        
        if det_v2 > 0 and ripeness_v2 is not None:
            valid_confidences.append(conf_v2)
            ripeness_votes.append(ripeness_v2)
        
        # Average confidence
        ensemble_confidence = np.mean(valid_confidences) if valid_confidences else 0
        
        # Majority vote for ripeness
        if ripeness_votes:
            ripe_votes = sum(1 for vote in ripeness_votes if vote == 'Ripe')
            ensemble_ripeness = 'Ripe' if ripe_votes > len(ripeness_votes) / 2 else 'Unripe'
        else:
            ensemble_ripeness = 'Unknown'
        
        # STEP 5: Build response
        return {
            'success': True,
            'is_black_pepper': True,
            'ripeness': ensemble_ripeness,
            'confidence': round(min(ensemble_confidence, 100), 2),  # Cap at 100%
            'model_type': 'yolov8_ensemble_v1_v2',
            'additional_info': f'🤖 Ensemble Detector (v1+v2): Classification: {ensemble_ripeness} ({ensemble_confidence:.1f}% confidence).',
            'all_predictions': {
                'Ripe': round(50.0 if ensemble_ripeness == 'Ripe' else 0.0, 2),
                'Unripe': round(50.0 if ensemble_ripeness == 'Unripe' else 0.0, 2)
            },
            'ensemble_details': {
                'v1_ripeness': ripeness_v1,
                'v1_confidence': round(min(conf_v1, 100), 2),
                'v1_detections': det_v1,
                'v2_ripeness': ripeness_v2,
                'v2_confidence': round(min(conf_v2, 100), 2),
                'v2_detections': det_v2,
                'ensemble_confidence': round(min(ensemble_confidence, 100), 2),
                'method': 'Average confidence + Majority vote'
            }
        }
    
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        return {
            'error': f'Prediction failed: {error_msg}',
            'success': False,
            'is_black_pepper': False
        }


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python predict_bunga_ripeness_ensemble.py <image_path>'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = predict_bunga_ripeness_ensemble(image_path)
    print(json.dumps(result))
