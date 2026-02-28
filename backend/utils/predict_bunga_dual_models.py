import os
import json
import sys
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


def predict_bunga_unified(image_path, unified_model_path):
    """
    Detect bunga with UNIFIED model outputting classes like 'Class A-a', 'Class B-c', etc.
    Automatically extracts ripeness (Ripe/Unripe based on A/B/C/D) and health class (a/b/c/d).
    Also detects OTHER OBJECTS in the frame using COCO model.
    
    Returns:
    {
        "success": true/false,
        "class": "Class A-a" (raw class from model),
        "ripeness": "Ripe/Unripe",
        "ripeness_confidence": float (0-100),
        "health_class": "a/b/c/d",
        "health_percentage": float (0-100),
        "health_range": "76-100%|51-75%|26-50%|0-25%",
        "bunga_detections": [
            {"class": "Class A-a", "ripeness": "Ripe", "health_class": "a", "health_percentage": 88, "confidence": 0.95, "bbox": [x1, y1, x2, y2]}
        ],
        "other_objects": [
            {"class": "hand", "confidence": 0.87},
            {"class": "leaf", "confidence": 0.92}
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
                "health_class": None,
                "bunga_detections": [],
                "other_objects": [],
                "image_size": [0, 0]
            }
        
        img_height, img_width = img.shape[:2]
        
        # Step 1: Unified Bunga Detection (Ripe/Unripe + Health A/B/C/D in single class)
        bunga_class = None
        ripeness_result = None
        health_class = None
        ripeness_confidence = 0
        health_percentage = 0
        health_range = None
        bunga_detections = []
        px1, py1, px2, py2 = 0, 0, 0, 0
        
        try:
            if not os.path.exists(unified_model_path):
                print(f"⚠️ Unified model not found: {unified_model_path}", file=sys.stderr)
            else:
                print(f"🤖 Loading unified bunga model...", file=sys.stderr)
                unified_model = YOLO(unified_model_path)
                unified_results = unified_model.predict(image_path, conf=0.3, verbose=False, half=True)
                unified_data = unified_results[0]
                
                if unified_data.boxes is not None and len(unified_data.boxes) > 0:
                    # Get best detection
                    best_box = unified_data.boxes[0]
                    ripeness_confidence = float(best_box.conf[0])
                    cls_idx = int(best_box.cls[0])
                    bunga_class = unified_data.names[cls_idx]  # e.g., "Class A-a" or "Rotten"
                    
                    # Handle Rotten class (no ripeness/health breakdown)
                    if bunga_class.lower() == "rotten":
                        ripeness_result = "Rotten"
                        health_class = None
                    else:
                        # Parse class name: "Class A-a", "Class B-c", etc.
                        # Format: "Class [RIPENESS]-[HEALTH]"
                        # RIPENESS: A/B (Ripe 51-100%), C/D (Unripe 0-50%)
                        # HEALTH: a/b/c/d (76-100%, 51-75%, 26-50%, 0-25%)
                        parts = bunga_class.split('-')
                        if len(parts) >= 2:
                            ripeness_letter = parts[0].strip().split()[-1] if ' ' in parts[0] else parts[0].strip()  # Extract "A", "B", etc.
                            health_class = parts[1].strip()  # Extract "a", "b", etc.
                            
                            # Determine ripeness from letter (A/B = Ripe, C/D = Unripe)
                            ripeness_result = "Ripe" if ripeness_letter in ['A', 'B'] else "Unripe"
                            
                            # Calculate ripeness percentage based on A/B/C/D ranges
                            # A: 76-100%, B: 51-75%, C: 26-50%, D: 0-25%
                            ripeness_ranges_map = {
                                'A': {'min': 76, 'max': 100},
                                'B': {'min': 51, 'max': 75},
                                'C': {'min': 26, 'max': 50},
                                'D': {'min': 0, 'max': 25}
                            }
                            
                            if ripeness_letter in ripeness_ranges_map:
                                r_range = ripeness_ranges_map[ripeness_letter]
                                r_min = r_range['min']
                                r_max = r_range['max']
                                # Use confidence to estimate position within range
                                ripeness_percentage = round(r_min + (ripeness_confidence * (r_max - r_min)), 1)
                        else:
                            ripeness_result = None
                            ripeness_percentage = 0
                            health_class = None
                    
                    # Extract bounding box
                    try:
                        bbox_tensor = best_box.xyxy[0]
                        px1, py1, px2, py2 = int(bbox_tensor[0]), int(bbox_tensor[1]), int(bbox_tensor[2]), int(bbox_tensor[3])
                    except:
                        norm_coords = best_box.xyxyn[0]
                        x1, y1, x2, y2 = float(norm_coords[0]), float(norm_coords[1]), float(norm_coords[2]), float(norm_coords[3])
                        px1, py1, px2, py2 = int(x1 * img_width), int(y1 * img_height), int(x2 * img_width), int(y2 * img_height)
                    
                    # Map health class to percentage range (using lowercase letters a/b/c/d)
                    health_ranges = {
                        'a': {'range': '76-100%', 'min': 76, 'max': 100},
                        'b': {'range': '51-75%', 'min': 51, 'max': 75},
                        'c': {'range': '26-50%', 'min': 26, 'max': 50},
                        'd': {'range': '0-25%', 'min': 0, 'max': 25}
                    }
                    
                    if health_class and health_class.lower() in health_ranges:
                        h_range = health_ranges[health_class.lower()]
                        health_range = h_range['range']
                        # Use confidence to estimate position within range
                        min_pct = h_range['min']
                        max_pct = h_range['max']
                        health_percentage = round(min_pct + (ripeness_confidence * (max_pct - min_pct)), 1)
                    
                    print(f"✅ Unified detection: {bunga_class} ({ripeness_confidence:.2f}) - Health {health_range}", file=sys.stderr)
        except Exception as e:
            print(f"⚠️ Unified detection error: {str(e)}", file=sys.stderr)
            bunga_class = None
        
        
        # Step 2: Combine bunga detections
        if bunga_class and ripeness_result and health_class:
            bunga_detections.append({
                "class": bunga_class,
                "ripeness": ripeness_result,
                "health_class": health_class,
                "health_percentage": health_percentage,
                "health_range": health_range,
                "confidence": round(ripeness_confidence * 100, 2),
                "bbox": [px1, py1, px2, py2]
            })
        
        
        # Step 4: Detect Other Objects (use YOLOv8 COCO model for general detection)
        other_objects = []
        # try:
        #     print(f"🤖 Loading COCO model for object detection...", file=sys.stderr)
        #     # Load YOLOv8 COCO model (80+ object classes)
        #     coco_model = YOLO('yolov8n.pt')  # nano model for speed
        #     coco_results = coco_model.predict(image_path, conf=0.4, verbose=False, half=True)
        #     coco_data = coco_results[0]
        #     
        #     if coco_data.boxes is not None and len(coco_data.boxes) > 0:
        #         # Get all detections and filter out bunga
        #         detected_classes = {}
        #         for box in coco_data.boxes:
        #             conf = float(box.conf[0])
        #             cls_idx = int(box.cls[0])
        #             class_name = coco_data.names[cls_idx]
        #             
        #             # Skip if it's bunga/pepper (likely classes 53=apple, 54=banana, etc or custom bunga)
        #             # Also skip very low confidence detections
        #             if conf < 0.4:
        #                 continue
        #             if class_name.lower() in ['bunga', 'pepper', 'fruit']:
        #                 continue
        #             
        #             # Add to detected objects (keep only highest confidence per class)
        #             if class_name not in detected_classes or conf > detected_classes[class_name]:
        #                 detected_classes[class_name] = conf
        #         
        #         # Convert to list format, sorted by confidence
        #         for obj_class, obj_conf in sorted(detected_classes.items(), key=lambda x: x[1], reverse=True):
        #             other_objects.append({
        #                 "class": obj_class,
        #                 "confidence": round(obj_conf, 2)
        #             })
        #         
        #         if other_objects:
        #             obj_names = [obj['class'] for obj in other_objects]
        #             print(f"✅ Objects detected: {obj_names}", file=sys.stderr)
        #         else:
        #             print(f"ℹ️ No other objects detected (only bunga)", file=sys.stderr)
        # except Exception as e:
        #     print(f"⚠️ COCO object detection error: {str(e)}", file=sys.stderr)
        
        return {
            "success": bunga_class is not None,
            "class": bunga_class,
            "ripeness": ripeness_result,
            "ripeness_percentage": ripeness_percentage,  # NEW
            "ripeness_confidence": round(ripeness_confidence * 100, 2),
            "health_class": health_class,
            "health_percentage": health_percentage,
            "health_range": health_range,
            "bunga_detections": bunga_detections,
            "other_objects": other_objects,
            "error": None,
            "image_size": [img_width, img_height]
        }
    
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": f"Processing error: {str(e)}",
            "ripeness": None,
            "ripeness_percentage": 0,
            "health_class": None,
            "ripeness_confidence": 0,
            "health_percentage": 0,
            "bunga_detections": [],
            "other_objects": [],
            "image_size": [0, 0]
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "No image path provided",
            "success": False,
            "bunga_detections": [],
            "image_size": [0, 0]
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    unified_model_path = sys.argv[2] if len(sys.argv) > 2 else "unified_model.pt"
    
    print(f"📸 Input image: {image_path}", file=sys.stderr)
    print(f"🤖 Unified model: {unified_model_path}", file=sys.stderr)
    
    result = predict_bunga_unified(image_path, unified_model_path)
    print(json.dumps(result))
