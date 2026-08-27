document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    canvas.width = 400;
    canvas.height = 400;

    const gridSize = 20;
    let tileCount = canvas.width / gridSize;
    let velocityX = 0;
    let velocityY = 0;
    let playerX = 10;
    let playerY = 10;
    let trail = [];
    let tail = 5;
    let appleX = 15;
    let appleY = 15;
    let score = 0;
    let gameLoop;
    let isPlaying = false;

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        playerX = 10; playerY = 10;
        velocityX = 1; velocityY = 0;
        trail = [];
        tail = 5;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "ROUTING IN PROGRESS...";

        if (gameLoop) clearInterval(gameLoop);
        // Slower, highly manageable pacing: 4 FPS instead of 12
        gameLoop = setInterval(game, 1000 / 4);
    }

    function game() {
        playerX += velocityX;
        playerY += velocityY;

        // Wall Collision (Game Over)
        if (playerX < 0 || playerX >= tileCount || playerY < 0 || playerY >= tileCount) {
            triggerGameOver();
            return;
        }

        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render Snake Trail
        for (let i = 0; i < trail.length; i++) {
            let part = trail[i];
            let isHead = (i === trail.length - 1);
            let isTail = (i === 0);

            ctx.save();
            ctx.translate(part.x * gridSize + gridSize / 2, part.y * gridSize + gridSize / 2);

            if (isHead) {
                // High-tech glowing head block
                ctx.fillStyle = '#34d399';
                ctx.shadowColor = '#34d399';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.roundRect(-gridSize / 2 + 1, -gridSize / 2 + 1, gridSize - 2, gridSize - 2, 6);
                ctx.fill();

                // Optical sensors (Eyes) based on direction
                ctx.fillStyle = '#05070c';
                let eyeOffset = 5;
                let eyeSize = 3;
                if (velocityX === 1) { ctx.fillRect(eyeOffset, -6, eyeSize, eyeSize); ctx.fillRect(eyeOffset, 3, eyeSize, eyeSize); }
                else if (velocityX === -1) { ctx.fillRect(-eyeOffset - 2, -6, eyeSize, eyeSize); ctx.fillRect(-eyeOffset - 2, 3, eyeSize, eyeSize); }
                else if (velocityY === 1) { ctx.fillRect(-6, eyeOffset, eyeSize, eyeSize); ctx.fillRect(3, eyeOffset, eyeSize, eyeSize); }
                else if (velocityY === -1) { ctx.fillRect(-6, -eyeOffset - 2, eyeSize, eyeSize); ctx.fillRect(3, -eyeOffset - 2, eyeSize, eyeSize); }

            } else if (isTail) {
                // Tapered tail segment
                ctx.fillStyle = '#059669';
                ctx.beginPath();
                ctx.roundRect(-gridSize / 2 + 3, -gridSize / 2 + 3, gridSize - 6, gridSize - 6, 8);
                ctx.fill();
            } else {
                // Standard smooth body segment
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.roundRect(-gridSize / 2 + 2, -gridSize / 2 + 2, gridSize - 4, gridSize - 4, 4);
                ctx.fill();
            }

            ctx.restore();

            // Self Collision (Game Over)
            if (!isHead && part.x === playerX && part.y === playerY) {
                triggerGameOver();
                return;
            }
        }

        trail.push({ x: playerX, y: playerY });
        while (trail.length > tail) {
            trail.shift();
        }

        // Apple Collision
        if (appleX === playerX && appleY === playerY) {
            tail++;
            score += 10;
            scoreDisplay.textContent = score;
            appleX = Math.floor(Math.random() * tileCount);
            appleY = Math.floor(Math.random() * tileCount);
        }

        // Render Glowing Data Core (Apple)
        ctx.save();
        ctx.translate(appleX * gridSize + gridSize / 2, appleY * gridSize + gridSize / 2);
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function changeDirection(newX, newY) {
        if (!isPlaying) return;
        // Prevent instant 180-degree self-destruction turns
        if (newX !== -velocityX || newY !== -velocityY) {
            velocityX = newX;
            velocityY = newY;
        }
    }

    function triggerGameOver() {
        isPlaying = false;
        clearInterval(gameLoop);
        actionBtn.disabled = false;
        actionBtn.textContent = "SYSTEM CRASH - RESTART";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    // Keyboard Inputs
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft': changeDirection(-1, 0); break;
            case 'ArrowUp': changeDirection(0, -1); break;
            case 'ArrowRight': changeDirection(1, 0); break;
            case 'ArrowDown': changeDirection(0, 1); break;
        }
    });

    // Mobile On-Screen D-Pad Touch/Click Handlers
    document.getElementById('btnUp').addEventListener('click', () => changeDirection(0, -1));
    document.getElementById('btnDown').addEventListener('click', () => changeDirection(0, 1));
    document.getElementById('btnLeft').addEventListener('click', () => changeDirection(-1, 0));
    document.getElementById('btnRight').addEventListener('click', () => changeDirection(1, 0));

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);
});