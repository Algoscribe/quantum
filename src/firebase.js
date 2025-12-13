// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqu1TsAC0Pj2vetA-FCk50K59Ebc-_QIQ",
  authDomain: "my-quantum-website.firebaseapp.com",
  projectId: "my-quantum-website",
  storageBucket: "my-quantum-website.firebasestorage.app",
  messagingSenderId: "563049952310",
  appId: "1:563049952310:web:855dea3557781c9572d497"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export authentication instance
export const auth = getAuth(app);
