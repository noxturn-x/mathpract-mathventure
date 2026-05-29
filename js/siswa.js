import { db, ROOM_REF, PLAYERS_COL, TEAMS_COL } from './firebase-config.js';
import { onSnapshot, doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let myId = localStorage.getItem('math_player_id') || "p_" + Date.now();
let myData = null;
let isFrozen = false;

// 1. Join Game
document.getElementById('btn-join').addEventListener('click', async () => {
    const nama = document.getElementById('in-nama').value;
    const absen = document.getElementById('in-absen').value;
    if(!nama) return;

    localStorage.setItem('math_player_id', myId);
    await setDoc(doc(db, "players", myId), {
        nama, absen, current_stage: 0, team_id: "", koin: 0
    });
    initGameplay();
});

// 2. Gameplay Loop
function initGameplay() {
    document.getElementById('view-setup').classList.add('hidden');
    document.getElementById('view-game').classList.remove('hidden');

    onSnapshot(doc(db, "players", myId), (snap) => {
        myData = snap.data();
        document.getElementById('display-stage').innerText = `Stage ${myData.current_stage}/20`;
        document.getElementById('display-coin').innerText = `💰 ${myData.koin}`;
        loadQuestion(myData.current_stage);
    });

    onSnapshot(ROOM_REF, (snap) => {
        if(snap.data().status === 'finished') switchView('view-finish');
    });
}

// 3. Freeze Penalty Logic (Saran 2 Terintegrasi)
async function handleAnswer(selected, correct) {
    if (isFrozen) return;

    if (selected === correct) {
        await updateDoc(doc(db, "players", myId), { 
            current_stage: myData.current_stage + 1,
            koin: myData.koin + 10 
        });
    } else {
        triggerFreeze();
    }
}

function triggerFreeze() {
    isFrozen = true;
    const overlay = document.getElementById('freeze-overlay');
    const timerText = document.getElementById('freeze-timer');
    let timeLeft = 5;

    overlay.style.display = 'flex';
    document.getElementById('options-grid').classList.add('frozen');

    const interval = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(interval);
            isFrozen = false;
            overlay.style.display = 'none';
            document.getElementById('options-grid').classList.remove('frozen');
        }
    }, 1000);
}

function loadQuestion(stage) {
    // Logika mengambil soal dari soal.json berdasarkan index stage
    // Tampilkan di #q-text dan #options-grid
    // Setiap tombol opsi panggil handleAnswer(dipilih, benar)
}