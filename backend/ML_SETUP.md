# Mobile Backend ML Setup

## Overview
The mobile backend (Port 4001) now has its own disease prediction capability using the same trained ML model.

## File Structure
```
backend/
├── utils/
│   └── predict_disease.py          (Python inference script - NEW)
├── routes/
│   └── Predict.js                  (API route handler - NEW)
├── app.js                          (Updated with Predict route)
└── ml_models/
    └── pepper_disease_detector/    (Shared - symlink or copy from parent)
```

## Setup Instructions

### 1. Create ml_models directory (if not exists)
```bash
cd backend
mkdir -p ml_models
```

### 2. Copy ML models from parent directory
**Option A: Copy (recommended for separation)**
```bash
xcopy ..\ml_models\pepper_disease_detector ml_models\pepper_disease_detector /E /Y
```

**Option B: Symlink (for development)**
```bash
mklink /D ml_models\pepper_disease_detector ..\..\ml_models\pepper_disease_detector
```

### 3. Verify Setup
The following files should exist:
```
backend/ml_models/pepper_disease_detector/
├── models/
│   ├── pepper_detector_final.pkl   (Trained model ~2MB)
│   └── scaler.pkl                  (Feature scaler ~1KB)
├── class_labels.json               (Disease class labels)
└── ...
```

### 4. Python Requirements
The backend already imports cv2, joblib, numpy which are required:
```bash
# Already in package.json as dev dependency
pip install opencv-python joblib numpy scikit-learn
```

### 5. Test the Endpoint
```bash
# Start backend
npm start

# Test prediction endpoint
curl -X POST http://localhost:4001/api/v1/predict/health

# Should return:
# {
#   "success": true,
#   "message": "✅ Disease prediction service is running",
#   "model": "Random Forest Classifier",
#   "accuracy": "99.22%",
#   "classes": ["Healthy", "Footrot", "Pollu_Disease", "Slow-Decline", "Leaf_Blight", "Yellow_Mottle_Virus"]
# }
```

## API Endpoints

### Health Check
```
GET /api/v1/predict/health
Response: { success: true, message, model, accuracy, classes }
```

### Disease Prediction
```
POST /api/v1/predict/disease
Headers: { Authorization: Bearer <token> }
Body: FormData { image: <file> }

Response:
{
  "success": true,
  "disease": "Footrot",
  "confidence": 95.32,
  "all_predictions": {
    "Healthy": 2.15,
    "Footrot": 95.32,
    "Pollu_Disease": 1.2,
    "Slow-Decline": 0.8,
    "Leaf_Blight": 0.35,
    "Yellow_Mottle_Virus": 0.18
  }
}
```

## Future Separation Plan

When you fully separate the backends:

1. **Keep ML models in backend/** (already done)
2. **Update mobile app** to call port 4001 instead of 5000
3. **Update web app** to keep using port 5000
4. **Optional**: Update backend-web to remove Predict.js if not needed for web

## Differences from backend-web

- Both have identical `predict_disease.py` and `Predict.js`
- Python executable path is hardcoded to: `C:\Users\admin\AppData\Local\Programs\Python\Python313\python.exe`
- Temp files stored in `backend/temp/`
- ML models can be independent copies or symlinks

## Troubleshooting

If Python execution fails:
1. Check Python path is correct in Predict.js
2. Verify ml_models directory exists with all required files
3. Run `npm start` in backend directory
4. Check console logs for specific errors

