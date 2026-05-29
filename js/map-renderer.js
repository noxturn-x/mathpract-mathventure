export function getCoordinates(angle, stage, totalStages = 20) {
    const cx = 500; // Titik pusat X (berdasarkan viewBox 0-1000)
    const cy = 500; // Titik pusat Y
    const maxRadius = 430; // Mulai dari pinggir
    const minRadius = 60;  // Berakhir di pusat (Istana)

    // Semakin tinggi stage, radius semakin kecil (mendekat ke pusat)
    const currentRadius = maxRadius - (stage / totalStages) * (maxRadius - minRadius);
    const angleRad = (angle * Math.PI) / 180;

    return {
        x: cx + currentRadius * Math.cos(angleRad),
        y: cy + currentRadius * Math.sin(angleRad)
    };
}

export function drawPath(svgElement, angle, teamColor) {
    let points = "";
    for (let i = 0; i <= 20; i++) {
        const { x, y } = getCoordinates(angle, i);
        points += `${x},${y} `;
    }

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("stroke", teamColor);
    polyline.setAttribute("stroke-width", "3");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke-opacity", "0.2");
    polyline.setAttribute("stroke-dasharray", "8,4");
    svgElement.appendChild(polyline);
}