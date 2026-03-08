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
        # Valid pepper images should have at least 10% of these colors
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
                # More specific skin tone detection (lower sat/val than peppers)
                if (hue < 20 or hue > 160) and (35 < sat < 65) and (50 < val < 150):
                    skin_like += 1
        
        skin_ratio = skin_like / total_pixels
        if skin_ratio > 0.30:  # Increased threshold to reduce false positives
            return False, skin_ratio, f"Image appears to contain human skin ({skin_ratio*100:.1f}%). Please send an image of a black pepper bunga."
        
        return True, pepper_color_ratio, "Valid pepper image"
    
    except Exception as e:
        return False, 0, f"Validation error: {str(e)}"


def predict_bunga_ripeness(image_path):
    """
    Predict black pepper bunga ripeness using trained YOLOv8 model.
    
    Process:
    1. Load trained YOLOv8 model (ripe_pepper_detection)
    2. Run inference on image
    3. Analyze detections and classify as Ripe/Unripe
    4. Return results with detection confidence
    
    Returns: {
        success: bool,
        is_black_pepper: bool,
        ripeness: str ('Ripe', 'Unripe'),
        confidence: float (0-100),
        model_type: str,
        additional_info: str,
        detection_info: dict,
        all_predictions: dict
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
        
        # STEP 2: Find and load YOLOv8 model
        backend_dir = Path(__file__).parent.parent
        workspace_root = backend_dir.parent
        
        # YOLOv8 trained model path - uses the trained model from your dataset
        yolo_model_path = workspace_root / 'ml_models' / 'ripebunga' / 'runs_ripe' / 'runs' / 'detect' / 'runs_ripe' / 'ripe_pepper_detection' / 'weights' / 'best.pt'
        
        if not yolo_model_path.exists():
            return {
                'error': f'Trained YOLOv8 model not found at {yolo_model_path}',
                'success': False,
                'is_black_pepper': False
            }
        
        # Load YOLO model
        model = YOLO(str(yolo_model_path))
        
        # STEP 3: Run YOLOv8 inference
        results = model.predict(image_path, conf=0.25, verbose=False)
        result = results[0]
        
        # Extract detections
        detections = result.boxes
        detection_count = len(detections) if detections is not None else 0
        
        # Analyze detections to predict ripeness
        if detection_count == 0:
            return {
                'error': 'No pepper bunches detected in image',
                'success': False,
                'is_black_pepper': True,
                'message': 'Could not find any black pepper bunga. Please ensure the entire bunch is visible.'
            }
        
        # STEP 4: Analyze detections for ripeness classification
        confidences = []
        class_predictions = []
        
        for detection in detections:
            conf = float(detection.conf[0])
            cls = int(detection.cls[0])
            class_name = result.names[cls]
            confidences.append(conf)
            class_predictions.append(class_name)
        
        avg_detection_conf = np.mean(confidences)
        
        # STEP 5: Determine ripeness based on YOLO class predictions
        # Classes from trained model:
        # "-" = Unripe
        # "pepper-v1 pepper data" or similar = Ripe
        ripe_count = sum(1 for pred in class_predictions if '-' not in pred or 'pepper' in pred.lower())
        unripe_count = sum(1 for pred in class_predictions if pred.strip() == '-')
        
        # Decision logic:
        # If model detected more 'Ripe' (pepper) classes -> classify as Ripe
        # Otherwise -> classify as Unripe
        if ripe_count > unripe_count:
            final_ripeness = 'Ripe'
        else:
            final_ripeness = 'Unripe'
        
        # Confidence = YOLO model's detection confidence score
        confidence_percent = avg_detection_conf * 100
        
        return {
            'success': True,
            'is_black_pepper': True,
            'ripeness': final_ripeness,
            'confidence': round(confidence_percent, 2),
            'model_type': 'yolov8_trained_detector',
            'additional_info': f'🔬 YOLOv8 Detector: Found {detection_count} pepper bunch(es). Classification: {final_ripeness} ({confidence_percent:.1f}% confidence).',
            'detection_info': {
                'detections_found': detection_count,
                'ripe_detections': ripe_count,
                'unripe_detections': unripe_count,
                'avg_confidence': round(avg_detection_conf * 100, 2),
                'detected_classes': list(set(class_predictions))
            },
            'all_predictions': {
                'Ripe': round((ripe_count / detection_count * 100), 2) if detection_count > 0 else 0,
                'Unripe': round((unripe_count / detection_count * 100), 2) if detection_count > 0 else 0
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
        print(json.dumps({'error': 'Usage: python predict_bunga_ripeness.py <image_path>'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = predict_bunga_ripeness(image_path)
    print(json.dumps(result))
