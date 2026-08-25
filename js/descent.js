const depthValue = document.getElementById('depthValue');
const milestoneTitle = document.getElementById('milestoneTitle');
const milestoneText = document.getElementById('milestoneText');
const drillBtn = document.getElementById('drillBtn');
const ascendBtn = document.getElementById('ascendBtn');
const canvas = document.getElementById('drillCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Telemetry state
let depth = 0;
let currentVelocity = 0;
let isDrilling = false;
let isAscending = false;
let lastTime = performance.now();
const MAX_DEPTH = 6371000;
const MAX_VELOCITY = 37800; // Recalibrated to strictly hit the 4m 30s target

// Particle Engine State
let particles = [];
let currentPalette = ['#5d4037', '#4e342e', '#3e2723', '#8d6e63'];

const milestones = [
    { d: 0, title: "Surface Level", text: "The journey begins. Pace yourself." },
    { d: 2, title: "Standard Grave", text: "Six feet under." },
    { d: 12, title: "Deepest Animal Burrow", text: "Nile crocodiles dig surprisingly deep to avoid extreme temperatures." },
    { d: 105, title: "Arsenalna Metro Station", text: "The deepest underground train station, located in Kyiv." },
    { d: 332, title: "Deepest SCUBA Dive", text: "Achieved by Ahmed Gabr in 2014 in the Red Sea." },
    { d: 1000, title: "Neutrino Observatory", text: "Ultra-sensitive physics labs are buried here to block cosmic rays." },
    { d: 2197, title: "Veryovkina Cave", text: "The deepest known cave on Earth." },
    { d: 4000, title: "Mponeng Gold Mine", text: "The deepest artificial point humans can physically travel to." },
    { d: 12262, title: "Kola Superdeep Borehole", text: "The deepest artificial hole ever dug by humanity. Just 9 inches wide." },
    { d: 35000, title: "The Moho Discontinuity", text: "The boundary between the Earth's crust and the solid mantle." },
    { d: 410000, title: "Mantle Transition Zone", text: "Extreme pressure changes the crystal structures in the rock here." },
    { d: 2900000, title: "Outer Core Boundary", text: "We enter a churning ocean of superheated liquid iron and nickel." },
    { d: 5150000, title: "Inner Core Boundary", text: "The pressure is so immense that the iron solidifies despite the 5,000°C heat." },
    { d: 6371000, title: "Center of the Earth", text: "Gravity pulls equally in all directions. You have arrived." }
];

const zones = [
    { limit: 12000, colors: ['#5d4037', '#4e342e', '#3e2723', '#795548'] },
    { limit: 35000, colors: ['#212121', '#424242', '#616161', '#111'] },
    { limit: 2900000, colors: ['#b71c1c', '#d32f2f', '#f44336', '#ff5722'] },
    { limit: 5150000, colors: ['#f57f17', '#ffb300', '#ffca28', '#fff3e0'] },
    { limit: 6371000, colors: ['#ffffff', '#eceff1', '#cfd8dc', '#b0bec5'] }
];

class Debris {
    constructor(speedMultiplier, direction) {
        this.x = Math.random() * width;
        this.y = direction > 0 ? height + 20 : -20;

        this.z = Math.random() * 0.8 + 0.2;
        this.size = (Math.random() * 8 + 4) * this.z;

        this.speed = (Math.random() * 8 + 4) * speedMultiplier * direction * this.z;
        this.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
        this.vx = (Math.random() - 0.5) * 3 * this.z;

        this.sides = Math.floor(Math.random() * 3) + 4;
        this.radii = Array.from({ length: this.sides }, () => Math.random() * 0.5 + 0.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.y -= this.speed;
        this.x += this.vx;
        this.rotation += this.spin;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            let angle = (i / this.sides) * Math.PI * 2 + this.rotation;
            let rad = this.size * this.radii[i];
            let px = this.x + Math.cos(angle) * rad;
            let py = this.y + Math.sin(angle) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
}

function manageParticles(velocityRatio) {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
    ctx.fillRect(0, 0, width, height);

    const direction = currentVelocity >= 0 ? 1 : -1;
    const speedMultiplier = Math.max(0.2, Math.abs(velocityRatio) * 12);

    if (Math.abs(currentVelocity) > 50) {
        const spawnCount = Math.ceil(Math.abs(velocityRatio) * 6);
        for (let i = 0; i < spawnCount; i++) {
            particles.push(new Debris(speedMultiplier, direction));
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw();

        if (p.y < -50 || p.y > height + 50 || p.x < -50 || p.x > width + 50) {
            particles.splice(i, 1);
        }
    }
}

function update(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    // Adjusted acceleration for the strict time limit
    if (isDrilling) {
        let maxV = 30 + Math.pow(depth, 0.78);
        if (maxV > MAX_VELOCITY) maxV = MAX_VELOCITY;
        currentVelocity += (maxV - currentVelocity) * dt * 0.75;
    } else if (isAscending) {
        let maxV = -(30 + Math.pow(depth, 0.78));
        if (maxV < -MAX_VELOCITY) maxV = -MAX_VELOCITY;
        currentVelocity += (maxV - currentVelocity) * dt * 0.75;
    } else {
        currentVelocity -= currentVelocity * dt * 3.5;
        if (Math.abs(currentVelocity) < 10) currentVelocity = 0;
    }

    depth += currentVelocity * dt;
    if (depth < 0) { depth = 0; currentVelocity = 0; }
    if (depth > MAX_DEPTH) { depth = MAX_DEPTH; currentVelocity = 0; }

    updateUI();

    const velocityRatio = currentVelocity / MAX_VELOCITY;
    const shakeIntensity = Math.abs(velocityRatio) * 4;
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    manageParticles(velocityRatio);
    ctx.restore();

    requestAnimationFrame(update);
}

function updateUI() {
    const depthInKm = depth / 1000;
    depthValue.textContent = depthInKm.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    });

    let currentMilestone = milestones[0];
    for (let i = milestones.length - 1; i >= 0; i--) {
        if (depth >= milestones[i].d) {
            currentMilestone = milestones[i];
            break;
        }
    }

    if (milestoneTitle.textContent !== currentMilestone.title) {
        milestoneTitle.textContent = currentMilestone.title;
        milestoneText.textContent = currentMilestone.text;
    }

    for (let i = 0; i < zones.length; i++) {
        if (depth <= zones[i].limit) {
            currentPalette = zones[i].colors;
            break;
        }
    }
}

const startDrilling = (e) => { e.preventDefault(); isDrilling = true; };
const stopDrilling = (e) => { e.preventDefault(); isDrilling = false; };
const startAscending = (e) => { e.preventDefault(); isAscending = true; };
const stopAscending = (e) => { e.preventDefault(); isAscending = false; };

['mousedown', 'touchstart'].forEach(evt => drillBtn.addEventListener(evt, startDrilling));
['mouseup', 'mouseleave', 'touchend'].forEach(evt => drillBtn.addEventListener(evt, stopDrilling));

['mousedown', 'touchstart'].forEach(evt => ascendBtn.addEventListener(evt, startAscending));
['mouseup', 'mouseleave', 'touchend'].forEach(evt => ascendBtn.addEventListener(evt, stopAscending));

requestAnimationFrame(update);