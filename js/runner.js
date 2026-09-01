document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    // ==================================================
    // HIGH SCORE
    // ==================================================

    const highScoreDisplay =
        document.getElementById('highScore') ||
        document.querySelector('.high-score');

    let highScore =
        Number(localStorage.getItem('salaarHighScore')) || 0;

    // ==================================================
    // HUMANLY POSSIBLE SPEED
    // ==================================================

    const MAX_GAME_SPEED = 5.0;
    const SPEED_INTERVAL = 200;
    const SPEED_INCREASE = 0.05;

    let isPlaying = false;
    let animationId;
    let score = 0;
    let frameCount = 0;
    let gameSpeed = 3.5;
    let obstacles = [];

    // STRICT GAP ENFORCEMENT
    let framesUntilNextObstacle = 100;

    // Load Player Assets Only
    const assets = {
        run1: new Image(),
        run2: new Image(),
        jump: new Image(),
        duck: new Image()
    };

    assets.run1.src = 'img/run1.png';
    assets.run2.src = 'img/run2.png';
    assets.jump.src = 'img/jump.png';
    assets.duck.src = 'img/duck.png';

    const floorY = 220;

    // Player Physics Matrix
    const player = {
        x: 50,
        y: 0,
        width: 30,
        height: 60,
        dy: 0,
        gravity: 0.49,
        jumpForce: -11.25,
        isJumping: false,
        isDucking: false
    };

    player.y = floorY - player.height;

    // MICRO-CALIBRATION MATRIX
    const spriteConfigs = {
        run1: { width: 65, height: 130, nudgeY: 28, nudgeX: -17 },
        run2: { width: 65, height: 130, nudgeY: 28, nudgeX: -17 },
        jump: { width: 60, height: 85, nudgeY: 5, nudgeX: -15 },
        duck: { width: 65, height: 100, nudgeY: 18, nudgeX: -17 }
    };


    // ==================================================
    // PIXEL DINOSAUR MATRICES
    //
    // 1 = filled pixel
    // 0 = empty pixel
    //
    // BOTH FACE LEFT
    // ==================================================

    /*
     * GROUND T-REX
     */

    const groundDinoMatrix = [
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];


    /*
     * FLYING PTERODACTYL
     */

    const flyDinoMatrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];


    // ==================================================
    // KEYSTROKES
    // ==================================================

    document.addEventListener('keydown', (e) => {

        // OVERRIDE: Prevent the browser from scrolling
        if (
            ['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)
        ) {
            e.preventDefault();
        }

        if (
            e.code === 'Space' &&
            !isPlaying
        ) {
            document
                .getElementById('gameOverModal')
                .classList
                .remove('active');

            startGame();
        }

        if (!isPlaying) return;

        if (
            (e.code === 'Space' || e.code === 'ArrowUp') &&
            !player.isJumping
        ) {
            player.dy = player.jumpForce;
            player.isJumping = true;
            player.isDucking = false;
        }

        if (
            e.code === 'ArrowDown' &&
            !player.isJumping
        ) {
            player.isDucking = true;
            player.height = 30;
            player.y = floorY - player.height;
        }
    });


    document.addEventListener('keyup', (e) => {

        if (
            e.code === 'ArrowDown' &&
            player.isDucking
        ) {
            player.isDucking = false;
            player.height = 60;
            player.y = floorY - player.height;
        }
    });


    // ==================================================
    // NATIVE PIXEL HAZARD ENGINE
    // ==================================================

    class Obstacle {

        constructor(type) {

            this.x = canvas.width;
            this.type = type;

            this.matrix =
                type === 'ground'
                    ? groundDinoMatrix
                    : flyDinoMatrix;

            // ==================================================
            // SIZE CALIBRATION
            // ==================================================

            this.pixelSize =
                type === 'ground'
                    ? 1.45
                    : 1.25;

            this.width =
                this.matrix[0].length *
                this.pixelSize;

            this.height =
                this.matrix.length *
                this.pixelSize;

            // ==================================================
            // POSITION CALIBRATION
            // ==================================================

            if (type === 'ground') {

                // Feet sit exactly on the floor
                this.y =
                    floorY -
                    this.height;

            } else {

                // Flying dino stays above human neck/head area
                this.y =
                    floorY -
                    82;
            }
        }


        draw() {

            // Keep pixel edges sharp
            ctx.imageSmoothingEnabled = false;

            ctx.fillStyle = '#1f2d50';

            for (
                let row = 0;
                row < this.matrix.length;
                row++
            ) {

                for (
                    let col = 0;
                    col < this.matrix[row].length;
                    col++
                ) {

                    if (
                        this.matrix[row][col] !== 1
                    ) {
                        continue;
                    }

                    ctx.fillRect(
                        this.x +
                        col * this.pixelSize,

                        this.y +
                        row * this.pixelSize,

                        this.pixelSize,

                        this.pixelSize
                    );
                }
            }
        }


        update() {

            this.x -= gameSpeed;

            this.draw();

        }
    }


    // ==================================================
    // SPAWN OBSTACLE
    // ==================================================

    function spawnObstacle() {

        if (framesUntilNextObstacle <= 0) {

            const type =
                Math.random() > 0.70
                    ? 'fly'
                    : 'ground';

            obstacles.push(
                new Obstacle(type)
            );

            // Random gap between 80 and 160 frames
            framesUntilNextObstacle =
                Math.floor(
                    Math.random() * 80
                ) + 80;

        } else {

            framesUntilNextObstacle--;

        }
    }


    // ==================================================
    // PLAYER RENDER
    // ==================================================

    function drawPlayer() {

        let activeImg;
        let config;


        if (player.isJumping) {

            activeImg = assets.jump;
            config = spriteConfigs.jump;

        } else if (player.isDucking) {

            activeImg = assets.duck;
            config = spriteConfigs.duck;

        } else {

            activeImg =
                Math.floor(frameCount / 24) % 2 === 0
                    ? assets.run1
                    : assets.run2;

            config =
                activeImg === assets.run1
                    ? spriteConfigs.run1
                    : spriteConfigs.run2;
        }


        if (
            !activeImg.complete ||
            activeImg.naturalWidth === 0
        ) {
            return;
        }


        const collisionBottom =
            player.y + player.height;


        const renderX =
            player.x + config.nudgeX;


        const renderY =
            collisionBottom -
            config.height +
            config.nudgeY;


        ctx.drawImage(
            activeImg,
            renderX,
            renderY,
            config.width,
            config.height
        );
    }


    // ==================================================
    // COLLISION DETECTION
    // ==================================================

    function detectCollision(obs) {

        // ------------------------------------------
        // PLAYER HITBOX
        // ------------------------------------------

        const playerLeft =
            player.x + 8;

        const playerRight =
            player.x +
            player.width -
            8;

        const playerTop =
            player.y + 8;

        const playerBottom =
            player.y +
            player.height -
            4;


        // ------------------------------------------
        // GROUND DINO
        //
        // Keep your current collision behaviour.
        // ------------------------------------------

        if (obs.type === 'ground') {

            const dinoLeft =
                obs.x + 3;

            const dinoRight =
                obs.x +
                obs.width -
                10;

            const dinoTop =
                obs.y + 3;

            const dinoBottom =
                obs.y +
                obs.height;


            const hitX =
                playerRight > dinoLeft &&
                playerLeft < dinoRight;


            const hitY =
                playerBottom > dinoTop &&
                playerTop < dinoBottom;


            return hitX && hitY;
        }


        // ------------------------------------------
        // FLYING DINO
        //
        // Artwork remains at floorY - 82.
        //
        // Collision area extends slightly downward
        // so a standing player cannot simply walk
        // through the flying dino.
        // ------------------------------------------

        if (obs.type === 'fly') {

            const dinoLeft =
                obs.x + 4;

            const dinoRight =
                obs.x +
                obs.width -
                4;

            const dinoTop =
                obs.y + 4;

            const dinoBottom =
                obs.y +
                obs.height +
                14;


            const hitX =
                playerRight > dinoLeft &&
                playerLeft < dinoRight;


            const hitY =
                playerBottom > dinoTop &&
                playerTop < dinoBottom;


            return hitX && hitY;
        }


        return false;
    }


    // ==================================================
    // GAME LOOP
    // ==================================================

    function gameLoop() {

        if (!isPlaying) return;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ==========================================
        // PHYSICS CALCULATION
        // ==========================================

        player.y += player.dy;


        if (
            player.y <
            floorY -
            player.height
            &&
            !player.isDucking
        ) {

            player.dy += player.gravity;
            player.isJumping = true;

        } else if (!player.isDucking) {

            player.dy = 0;

            player.y =
                floorY -
                player.height;

            player.isJumping = false;
        }


        // ==========================================
        // RENDER LAYERING
        // ==========================================

        drawPlayer();

        spawnObstacle();


        for (
            let i = 0;
            i < obstacles.length;
            i++
        ) {

            obstacles[i].update();


            if (
                detectCollision(obstacles[i])
            ) {

                triggerGameOver();

                return;
            }
        }


        // ==========================================
        // REMOVE OFFSCREEN OBSTACLES
        // ==========================================

        if (
            obstacles.length > 0 &&
            obstacles[0].x < -80
        ) {

            obstacles.shift();

        }


        // ==========================================
        // FLOOR LINE
        // ==========================================

        ctx.beginPath();

        ctx.moveTo(
            0,
            floorY
        );

        ctx.lineTo(
            canvas.width,
            floorY
        );

        ctx.strokeStyle =
            '#1f2d50';

        ctx.lineWidth = 3;

        ctx.stroke();


        // ==========================================
        // SCORE
        // ==========================================

        frameCount++;


        if (
            frameCount % 10 === 0
        ) {

            score++;

            scoreDisplay.textContent =
                String(score).padStart(
                    5,
                    '0'
                );
        }


        // ==========================================
        // HUMANLY POSSIBLE SPEED INCREASE
        // ==========================================

        if (
            score > 0 &&
            score % SPEED_INTERVAL === 0
        ) {

            gameSpeed = Math.min(
                MAX_GAME_SPEED,
                gameSpeed + SPEED_INCREASE
            );
        }


        animationId =
            requestAnimationFrame(
                gameLoop
            );
    }


    // ==================================================
    // GAME OVER
    // ==================================================

    function triggerGameOver() {

        isPlaying = false;

        cancelAnimationFrame(
            animationId
        );

        actionBtn.disabled = false;

        actionBtn.textContent =
            "RERUN SALAAR";


        // ==========================================
        // HIGH SCORE UPDATE
        // ==========================================

        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                'salaarHighScore',
                highScore
            );
        }


        if (highScoreDisplay) {

            highScoreDisplay.textContent =
                String(highScore).padStart(
                    5,
                    '0'
                );
        }


        const modal =
            document.getElementById(
                'gameOverModal'
            );


        document
            .getElementById(
                'finalScoreDisplay'
            )
            .textContent = score;


        modal.classList.add(
            'active'
        );
    }


    // ==================================================
    // START GAME
    // ==================================================

    async function startGame() {

        if (isPlaying) return;


        obstacles = [];

        score = 0;

        frameCount = 0;

        framesUntilNextObstacle = 100;

        gameSpeed = 3.5;


        player.isDucking = false;

        player.height = 60;

        player.y =
            floorY -
            player.height;

        player.dy = 0;

        player.isJumping = false;


        // Current score resets.
        // High score does NOT reset.

        scoreDisplay.textContent =
            '00000';


        if (highScoreDisplay) {

            highScoreDisplay.textContent =
                String(highScore).padStart(
                    5,
                    '0'
                );
        }


        actionBtn.disabled = true;

        actionBtn.textContent =
            "SALAAR IS ON HIS WAY";


        isPlaying = true;

        gameLoop();
    }


    // ==================================================
    // MODAL DISMISS
    // ==================================================

    document
        .getElementById('modalDismissBtn')
        .addEventListener(
            'click',
            () => {

                document
                    .getElementById(
                        'gameOverModal'
                    )
                    .classList
                    .remove('active');


                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                drawPlayer();


                ctx.beginPath();

                ctx.moveTo(
                    0,
                    floorY
                );

                ctx.lineTo(
                    canvas.width,
                    floorY
                );

                ctx.strokeStyle =
                    '#1f2d50';

                ctx.lineWidth = 3;

                ctx.stroke();

            }
        );


    // ==================================================
    // INITIAL HIGH SCORE DISPLAY
    // ==================================================

    if (highScoreDisplay) {

        highScoreDisplay.textContent =
            String(highScore).padStart(
                5,
                '0'
            );
    }


    // ==================================================
    // ACTION BUTTON
    // ==================================================

    actionBtn.addEventListener(
        'click',
        startGame
    );


    // ==================================================
    // INITIAL PLAYER LOAD
    // ==================================================

    assets.run1.onload = () => {

        drawPlayer();


        ctx.beginPath();

        ctx.moveTo(
            0,
            floorY
        );

        ctx.lineTo(
            canvas.width,
            floorY
        );

        ctx.strokeStyle =
            '#1f2d50';

        ctx.lineWidth = 3;

        ctx.stroke();

    };

});

// ==================================================
// VISIBLE GLOSSY TOUCH MATRIX (INSIDE ENGINE SCOPE)
// ==================================================

const btnDuck = document.getElementById('btnDuck');
const btnJump = document.getElementById('btnJump');

if (btnJump && btnDuck) {

    // ------------------------------------------
    // JUMP & IGNITION BUTTON
    // ------------------------------------------
    btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();

        // Ignition Protocol
        if (!isPlaying) {
            document.getElementById('gameOverModal').classList.remove('active');
            startGame();
            return;
        }

        // Jump Action
        if (!player.isJumping) {
            player.dy = player.jumpForce;
            player.isJumping = true;
            player.isDucking = false;
        }
    }, { passive: false });

    // ------------------------------------------
    // DUCK / SLIDE BUTTON (HOLD)
    // ------------------------------------------
    btnDuck.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isPlaying) return;

        if (!player.isJumping) {
            player.isDucking = true;
            player.height = 30;
            player.y = floorY - player.height;
        }
    }, { passive: false });

    // ------------------------------------------
    // RELEASE SLIDE BUTTON
    // ------------------------------------------
    btnDuck.addEventListener('touchend', (e) => {
        e.preventDefault();

        if (player.isDucking) {
            player.isDucking = false;
            player.height = 60;
            player.y = floorY - player.height;
        }
    }, { passive: false });
}
