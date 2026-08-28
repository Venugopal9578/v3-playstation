document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    canvas.width = 400;
    canvas.height = 400;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const coreRadius = 25;
    const shieldRadius = 45;

    let isPlaying = false;
    let score = 0;
    let animationId;

    // Shield Mechanics
    let shieldAngle = 0;
    let shieldWidth = Math.PI / 2; // 90 degree arc
    let shieldDirection = 0;
    const shieldSpeed = 0.18; // Increased shield agility by 50%

    // Anomalies (Projectiles)
    let anomalies = [];
    let spawnRate = 100; // Increased delay between spawns
    let frameCount = 0;
    let anomalySpeed = 1.2; // Halved the incoming threat velocity

    function drawCore() {
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#93c5fd';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawShield() {
        ctx.strokeStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, shieldRadius, shieldAngle - shieldWidth / 2, shieldAngle + shieldWidth / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function spawnAnomaly() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 250; // Spawn outside canvas
        anomalies.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            angle: angle,
            r: 6
        });
    }

    function drawAndMoveAnomalies() {
        for (let i = anomalies.length - 1; i >= 0; i--) {
            let a = anomalies[i];

            // Move towards center
            a.x -= Math.cos(a.angle) * anomalySpeed;
            a.y -= Math.sin(a.angle) * anomalySpeed;

            // Draw
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Distance to center
            const distToCenter = Math.hypot(a.x - centerX, a.y - centerY);

            // Check Shield Collision
            if (distToCenter <= shieldRadius + a.r && distToCenter >= shieldRadius - a.r) {
                // Normalize angles to check if anomaly hits the shield arc
                let normalizedHitAngle = (a.angle + Math.PI) % (Math.PI * 2);
                let normalizedShieldAngle = ((shieldAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

                let angleDiff = Math.abs(normalizedHitAngle - normalizedShieldAngle);
                if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

                if (angleDiff <= shieldWidth / 2) {
                    // Deflected
                    anomalies.splice(i, 1);
                    score += 10;
                    scoreDisplay.textContent = score;

                    // Progressive difficulty
                    if (score % 100 === 0) {
                        spawnRate = Math.max(20, spawnRate - 5);
                        anomalySpeed += 0.2;
                    }
                    continue;
                }
            }

            // Check Core Collision (Game Over)
            if (distToCenter <= coreRadius + a.r) {
                triggerGameOver();
                return;
            }
        }
    }

    function renderLoop() {
        if (!isPlaying) return;

        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update Shield Position
        shieldAngle += shieldDirection * shieldSpeed;

        frameCount++;
        if (frameCount % spawnRate === 0) spawnAnomaly();

        drawCore();
        drawShield();
        drawAndMoveAnomalies();

        animationId = requestAnimationFrame(renderLoop);
    }

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "DEFENSE GRID ACTIVE...";

        anomalies = [];
        frameCount = 0;
        spawnRate = 100;
        anomalySpeed = 1.2;
        shieldAngle = 0;

        renderLoop();
    }

    function triggerGameOver() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        actionBtn.disabled = false;
        actionBtn.textContent = "CORE BREACH - REBOOT";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') shieldDirection = 1;
        if (e.key === 'ArrowLeft') shieldDirection = -1;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') shieldDirection = 0;
    });

    // Mobile/Mouse Dual-Zone Touch Controls
    canvas.addEventListener('mousedown', (e) => {
        let rect = canvas.getBoundingClientRect();
        let relativeX = e.clientX - rect.left;
        shieldDirection = relativeX > canvas.width / 2 ? 1 : -1;
    });
    canvas.addEventListener('mouseup', () => shieldDirection = 0);
    canvas.addEventListener('mouseleave', () => shieldDirection = 0);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let relativeX = e.touches[0].clientX - rect.left;
        shieldDirection = relativeX > canvas.width / 2 ? 1 : -1;
    }, { passive: false });
    canvas.addEventListener('touchend', () => shieldDirection = 0);

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);

    // Initial Render
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCore();
    drawShield();
});