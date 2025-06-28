// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDdiLcjRhaPt5U97STIXWYx2pkgtkaNZNU",
  authDomain: "task-master-98691.firebaseapp.com",
  projectId: "task-master-98691",
  storageBucket: "task-master-98691.firebasestorage.app",
  messagingSenderId: "472395254406",
  appId: "1:472395254406:web:452bf11ab9517211585f07",
  measurementId: "G-H6C739NKG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
