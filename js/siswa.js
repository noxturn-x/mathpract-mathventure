import { db, ROOM_REF, PLAYERS_COL } from './firebase-config.js';
import { onSnapshot, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let myId = localStorage.getItem('math_player_id') || "p_" + Date.now();
let myData = null;
let isFrozen = false;
let bankSoal = [];

// LOGIKA KLIK KARAKTER (Agar kelas aktif .border-indigo-500 bekerja)
document.querySelectorAll('.char-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.char-opt').forEach(o => o.classList.remove('border-indigo-500', 'bg-indigo-950/40'));
        opt.classList.add('border-indigo-500', 'bg-indigo-950/40');
    });
});

async function loadQuestions() {
    try {
        const res = await fetch('data/soal.json');
        const data = await res.json();
        const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
        
        bankSoal = [
            ...shuffle(data.tipe_A).slice(0, 5),
            ...shuffle(data.tipe_B).slice(0, 5),
            ...shuffle(data.tipe_C).slice(0, 5),
            ...shuffle(data.tipe_D).slice(0, 5)
        ];
    } catch (e) {
        console.error("Gagal memuat bank soal eksternal JSON:", e);
    }
}

// REGISTER MASUK LOBBY
document.getElementById('btn-join').addEventListener('click', async () => {
    const nama = document.getElementById('in-nama').value.trim();
    const absen = document.getElementById('in-absen').value;
    const selectedCharOpt = document.querySelector('.char-opt.border-indigo-500');
    const karakter = selectedCharOpt ? selectedCharOpt.dataset.char : "Warrior";
    
    if(!nama || !absen) {
        alert("Nama dan No Absen tidak boleh kosong!");
        return;
    }

    await loadQuestions();
    localStorage.setItem('math_player_id', myId);
    
    await setDoc(doc(db, "players", myId), {
        nama, 
        absen: parseInt(absen), 
        karakter, 
        current_stage: 0, 
        team_id: "", 
        koin: 0
    });
    
    initSiswaLoop();
});

// LOOP UTAMA MONITORING
function initSiswaLoop() {
    document.getElementById('view-setup').classList.add('hidden');
    document.getElementById('view-lobby').classList.remove('hidden'); // SEKARANG AMAN (TIDAK NULL)

    // Deteksi Start dari Guru
    onSnapshot(ROOM_REF, (snap) => {
        if (!snap.exists()) return;
        const room = snap.data();
        if(room.status === 'playing') {
            document.getElementById('view-lobby').classList.add('hidden');
            document.getElementById('view-game').classList.remove('hidden');
        } else if(room.status === 'finished') {
            document.getElementById('view-game').classList.add('hidden');
            document.getElementById('view-finish').classList.remove('hidden');
        }
    });

    // Ambil Data Progres Diri Sendiri
    onSnapshot(doc(db, "players", myId), (snap) => {
        if (!snap.exists()) return;
        myData = snap.data();
        
        if (myData.team_id) {
            document.getElementById('display-team').innerText = "Tim Terhubung";
        }
        
        renderQuestion(myData.current_stage);
    });
}

function renderQuestion(stage) {
    if (stage >= 20) {
        document.getElementById('q-text').innerText = "Hebat! Seluruh tantanganmu selesai. Mari bantu teman satu timmu yang tertinggal agar posisi tim bisa melaju!";
        document.getElementById('options-grid').innerHTML = "";
        return;
    }
    
    if (bankSoal.length === 0) return;
    
    const soal = bankSoal[stage];
    document.getElementById('q-text').innerText = soal.pertanyaan;
    document.getElementById('display-stage').innerText = `Stage ${stage}/20`;
    document.getElementById('display-coin').innerText = `💰 ${myData.koin || 0}`;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = "";
    
    soal.pilihan.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "w-full p-4 bg-slate-800 hover:bg-indigo-600 rounded-xl font-medium text-left transition text-slate-100 border border-slate-700/50";
        btn.innerText = opt;
        btn.onclick = () => {
            if (isFrozen) return;
            if (opt === soal.jawaban_benar) {
                updateDoc(doc(db, "players", myId), { 
                    current_stage: stage + 1,
                    koin: (myData.koin || 0) + 10
                });
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
    const timerText = document.getElementById('freeze-timer');
    
    overlay.classList.remove('hidden');
    timerText.innerText = time;
    
    const timer = setInterval(() => {
        time--;
        timerText.innerText = time;
        if(time <= 0) {
            clearInterval(timer);
            isFrozen = false;
            overlay.classList.add('hidden');
        }
    }, 1000);
}
