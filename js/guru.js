import { db, ROOM_REF, PLAYERS_COL, TEAMS_COL } from './firebase-config.js';
import { onSnapshot, updateDoc, writeBatch, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allPlayers = [];
let allTeams = [];

import { db, TEAMS_COL, PLAYERS_COL, ROOM_REF } from './firebase-config.js';
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { drawFullMap } from './map-renderer.js';

const svg = document.getElementById('map-svg');

onSnapshot(TEAMS_COL, (snap) => {
    const teams = snap.docs.map(d => d.data());
    // GAMBAR ULANG PETA SETIAP ADA PERUBAHAN PROGRESS TIM
    if(teams.length > 0) {
        drawFullMap(svg, teams);
    }
});
// =========================================================================
// SOLUSI ERROR: Inisialisasi Kamar Otomatis Saat Layar Guru Dibuka
// =========================================================================
async function inisialisasiKamar() {
    try {
        // Menggunakan setDoc dengan { merge: true } agar jika sudah ada, 
        // data lama tidak tertimpa, namun jika belum ada, otomatis dibuat.
        await setDoc(ROOM_REF, { 
            status: 'waiting',
            last_active: new Date()
        }, { merge: true });
        console.log("Kamar berhasil diinisialisasi.");
    } catch (err) {
        console.error("Gagal inisialisasi kamar:", err);
    }
}
// Jalankan fungsi saat script dimuat
inisialisasiKamar();

// 1. Monitor Lobby & Perubahan Stage Siswa
onSnapshot(PLAYERS_COL, (snapshot) => {
    allPlayers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderLobby();
    
    // Kalkulasi Progres Kelompok dilakukan di sini (Satu titik tulis oleh Layar Guru)
    calculateTeamProgress();
});

function calculateTeamProgress() {
    allTeams.forEach(async (team) => {
        const members = allPlayers.filter(p => p.team_id === team.id);
        if (members.length === 0) return;

        // Cari stage terkecil dari anggota
        const minStage = Math.min(...members.map(m => m.current_stage));
        
        // Update hanya jika stage kelompok berubah
        if (minStage > team.group_stage) {
            await updateDoc(doc(db, "teams", team.id), { group_stage: minStage });
        }
    });
}

// 2. Start Game (Round Robin)
document.getElementById('btn-start').addEventListener('click', async () => {
    if (allPlayers.length === 0) {
        alert("Belum ada siswa yang bergabung di lobby!");
        return;
    }

    const batch = writeBatch(db);
    const numTeams = Math.ceil(allPlayers.length / 4);
    
    // Buat Tim
    for(let i=0; i<numTeams; i++) {
        const tId = "team_" + i;
        const tRef = doc(db, "teams", tId);
        batch.set(tRef, {
            id: tId,
            team_name: "Tim " + String.fromCharCode(65+i),
            group_stage: 0,
            angle: (360/numTeams) * i
        });
    }

    // Assign Player
    allPlayers.forEach((p, idx) => {
        const tId = "team_" + (idx % numTeams);
        batch.update(doc(db, "players", p.id), { team_id: tId });
    });

    // Mengubah status menjadi playing
    batch.update(ROOM_REF, { status: 'playing' });
    
    try {
        await batch.commit();
        alert("Permainan dimulai! Kelompok berhasil dibagikan.");
    } catch (err) {
        console.error("Gagal memulai game:", err);
    }
});

// 3. Stop Darurat
document.getElementById('btn-stop').addEventListener('click', async () => {
    try {
        await updateDoc(ROOM_REF, { status: 'finished' });
        alert("Permainan dihentikan darurat oleh Guru.");
    } catch (err) {
        console.error("Gagal menghentikan game:", err);
    }
});

function renderLobby() {
    const list = document.getElementById('player-list-guru');
    if (!list) return;
    
    list.innerHTML = allPlayers.map(p => `
        <div class="p-3 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-800">
            <span>${p.nama} (Absen ${p.absen})</span>
            <span class="text-indigo-400 font-mono font-bold">Stage ${p.current_stage}</span>
        </div>
    `).join('');
    
    document.getElementById('count-player').innerText = allPlayers.length;
}
