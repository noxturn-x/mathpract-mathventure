import { db, ROOM_REF, PLAYERS_COL, TEAMS_COL } from './firebase-config.js';
import { onSnapshot, updateDoc, writeBatch, doc, collection, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allPlayers = [];
let allTeams = [];

// 1. Monitor Lobby & Perubahan Stage Siswa
onSnapshot(PLAYERS_COL, (snapshot) => {
    allPlayers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderLobby();
    
    // INTEGRASI SARAN 1: Kalkulasi Progres Kelompok dilakukan di sini (Satu titik tulis)
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

    batch.update(ROOM_REF, { status: 'playing' });
    await batch.commit();
});

// 3. Stop Darurat
document.getElementById('btn-stop').addEventListener('click', () => {
    updateDoc(ROOM_REF, { status: 'finished' });
});

function renderLobby() {
    const list = document.getElementById('player-list-guru');
    list.innerHTML = allPlayers.map(p => `
        <div class="p-3 bg-slate-950 rounded-lg flex justify-between">
            <span>${p.nama}</span>
            <span class="text-indigo-400 font-mono">Stage ${p.current_stage}</span>
        </div>
    `).join('');
    document.getElementById('count-player').innerText = allPlayers.length;
}