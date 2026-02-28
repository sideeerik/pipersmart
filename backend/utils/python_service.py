#!/usr/bin/env python3
"""
Persistent Python ML Service
- Loads models once on startup
- Listens on localhost:9001
- Accepts prediction requests via HTTP
- Keeps models in memory for fast inference
"""

import os
import json
import sys
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import traceback
import threading

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Global model cache
MODEL_CACHE = {}

def load_models():
    """Load models once at startup"""
    global MODEL_CACHE
    
    print("🔄 Loading ML models into memory...", file=sys.stderr)
    
    try:
        # Use absolute path to model
        bunga_model_path = Path(__file__).parent.parent.parent / 'ml_models' / 'ripebunga2' / 'bunga_ripeness_v1' / 'weights' / 'best.pt'
        
        print(f"📂 Looking for model at: {bunga_model_path}", file=sys.stderr)
        print(f"📂 Model exists: {bunga_model_path.exists()}", file=sys.stderr)
        
        if bunga_model_path.exists():
            print(f"📦 Loading bunga model...", file=sys.stderr)
            MODEL_CACHE['bunga'] = YOLO(str(bunga_model_path))
            print(f"✅ Bunga model loaded successfully", file=sys.stderr)
        else:
            print(f"❌ Bunga model NOT found at {bunga_model_path}", file=sys.stderr)
            print(f"❌ Searching for .pt files...", file=sys.stderr)
            # List files to help debug
            parent_dir = bunga_model_path.parent.parent.parent / 'ml_models'
            if parent_dir.exists():
                for root, dirs, files in os.walk(parent_dir):
                    for f in files:
                        if f.endswith('.pt'):
                            print(f"🔍 Found: {os.path.join(root, f)}", file=sys.stderr)
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}", file=sys.stderr)
        traceback.print_exc()

def predict_bunga_ripeness_with_objects(image_path):
    """
    Predict bunga ripeness using cached model
    """
    try:
        if 'bunga' not in MODEL_CACHE:
            return {
                "success": False,
                "error": "Model not loaded",
                "ripeness": None,
                "confidence": 0,
                "bunga_detections": [],
                "other_objects": [],
                "image_size": [0, 0]
            }
        
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
        
        print(f"🤖 Running inference on {image_path}...", file=sys.stderr)
        
        # Use cached model for inference
        results = MODEL_CACHE['bunga'].predict(image_path, conf=0.25, verbose=False, half=True)
        result = results[0]
        
        bunga_detections = []
        max_confidence = 0
        best_ripeness = None
        
        # Process detections
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
                    "center": [round(center_x, 2), round(center_y, 2)]
                })
                
                if conf > max_confidence:
                    max_confidence = conf
                    best_ripeness = class_name
            
            print(f"✅ Result: {best_ripeness} ({max_confidence:.2f} confidence)", file=sys.stderr)
        else:
            print(f"⚠️ No peppers detected", file=sys.stderr)
        
        return {
            "success": True,
            "ripeness": best_ripeness,
            "confidence": round(max_confidence * 100, 2) if best_ripeness else 0,
            "bunga_detections": bunga_detections,
            "other_objects": [],
            "error": None,
            "image_size": [img_width, img_height]
        }
    
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}", file=sys.stderr)
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Prediction error: {str(e)}",
            "ripeness": None,
            "confidence": 0,
            "bunga_detections": [],
            "other_objects": [],
            "image_size": [0, 0]
        }

class PredictionHandler(BaseHTTPRequestHandler):
    """HTTP handler for prediction requests"""
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "models_loaded": list(MODEL_CACHE.keys())
            }).encode())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Parse URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            print(f"📨 Request: {self.command} {path}", file=sys.stderr)
            
            # Get content length and read body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            if path == '/predict/bunga':
                # Expect JSON with image_path
                data = json.loads(body.decode('utf-8'))
                image_path = data.get('image_path')
                
                print(f"📸 Image path: {image_path}", file=sys.stderr)
                
                if not image_path or not os.path.exists(image_path):
                    print(f"❌ Image not found: {image_path}", file=sys.stderr)
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Image not found"}).encode())
                    return
                
                result = predict_bunga_ripeness_with_objects(image_path)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            
            elif path == '/health':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "ok",
                    "models_loaded": list(MODEL_CACHE.keys())
                }).encode())
            
            else:
                print(f"❌ Unknown path: {path}", file=sys.stderr)
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Path {path} not found. Use /predict/bunga or /health"}).encode())
        
        except Exception as e:
            print(f"❌ Handler error: {str(e)}", file=sys.stderr)
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def start_server(host='localhost', port=9001):
    """Start HTTP server"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, PredictionHandler)
    print(f"🚀 Python service listening on {host}:{port}", file=sys.stderr)
    httpd.serve_forever()

if __name__ == '__main__':
    print(f"🔧 Starting Python ML Service...", file=sys.stderr)
    load_models()
    start_server(port=9001)
