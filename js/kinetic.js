const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const refillBtn = document.getElementById('refillBtn');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let particles = [];
let mouse = { x: canvas.width / 2, y: canvas.height / 2, active: false };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
    }

    update() {
        if (mouse.active) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let force = (120 - distance) / 120;

            if (distance < 120) {
                this.vx -= (dx / distance) * force * 0.6;
                this.vy -= (dy / distance) * force * 0.6;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98; // Friction
        this.vy *= 0.98;

        // Boundary bounce
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 400; i++) {
        particles.push(new Particle());
    }
}

// Generate the initial swarm
initParticles();

function animate() {
    // Trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

const setMouse = (e, active) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.active = active;
};

// Event Listeners
canvas.addEventListener('mousedown', (e) => setMouse(e, true));
canvas.addEventListener('mousemove', (e) => { if (mouse.active) setMouse(e, true); });
window.addEventListener('mouseup', () => mouse.active = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); setMouse(e, true); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { if (mouse.active) setMouse(e, true); }, { passive: false });
window.addEventListener('touchend', () => mouse.active = false);

refillBtn.addEventListener('click', () => {
    initParticles();
});

animate();