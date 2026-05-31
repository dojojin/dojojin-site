// src/firebase.js
// โหลด Firebase แบบ lazy — โมดูลจริงอยู่ใน firebase-impl.js (static import → tree-shake ได้)
// dynamic import ทำให้ทั้งก้อนถูกแยกเป็น chunk ที่โหลดตอนใช้ครั้งแรกเท่านั้น
// คืน object ที่มี { db, auth, googleProvider, + named firestore/auth functions }

let _fb = null;

export function loadFirebase() {
  if (!_fb) _fb = import("./firebase-impl.js").then((m) => m.init());
  return _fb;
}
