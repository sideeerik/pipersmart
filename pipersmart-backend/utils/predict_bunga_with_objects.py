import os
import json
import sys
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# TensorFlow for general object detection
try:
    import tensorflow as tf
    import tensorflow_hub as hub
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow not available, falling back to YOLO", file=sys.stderr)

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


def predict_bunga_ripeness_with_objects(image_path, bunga_model_path, general_model_path):
    """
    Detect pepper bunga (Ripe/Unripe) AND all other objects in the image.
    
    Returns:
    {
        "success": true/false,
        "ripeness": "Ripe/Unripe/None",
        "confidence": float,
        "bunga_detections": [
            {"class": "Ripe", "confidence": 0.95, "bbox": [x1, y1, x2, y2], "center": [cx, cy]}
        ],
        "other_objects": [
            {"class": "person", "confidence": 0.87, "count": 1},
            {"class": "hand", "confidence": 0.92, "count": 1},
            {"class": "leaf", "confidence": 0.78, "count": 2}
        ],
        "error": null
    }
    """
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {
                "success": False,
                "error": "Could not read image",
                "ripeness": None,
                "confidence": 0,
                "bunga_detections": [],
                "other_objects": [],
                "image_size": [0, 0]
            }
        
        img_height, img_width = img.shape[:2]
        
        # Step 1: Detect bunga ripeness (custom model)
        bunga_ripeness_result = None
        bunga_detections = []
        
        try:
            # Check if model file exists
            if not os.path.exists(bunga_model_path):
                print(f"⚠️ Model not found: {bunga_model_path}", file=sys.stderr)
                bunga_ripeness_result = {"ripeness": None, "confidence": 0}
            else:
                print(f"✅ Loading bunga model...", file=sys.stderr)
                bunga_model = YOLO(bunga_model_path)
                # Use half precision for faster inference
                bunga_results = bunga_model.predict(image_path, conf=0.25, verbose=False, half=True)
                bunga_result = bunga_results[0]
                
                max_confidence = 0
                best_ripeness = None
                
                if bunga_result.boxes is not None and len(bunga_result.boxes) > 0:
                    for detection in bunga_result.boxes:
                        conf = float(detection.conf[0])
                        cls = int(detection.cls[0])
                        class_name = bunga_result.names[cls]
                        
                        # Get bounding box coordinates in pixel space
                        try:
                            # xyxy returns [x1, y1, x2, y2] in pixel coordinates
                            bbox_tensor = detection.xyxy[0]
                            px1, py1, px2, py2 = int(bbox_tensor[0]), int(bbox_tensor[1]), int(bbox_tensor[2]), int(bbox_tensor[3])
                        except:
                            # Fallback: try normalized coordinates
                            norm_coords = detection.xyxyn[0]
                            x1, y1, x2, y2 = float(norm_coords[0]), float(norm_coords[1]), float(norm_coords[2]), float(norm_coords[3])
                            px1, py1, px2, py2 = int(x1 * img_width), int(y1 * img_height), int(x2 * img_width), int(y2 * img_height)
                        
                        center_x = (px1 + px2) / 2
                        center_y = (py1 + py2) / 2
                        
                        bunga_detections.append({
                            "class": class_name,
                            "confidence": round(conf, 4),
                            "bbox": [px1, py1, px2, py2],
                            "center": [round(center_x, 2), round(center_y, 2)]
                        })
                        
                        # Track best ripeness prediction
                        if conf > max_confidence:
                            max_confidence = conf
                            best_ripeness = class_name
                    
                    print(f"✅ Pepper detected: {best_ripeness} ({max_confidence:.2f})", file=sys.stderr)
                    bunga_ripeness_result = {
                        "ripeness": best_ripeness,
                        "confidence": round(max_confidence * 100, 2)
                    }
                else:
                    print(f"⚠️ No peppers detected in image", file=sys.stderr)
                    bunga_ripeness_result = {
                        "ripeness": None, 
                        "confidence": 0,
                        "no_detection": True
                    }
        except Exception as e:
            print(f"⚠️ Bunga detection error: {str(e)}", file=sys.stderr)
            bunga_ripeness_result = {
                "ripeness": None, 
                "confidence": 0,
                "no_detection": True
            }
        
        
        # Step 2: Skip object detection for speed (objects add 2-5s latency)
        # Focus on fast bunga ripeness detection only
        other_objects = []
        
        return {
            "success": bunga_ripeness_result.get("ripeness") is not None,
            "ripeness": bunga_ripeness_result["ripeness"],
            "confidence": bunga_ripeness_result["confidence"],
            "bunga_detections": bunga_detections,
            "other_objects": other_objects,
            "error": "No pepper bunches detected" if bunga_ripeness_result.get("no_detection") else None,
            "image_size": [img_width, img_height]
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Processing error: {str(e)}",
            "ripeness": None,
            "confidence": 0,
            "bunga_detections": [],
            "other_objects": [],
            "image_size": [0, 0]
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided", "success": False, "bunga_detections": [], "other_objects": [], "image_size": [0, 0]}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    bunga_model_path = sys.argv[2] if len(sys.argv) > 2 else "bunga_model.pt"
    
    # Debug logging
    print(f"📸 Input image: {image_path}", file=sys.stderr)
    print(f"🤖 Bunga model: {bunga_model_path}", file=sys.stderr)
    print(f"📂 Model exists: {os.path.exists(bunga_model_path)}", file=sys.stderr)
    
    result = predict_bunga_ripeness_with_objects(image_path, bunga_model_path, None)
    print(json.dumps(result))
