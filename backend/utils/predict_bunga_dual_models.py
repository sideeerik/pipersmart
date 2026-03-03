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
    Parses ripeness (A/B=Ripe, C/D=Unripe) and health class (a/b/c/d).
    Calculates percentages based on letter ranges.
    Frontend handles the rest.
    
    Returns:
    {
        "success": true/false,
        "ripeness": "Ripe/Unripe/Rotten",
        "ripeness_percentage": float (0-100),
        "health_class": "a/b/c/d",
        "health_percentage": float (0-100),
        "confidence": float (0-100),
        "image_size": [width, height],
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
                "ripeness_percentage": 0,
                "health_class": None,
                "health_percentage": 0,
                "confidence": 0,
                "image_size": [0, 0]
            }
        
        img_height, img_width = img.shape[:2]
        
        ripeness = None
        ripeness_percentage = 0
        health_class = None
        health_percentage = 0
        confidence = 0
        error_msg = None
        
        try:
            print(f"🤖 Loading unified bunga model...", file=sys.stderr)
            unified_model = YOLO(unified_model_path)
            unified_results = unified_model.predict(
                image_path, 
                conf=0.5,
                imgsz=512,
                verbose=False, 
                half=True
            )
            unified_data = unified_results[0]
            
            if unified_data.boxes is not None and len(unified_data.boxes) > 0:
                best_box = unified_data.boxes[0]
                confidence = float(best_box.conf[0]) * 100
                cls_idx = int(best_box.cls[0])
                bunga_class = unified_data.names[cls_idx]
                
                # Handle Rotten class
                if bunga_class.lower() == "rotten":
                    ripeness = "Rotten"
                    ripeness_percentage = 0
                else:
                    # Parse "Class A-a" format
                    parts = bunga_class.split('-')
                    if len(parts) >= 2:
                        # Extract ripeness letter (A/B/C/D)
                        ripeness_letter = parts[0].strip().split()[-1] if ' ' in parts[0] else parts[0].strip()
                        ripeness = "Ripe" if ripeness_letter in ['A', 'B'] else "Unripe"
                        
                        # Calculate ripeness percentage based on A/B/C/D ranges
                        # A: 76-100%, B: 51-75%, C: 26-50%, D: 0-25%
                        ripeness_ranges = {
                            'A': {'min': 76, 'max': 100},
                            'B': {'min': 51, 'max': 75},
                            'C': {'min': 26, 'max': 50},
                            'D': {'min': 0, 'max': 25}
                        }
                        
                        if ripeness_letter in ripeness_ranges:
                            r_range = ripeness_ranges[ripeness_letter]
                            r_min = r_range['min']
                            r_max = r_range['max']
                            # Use confidence to estimate position within range
                            ripeness_percentage = round(r_min + ((confidence / 100) * (r_max - r_min)), 1)
                        
                        # Extract health letter (a/b/c/d)
                        health_class = parts[1].strip()
                        
                        # Calculate health percentage based on a/b/c/d ranges
                        health_ranges = {
                            'a': {'min': 76, 'max': 100},
                            'b': {'min': 51, 'max': 75},
                            'c': {'min': 26, 'max': 50},
                            'd': {'min': 0, 'max': 25}
                        }
                        
                        if health_class.lower() in health_ranges:
                            h_range = health_ranges[health_class.lower()]
                            h_min = h_range['min']
                            h_max = h_range['max']
                            # Use confidence to estimate position within range
                            health_percentage = round(h_min + ((confidence / 100) * (h_max - h_min)), 1)
                
                print(f"✅ Detection: {bunga_class} - Ripeness: {ripeness} ({ripeness_percentage}%), Health: {health_class} ({health_percentage}%), Confidence: {confidence:.2f}%", file=sys.stderr)
            else:
                # No bunga detected in the image
                error_msg = "No black pepper bunga detected in image"
                print(f"⚠️ No bunga detected in image", file=sys.stderr)
        
        except Exception as e:
            error_msg = f"Detection error: {str(e)}"
            print(f"⚠️ Detection error: {str(e)}", file=sys.stderr)
        
        return {
            "success": ripeness is not None,
            "ripeness": ripeness,
            "ripeness_percentage": ripeness_percentage,
            "health_class": health_class,
            "health_percentage": health_percentage,
            "confidence": round(confidence, 2),
            "image_size": [img_width, img_height],
            "error": error_msg
        }
    
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "ripeness": None,
            "ripeness_percentage": 0,
            "health_class": None,
            "health_percentage": 0,
            "confidence": 0,
            "image_size": [0, 0]
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "No image path provided",
            "success": False,
            "ripeness": None,
            "ripeness_percentage": 0,
            "health_class": None,
            "health_percentage": 0,
            "image_size": [0, 0]
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    unified_model_path = sys.argv[2] if len(sys.argv) > 2 else "unified_model.pt"
    
    print(f"📸 Input image: {image_path}", file=sys.stderr)
    print(f"🤖 Unified model: {unified_model_path}", file=sys.stderr)
    
    result = predict_bunga_unified(image_path, unified_model_path)
    print(json.dumps(result))
