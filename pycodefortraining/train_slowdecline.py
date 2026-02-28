import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split
import json
import matplotlib.pyplot as plt
import time
import os
from pathlib import Path

# Configuration
DATASET_PATH = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\leafdataset\slowdecline_organized"
OUTPUT_PATH = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\leafdataset"
EPOCHS = 20
BATCH_SIZE = 32
LEARNING_RATE = 0.001
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print(f"Using device: {DEVICE}")
print(f"Dataset path: {DATASET_PATH}")
print(f"Output path: {OUTPUT_PATH}")
print("=" * 60)

# Data transforms
train_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

val_test_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# Load datasets
train_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'train'), transform=train_transforms)
val_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'val'), transform=val_test_transforms)
test_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'test'), transform=val_test_transforms)

# Create data loaders
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print(f"Train samples: {len(train_dataset)}")
print(f"Val samples: {len(val_dataset)}")
print(f"Test samples: {len(test_dataset)}")
print(f"Classes: {', '.join(train_dataset.classes)}")
print("=" * 60)

# Model setup
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
num_classes = len(train_dataset.classes)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model = model.to(DEVICE)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

# Training loop
metrics = {
    'train_loss': [],
    'train_acc': [],
    'val_loss': [],
    'val_acc': [],
    'test_loss': None,
    'test_acc': None
}

start_time = time.time()

for epoch in range(EPOCHS):
    # Training phase
    model.train()
    train_loss = 0.0
    train_correct = 0
    train_total = 0
    
    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        train_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()
    
    train_loss /= len(train_loader)
    train_acc = train_correct / train_total
    metrics['train_loss'].append(train_loss)
    metrics['train_acc'].append(train_acc)
    
    # Validation phase
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0
    
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            val_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()
    
    val_loss /= len(val_loader)
    val_acc = val_correct / val_total
    metrics['val_loss'].append(val_loss)
    metrics['val_acc'].append(val_acc)
    
    scheduler.step(val_loss)
    
    print(f"Epoch {epoch + 1}/{EPOCHS} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")

elapsed = time.time() - start_time
print(f"\n✓ Training completed in {elapsed / 60:.2f} minutes")

# Test evaluation
print("\n📈 Evaluating on test set...")
model.eval()
test_loss = 0.0
test_correct = 0
test_total = 0

with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        test_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        test_total += labels.size(0)
        test_correct += (predicted == labels).sum().item()

test_loss /= len(test_loader)
test_acc = test_correct / test_total
metrics['test_loss'] = test_loss
metrics['test_acc'] = test_acc

print(f"Test Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# Save metrics
metrics_path = os.path.join(OUTPUT_PATH, 'slowdecline_metrics.json')
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=4)
print(f"\n✓ Metrics saved to: {metrics_path}")

# Save model
model_path = os.path.join(OUTPUT_PATH, 'slowdecline_model.pth')
torch.save(model.state_dict(), model_path)
print(f"✓ Model saved to: {model_path}")

# Generate plots
print("\n📊 Generating plots...")
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(metrics['train_loss'], label='Train Loss')
plt.plot(metrics['val_loss'], label='Val Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Slow-Decline: Training & Validation Loss')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(metrics['train_acc'], label='Train Accuracy')
plt.plot(metrics['val_acc'], label='Val Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.title('Slow-Decline: Training & Validation Accuracy')
plt.grid(True)

plot_path = os.path.join(OUTPUT_PATH, 'slowdecline_training_plot.png')
plt.tight_layout()
plt.savefig(plot_path)
print(f"✓ Plot saved to: {plot_path}")

print("\n" + "=" * 60)
print("🎉 TRAINING COMPLETE!")
print("=" * 60)
print(f"Model: {model_path}")
print(f"Metrics: {metrics_path}")
print(f"Classes: {', '.join(train_dataset.classes)}")
print(f"Final Test Accuracy: {test_acc:.4f}")
