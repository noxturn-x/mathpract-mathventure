import { db, activeRoomId } from './firebase-config.js';
import { collection, doc, setDoc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function distributeTeams(allPlayers) {
    const batch = writeBatch(db);
    const maxPerTeam = 4;
    
    // Hitung jumlah tim (Minimal 1 tim jika pemain sedikit)
    const numTeams = Math.max(1, Math.ceil(allPlayers.length / maxPerTeam));
    const teams = [];

    // Inisialisasi struktur tim
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: `team_${i}`,
            team_name: `Kelompok ${String.fromCharCode(65 + i)}`,
            members: [],
            group_stage: 0,
            sudut_peta: (360 / numTeams) * i // Sebar jalur di lingkaran
        });
    }

    // Distribusi pemain secara adil (Round Robin)
    allPlayers.sort(() => Math.random() - 0.5); // Acak siswa
    allPlayers.forEach((player, index) => {
        const teamIdx = index % numTeams;
        teams[teamIdx].members.push(player.id);
    });

    // Simpan ke Firestore
    for (const team of teams) {
        const teamRef = doc(db, "teams", team.id);
        batch.set(teamRef, team);
        
        // Update setiap player agar tahu mereka tim mana
        for (const pId of team.members) {
            batch.update(doc(db, "players", pId), { team_id: team.id });
        }
    }

    // Ubah status room menjadi playing
    batch.update(doc(db, "rooms", activeRoomId), { status: "playing" });
    await batch.commit();
}