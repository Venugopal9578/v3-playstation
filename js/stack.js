document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    canvas.width = 400;
    canvas.height = 500;

    let isPlaying = false;
    let inputLocked = false;
    let animationId;
    let score = 0;

    let boxes = [];
    let currentBox = null;
    let boxHeight = 25;

    // Sir, I have dropped the base speed from 4.0 to a very relaxed 2.5
    let speed = 2.5;
    let direction = 1;
    let cameraY = 0;

    function startGame() {
        if (isPlaying) return;

        isPlaying = true;
        inputLocked = true;
        actionBtn.blur();

        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "ALIGNMENT IN PROGRESS...";

        speed = 2.5;
        cameraY = 0;

        // Foundation block
        boxes = [
            { x: 50, y: canvas.height - boxHeight - 20, w: 300, h: boxHeight, color: '#06b6d4' }
        ];

        spawnBox();
        renderLoop();

        setTimeout(() => {
            inputLocked = false;
        }, 300);
    }

    function spawnBox() {
        let lastBox = boxes[boxes.length - 1];
        currentBox = {
            x: 0,
            y: lastBox.y - boxHeight,
            w: lastBox.w,
            h: boxHeight,
            color: `hsl(${190 + score * 12}, 100%, 60%)`
        };

        direction = Math.random() > 0.5 ? 1 : -1;
        currentBox.x = direction === 1 ? 0 : canvas.width - currentBox.w;
    }

    function renderLoop() {
        if (!isPlaying) return;

        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        currentBox.x += speed * direction;

        if (currentBox.x + currentBox.w >= canvas.width) {
            currentBox.x = canvas.width - currentBox.w;
            direction = -1;
        } else if (currentBox.x <= 0) {
            currentBox.x = 0;
            direction = 1;
        }

        ctx.save();
        ctx.translate(0, cameraY);

        boxes.forEach(b => drawBox(b));
        if (currentBox) drawBox(currentBox);

        ctx.restore();

        animationId = requestAnimationFrame(renderLoop);
    }

    function drawBox(b) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
    }

    function placeBox() {
        if (!isPlaying || !currentBox || inputLocked) return;

        let lastBox = boxes[boxes.length - 1];

        // MAGNETIC SNAP: 12 pixels of forgiveness. 
        // If you are close enough, the system assists you and perfectly aligns the block.
        const tolerance = 12;
        if (Math.abs(currentBox.x - lastBox.x) <= tolerance) {
            currentBox.x = lastBox.x;
            currentBox.w = lastBox.w;
        }

        let overlapStart = Math.max(currentBox.x, lastBox.x);
        let overlapEnd = Math.min(currentBox.x + currentBox.w, lastBox.x + lastBox.w);
        let overlapWidth = overlapEnd - overlapStart;

        if (overlapWidth > 0) {
            currentBox.x = overlapStart;
            currentBox.w = overlapWidth;
            boxes.push(currentBox);

            score++;
            scoreDisplay.textContent = score;

            // Reduced acceleration from 0.15 to a barely noticeable 0.05
            speed += 0.05;

            if (currentBox.y + cameraY < 250) {
                cameraY += boxHeight;
            }

            inputLocked = true;
            spawnBox();
            setTimeout(() => { inputLocked = false; }, 200);

        } else {
            triggerGameOver();
        }
    }

    function triggerGameOver() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        actionBtn.disabled = false;
        actionBtn.textContent = "STRUCTURAL COLLAPSE - REBOOT";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    canvas.addEventListener('mousedown', placeBox);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        placeBox();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            placeBox();
        }
    });

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);

    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    boxes = [{ x: 50, y: canvas.height - boxHeight - 20, w: 300, h: boxHeight, color: '#06b6d4' }];
    drawBox(boxes[0]);
});