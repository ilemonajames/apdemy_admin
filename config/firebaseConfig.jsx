// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-0I7cYQYlGk_7jwui5fHr8FiixkkqGBg",
  authDomain: "reactnatively-14c27.firebaseapp.com",
  projectId: "reactnatively-14c27",
  storageBucket: "reactnatively-14c27.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "205672231989",
  appId: "1:205672231989:web:2ff4c316714fad294a6d7c",
  measurementId: "G-MMJKRD5WVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (web version automatically uses browser persistence)
const auth = getAuth(app);

const db = getFirestore(app);
//const analytics = getAnalytics(app);

export { auth, db }; // Export what you need