import { db, ROOM_REF, PLAYERS_COL } from './firebase-config.js';
import { onSnapshot, doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let myId = localStorage.getItem('math_player_id') || "p_" + Date.now();
let myData = null;
let isFrozen = false;
let bankSoal = []; // Tempat menyimpan paket 20 soal

async function loadQuestions() {
    const res = await fetch('data/soal.json');
    const data = await res.json();
    // Ambil 5 soal acak dari tiap tipe (A, B, C, D)
    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
    bankSoal = [
        ...shuffle(data.tipe_A).slice(0, 5),
        ...shuffle(data.tipe_B).slice(0, 5),
        ...shuffle(data.tipe_C).slice(0, 5),
        ...shuffle(data.tipe_D).slice(0, 5)
    ];
}

document.getElementById('btn-join').addEventListener('click', async () => {
    const nama = document.getElementById('in-nama').value;
    const absen = document.getElementById('in-absen').value;
    const karakter = document.querySelector('.char-opt.border-indigo-500')?.dataset.char || "A";
    
    if(!nama || !absen) return alert("Isi nama dan absen!");

    await loadQuestions();
    localStorage.setItem('math_player_id', myId);
    await setDoc(doc(db, "players", myId), {
        nama, absen, karakter, current_stage: 0, team_id: "", koin: 0
    });
    
    initSiswaLoop();
});

function initSiswaLoop() {
    document.getElementById('view-setup').classList.add('hidden');
    document.getElementById('view-lobby').classList.remove('hidden');

    // Cek Status Room (Jika guru Start)
    onSnapshot(ROOM_REF, (snap) => {
        const room = snap.data();
        if(room.status === 'playing') {
            document.getElementById('view-lobby').classList.add('hidden');
            document.getElementById('view-game').classList.remove('hidden');
        }
    });

    // Cek Data Diri Sendiri
    onSnapshot(doc(db, "players", myId), (snap) => {
        myData = snap.data();
        renderQuestion(myData.current_stage);
    });
}

function renderQuestion(stage) {
    if (stage >= 20) {
        document.getElementById('q-text').innerText = "Kamu sudah sampai di Pusat! Tunggu temanmu.";
        document.getElementById('options-grid').innerHTML = "";
        return;
    }
    const soal = bankSoal[stage];
    document.getElementById('q-text').innerText = soal.pertanyaan;
    document.getElementById('display-stage').innerText = `Stage ${stage}/20`;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = "";
    soal.pilihan.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "p-3 bg-slate-800 rounded-xl hover:bg-indigo-600 transition";
        btn.innerText = opt;
        btn.onclick = () => {
            if (isFrozen) return;
            if (opt === soal.jawaban_benar) {
                updateDoc(doc(db, "players", myId), { current_stage: stage + 1 });
            } else {
                startFreeze();
            }
        };
        grid.appendChild(btn);
    });
}

function startFreeze() {
    isFrozen = true;
    let time = 5;
    const overlay = document.getElementById('freeze-overlay');
    overlay.style.display = 'flex';
    const timer = setInterval(() => {
        time--;
        document.getElementById('freeze-timer').innerText = time;
        if(time <= 0) {
            clearInterval(timer);
            isFrozen = false;
            overlay.style.display = 'none';
        }
    }, 1000);
}
