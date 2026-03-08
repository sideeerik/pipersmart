"""
Persistent Model Server - Loads ML models once and keeps them in memory
This avoids reloading models for every prediction request
"""
import os
import sys
import json
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
from typing import Dict, Any

# Global model instances (loaded once, reused for every prediction)
_models = {
    'bunga': None,
    'disease': None
}

def load_models():
    """Load all models into memory once"""
    global _models
    
    try:
        bunga_model_path = r'C:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\ripebunga2\bunga_ripeness_v1\weights\best.pt'
        disease_model_path = r'C:\Users\admin\Documents\6.1 Reporting\pipersmart\backend\ml_models\unified_pepper_diseases_organized\weights\best.pt'
        
        print('🚀 Loading BUNGA model...', file=sys.stderr)
        if os.path.exists(bunga_model_path):
            _models['bunga'] = YOLO(bunga_model_path)
            print('✅ BUNGA model loaded', file=sys.stderr)
        
        print('🚀 Loading DISEASE model...', file=sys.stderr)
        if os.path.exists(disease_model_path):
            _models['disease'] = YOLO(disease_model_path)
            print('✅ DISEASE model loaded', file=sys.stderr)
    except Exception as e:
        print(f'❌ Error loading models: {e}', file=sys.stderr)

def predict_bunga(image_path: str, model_path: str) -> Dict[str, Any]:
    """
    Fast bunga ripeness prediction using cached model
    """
    global _models
    
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {"success": False, "error": "Image read failed", "ripeness": None, "confidence": 0}
        
        img_height, img_width = img.shape[:2]
        
        # Use cached model or load if needed
        if _models['bunga'] is None:
            bunga_model_path = r'C:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\ripebunga2\bunga_ripeness_v1\weights\best.pt'
            _models['bunga'] = YOLO(bunga_model_path)
        
        # Fast prediction with cached model
        results = _models['bunga'].predict(image_path, conf=0.25, verbose=False, half=True)
        result = results[0]
        
        best_ripeness = None
        best_confidence = 0
        bunga_detections = []
        
        if result.boxes is not None and len(result.boxes) > 0:
            for detection in result.boxes:
                conf = float(detection.conf[0])
                cls = int(detection.cls[0])
                class_name = result.names[cls]
                
                try:
                    bbox_tensor = detection.xyxy[0]
                    px1, py1, px2, py2 = int(bbox_tensor[0]), int(bbox_tensor[1]), int(bbox_tensor[2]), int(bbox_tensor[3])
                except:
                    norm_coords = detection.xyxyn[0]
                    x1, y1, x2, y2 = float(norm_coords[0]), float(norm_coords[1]), float(norm_coords[2]), float(norm_coords[3])
                    px1, py1, px2, py2 = int(x1 * img_width), int(y1 * img_height), int(x2 * img_width), int(y2 * img_height)
                
                center_x = (px1 + px2) / 2
                center_y = (py1 + py2) / 2
                
                bunga_detections.append({
                    "class": class_name,
                    "confidence": round(conf, 4),
                    "bbox": [px1, py1, px2, py2],
                    "center": [center_x, center_y]
                })
                
                if conf > best_confidence:
                    best_confidence = conf
                    best_ripeness = class_name
        
        return {
            "success": True,
            "ripeness": best_ripeness,
            "confidence": round(best_confidence * 100, 2),
            "bunga_detections": bunga_detections,
            "other_objects": [],
            "image_size": [img_width, img_height],
            "error": None
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "ripeness": None,
            "confidence": 0,
            "bunga_detections": [],
            "other_objects": [],
            "image_size": [0, 0]
        }

if __name__ == '__main__':
    # Load models once at startup
    load_models()
    print('✅ Model server initialized', file=sys.stderr)
    
    # Handle prediction requests
    if len(sys.argv) > 2:
        image_path = sys.argv[1]
        model_type = sys.argv[2]
        
        if model_type == 'bunga':
            model_path = sys.argv[3] if len(sys.argv) > 3 else None
            result = predict_bunga(image_path, model_path)
            print(json.dumps(result))
