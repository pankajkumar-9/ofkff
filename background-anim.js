/**
 * Modern 3D Particle Network Animation (Enhanced)
 * Features High-DPI support, Glow Effects, and Smooth Physics.
 */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration
const CONFIG = {
    particleCount: 120, // Increased density
    connectionDistance: 160,
    baseSpeed: 0.3, // Slower for elegance
    perspective: 1000,
    zRange: 1500, // Deeper field
    mouseSensitivity: 0.00005, // Subtle rotation
    colors: {
        light: {
            nodes: 'rgba(46, 125, 50, 0.8)',
            lines: 'rgba(46, 125, 50, 0.2)',
            glow: '#4caf50',
            bg: '#f8fdf9' // Brighter, cleaner paper-like bg
        },
        dark: {
            nodes: 'rgba(100, 255, 218, 0.9)',
            lines: 'rgba(100, 255, 218, 0.15)',
            glow: '#64ffda',
            bg: '#0a192f'
        }
    }
};

let theme = CONFIG.colors.light;
let mouseX = 0;
let mouseY = 0;
let rotationX = 0;
let rotationY = 0;

class Particle3D {
    constructor() {
        this.init();
    }

    init() {
        // Spread particles wider
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = (Math.random() - 0.5) * CONFIG.zRange;

        // Random velocity variations for organic feel
        this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vz = (Math.random() - 0.5) * CONFIG.baseSpeed * 0.5;

        this.size = Math.random() * 2.5 + 0.5; // Finer particles
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Soft Bounds - respawn on other side
        const boundsX = width * 1.2;
        const boundsY = height * 1.2;
        const boundsZ = CONFIG.zRange / 2;

        if (this.x > boundsX) this.x = -boundsX;
        if (this.x < -boundsX) this.x = boundsX;
        if (this.y > boundsY) this.y = -boundsY;
        if (this.y < -boundsY) this.y = boundsY;
        if (this.z > boundsZ) this.z = -boundsZ;
        if (this.z < -boundsZ) this.z = boundsZ;
    }
}

function init() {
    resize();
    particles = [];
    // Smart density based on screen area
    const count = Math.min(CONFIG.particleCount, (window.innerWidth * window.innerHeight) / 8000);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle3D());
    }

    checkTheme();
    animate();
}

function resize() {
    // High DPI Support
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context
    ctx.scale(dpr, dpr);
}

function checkTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    theme = isDark ? CONFIG.colors.dark : CONFIG.colors.light;
}

// 3D Projection
function project(p, rotX, rotY) {
    // 1. Rotate Y
    const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    const z1 = p.z * Math.cos(rotY) + p.x * Math.sin(rotY);

    // 2. Rotate X
    const y1 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = z1 * Math.cos(rotX) + p.y * Math.sin(rotX);

    // 3. Project to 2D with depth scaling
    const scale = CONFIG.perspective / (CONFIG.perspective + z2 + 800);

    return {
        x: x1 * scale + width / 2,
        y: y1 * scale + height / 2,
        scale: scale,
        z: z2,
        alpha: Math.min(1, Math.max(0, (scale - 0.2) * 2)) // Fade out distant particles
    };
}


function animate() {
    checkTheme();

    // Clear
    ctx.clearRect(0, 0, width, height);
    // Fill bg independently usually, but here we can just let CSS handle bg color 
    // OR draw it here. Drawing ensures correct color sync.
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Camera Rotation
    const targetRotY = (mouseX - width / 2) * CONFIG.mouseSensitivity;
    const targetRotX = (mouseY - height / 2) * CONFIG.mouseSensitivity;

    rotationY += (targetRotY - rotationY) * 0.05;
    rotationX += (targetRotX - rotationX) * 0.05;

    // Calculate & Project
    const projected = particles.map(p => {
        p.update();
        return {
            original: p,
            ...project(p, rotationX, rotationY)
        };
    });

    // Drawing

    // 1. Lines (Batch where possible or simple loop)
    ctx.lineWidth = 0.8; // Thicker due to High DPI, looks fine

    projected.forEach((p, i) => {
        if (p.alpha <= 0.01) return; // Skip invisible

        // Connections
        for (let j = i + 1; j < projected.length; j++) {
            const p2 = projected[j];
            if (p2.alpha <= 0.01) continue;

            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            // Simple distance check avoids sqrt for perf? No, we need visual falloff
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.connectionDistance) {
                // Calculate combined opacity based on distance & depth
                const lineAlpha = (1 - (dist / CONFIG.connectionDistance)) * Math.min(p.alpha, p2.alpha);

                ctx.beginPath();
                ctx.strokeStyle = theme.lines.replace(')', `, ${lineAlpha})`).replace('rgba', 'rgba').replace(', 0.15)', `, ${lineAlpha})`);

                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    // 2. Nodes (Draw on top)
    projected.forEach(p => {
        if (p.alpha <= 0.01) return;

        ctx.beginPath();

        const radius = p.original.size * p.scale;

        ctx.fillStyle = theme.nodes;
        ctx.globalAlpha = p.alpha;

        // Glow effect
        if (p.scale > 0.8) { // Only close particles glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = theme.glow;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Reset
    });

    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('mousemove', (e) => {
    // Add some lag/easing to mouse values? handled in animate loop
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('resize', resize);
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(checkTheme, 50));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
