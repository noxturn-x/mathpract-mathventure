export function getCoordinates(angle, stage, totalStages = 20) {
    const cx = 500; 
    const cy = 500;
    const maxRadius = 400; 
    const minRadius = 50;  
    const currentRadius = maxRadius - (stage / totalStages) * (maxRadius - minRadius);
    const angleRad = (angle * Math.PI) / 180;

    return {
        x: cx + currentRadius * Math.cos(angleRad),
        y: cy + currentRadius * Math.sin(angleRad)
    };
}

export function drawFullMap(svgElement, teams) {
    svgElement.innerHTML = ''; // Bersihkan peta
    
    // Gambar Pusat (Goal)
    const goal = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    goal.setAttribute("cx", "500"); goal.setAttribute("cy", "500"); goal.setAttribute("r", "40");
    goal.setAttribute("fill", "#fbbf24");
    svgElement.appendChild(goal);

    teams.forEach(team => {
        const color = "#4f46e5";
        // Gambar Jalur dan Titik
        for (let i = 0; i <= 20; i++) {
            const { x, y } = getCoordinates(team.angle || 0, i);
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);
            dot.setAttribute("r", i <= team.group_stage ? "8" : "4");
            dot.setAttribute("fill", i <= team.group_stage ? "#fbbf24" : "#334155");
            svgElement.appendChild(dot);
        }
    });
}
