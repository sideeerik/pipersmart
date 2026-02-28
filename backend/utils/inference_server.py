import os
import sys
import cv2
import numpy as np
import json
from flask import Flask, request, jsonify
from ultralytics import YOLO
import time
from pathlib import Path

# Initialize Flask App
app = Flask(__name__)

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Path to models (adjust relative to this script)
LEAF_MODEL_PATH = os.path.join(BASE_DIR, '../ml_models/leaf/train/weights/best.pt')
BUNGA_MODEL_PATH = os.path.join(BASE_DIR, '../ml_models/bunga/train/weights/best.pt')

# --- GLOBAL MODEL STORAGE ---
models = {
    'leaf': None,
    'bunga': None
}

def load_models():
    """Load YOLO models into memory once at startup"""
    print("⏳ [SERVER] Loading models into memory... This may take a few seconds.")
    
    # Load Leaf Disease Model
    if os.path.exists(LEAF_MODEL_PATH):
        try:
            print(f"🍃 [SERVER] Loading Leaf Model: {LEAF_MODEL_PATH}")
            models['leaf'] = YOLO(LEAF_MODEL_PATH)
            print("✅ [SERVER] Leaf Model Loaded Successfully!")
        except Exception as e:
            print(f"❌ [SERVER] Failed to load Leaf Model: {e}")
    else:
        print(f"⚠️ [SERVER] Leaf Model not found at {LEAF_MODEL_PATH}")

    # Load Bunga Model (Optional/Future)
    if os.path.exists(BUNGA_MODEL_PATH):
        try:
            print(f"🌸 [SERVER] Loading Bunga Model: {BUNGA_MODEL_PATH}")
            models['bunga'] = YOLO(BUNGA_MODEL_PATH)
            print("✅ [SERVER] Bunga Model Loaded Successfully!")
        except Exception as e:
            print(f"❌ [SERVER] Failed to load Bunga Model: {e}")
    else:
        print(f"⚠️ [SERVER] Bunga Model not found at {BUNGA_MODEL_PATH}")

# Load models immediately
load_models()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "models_loaded": {
            "leaf": models['leaf'] is not None,
            "bunga": models['bunga'] is not None
        }
    })

@app.route('/predict/leaf', methods=['POST'])
def predict_leaf():
    """
    Endpoint for Leaf Disease Prediction
    Expects: 
    - Multipart file 'image' OR
    - JSON body { "file_path": "/path/to/image.jpg" }
    """
    start_time = time.time()
    img = None
    
    # Check if JSON with file_path is provided
    if request.is_json:
        data = request.get_json()
        if 'file_path' in data and os.path.exists(data['file_path']):
            try:
                img = cv2.imread(data['file_path'])
                if img is None:
                    return jsonify({"success": False, "error": "Failed to read file from path"}), 400
            except Exception as e:
                return jsonify({"success": False, "error": f"Error reading file: {str(e)}"}), 400
    
    # Fallback to file upload
    if img is None:
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image provided (file upload or file_path)"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "error": "No image selected"}), 400

        try:
            # Read Image directly from memory
            file_bytes = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        except Exception as e:
             return jsonify({"success": False, "error": f"Error decoding image: {str(e)}"}), 400
            
    if img is None:
        return jsonify({"success": False, "error": "Invalid image format"}), 400
            
    img_height, img_width = img.shape[:2]
    
    try:
        # 2. Check if model is loaded
        if models['leaf'] is None:
            return jsonify({"success": False, "error": "Leaf model not loaded on server"}), 503

        # 3. Run Inference (Fast!)
        # conf=0.10: Low threshold to catch diseases
        results = models['leaf'].predict(
            img,
            conf=0.10,
            imgsz=640,
            device='cpu',
            half=False,
            verbose=False,
            max_det=10
        )
        
        # 4. Process Results
        detection = results[0]
        
        disease_candidates = []
        healthy_candidates = []
        all_detections = []
        
        if detection.boxes is not None and len(detection.boxes) > 0:
            for box in detection.boxes:
                conf = float(box.conf[0])
                cls_idx = int(box.cls[0])
                name = detection.names[cls_idx]
                
                all_detections.append({
                    "class": name,
                    "confidence": round(conf * 100, 2),
                    "bbox": [int(x) for x in box.xyxy[0].tolist()]
                })
                
                if name.lower() == "healthy":
                    healthy_candidates.append((name, conf))
                else:
                    disease_candidates.append((name, conf))
            
            # Decision Logic (Prioritize Disease)
            if len(disease_candidates) > 0:
                disease_candidates.sort(key=lambda x: x[1], reverse=True)
                best_class, best_conf = disease_candidates[0]
            elif len(healthy_candidates) > 0:
                healthy_candidates.sort(key=lambda x: x[1], reverse=True)
                best_class, best_conf = healthy_candidates[0]
            else:
                best_class = "Healthy"
                best_conf = 0.95
        else:
            best_class = "Healthy"
            best_conf = 0.95

        process_time = (time.time() - start_time) * 1000 # ms
        
        print(f"⚡ [SERVER] Inference Request: {best_class} ({round(best_conf*100, 1)}%) - took {int(process_time)}ms")

        return jsonify({
            "success": True,
            "disease": best_class,
            "confidence": round(best_conf * 100, 2),
            "detections": all_detections,
            "image_size": [img_width, img_height],
            "server_processing_time_ms": int(process_time)
        })

    except Exception as e:
        print(f"❌ [SERVER] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting Python Inference Server on port 5000...")
    print("⚠️  Ensure you have 'flask' installed: pip install flask")
    app.run(host='0.0.0.0', port=5000, debug=False)
