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
            print(f"🤖 Loading unified bunga model from: {unified_model_path}", file=sys.stderr)
            unified_model = YOLO(unified_model_path)
            print(f"✅ Model loaded successfully", file=sys.stderr)
            
            print(f"🎯 Running inference with conf=0.25, imgsz=640...", file=sys.stderr)
            unified_results = unified_model.predict(
                image_path, 
                conf=0.25,      # Lowered from 0.5 to catch weaker detections
                imgsz=640,      # Increased from 512 for better detail
                verbose=False, 
                half=True
            )
            print(f"✅ Inference completed", file=sys.stderr)
            
            unified_data = unified_results[0]
            print(f"✅ Results object retrieved - Type: {type(unified_data)}", file=sys.stderr)
            
            # Debug: Check boxes structure
            has_boxes = unified_data.boxes is not None
            box_count = len(unified_data.boxes) if has_boxes else 0
            print(f"📊 Has boxes: {has_boxes} | Box count: {box_count}", file=sys.stderr)
            print(f"📋 Model class names: {list(unified_data.names.values())}", file=sys.stderr)
            
            if has_boxes and box_count > 0:
                print(f"🔍 Iterating through {box_count} detections...", file=sys.stderr)
                for idx, box in enumerate(unified_data.boxes):
                    raw_conf = float(box.conf[0]) if hasattr(box.conf, '__len__') else float(box.conf)
                    raw_cls = int(box.cls[0]) if hasattr(box.cls, '__len__') else int(box.cls)
                    raw_class_name = unified_data.names[raw_cls]
                    print(f"  [{idx}] class='{raw_class_name}' | conf={raw_conf:.4f} ({raw_conf*100:.2f}%)", file=sys.stderr)
            
            # Check if any detections were made
            if has_boxes and box_count > 0:
                # Get the first (best) detection by confidence
                best_detection = unified_data.boxes[0]
                conf_value = float(best_detection.conf[0]) if hasattr(best_detection.conf, '__len__') else float(best_detection.conf)
                confidence = conf_value * 100  # Convert 0-1 to 0-100 percentage
                cls_idx = int(best_detection.cls[0]) if hasattr(best_detection.cls, '__len__') else int(best_detection.cls)
                bunga_class = unified_data.names[cls_idx]
                
                print(f"🔍 Selected detection: '{bunga_class}' with confidence {confidence:.2f}%", file=sys.stderr)
                
                # Handle Rotten class
                if bunga_class.lower() == "rotten":
                    ripeness = "Rotten"
                    ripeness_percentage = 0
                    print(f"✅ Detected as Rotten", file=sys.stderr)
                else:
                    # Parse class format - handle multiple formats:
                    # Format 1: "Class A-a" or "A-a"
                    # Format 2: "Ripe_A_a" or "A_a"
                    # Format 3: Just "A-a"
                    
                    # Try splitting by dash first
                    if '-' in bunga_class:
                        parts = bunga_class.split('-')
                    elif '_' in bunga_class:
                        parts = bunga_class.split('_')
                    else:
                        parts = [bunga_class]
                    
                    print(f"📝 Class parts: {parts}", file=sys.stderr)
                    
                    if len(parts) >= 2:
                        # Extract ripeness letter (A/B/C/D) from first part
                        ripeness_part = parts[0].strip()
                        # Handle "Class A" or just "A"
                        ripeness_letter = ripeness_part.split()[-1] if ' ' in ripeness_part else ripeness_part
                        ripeness_letter = ripeness_letter.upper()
                        
                        print(f"🔤 Ripeness letter: '{ripeness_letter}'", file=sys.stderr)
                        
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
                            print(f"📊 Ripeness: {ripeness} ({ripeness_percentage}%)", file=sys.stderr)
                        
                        # Extract health letter (a/b/c/d) from second part
                        health_part = parts[1].strip()
                        # Could be just "a" or have other text
                        health_class = health_part[0].lower() if health_part else '?'
                        
                        print(f"🔤 Health letter: '{health_class}'", file=sys.stderr)
                        
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
                            print(f"📊 Health: {health_class.upper()} ({health_percentage}%)", file=sys.stderr)
                
                print(f"✅ FINAL RESULT - Ripeness: {ripeness} ({ripeness_percentage}%), Health: {health_class.upper()} ({health_percentage}%), Confidence: {confidence:.2f}%", file=sys.stderr)
            else:
                # No bunga detected in the image
                error_msg = "No black pepper bunga detected in image"
                print(f"⚠️ NO DETECTIONS FOUND - No bunga detected in image", file=sys.stderr)
        
        except Exception as e:
            error_msg = f"Detection error: {str(e)}"
            print(f"⚠️ Detection error: {str(e)}", file=sys.stderr)
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}", file=sys.stderr)
        
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
