import os
import json
import sys
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


def predict_leaf_disease(image_path, model_path):
    """
    Detect pepper leaf disease using YOLOv8 model.
    Returns ONLY disease class and confidence (no bounding boxes - leaf analysis only).
    Bounding boxes are for bunga detection only.
    
    Returns:
    {
        "success": true/false,
        "disease": "Healthy/Footrot/Pollu_Disease/Slow-Decline/Leaf_Blight/Yellow_Mottle_Virus",
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
                "disease": None,
                "confidence": 0,
                "image_size": [0, 0]
            }
        
        img_height, img_width = img.shape[:2]
        image_size = [img_width, img_height]
        
        # Check if model path exists
        if not os.path.exists(model_path):
            return {
                "success": False,
                "error": f"Model not found at {model_path}",
                "disease": None,
                "confidence": 0,
                "image_size": image_size
            }
        
        print(f"🤖 Loading YOLOv8 leaf disease model...", file=sys.stderr)
        
        # Load YOLOv8 model
        model = YOLO(model_path)
        
        # Print model details for debugging
        print(f"📋 Model names dict: {model.names}", file=sys.stderr)
        print(f"📋 Number of classes: {len(model.names)}", file=sys.stderr)
        
        # Run inference - Optimized for speed
        # Use conf=0.5 (filter weak detections), imgsz=640 (smaller for speed), half=True (faster FP16)
        results = model.predict(
            image_path, 
            conf=0.5,      # Higher confidence threshold - only strong detections
            imgsz=640,     # Standard size (can try 512 for faster)
            verbose=False, 
            half=True      # FP16 inference (faster on GPU)
        )
        detection_data = results[0]
        
        # Process detections - Get best disease classification (no bounding boxes for leaf)
        best_disease = "Healthy"
        best_confidence = 0
        
        print(f"📊 Model class names: {detection_data.names}", file=sys.stderr)
        print(f"🔍 Total detections: {len(detection_data.boxes) if detection_data.boxes is not None else 0}", file=sys.stderr)
        
        if detection_data.boxes is not None and len(detection_data.boxes) > 0:
            # Find best detection only
            for idx, box in enumerate(detection_data.boxes):
                confidence = float(box.conf[0])
                cls_idx = int(box.cls[0])
                disease_name = detection_data.names[cls_idx]
                
                print(f"  📍 Detection {idx}: cls_idx={cls_idx}, name='{disease_name}', conf={confidence:.4f}", file=sys.stderr)
                
                # Track only the best confidence
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_disease = disease_name
            
            print(f"✅ Best detection: {best_disease} ({best_confidence:.4f})", file=sys.stderr)
        else:
            # No disease detected - assume healthy
            best_disease = "Healthy"
            best_confidence = 0.95
            print(f"✅ No disease regions detected - Leaf is Healthy", file=sys.stderr)
        
        # Return results - CLEAN format for leaf analysis
        return {
            "success": True,
            "disease": best_disease,
            "confidence": round(best_confidence * 100, 2),
            "image_size": image_size,
            "error": None
        }
    
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": f"Processing error: {str(e)}",
            "disease": None,
            "confidence": 0,
            "image_size": [0, 0]
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "No image path provided",
            "success": False,
            "disease": None,
            "confidence": 0,
            "image_size": [0, 0]
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else "leaf_disease_model.pt"
    
    print(f"📸 Input image: {image_path}", file=sys.stderr)
    print(f"🤖 Model: {model_path}", file=sys.stderr)
    
    result = predict_leaf_disease(image_path, model_path)
    print(json.dumps(result))
