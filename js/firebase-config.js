import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzi8YvyOMmbiAs6VQs3-XBnWoJISJ4mC0",
  authDomain: "mathpract-mathventure.firebaseapp.com",
  projectId: "mathpract-mathventure",
  storageBucket: "mathpract-mathventure.firebasestorage.app",
  messagingSenderId: "675898460627",
  appId: "1:675898460627:web:a36ca4ead55092bbf10726",
  measurementId: "G-ZQTRPEWBN5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const activeRoomId = 'kelas_8a_2026';

// Menjamin user login secara anonim agar bisa baca/tulis Firestore
signInAnonymously(auth).catch(err => console.error("Firebase Auth Error:", err));