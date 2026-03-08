"""
Diagnostic script to test bunga detection directly
Run: python utils/test_bunga_detection.py "path_to_image.jpg"
"""
import os
import sys
import cv2
from ultralytics import YOLO

def test_detection(image_path, model_path):
    print(f"\n{'='*60}")
    print(f"🔍 BUNGA DETECTION DIAGNOSTIC TEST")
    print(f"{'='*60}")
    
    # 1. Check image
    print(f"\n1️⃣ IMAGE VALIDATION")
    print(f"   📁 Path: {image_path}")
    if not os.path.exists(image_path):
        print(f"   ❌ Image file NOT FOUND!")
        return
    
    img = cv2.imread(image_path)
    if img is None:
        print(f"   ❌ Cannot read image (corrupted or invalid format)")
        return
    
    height, width = img.shape[:2]
    print(f"   ✅ Image loaded: {width}x{height} pixels")
    print(f"   📊 Channels: {img.shape[2] if len(img.shape) > 2 else 1}")
    
    # 2. Check model
    print(f"\n2️⃣ MODEL VALIDATION")
    print(f"   🤖 Model: {model_path}")
    if not os.path.exists(model_path):
        print(f"   ❌ Model file NOT FOUND!")
        return
    
    model_size = os.path.getsize(model_path) / (1024*1024)  # MB
    print(f"   ✅ Model exists: {model_size:.2f} MB")
    
    # 3. Load model
    print(f"\n3️⃣ MODEL LOADING")
    try:
        model = YOLO(model_path)
        print(f"   ✅ Model loaded successfully")
        print(f"   📋 Task: {model.task}")
        print(f"   🏷️  Classes: {model.names}")
    except Exception as e:
        print(f"   ❌ Failed to load model: {e}")
        return
    
    # 4. Run detection with different confidence levels
    print(f"\n4️⃣ DETECTION TEST (testing different confidence thresholds)")
    
    confidence_levels = [0.3, 0.4, 0.5, 0.6]
    
    for conf in confidence_levels:
        print(f"\n   Testing with conf={conf}...")
        try:
            results = model.predict(
                image_path,
                conf=conf,
                imgsz=640,
                verbose=False,
                half=False
            )
            
            result = results[0]
            
            if result.boxes is not None and len(result.boxes) > 0:
                print(f"   ✅ DETECTION SUCCESSFUL at conf={conf}")
                print(f"      Found {len(result.boxes)} detection(s)")
                
                for i, box in enumerate(result.boxes):
                    conf_val = float(box.conf[0]) * 100
                    cls_idx = int(box.cls[0])
                    class_name = result.names[cls_idx]
                    
                    print(f"      Detection {i+1}:")
                    print(f"         🏷️  Class: {class_name}")
                    print(f"         📊 Confidence: {conf_val:.2f}%")
                    
                    x1, y1, x2, y2 = box.xyxy[0]
                    print(f"         📍 Bbox: ({int(x1)}, {int(y1)}) -> ({int(x2)}, {int(y2)})")
            else:
                print(f"   ⚠️  NO DETECTION at conf={conf}")
        
        except Exception as e:
            print(f"   ❌ Error at conf={conf}: {e}")
    
    print(f"\n{'='*60}\n")
    print("📝 RECOMMENDATIONS:")
    print("   • If model detects at conf=0.3 but not higher: lowering threshold helps")
    print("   • If model never detects: check if image contains actual bunga")
    print("   • If model weights are corrupted: retrain or download new weights")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python test_bunga_detection.py <image_path> [model_path]")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else "ml_models/bunga/train/weights/best.pt"
    
    test_detection(image_path, model_path)
