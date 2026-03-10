import os
import json
import numpy as np
import cv2
from pathlib import Path
import joblib
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class DiseasePredictor:
    def __init__(self, model_path='ml_models/pepper_disease_detector/models/pepper_detector_final.pkl',
                 scaler_path='ml_models/pepper_disease_detector/models/scaler.pkl',
                 labels_path='ml_models/pepper_disease_detector/class_labels.json'):
        """Initialize predictor with trained model"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            with open(labels_path) as f:
                self.classes = json.load(f)
            print(f"✅ Model loaded successfully. Classes: {self.classes}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
            self.scaler = None
            self.classes = []
    
    def extract_features(self, image_path, size=100):
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
            print(f"Error extracting features: {e}")
            return None
    
    def predict(self, image_path):
        """Make prediction on image"""
        if self.model is None:
            return {'error': 'Model not loaded'}
        
        try:
            # Extract features
            features = self.extract_features(image_path)
            if features is None:
                return {'error': 'Could not process image'}
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            predictions = self.model.predict_proba(features_scaled)[0]
            class_idx = np.argmax(predictions)
            confidence = float(predictions[class_idx]) * 100
            
            # Get all predictions
            all_predictions = {
                self.classes[i]: round(float(predictions[i]) * 100, 2)
                for i in range(len(self.classes))
            }
            
            return {
                'disease': self.classes[class_idx],
                'confidence': round(confidence, 2),
                'all_predictions': all_predictions,
                'success': True
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return {'error': str(e)}

# Initialize predictor
predictor = DiseasePredictor()

if __name__ == "__main__":
    # Test the predictor
    test_image = "test_image.jpg"
    if os.path.exists(test_image):
        result = predictor.predict(test_image)
        print(json.dumps(result, indent=2))
    else:
        print("No test image found")
