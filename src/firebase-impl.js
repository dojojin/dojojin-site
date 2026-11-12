// src/firebase-impl.js
// โมดูลนี้ถูก import แบบ dynamic จาก firebase.js (โหลด lazy)
// static named import → rollup tree-shake เฉพาะ function ที่ใช้จริง = chunk เล็ก
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase-config.js";
import {
  getFirestore, doc, collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, runTransaction, serverTimestamp,
  setDoc, getDoc, getDocs, increment, limit,
} from "firebase/firestore";
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
} from "firebase/auth";


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
    setDoc, getDoc, getDocs, increment, limit,
    // auth
    onAuthStateChanged, signInWithPopup, signOut,
  };
}
