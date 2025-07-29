// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdiLcjRhaPt5U97STIXWYx2pkgtkaNZNU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "task-master-98691.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "task-master-98691",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "task-master-98691.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "472395254406",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:472395254406:web:452bf11ab9517211585f07",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H6C739NKG5"
};

// Validate required environment variables in production
if (import.meta.env.PROD) {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  if (missingVars.length > 0) {
    console.error('Missing required Firebase environment variables:', missingVars);
    throw new Error('Firebase configuration incomplete');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
