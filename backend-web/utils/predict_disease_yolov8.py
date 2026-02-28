import os
import json
import sys
import cv2
import numpy as np
from ultralytics import YOLO

# Suppress TensorFlow and other warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def predict_leaf_disease_cpu(image_path, model_path):
    """
    WEB OPTIMIZED VERSION: Detect Leaf Disease.
    - Optimized for CPU-only environments
    - Prioritizes Disease detection over 'Healthy' labels
    - Lowers threshold to catch early disease signs
    """
    
    result = {
        "success": False,
        "disease": None,
        "confidence": 0,
        "detections": [],
        "error": None,
        "image_size": [0, 0]
    }

    try:
        # 1. Validation
        if not os.path.exists(image_path):
            result["error"] = f"Image file not found at {image_path}"
            return result
            
        if not os.path.exists(model_path):
            result["error"] = f"Model file not found at {model_path}"
            return result

        # 2. Read Image
        img = cv2.imread(image_path)
        if img is None:
            result["error"] = "Failed to read image file (corrupt or invalid format)"
            return result
            
        img_height, img_width = img.shape[:2]
        result["image_size"] = [img_width, img_height]
        
        print(f"📸 [LEAF-CPU] Processing image: {img_width}x{img_height}", file=sys.stderr)

        # 3. Load Model (CPU Mode)
        print(f"🤖 [LEAF-CPU] Loading YOLO model: {model_path}", file=sys.stderr)
        model = YOLO(model_path)
        
        # Log classes for debugging
        print(f"📋 [LEAF-CPU] Model Classes: {model.names}", file=sys.stderr)
        
        # 4. Run Inference
        # Lower confidence to 0.10 to ensure we catch diseases even if model is unsure
        results = model.predict(
            image_path,
            conf=0.10,     # Lowered from 0.25 to 0.10 to be more sensitive
            imgsz=640,
            device='cpu',
            half=False, 
            verbose=False,
            max_det=10     # Get top 10 to inspect
        )
        
        # 5. Process Results
        detection = results[0]
        
        disease_candidates = []
        healthy_candidates = []
        
        if detection.boxes is not None and len(detection.boxes) > 0:
            for box in detection.boxes:
                conf = float(box.conf[0])
                cls_idx = int(box.cls[0])
                name = detection.names[cls_idx]
                
                # Store all detections
                result["detections"].append({
                    "class": name,
                    "confidence": round(conf * 100, 2),
                    "bbox": [int(x) for x in box.xyxy[0].tolist()]
                })
                
                # Categorize
                if name.lower() == "healthy":
                    healthy_candidates.append((name, conf))
                else:
                    disease_candidates.append((name, conf))
            
            # DECISION LOGIC:
            # Prioritize ANY disease detection over "Healthy"
            if len(disease_candidates) > 0:
                # Pick the highest confidence disease
                disease_candidates.sort(key=lambda x: x[1], reverse=True)
                best_class, best_conf = disease_candidates[0]
                
                print(f"✅ [LEAF-CPU] Disease Detected: {best_class} ({round(best_conf*100, 2)}%)", file=sys.stderr)
                result["success"] = True
                result["disease"] = best_class
                result["confidence"] = round(best_conf * 100, 2)
                
            elif len(healthy_candidates) > 0:
                # Only Healthy detected
                healthy_candidates.sort(key=lambda x: x[1], reverse=True)
                best_class, best_conf = healthy_candidates[0]
                
                print(f"✅ [LEAF-CPU] Healthy Detected: {round(best_conf*100, 2)}%", file=sys.stderr)
                result["success"] = True
                result["disease"] = "Healthy"
                result["confidence"] = round(best_conf * 100, 2)
            else:
                # Should not happen if len > 0
                pass
                
        else:
            print(f"ℹ️ [LEAF-CPU] No detections found. Defaulting to Healthy.", file=sys.stderr)
            result["success"] = True
            result["disease"] = "Healthy"
            result["confidence"] = 95.0
            
        return result

    except Exception as e:
        print(f"❌ [LEAF-CPU] Critical Error: {str(e)}", file=sys.stderr)
        result["error"] = str(e)
        return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided", "success": False}))
        sys.exit(1)
    
    img_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else "leaf_disease_model.pt"
    
    final_result = predict_leaf_disease_cpu(img_path, model_path)
    print(json.dumps(final_result))
