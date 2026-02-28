import os
import json
import sys
import numpy as np
import cv2
import joblib
from pathlib import Path

def extract_features(image_path, size=100):
    """Extract color and texture features from image"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        img_resized = cv2.resize(img, (size, size))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        
        features = []
        
        # Color histogram features (30 features)
        for i in range(3):
            hist = cv2.calcHist([img_rgb], [i], None, [10], [0, 256])
            features.extend(hist.flatten())
        
        # Grayscale features
        img_gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(img_gray, 100, 200)
        lap = cv2.Laplacian(img_gray, cv2.CV_64F)
        
        features.append(edges.mean())
        features.append(edges.std())
        features.append(lap.mean())
        features.append(lap.std())
        features.append(img_gray.mean())
        features.append(img_gray.std())
        
        return np.array(features, dtype=np.float32)
    except Exception as e:
        print(json.dumps({'error': f'Error extracting features: {str(e)}'}))
        return None

def predict_disease(image_path):
    """Predict disease from image"""
    try:
        # Define model paths relative to backend directory
        backend_dir = Path(__file__).parent.parent
        model_path = backend_dir / 'ml_models' / 'pepper_disease_detector' / 'models' / 'pepper_detector_final.pkl'
        scaler_path = backend_dir / 'ml_models' / 'pepper_disease_detector' / 'models' / 'scaler.pkl'
        labels_path = backend_dir / 'ml_models' / 'pepper_disease_detector' / 'class_labels.json'
        
        # Fallback to parent directory structure (if models are shared)
        if not model_path.exists():
            model_path = Path(__file__).parent.parent.parent / 'ml_models' / 'pepper_disease_detector' / 'models' / 'pepper_detector_final.pkl'
            scaler_path = Path(__file__).parent.parent.parent / 'ml_models' / 'pepper_disease_detector' / 'models' / 'scaler.pkl'
            labels_path = Path(__file__).parent.parent.parent / 'ml_models' / 'pepper_disease_detector' / 'class_labels.json'
        
        # Load model and scaler
        if not model_path.exists():
            return {'error': f'Model not found at {model_path}'}
        
        model = joblib.load(str(model_path))
        scaler = joblib.load(str(scaler_path))
        
        with open(labels_path) as f:
            classes = json.load(f)
        
        # Extract features from image
        features = extract_features(image_path)
        if features is None:
            return {'error': 'Could not process image. Ensure it is a valid image file.'}
        
        # Scale features
        features_scaled = scaler.transform([features])
        
        # Predict
        predictions = model.predict_proba(features_scaled)[0]
        class_idx = np.argmax(predictions)
        confidence = float(predictions[class_idx]) * 100
        
        # Get all predictions
        all_predictions = {
            classes[i]: round(float(predictions[i]) * 100, 2)
            for i in range(len(classes))
        }
        
        return {
            'disease': classes[class_idx],
            'confidence': round(confidence, 2),
            'all_predictions': all_predictions,
            'success': True
        }
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({'error': f'Image file not found: {image_path}'}))
        sys.exit(1)
    
    result = predict_disease(image_path)
    print(json.dumps(result))
