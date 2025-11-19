// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// NEW: Import Authentication functions
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";



// My web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjG65CEKmpI94uaMa3oO0xMso8z7K0sUk",
  authDomain: "powerhacks-demo.firebaseapp.com",
  projectId: "powerhacks-demo",
  storageBucket: "powerhacks-demo.firebasestorage.app",
  messagingSenderId: "540891308726",
  appId: "1:540891308726:web:5e62fbb51f9d2013107c17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// NEW: Initialize Auth
export const auth = getAuth(app);














