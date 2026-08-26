const gridContainer = document.getElementById('rippleGrid');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const columns = 15;
const rows = 15;
const tiles = [];

let isSoundEnabled = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playWaveSound() {
    if (!isSoundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Creates a soft, resonant drop sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
}

soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
        soundToggleBtn.textContent = 'Sound: ON';
        soundToggleBtn.classList.add('active');
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } else {
        soundToggleBtn.textContent = 'Sound: OFF';
        soundToggleBtn.classList.remove('active');
    }
});

for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');

        tile.dataset.x = x;
        tile.dataset.y = y;

        const triggerWave = () => {
            const randomHue = Math.floor(Math.random() * 360);
            document.documentElement.style.setProperty('--wave-hue', randomHue);
            playWaveSound();
            propagateWave(x, y);
        };

        tile.addEventListener('mousedown', triggerWave);
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerWave();
        });

        gridContainer.appendChild(tile);
        tiles.push(tile);
    }
}

function propagateWave(originX, originY) {
    tiles.forEach(tile => {
        const tx = parseInt(tile.dataset.x);
        const ty = parseInt(tile.dataset.y);

        const dx = tx - originX;
        const dy = ty - originY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const delay = distance * 40;

        setTimeout(() => {
            tile.classList.add('active');

            setTimeout(() => {
                tile.classList.remove('active');
            }, 400);

        }, delay);
    });
}