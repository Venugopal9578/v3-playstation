const canvas = document.getElementById('zenCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;

function clearCanvas() {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Initialize clean dark space slate
clearCanvas();

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const currentY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    const currentColor = `hsl(${hue}, 100%, 60%)`;

    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Intense neon bloom glow effect
    ctx.shadowBlur = 18;
    ctx.shadowColor = currentColor;

    // Draw smooth connecting line
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Draw anchor cap for zero-lag fidelity
    ctx.beginPath();
    ctx.arc(currentX, currentY, 7, 0, Math.PI * 2);
    ctx.fill();

    lastX = currentX;
    lastY = currentY;

    // Shift hue fluidly as you draw across the pad
    hue = (hue + 2.5) % 360;
}

const startDrawing = (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
};

const stopDrawing = () => {
    isDrawing = false;
    ctx.shadowBlur = 0; // Reset shadow when stroke completes
};

// Mouse bindings
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

// Touch bindings for mobile/tablet fluidity
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
}, { passive: false });
window.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', clearCanvas);