/* ==========================================================================
   HERO GENERATIVE CANVAS BACKGROUND
   Ambient 60fps kinetic particle waves & interactive optical nodes
   ========================================================================== */

class HeroCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.particles = [];
    this.numParticles = 55;
    this.mouse = { x: null, y: null, radius: 180 };
    this.isActive = true;
    this.time = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    window.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * this.dpr;
      this.mouse.y = (e.clientY - rect.top) * this.dpr;
    });

    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Pause when hero is scrolled out of view to save battery & CPU
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isActive = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(this.canvas);

    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.clientWidth * this.dpr;
    this.height = this.canvas.clientHeight * this.dpr;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (this.particles.length > 0) {
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];
    // Adjust density based on screen size
    const count = window.innerWidth < 768 ? 30 : this.numParticles;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let color = "#d4af37";
      if (rand > 0.65) color = "#f5d77f"; // Burnished Gold
      else if (rand > 0.35) color = "#00f0ff"; // Animus Cyan
      else if (rand > 0.15) color = "#f6f1e3"; // Ivory Parchment
      else color = "#c81d25"; // Brotherhood Crimson

      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5 * this.dpr,
        vy: (Math.random() - 0.5) * 0.5 * this.dpr,
        radius: (Math.random() * 2 + 1) * this.dpr,
        baseX: 0,
        baseY: 0,
        color: color
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isActive) return;

    this.time += 0.005;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connecting kinetic lines
    const maxDist = 140 * this.dpr;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position with gentle floating wave
      p.x += p.vx + Math.sin(this.time + i) * 0.2;
      p.y += p.vy + Math.cos(this.time + i) * 0.2;

      // Wrap around edges smoothly
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse repulsion / attraction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius * this.dpr) {
          const force = (1 - distance / (this.mouse.radius * this.dpr)) * 2;
          p.x -= (dx / distance) * force * 1.5;
          p.y -= (dy / distance) * force * 1.5;
        }
      }

      // Draw particle dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = 0.5;
      this.ctx.fill();

      // Connect with neighboring particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

        if (dist < maxDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = (1 - dist / maxDist) * 0.18;
          this.ctx.lineWidth = 0.75 * this.dpr;
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1.0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new HeroCanvas("hero-canvas");
});
