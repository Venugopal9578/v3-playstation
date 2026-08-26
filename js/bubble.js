const bubbleGrid = document.getElementById('bubbleGrid');
const popCountEl = document.getElementById('popCount');
const freshSheetBtn = document.getElementById('freshSheetBtn');

let poppedCount = 0;
const totalBubbles = 36; // 6x6 grid

const palettes = [
    { start: '#38bdf8', end: '#0284c7' },
    { start: '#a855f7', end: '#7e22ce' },
    { start: '#f43f5e', end: '#be123c' },
    { start: '#10b981', end: '#047857' },
    { start: '#f59e0b', end: '#b45309' },
    { start: '#ec4899', end: '#be185d' }
];

// Audio context deferred to prevent browser termination on load
let audioCtx = null;

function playPopSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function createSheet() {
    bubbleGrid.innerHTML = '';
    poppedCount = 0;
    popCountEl.textContent = poppedCount;

    const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];

    for (let i = 0; i < totalBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        bubble.style.background = `radial-gradient(circle at 30% 30%, ${randomPalette.start}, ${randomPalette.end})`;

        const popAction = (e) => {
            e.preventDefault();
            if (!bubble.classList.contains('popped')) {
                bubble.classList.add('popped');
                poppedCount++;
                popCountEl.textContent = poppedCount;
                playPopSound();
            }
        };

        bubble.addEventListener('mousedown', popAction);
        bubble.addEventListener('touchstart', popAction, { passive: false });

        bubble.addEventListener('mouseover', (e) => {
            if (e.buttons === 1 && !bubble.classList.contains('popped')) {
                bubble.classList.add('popped');
                poppedCount++;
                popCountEl.textContent = poppedCount;
                playPopSound();
            }
        });

        bubbleGrid.appendChild(bubble);
    }
}

freshSheetBtn.addEventListener('click', createSheet);

createSheet();