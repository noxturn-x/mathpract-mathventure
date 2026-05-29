import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function checkAnswer(playerId, teamId, isCorrect) {
    if (!isCorrect) return;

    const playerRef = doc(db, "players", playerId);
    const pSnap = await getDoc(playerRef);
    const newStage = pSnap.data().current_stage + 1;

    // 1. Update progres individu
    await updateDoc(playerRef, { current_stage: newStage });

    // 2. Cek apakah tim bisa maju (Anti-Free Rider)
    // Ambil data semua player di tim yang sama
    // Jika semua player stage-nya >= X, maka team group_stage = X
}