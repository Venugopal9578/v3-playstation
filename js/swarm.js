const canvas = document.getElementById('swarmCanvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Track the cursor as the gravitational center
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    isActive: false
};

const particles = [];
const particleCount = 150;

class Boid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        // Retaining the full, vibrant color spectrum
        this.baseHue = Math.random() * 360;
        this.currentHue = this.baseHue;
        this.history = [];
    }

    update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Reverted to the elegant, stable magnetic physics
            const forceDirection = distance < 70 ? -0.15 : 0.04;

            this.vx += (dx / distance) * forceDirection;
            this.vy += (dy / distance) * forceDirection;

            // Restored the smooth, controlled swirling force
            const swirlStrength = distance < 120 ? 0.08 : 0.02;
            this.vx += (dy / distance) * swirlStrength;
            this.vy -= (dx / distance) * swirlStrength;
        }

        // Reverted the organic jitter to a calm, manageable level
        this.vx += (Math.random() - 0.5) * 0.6;
        this.vy += (Math.random() - 0.5) * 0.6;

        // Restored proper friction to maintain tight flocking control
        this.vx *= 0.94;
        this.vy *= 0.94;

        this.x += this.vx;
        this.y += this.vy;

        // Velocity-based color shifting
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.currentHue = this.baseHue - (speed * 12);

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 12) {
            this.history.shift();
        }
    }

    draw() {
        // Draw the crisp geometric trail first
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = `hsla(${this.currentHue}, 100%, 65%, 0.4)`;

            // Explicitly thinner line width for a sleek, refined look
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw the glowing particle head
        ctx.beginPath();

        // Explicitly smaller particle radius 
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.currentHue}, 100%, 65%)`;
        ctx.fill();

        // Apply controlled neon glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${this.currentHue}, 100%, 60%)`;
    }
}

// Generate the swarm
for (let i = 0; i < particleCount; i++) {
    particles.push(new Boid());
}

function animate() {
    // Completely clear the canvas with true black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 0;

    // Let the swarm default to a gentle orbit if untouched
    if (!mouse.isActive) {
        mouse.x = canvas.width / 2 + Math.cos(Date.now() * 0.0008) * 120;
        mouse.y = canvas.height / 2 + Math.sin(Date.now() * 0.0011) * 120;
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// Event Listeners for smooth tracking
const updateMouse = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    mouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    mouse.isActive = true;
};

canvas.addEventListener('mousemove', updateMouse);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateMouse(e);
}, { passive: false });

canvas.addEventListener('mouseleave', () => mouse.isActive = false);
canvas.addEventListener('touchend', () => mouse.isActive = false);

// Ignite the engine
animate();