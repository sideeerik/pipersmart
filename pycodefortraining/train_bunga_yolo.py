"""
YOLOv8 Training Script for Black Pepper Bunga Ripeness Detection
Dataset: blackpepperbunga2 (YOLO format with train/valid/test splits)
GPU Training: Recommended for faster results (~15-20 min for 30 epochs on T4/A100)
"""

from ultralytics import YOLO
import os
import yaml

# Configuration
DATASET_PATH = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\bungadatasets\blackpepperbunga2"
DATA_YAML = os.path.join(DATASET_PATH, "data.yaml")
OUTPUT_DIR = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\ripebunga"
MODEL_NAME = "yolov8n"  # nano model for faster training
EPOCHS = 30
IMG_SIZE = 640
BATCH_SIZE = 16  # Adjust based on GPU memory (GPU: 16-32, CPU: 8)

print("=" * 70)
print("🍎 YOLOv8 Black Pepper Bunga Training")
print("=" * 70)
print(f"Dataset: {DATASET_PATH}")
print(f"Data YAML: {DATA_YAML}")
print(f"Output Dir: {OUTPUT_DIR}")
print(f"Model: {MODEL_NAME}")
print(f"Epochs: {EPOCHS}")
print(f"Image Size: {IMG_SIZE}")
print(f"Batch Size: {BATCH_SIZE}")
print("=" * 70)

# Verify data.yaml exists
if not os.path.exists(DATA_YAML):
    print(f"❌ ERROR: data.yaml not found at {DATA_YAML}")
    exit(1)

# Load and display data.yaml
with open(DATA_YAML, 'r') as f:
    data_config = yaml.safe_load(f)
    print(f"\n📋 Dataset Classes:")
    if 'names' in data_config:
        for idx, class_name in data_config['names'].items():
            print(f"  Class {idx}: {class_name}")
    print()

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load pretrained YOLOv8n model
print("📥 Loading YOLOv8n pretrained model...")
model = YOLO(f"{MODEL_NAME}.pt")

# Train the model
print("\n🚀 Starting training...")
print("-" * 70)
results = model.train(
    data=DATA_YAML,
    epochs=EPOCHS,
    imgsz=IMG_SIZE,
    batch=BATCH_SIZE,
    device=0,  # GPU device (0 for first GPU, use -1 for CPU)
    patience=3,
    save=True,
    project=OUTPUT_DIR,
    name="bunga_model",
    exist_ok=False,
    verbose=True,
    # Additional training parameters
    augment=True,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=10,
    translate=0.1,
    scale=0.5,
    flipud=0.5,
    fliplr=0.5,
    mosaic=1.0,
    conf=0.5,
)

print("-" * 70)
print("\n✅ Training completed!")

# Model paths
best_model_path = os.path.join(OUTPUT_DIR, "bunga_model", "weights", "best.pt")
last_model_path = os.path.join(OUTPUT_DIR, "bunga_model", "weights", "last.pt")

print("\n" + "=" * 70)
print("📦 TRAINING RESULTS")
print("=" * 70)
print(f"Best Model: {best_model_path}")
print(f"Last Model: {last_model_path}")
print(f"Results Directory: {os.path.join(OUTPUT_DIR, 'bunga_model')}")

# Validate on test set
print("\n📊 Running validation on test set...")
metrics = model.val()
print(f"mAP@50: {metrics.box.map50:.3f}")
print(f"mAP@50-95: {metrics.box.map:.3f}")

print("\n🎉 Done! Ready for mobile integration.")
print("=" * 70)
