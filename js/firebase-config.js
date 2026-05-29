import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
export const db = getFirestore(app);
export const activeRoomId = 'kelas_8a_2026';
export const ROOM_REF = doc(db, "rooms", activeRoomId);
export const PLAYERS_COL = collection(db, "players");
export const TEAMS_COL = collection(db, "teams");