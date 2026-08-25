const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreOverlay = document.getElementById('scoreOverlay');
const scoreValue = document.getElementById('scoreValue');
const scoreFeedback = document.getElementById('scoreFeedback');
const resetBtn = document.getElementById('resetBtn');

let isDrawing = false;
let points = [];

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    points = [];
    const coords = getCanvasCoordinates(e);
    points.push(coords);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    points.push(coords);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    evaluateDrawing();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function perpendicularDistance(p, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return distance(p, lineStart);
    return Math.abs(dy * p.x - dx * p.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
}

function ramerDouglasPeucker(pointList, epsilon) {
    let dmax = 0;
    let index = 0;
    const end = pointList.length - 1;

    for (let i = 1; i < end; i++) {
        const d = perpendicularDistance(pointList[i], pointList[0], pointList[end]);
        if (d > dmax) {
            index = i;
            dmax = d;
        }
    }

    if (dmax > epsilon) {
        const recResults1 = ramerDouglasPeucker(pointList.slice(0, index + 1), epsilon);
        const recResults2 = ramerDouglasPeucker(pointList.slice(index), epsilon);
        return recResults1.slice(0, -1).concat(recResults2);
    }
    return [pointList[0], pointList[end]];
}

function calculateAngle(a, b, c) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.hypot(ab.x, ab.y);
    const magCB = Math.hypot(cb.x, cb.y);
    if (magAB === 0 || magCB === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
    return Math.acos(cosTheta) * (180 / Math.PI);
}

function evaluateDrawing() {
    if (points.length < 30) {
        showScore(0, "Line too short. Please draw a complete triangle.");
        return;
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const closureDistance = distance(startPoint, endPoint);

    let simplified = ramerDouglasPeucker(points, 25);

    if (simplified.length > 2 && distance(simplified[0], simplified[simplified.length - 1]) < 40) {
        simplified.pop();
    }

    if (simplified.length !== 3) {
        showScore(
            Math.max(12, Math.min(45, 100 - Math.abs(simplified.length - 3) * 20)),
            `Detected ${simplified.length} vertices instead of 3. Try to make 3 distinct corners.`
        );
        return;
    }

    const [A, B, C] = simplified;
    const angles = [
        calculateAngle(B, A, C),
        calculateAngle(A, B, C),
        calculateAngle(A, C, B)
    ];

    const closestTo90 = angles.reduce((prev, curr) =>
        Math.abs(curr - 90) < Math.abs(prev - 90) ? curr : prev
    );

    const angleError = Math.abs(closestTo90 - 90);
    const closureError = Math.min(closureDistance, 100);

    let angleScore = Math.max(0, 100 - (angleError * 2.2));
    let closureScore = Math.max(0, 100 - (closureError * 1.5));

    let finalScore = (angleScore * 0.7) + (closureScore * 0.3);
    finalScore = Math.min(99.9, Math.max(1.0, finalScore));

    let feedback = "Perfect geometry.";
    if (finalScore < 50) feedback = "Not quite a triangle. Needs sharper corners.";
    else if (finalScore < 75) feedback = "Not bad, but the right angle is noticeably askew.";
    else if (finalScore < 90) feedback = "Impressive accuracy. Very close to perfect.";

    showScore(finalScore, feedback);
}

function showScore(score, text) {
    scoreValue.textContent = `${score.toFixed(1)}%`;
    scoreFeedback.textContent = text;
    scoreOverlay.classList.remove('hidden');
}

resetBtn.addEventListener('click', () => {
    scoreOverlay.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
});