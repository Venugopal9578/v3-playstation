document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    // Scale for sharp high-res rendering
    canvas.width = 400;
    canvas.height = 500;

    let isPlaying = false;
    let score = 0;
    let animationId;

    // Core Game Entities
    const paddle = { x: 150, y: 470, w: 100, h: 10, speed: 9, dx: 0 };
    const ball = { x: 200, y: 450, r: 7, dx: 2.5, dy: -2.5, speed: 3.5 };
    let bricks = [];
    const brickCfg = { rows: 6, cols: 7, w: 44, h: 18, padding: 8, offsetX: 18, offsetY: 50 };

    function initBricks() {
        bricks = [];
        for (let r = 0; r < brickCfg.rows; r++) {
            for (let c = 0; c < brickCfg.cols; c++) {
                bricks.push({
                    x: c * (brickCfg.w + brickCfg.padding) + brickCfg.offsetX,
                    y: r * (brickCfg.h + brickCfg.padding) + brickCfg.offsetY,
                    status: 1,
                    color: `hsl(${190 + r * 25}, 100%, 60%)` // Cyber gradient
                });
            }
        }
    }

    function drawPaddle() {
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawBall() {
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawBricks() {
        bricks.forEach(b => {
            if (b.status === 1) {
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.roundRect(b.x, b.y, brickCfg.w, brickCfg.h, 4);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    function moveEntities() {
        // Paddle movement
        paddle.x += paddle.dx;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall bounds
        if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.dx *= -1;
        if (ball.y - ball.r < 0) ball.dy *= -1;

        // Robust Paddle collision
        // The ball.dy > 0 check ensures it only bounces if it is falling downward, preventing the "stuck inside paddle" glitch.
        if (ball.dy > 0 && ball.y + ball.r >= paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {

            // Snap ball to the top of the paddle to prevent clipping
            ball.y = paddle.y - ball.r;

            // Calculate hit point for angle deflection
            let hitPoint = ball.x - (paddle.x + paddle.w / 2);

            // Soften the deflection angle multiplier from 0.15 to 0.08
            ball.dx = hitPoint * 0.08;
            ball.dy = -ball.speed;

            // Normalize the velocity vector to ensure constant, predictable speed
            let currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = (ball.dx / currentSpeed) * ball.speed;
            ball.dy = (ball.dy / currentSpeed) * ball.speed;
        }

        // Floor collision (Game Over)
        if (ball.y + ball.r > canvas.height) {
            triggerGameOver(false);
        }
    }

    function detectBrickCollisions() {
        let activeBricks = 0;
        bricks.forEach(b => {
            if (b.status === 1) {
                activeBricks++;
                if (ball.x > b.x && ball.x < b.x + brickCfg.w && ball.y > b.y && ball.y < b.y + brickCfg.h) {
                    ball.dy *= -1;
                    b.status = 0;
                    score += 15;
                    scoreDisplay.textContent = score;
                }
            }
        });

        // Win Condition
        if (activeBricks === 0 && isPlaying) {
            triggerGameOver(true);
        }
    }

    function renderLoop() {
        if (!isPlaying) return;

        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawPaddle();
        drawBall();

        moveEntities();
        detectBrickCollisions();

        animationId = requestAnimationFrame(renderLoop);
    }

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "PHYSICS ENGINE ACTIVE...";

        paddle.x = canvas.width / 2 - paddle.w / 2;
        ball.x = canvas.width / 2;
        ball.y = paddle.y - 12;
        ball.dx = 2.5;
        ball.dy = -ball.speed;

        initBricks();
        renderLoop();
    }

    function triggerGameOver(isWin) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        actionBtn.disabled = false;
        actionBtn.textContent = isWin ? "SECTOR CLEARED - NEXT LEVEL" : "SYSTEM CRASH - REBOOT";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        document.querySelector('#gameOverModal h2').textContent = isWin ? "SECTOR CLEARED" : "SYSTEM BREACHED";
        document.querySelector('#gameOverModal h2').style.color = isWin ? "#34d399" : "#ff3366";
        modal.classList.add('active');
    }

    // Desktop Keyboard Controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
        if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') paddle.dx = 0;
    });

    // Precision Mouse & Touch Controls
    canvas.addEventListener('mousemove', (e) => {
        let rect = canvas.getBoundingClientRect();
        let relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) paddle.x = relativeX - paddle.w / 2;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevents screen scrolling while dragging paddle
        let rect = canvas.getBoundingClientRect();
        let relativeX = e.touches[0].clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) paddle.x = relativeX - paddle.w / 2;
    }, { passive: false });

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);

    // Initial static render
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    initBricks();
    drawBricks();
    drawPaddle();
    drawBall();
});