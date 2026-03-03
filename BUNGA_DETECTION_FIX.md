# Bunga Detection Troubleshooting Guide

## What I Fixed

### 1. **Backend Changes** (`bungaController.js`)
- ✅ Added detailed logging of Python stderr output
- ✅ Improved error message handling
- ✅ Better response formatting to show success/failure status
- ✅ More informative console logs for debugging

### 2. **Detection Model Settings** (`predict_bunga_dual_models.py`)
- ✅ Lowered confidence threshold from **0.5 (50%)** → **0.3 (30%)**
  - Higher threshold = misses valid detections
  - 0.3 is more forgiving while still accurate
- ✅ Increased image size from **512** → **640** pixels
  - Larger size = better detail for detection
- ✅ Changed `half=True` → `half=False`
  - More stable predictions (no numerical instability)
- ✅ Added model file existence check
- ✅ Better logging of detection process

### 3. **Mobile App UI** (`BungaRipenessScreen.js`)
- ✅ Enhanced error message display
- ✅ Added helpful tips when detection fails
- ✅ Better error visual feedback

---

## Testing the Fix

### Step 1: Test Python Detection Directly
```bash
cd backend
python utils/test_bunga_detection.py "..\picturesofbp\bp1.jpg"
```

**What to look for:**
- ✅ Image loads successfully
- ✅ Model loads successfully  
- ✅ Detection works at **conf=0.3** (even if not at 0.4, 0.5, 0.6)
- 📊 Shows bbox coordinates and confidence score

### Step 2: Check Backend Logs
When you analyze from the mobile app:
```
📸 [bunga_XXXXX] Bunga Analysis Request
🐍 Spawning Python...
📝 Python stderr: (detailed output)
📤 Python stdout: (JSON result)
📊 Full stderr output: (complete log)
```

**What to look for:**
- ✅ `🤖 Loading unified bunga model...`
- ✅ `📸 Image dimensions: WIDTHxHEIGHT`
- ✅ Either `✅ Detection: Class A-a...` OR `⚠️ No bunga detected`

### Step 3: Backend Health Check
```bash
# From any terminal
curl http://localhost:4001/api/v1/health
```

---

## If Detection Still Fails

### Check 1: Model File Integrity
```bash
cd backend
python
>>> from ultralytics import YOLO
>>> model = YOLO('ml_models/bunga/train/weights/best.pt')
>>> # If this runs without error, model is OK
```

### Check 2: Image Quality
Ensure your test image:
- ✅ Contains a clear, well-lit black pepper bunga
- ✅ Has the bunga filling 30-70% of the frame
- ✅ Is not too dark, blurry, or rotated
- ✅ Is in JPG or PNG format

### Check 3: Full Detection Pipeline
```bash
# Test with different confidence levels
python utils/test_bunga_detection.py "your_image.jpg"
```

If detection works at conf=0.3 in this test but not in the app:
1. Restart backend: `npm start`
2. Clear temp files: `backend/temp/*`
3. Try again in mobile app

### Check 4: Backend-Mobile Communication
In backend console, you should see:
- Full Python output (stderr)
- Parsed JSON result
- ResponseData sent to frontend

In mobile console, you should see:
- ✅ Result: (JSON response)
- Either success or error message

---

## API Response Format (New)

### Successful Detection
```json
{
  "success": true,
  "ripeness": "Ripe",
  "ripeness_percentage": 78.5,
  "health_class": "a",
  "health_percentage": 92.0,
  "confidence": 95.34,
  "processingTime": 2500,
  "analysisId": "507f1f77bcf86cd799439011",
  "market_grade": "Premium",
  "image_size": [3060, 3060]
}
```

### Detection Failed
```json
{
  "success": false,
  "ripeness": null,
  "ripeness_percentage": 0,
  "health_class": null,
  "health_percentage": 0,
  "confidence": 0,
  "processingTime": 1700,
  "analysisId": null,
  "market_grade": null,
  "image_size": [3060, 3060],
  "error": "No black pepper bunga detected in image"
}
```

---

## Next Steps

1. **Test the diagnostic script** with your image
2. **Check backend console logs** for detailed Python output
3. **Verify model file** isn't corrupted
4. **Try better image** (clear, well-lit, bunga-centered)
5. **Monitor confidence scores** - if they're improving, model is working

---

## Performance Notes

- First detection: 10-17 seconds (YOLO model loads into memory)
- Subsequent detections: 2-3 seconds (model cached)
- Confidence threshold of 0.3 is reasonable - balances accuracy vs detection rate

---

## Questions?

Check the console output from these three places:
1. **Backend terminal** - shows Python output + parsing
2. **Mobile terminal** - shows API response
3. **Python test** - shows model loading and detection at different confidence levels
