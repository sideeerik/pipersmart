import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms, models, datasets
import time
from pathlib import Path
import matplotlib.pyplot as plt

# ======================== CONFIG ========================
DATASET_PATH = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\leafdataset\pollu_organized"
OUTPUT_PATH = r"c:\Users\admin\Documents\6.1 Reporting\pipersmart\ml_models\leafdataset"
EPOCHS = 20
BATCH_SIZE = 32
LEARNING_RATE = 0.001
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print(f"Using device: {DEVICE}")

# Create output directory
os.makedirs(OUTPUT_PATH, exist_ok=True)

# ======================== DATA LOADING ========================
print("\n📊 Loading dataset...")

data_transforms = {
    'train': transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ]),
    'test': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])
}

train_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'train'), 
                                     transform=data_transforms['train'])
val_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'val'), 
                                   transform=data_transforms['val'])
test_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, 'test'), 
                                    transform=data_transforms['test'])

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print(f"✓ Train: {len(train_dataset)} images")
print(f"✓ Val: {len(val_dataset)} images")
print(f"✓ Test: {len(test_dataset)} images")

# ======================== MODEL ========================
print("\n🤖 Loading ResNet50 model...")

model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

# Freeze early layers
for param in model.parameters():
    param.requires_grad = False

# Replace final layer for binary classification
num_classes = len(train_dataset.classes)
model.fc = nn.Linear(model.fc.in_features, num_classes)

model = model.to(DEVICE)

# ======================== TRAINING SETUP ========================
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, 
                                                  patience=3)

# ======================== TRAINING FUNCTION ========================
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    avg_loss = running_loss / len(loader)
    accuracy = correct / total
    return avg_loss, accuracy

# ======================== VALIDATION FUNCTION ========================
def validate_epoch(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    avg_loss = running_loss / len(loader)
    accuracy = correct / total
    return avg_loss, accuracy

# ======================== TRAIN ========================
print(f"\n🚀 Starting training ({EPOCHS} epochs)...\n")

history = {
    'train_loss': [],
    'val_loss': [],
    'train_acc': [],
    'val_acc': []
}

best_val_loss = float('inf')
best_model_path = os.path.join(OUTPUT_PATH, 'pollu_model.pth')

start_time = time.time()

for epoch in range(EPOCHS):
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, DEVICE)
    val_loss, val_acc = validate_epoch(model, val_loader, criterion, DEVICE)
    
    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['train_acc'].append(train_acc)
    history['val_acc'].append(val_acc)
    
    scheduler.step(val_loss)
    
    print(f"Epoch {epoch+1}/{EPOCHS} | "
          f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f} | "
          f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
    
    # Save best model
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), best_model_path)
        print(f"  ✓ Model saved (best val loss: {val_loss:.4f})")

elapsed_time = time.time() - start_time
print(f"\n✓ Training completed in {elapsed_time/60:.2f} minutes")

# ======================== TEST ========================
print("\n📈 Evaluating on test set...")

test_loss, test_acc = validate_epoch(model, test_loader, criterion, DEVICE)
print(f"Test Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# ======================== SAVE METRICS ========================
metrics = {
    'epochs': EPOCHS,
    'batch_size': BATCH_SIZE,
    'learning_rate': LEARNING_RATE,
    'device': str(DEVICE),
    'train_loss': history['train_loss'],
    'val_loss': history['val_loss'],
    'train_acc': history['train_acc'],
    'val_acc': history['val_acc'],
    'test_loss': float(test_loss),
    'test_accuracy': float(test_acc),
    'training_time_minutes': elapsed_time/60,
    'classes': train_dataset.classes
}

metrics_path = os.path.join(OUTPUT_PATH, 'pollu_metrics.json')
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=4)

print(f"\n✓ Metrics saved to: {metrics_path}")
print(f"✓ Model saved to: {best_model_path}")

# ======================== PLOT ========================
print("\n📊 Generating plots...")

plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history['train_loss'], label='Train Loss')
plt.plot(history['val_loss'], label='Val Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training & Validation Loss')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history['train_acc'], label='Train Accuracy')
plt.plot(history['val_acc'], label='Val Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('Training & Validation Accuracy')
plt.legend()
plt.grid(True)

plot_path = os.path.join(OUTPUT_PATH, 'pollu_training_plot.png')
plt.savefig(plot_path, dpi=100, bbox_inches='tight')
print(f"✓ Plot saved to: {plot_path}")

print("\n" + "="*60)
print("🎉 TRAINING COMPLETE!")
print("="*60)
print(f"Model: {best_model_path}")
print(f"Metrics: {metrics_path}")
print(f"Classes: {', '.join(train_dataset.classes)}")
print(f"Final Test Accuracy: {test_acc:.4f}")
