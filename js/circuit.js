document.addEventListener('DOMContentLoaded', () => {
    const gridBoard = document.getElementById('gridBoard');
    const scoreDisplay = document.getElementById('score');
    const energyDisplay = document.getElementById('energy');
    const actionBtn = document.getElementById('actionBtn');

    if (!gridBoard) return;

    let score = 0;
    let energy = 100;
    let sequence = [];
    let playerSequence = [];
    let isPlaying = false;
    let roundTimer = null;
    const GRID_SIZE = 9;

    for (let i = 0; i < GRID_SIZE; i++) {
        const node = document.createElement('div');
        node.classList.add('node');
        node.dataset.index = i;
        node.innerHTML = `<span class="node-id">0${i + 1}</span><div class="node-core"></div>`;
        node.addEventListener('click', () => handleNodePress(i));
        gridBoard.appendChild(node);
    }

    const nodes = document.querySelectorAll('.node');

    function startGame() {
        score = 0;
        energy = 100;
        scoreDisplay.textContent = score;
        energyDisplay.textContent = energy;
        sequence = [];
        playerSequence = [];
        isPlaying = true;
        actionBtn.textContent = "SYNCHRONIZING...";
        actionBtn.disabled = true;

        nextSequenceStep();
    }

    function nextSequenceStep() {
        playerSequence = [];
        const nextNode = Math.floor(Math.random() * GRID_SIZE);
        sequence.push(nextNode);

        playSequenceVisuals();
    }

    function playSequenceVisuals() {
        let i = 0;
        const speed = Math.max(400, 800 - (score * 15));

        const interval = setInterval(() => {
            nodes.forEach(n => n.classList.remove('pulse'));
            if (i < sequence.length) {
                const targetNode = nodes[sequence[i]];
                targetNode.classList.add('pulse');
                playBeep();
                i++;
            } else {
                clearInterval(interval);
                nodes.forEach(n => n.classList.remove('pulse'));
                actionBtn.textContent = "YOUR TURN: ROUTE PULSE";
                startRoundTimer();
            }
        }, speed);
    }

    function startRoundTimer() {
        energy = 100;
        energyDisplay.textContent = energy;
        if (roundTimer) clearInterval(roundTimer);

        // Drain calibrated for maximum comfort: 10 full seconds per click
        roundTimer = setInterval(() => {
            energy -= 1;
            energyDisplay.textContent = energy;
            if (energy <= 0) {
                clearInterval(roundTimer);
                triggerOverload();
            }
        }, 100); // Increased span from 40ms to 100ms per tick
    }

    function handleNodePress(index) {
        if (!isPlaying || actionBtn.textContent.includes("SYNCHRONIZING")) return;

        const targetNode = nodes[index];
        targetNode.classList.add('clicked');
        setTimeout(() => targetNode.classList.remove('clicked'), 200);

        playerSequence.push(index);
        const currentIndex = playerSequence.length - 1;

        if (playerSequence[currentIndex] !== sequence[currentIndex]) {
            clearInterval(roundTimer);
            triggerOverload();
            return;
        }

        // CORRECT CLICK: Reset the timer buffer for the next node!
        energy = 100;
        energyDisplay.textContent = energy;

        if (playerSequence.length === sequence.length) {
            clearInterval(roundTimer);
            score += 25;
            scoreDisplay.textContent = score;
            actionBtn.textContent = "CIRCUIT SECURED!";

            setTimeout(nextSequenceStep, 1000);
        }
    }

    function triggerOverload() {
        isPlaying = false;
        clearInterval(roundTimer);
        nodes.forEach(n => n.classList.remove('pulse'));
        actionBtn.textContent = "SYSTEM OVERLOAD - RESTART";
        actionBtn.disabled = false;

        const modal = document.getElementById('gameOverModal');
        const finalScore = document.getElementById('finalScoreDisplay');
        if (modal && finalScore) {
            finalScore.textContent = score;
            modal.classList.add('active');
        }
    }

    const modalBtn = document.getElementById('modalDismissBtn');
    if (modalBtn) {
        modalBtn.addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('active');
        });
    }

    actionBtn.addEventListener('click', startGame);

    function playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440 + (score * 10), ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) { }
    }
});