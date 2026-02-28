# PiperSmart Copilot Instructions

## Project Overview

**PiperSmart** is a full-stack agricultural application for black pepper disease detection and analysis. It consists of:
- **Mobile App** (Expo/React Native) - Port 8081, connects to backend on port 4001
- **Web App** (Vite/React) - Port 5173, connects to backend on port 5000
- **Dual Backends** (Express.js) - Separate backends for mobile (port 4001) and web (port 5000)
- **Shared MongoDB Database** - Both backends use the same database

## Critical Architecture

### Multi-Backend Pattern
Both `backend/` and `backend-web/` exist **intentionally**:
- `backend/` (Port 4001): Mobile app backend
- `backend-web/` (Port 5000): Web app backend
- **Same MongoDB database and credentials** for both
- **Separate CORS configurations** (backend-web whitelists Vite origins)

To run both: Open terminal 1 in `backend/`, terminal 2 in `backend-web/`, both run `npm start`.

### Authentication Flow
1. User registers/logs in via `/api/v1/users/register` or `/api/v1/users/login`
2. Backend returns JWT token
3. **Mobile app** (AppNavigator.js): Token stored in AsyncStorage, axios default header auto-configured on init
4. **Web app**: Token stored in localStorage, axios interceptor adds header to all requests
5. Protected endpoints require `Authorization: Bearer ${token}` header

**Common Issue**: API calls fail with 401 if Authorization header isn't set. In mobile, verify `setupAxios()` runs before API calls. In web, check axios interceptor is attached.

## Directory Structure

```
backend/          Mobile backend (Port 4001)
├── app.js        CORS config, routes setup
├── server.js     Env load, DB connect, listen
├── config/       Database & Firebase config
├── controllers/  Business logic (User.js handles auth)
├── routes/       API endpoints (/api/v1/users/*)
├── models/       MongoDB schemas
└── utils/        Cloudinary, Firebase, Mailer, Multer

backend-web/      Web backend (Port 5000)
└── [Same structure]

mobile/           Expo React Native app
├── src/
│   ├── Components/Navigation/AppNavigator.js  [CRITICAL] Sets up axios + auth
│   ├── Components/Screen/                     Feature screens
│   └── utils/helper.js                        Auth helpers (getToken, getUser)
└── package.json  Includes axios, react-native-maps

web/              Vite React app
├── src/
│   ├── Components/User/                       User screens
│   ├── Components/Admin/                      Admin screens
│   └── config/firebase.js
└── package.json  React Router, axios, Firebase
```

## Key Files & Patterns

### Backend Authentication (backend/controllers/User.js)
- `registerUser`: Email verification required (sends Mailer with token)
- `loginUser`: Returns JWT token (valid 24h by default)
- `firebaseGoogleAuth/firebaseFacebookAuth`: OAuth providers
- Protected routes use `isAuthenticatedUser` middleware

### Mobile Auth Setup (mobile/src/Components/Navigation/AppNavigator.js)
```javascript
// MUST run before any API call
const token = await getToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor logs 401 errors with header status
axios.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    console.error('❌ Authorization header:', axios.defaults.headers.common['Authorization']);
  }
  return Promise.reject(error);
});
```

### Backend Routes (backend/routes/User.js)
```
POST   /api/v1/users/register              No auth required
POST   /api/v1/users/login                 No auth required
GET    /api/v1/users/me                    ✅ Requires auth
PUT    /api/v1/users/me/update             ✅ Requires auth
POST   /api/v1/users/firebase/auth/google  No auth required
POST   /api/v1/users/firebase/auth/facebook No auth required
POST   /api/v1/users/forgot-password       No auth required
GET    /api/v1/users/verify-email/:token   No auth required
```

## Development Workflows

### Start Mobile Backend
```bash
cd backend
npm start
# Output: "Server started on port: 4001 in development mode"
```

### Start Web Backend
```bash
cd backend-web
npm start
# Output shows Port 5000
```

### Start Mobile App
```bash
cd mobile
npm start
# Then press 'a' for Android or 'i' for iOS
```

### Start Web App
```bash
cd web
npm run dev
# Opens http://localhost:5173
```

### Test Backend Health
```bash
curl http://localhost:4001/api/v1/health
curl http://localhost:5000/api/v1/health
```

## Common Pitfalls & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| 401 Unauthorized in mobile | Token not set in axios header | Verify `setupAxios()` runs in AppNavigator useEffect before `fetchUser()` |
| CORS error from web app | backend (4001) doesn't have Vite origins | Make requests to `backend-web` (port 5000) instead |
| "No token found" warning | User not logged in | Token should be null initially; log in first |
| Backend not accepting requests | .env variables not loaded | Ensure `config/.env` exists with `PORT`, `DB_URI`, `JWT_SECRET` |
| Firebase auth fails | Missing firebaseAdmin.js setup | Check `config/firebase.js` and `utils/firebaseAdmin.js` have correct credentials |

## Data Flow Examples

### Register New User (Mobile)
1. User fills form → `registerUser()` POST to `/api/v1/users/register`
2. Backend: Validates email uniqueness, hashes password, creates user, sends verification email
3. Response: User data + message "Verification email sent"
4. User checks email, clicks verification link
5. Backend: `verifyEmail()` marks `isVerified: true`

### Update Profile (Mobile - Auth Required)
1. User uploads photo + updates form
2. Multer uploads to Cloudinary via `uploadWithJson` middleware
3. PUT to `/api/v1/users/me/update` with Authorization header
4. Backend: Verifies auth, updates user doc, returns updated user
5. Mobile: Stores updated user in AsyncStorage, refreshes UI

## Environment Setup

### Required .env Files

**backend/config/.env & backend-web/config/.env:**
```
PORT=4001  (or 5000 for backend-web)
NODE_ENV=development
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_email@project.iam.gserviceaccount.com
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password
```

**mobile/.env:**
```
EXPO_PUBLIC_BACKEND_URL=http://192.168.x.x:4001  # Your machine's IP
EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"..."}
```

**web/.env:**
```
VITE_BACKEND_URL=http://localhost:5000
VITE_FIREBASE_CONFIG={"apiKey":"..."}
```

## Testing Approach

1. **Health Check First**: Test `/api/v1/health` endpoints before feature work
2. **Auth Flow**: Manual test register → verify email → login → protected endpoint
3. **Console Logs**: Mobile uses detailed logging (✅/❌ prefixes) for debugging
4. **AsyncStorage**: In mobile, verify token persists via `getToken()` helper

## Git & Deployment Notes

- Both backends share database but have separate repos/deployments
- Mobile uses Expo EAS for builds
- Web uses Vite for builds
- `.env` files are `.gitignored` - never commit credentials
- Verify `FIREBASE_PRIVATE_KEY` format (escaped newlines: `\n` not literal)
