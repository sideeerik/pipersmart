import os
import json
import sys
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path

def load_model(model_path, device, class_names):
    """Load the pre-trained ResNet50 model"""
    try:
        num_classes = len(class_names)
        
        # Load ResNet50 with pre-trained weights
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        
        # Replace the final layer to match our number of classes
        model.fc = nn.Linear(model.fc.in_features, num_classes)
        
        # Load the trained weights
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint)
        
        model = model.to(device)
        model.eval()
        
        return model
    except Exception as e:
        raise Exception(f"Failed to load model: {str(e)}")

def preprocess_image(image_path):
    """Preprocess image for ResNet50"""
    try:
        # Define transforms (same as used during training)
        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])
        
        # Load and transform image
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image)
        
        return image_tensor.unsqueeze(0)  # Add batch dimension
    except Exception as e:
        raise Exception(f"Failed to preprocess image: {str(e)}")

def predict_disease(image_path, model_path, class_names):
    """Predict disease from image using ResNet50 model"""
    try:
        # Set device
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Check if model path exists
        if not os.path.exists(model_path):
            return {'error': f'Model not found at {model_path}'}
        
        # Check if image path exists
        if not os.path.exists(image_path):
            return {'error': f'Image not found at {image_path}'}
        
        # Load model
        model = load_model(model_path, device, class_names)
        
        # Preprocess image
        image_tensor = preprocess_image(image_path)
        image_tensor = image_tensor.to(device)
        
        # Run inference
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, pred_class = torch.max(probabilities, 1)
        
        # Get results
        pred_idx = pred_class.item()
        pred_disease = class_names[pred_idx]
        pred_confidence = float(confidence.item()) * 100
        
        # Get all predictions as percentages
        all_predictions = {
            class_names[i]: round(float(probabilities[0][i].item()) * 100, 2)
            for i in range(len(class_names))
        }
        
        return {
            'disease': pred_disease,
            'confidence': round(pred_confidence, 2),
            'all_predictions': all_predictions,
            'success': True
        }
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)
    
    image_path = sys.argv[1].strip('"')
    
    # Define paths using project root
    project_root = Path(__file__).parent.parent.parent
    model_path = project_root / 'ml_models' / 'leafdataset' / 'unified_pepper_diseases_model.pth'
    metrics_path = project_root / 'ml_models' / 'leafdataset' / 'unified_pepper_diseases_metrics.json'
    
    # Load class names from metrics.json
    try:
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
            class_names = metrics.get('classes', [])
        
        if not class_names:
            print(json.dumps({'error': 'No classes found in metrics.json'}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({'error': f'Failed to load metrics.json: {str(e)}'}))
        sys.exit(1)
    
    result = predict_disease(image_path, str(model_path), class_names)
    print(json.dumps(result))
