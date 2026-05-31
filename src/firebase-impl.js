// src/firebase-impl.js
// โมดูลนี้ถูก import แบบ dynamic จาก firebase.js (โหลด lazy)
// static named import → rollup tree-shake เฉพาะ function ที่ใช้จริง = chunk เล็ก
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, runTransaction, serverTimestamp,
} from "firebase/firestore";
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEVPjjO1b6chwpIXXfpCvvqEkc8Bgspz8",
  authDomain: "dojojin-guestbook-visitor.firebaseapp.com",
  projectId: "dojojin-guestbook-visitor",
  storageBucket: "dojojin-guestbook-visitor.firebasestorage.app",
  messagingSenderId: "703191129555",
  appId: "1:703191129555:web:be0cb85e52e26207462326",
  measurementId: "G-PG142TH1X9",
};

export function init() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  return {
    db, auth, googleProvider,
    // firestore
    doc, collection, onSnapshot, query, orderBy,
    addDoc, deleteDoc, runTransaction, serverTimestamp,
    // auth
    onAuthStateChanged, signInWithPopup, signOut,
  };
}
