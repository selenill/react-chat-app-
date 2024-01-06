// Import the functions from the SDKs 
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAELQdWPiWU70vXYDKrK6fF5_H-FGtf6B0",
  authDomain: "react-chat-app-6aeab.firebaseapp.com",
  projectId: "react-chat-app-6aeab",
  storageBucket: "react-chat-app-6aeab.appspot.com",
  messagingSenderId: "695307744299",
  appId: "1:695307744299:web:1ad38ea28d0c15820ae66e",
  measurementId: "G-1S14W9H375"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);