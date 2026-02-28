# Real-Time Camera Analysis - Error Explanation & Fixes

## Errors You Saw:

### 1. ⚠️ `Notification fetch timeout (will retry): canceled`
**What it is:** Expo internal notification system timing out  
**Severity:** ⚠️ Low - Not critical to functionality  
**Why it happens:** Expo tries to fetch push notifications, network delay causes timeout  
**Impact:** None - system auto-retries, doesn't affect bunga analysis

---

### 2. ❌ `Request failed with status code 400` (Backend rejection)
**What it is:** HTTP 400 Bad Request error  
**Severity:** 🔴 Critical - Analysis won't work  
**Root causes:**
- **Missing authentication token** - App not logged in properly
- **Incorrect image format** - Image data structure doesn't match backend expectations  
- **Invalid form data** - Missing required fields in FormData
- **Backend validation failed** - Server rejects the image/data

**Example flow:**
```
1. Real-time camera starts ✓
2. Captures image ✓
3. Sends to backend ✗
4. Backend says: "400 - I don't understand this data format"
5. Error shown in console
```

**Why this happens in real-time mode:**
- Token might not be properly set when switching to real-time mode
- Camera captures so fast that token initialization might race with first capture
- Axios headers might not be properly carried over

---

### 3. ❌ `Image could not be captured`
**What it is:** Native camera failed to capture a photo  
**Severity:** 🔴 Critical - Can't analyze without images  
**Root causes:**
- **Camera permissions denied** - App doesn't have camera access
- **Camera already in use** - Another app using camera
- **CameraView not ready** - Component still loading
- **Device camera issue** - Hardware problem
- **React Native Expo camera issue** - Native code error

**Example flow:**
```
1. Real-time analysis starts
2. App tries: takePictureAsync()
3. Native camera responds: "I can't capture right now"
4. Error: "Image could not be captured"
```

---

## What I Fixed:

### 1. **Added Token Validation BEFORE Capturing**
```javascript
// OLD (BAD):
const photo = await cameraRef.current.takePictureAsync();
const token = axios.defaults.headers.common['Authorization']; // Too late!

// NEW (GOOD):
const token = axios.defaults.headers.common['Authorization'];
if (!token) {
  setError('Authentication required - please login again');
  return; // Don't capture if no token
}
const photo = await cameraRef.current.takePictureAsync();
```

**Why this matters:** Ensures authentication is ready BEFORE wasting time capturing.

---

### 2. **Added Detailed Debug Logging**
Now you'll see logs like:
```
📸 Photo captured: file:///path/to/image.jpg
📤 Sending to backend with token: Bearer eyJhbGc...
❌ Bad Request (400) - Server says: {"error": "Missing field X"}
```

This tells you EXACTLY what's failing and where.

---

### 3. **Better Error Messages**
Instead of generic "Analysis failed", you now get:
- `"Authentication failed - please login again"` → 401 error
- `"Invalid image format or incomplete data sent to server"` → 400 error  
- `"Camera capture failed - check permissions or restart app"` → Camera error
- `"Bunga detection service not available"` → 404 error

---

### 4. **Token Check Before Starting Real-Time**
```javascript
const startRealTimeAnalysis = async () => {
  const token = axios.defaults.headers.common['Authorization'];
  if (!token) {
    Alert.alert('Authentication Required', 'Please login first');
    return; // Stop if not authenticated
  }
  // Start analyzing...
}
```

**Why this matters:** Prevents wasting phone resources on analysis that will fail anyway.

---

## How to Fix These Issues:

### Fix 1: Confirm You're Logged In
**Steps:**
1. Go back to login screen
2. Make sure you successfully logged in (see user info in drawer)
3. Then try real-time analyzer
4. Check console for: `🎥 Starting real-time analysis with token: Bearer eyJ...`

**If you see:** `❌ No authentication token found`  
→ You're NOT logged in. Log in first.

---

### Fix 2: Check Camera Permissions
**iOS:**
1. Settings → PiperSmart → Camera → Turn ON
2. Restart the app (press 'r' in Expo terminal)
3. Try again - should show permission request

**Android:**
1. Settings → Apps → Pipersmart → Permissions → Camera → Allow
2. Restart the app
3. Try again

**If you see:** `❌ Camera capture failed - check permissions...`  
→ Camera permissions not granted. Follow steps above.

---

### Fix 3: Make Sure Backend is Running  
**Check:**
```bash
# In terminal, run:
curl http://localhost:4001/api/v1/health
```

**Expected response:**
```
{
  "status": "ok",
  "backend_type": "mobile",
  "bunga_model": "YOLOv8 Ensemble (v1 + v2)"
}
```

**If it fails:**
→ Backend not running. Start it: `npm start` in backend folder

---

### Fix 4: Check Image Format
The backend expects image in very specific format. Look in console for:
```
📤 Sending to backend with token...
```

If you see 400 error after this, the issue is **data format**, likely:
- Image URI not valid → Check file path
- Image not readable → Try uploading from gallery first
- Backend validation → Check backend logs

---

## Testing Workflow:

### ✅ Proper sequence:
1. **Login** → See "USER" in drawer
2. **Open Bunga Ripeness Screen**
3. **Click "Real-time" button** → Should ask camera permission
4. **Grant permission** → Camera preview starts
5. **Click "Start" button** → Should see `🎥 Starting real-time analysis with token: Bearer...` in console
6. **Point camera at bunga** → Should see "🔴 LIVE - Analyzing every 2.5s"
7. **Wait 2-3 seconds** → Should see result: "Ripe/Unripe/Overripe" with confidence %

### ❌ If it fails:
- Check console for which step fails
- Look at the error message from my fixes
- Cross-reference with solutions above

---

## Console Log Legend:

| Symbol | Meaning | Action |
|--------|---------|--------|
| 📸 | Image captured successfully | ✓ Good, moving forward |
| 📤 | Sending to backend | ✓ Good, waiting for response |
| ✅ | Operation succeeded | ✓ Good, continue |
| ⚠️ | Warning (non-blocking) | ⚠️ Note but continue |
| ❌ | Error (blocking) | 🔴 Stop and fix |
| 🎥 | Real-time analyzer event | ℹ️ Information |

---

## Next Steps:

1. **Test with latest code** - I've added better logging
2. **Check console** - Look for token validation message
3. **Report what you see** - Share the console output
4. **Verify login** - Make sure user is authenticated
5. **Test camera permissions** - Grant if prompted
6. **Restart Expo** - Press 'r' to reload with new code

---

## If You Still See 400 Error:

Please share the console output that shows:
```
❌ Bad Request (400) - Server says: {...}
```

This will tell us exactly what the backend is rejecting, so we can fix it.
