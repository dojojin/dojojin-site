// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore  } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEVPjjO1b6chwpIXXfpCvvqEkc8Bgspz8",
  authDomain: "dojojin-guestbook-visitor.firebaseapp.com",
  projectId: "dojojin-guestbook-visitor",
  storageBucket: "dojojin-guestbook-visitor.firebasestorage.app",
  messagingSenderId: "703191129555",
  appId: "1:703191129555:web:be0cb85e52e26207462326",
  measurementId: "G-PG142TH1X9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
