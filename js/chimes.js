const chimeBoard = document.getElementById('chimeBoard');
const windToggleBtn = document.getElementById('windToggleBtn');

// C Major Pentatonic Scale frequencies (C4 to G5)
const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

// Generate complementary glowing hues for the 9 orbs
const hues = [340, 360, 20, 40, 180, 200, 220, 260, 290];

let audioCtx = null;
const orbs = [];
let windInterval = null;
let isWindActive = false;

// Initialize audio context only on first user interaction to comply with browser safety
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playChime(freq) {
    initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Sine wave for a pure, bell-like tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // ADSR Envelope for realistic chime resonance
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5); // Long, fading release

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.5);
}

function triggerOrb(index) {
    const orb = orbs[index];
    playChime(frequencies[index]);

    // Visual pulse
    orb.classList.add('active');
    setTimeout(() => {
        orb.classList.remove('active');
    }, 400);
}

// Build the board
for (let i = 0; i < 9; i++) {
    const orb = document.createElement('div');
    orb.classList.add('orb');

    // Inject specific color properties
    const color = `hsla(${hues[i]}, 90%, 65%, 0.8)`;
    orb.style.color = color;

    // Event listeners for dragging/tapping
    orb.addEventListener('mousedown', () => triggerOrb(i));
    orb.addEventListener('mouseenter', (e) => {
        if (e.buttons === 1) triggerOrb(i); // Trigger if dragging across
    });

    orb.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerOrb(i);
    }, { passive: false });

    chimeBoard.appendChild(orb);
    orbs.push(orb);
}

// Ambient Wind Mode Logic
function playRandomWind() {
    if (!isWindActive) return;

    const randomIndex = Math.floor(Math.random() * 9);
    triggerOrb(randomIndex);

    // Schedule next chime randomly between 400ms and 2000ms
    const nextDelay = Math.random() * 1600 + 400;
    windInterval = setTimeout(playRandomWind, nextDelay);
}

windToggleBtn.addEventListener('click', () => {
    initAudio();
    isWindActive = !isWindActive;

    if (isWindActive) {
        windToggleBtn.textContent = 'Ambient Wind: ON';
        windToggleBtn.classList.add('active');
        playRandomWind();
    } else {
        windToggleBtn.textContent = 'Ambient Wind: OFF';
        windToggleBtn.classList.remove('active');
        clearTimeout(windInterval);
    }
});