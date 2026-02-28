import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Firebase configuration using the API key from your .env or hardcoded
// NOTE: For better security, consider moving these to .env file
const firebaseConfig = {
  apiKey: "AIzaSyAOsHUVerp3odNffUacEzU0rRHf9FnWIM4", // Matches backend config
  authDomain: "harmoniahub-2efd5.firebaseapp.com",
  projectId: "harmoniahub-2efd5",
  storageBucket: "harmoniahub-2efd5.firebasestorage.app",
  messagingSenderId: "112867671853655695337", // Matches backend config
  appId: "1:112867671853655695337:web:your-app-id-here" // Matches backend config structure
};

console.log('🔧 Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Present' : '❌ Missing'
});

// Initialize Firebase
let app;
let auth;
let googleProvider;
let facebookProvider;

try {
  console.log('🚀 Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  
  console.log('🔐 Initializing Firebase Auth...');
  // Initialize Auth with persistence if needed, but for now standard initialization
  auth = getAuth(app);
  
  console.log('🔍 Initializing Google Auth Provider...');
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  console.log('🔍 Initializing Facebook Auth Provider...');
  facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');
  
  console.log('✅ Firebase initialized successfully!');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export { auth, googleProvider, facebookProvider };
export default app;
