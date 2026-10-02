/* ==========================================================================
   CREATIVE LAB / INTERACTIVE VISUAL PLAYGROUND
   ========================================================================== */

class CreativeLab {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mode = "waves"; // 'waves', 'neural', 'kinetic', 'matrix'
    this.modeButtons = document.querySelectorAll(".lab-mode-btn");
    this.statsInfo = document.querySelector(".lab-stats-info");

    this.mouse = { x: 200, y: 200 };
    this.time = 0;
    this.isActive = true;

    // Mode-specific data
    this.particles = [];
    this.matrixColumns = [];
    this.matrixDrops = [];
    this.chars = "01アイウエオカキクケコサシスセソタチツテトABCDEF";

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * this.dpr;
      this.mouse.y = (e.clientY - rect.top) * this.dpr;
    });

    // Intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        this.isActive = e.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(this.canvas);

    // Mode toggle buttons
    this.modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        this.modeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.mode = btn.getAttribute("data-mode");
        this.setupMode();
      });
    });

    this.setupMode();
    this.animate();
  }

  resize() {
    this.width = this.canvas.clientWidth * this.dpr;
    this.height = this.canvas.clientHeight * this.dpr;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.setupMode();
  }

  setupMode() {
    if (this.mode === "neural") {
      this.particles = [];
      const count = 70;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 1.5 * this.dpr,
          vy: (Math.random() - 0.5) * 1.5 * this.dpr,
          color: i % 2 === 0 ? "#ccff00" : "#00f0ff"
        });
      }
    } else if (this.mode === "matrix") {
      const fontSize = 16 * this.dpr;
      const columns = Math.floor(this.width / fontSize);
      this.matrixDrops = [];
      for (let i = 0; i < columns; i++) {
        this.matrixDrops[i] = Math.floor(Math.random() * -50);
      }
    }

    if (this.statsInfo) {
      this.statsInfo.textContent = `MODE: ${this.mode.toUpperCase()} // 60 FPS GPU ACCELERATED`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isActive) return;

    this.time += 0.02;

    if (this.mode === "waves") {
      this.drawWaves();
    } else if (this.mode === "neural") {
      this.drawNeural();
    } else if (this.mode === "kinetic") {
      this.drawKinetic();
    } else if (this.mode === "matrix") {
      this.drawMatrix();
    }
  }

  drawWaves() {
    this.ctx.fillStyle = "rgba(4, 4, 6, 0.25)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const lines = 7;
    const colors = ["#ccff00", "#00f0ff", "#ff4365", "#8e44ff", "#ffbe0b"];

    for (let l = 0; l < lines; l++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colors[l % colors.length];
      this.ctx.lineWidth = 2 * this.dpr;

      for (let x = 0; x < this.width; x += 15 * this.dpr) {
        const mouseFactor = (this.mouse.y - this.height / 2) * 0.002;
        const y = this.height / 2 +
          Math.sin(x * 0.004 + this.time + l * 0.6) * (60 + l * 15) * this.dpr +
          Math.cos(x * 0.008 - this.time * 0.5) * 30 * this.dpr * mouseFactor;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    }
  }

  drawNeural() {
    this.ctx.fillStyle = "rgba(4, 4, 6, 0.3)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const maxDist = 130 * this.dpr;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse pull
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 * this.dpr) {
        p.x += dx * 0.02;
        p.y += dy * 0.02;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 * this.dpr, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < maxDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = 1 - d / maxDist;
          this.ctx.lineWidth = 1 * this.dpr;
          this.ctx.stroke();
        }
      }
      this.ctx.globalAlpha = 1.0;
    }
  }

  drawKinetic() {
    this.ctx.fillStyle = "rgba(4, 4, 6, 0.2)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const words = ["DISRUPT", "CREATE", "TRANSCEND", "INVENT"];
    this.ctx.font = `900 ${clamp(40, 60, this.width * 0.06)}px 'Syne', sans-serif`;
    this.ctx.textAlign = "center";

    words.forEach((word, index) => {
      const offset = (this.time * 40 + index * 120) % (this.height + 100);
      const y = offset - 50;
      const x = this.width / 2 + Math.sin(this.time + index) * 60 * this.dpr;

      this.ctx.fillStyle = index % 2 === 0 ? "#ccff00" : "#ffffff";
      this.ctx.fillText(word, x, y);
    });
  }

  drawMatrix() {
    this.ctx.fillStyle = "rgba(4, 4, 6, 0.15)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const fontSize = 16 * this.dpr;
    this.ctx.font = `${fontSize}px 'Space Grotesk', monospace`;

    for (let i = 0; i < this.matrixDrops.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * fontSize;
      const y = this.matrixDrops[i] * fontSize;

      this.ctx.fillStyle = Math.random() > 0.85 ? "#ffffff" : "#ccff00";
      this.ctx.fillText(char, x, y);

      if (y > this.height && Math.random() > 0.975) {
        this.matrixDrops[i] = 0;
      }
      this.matrixDrops[i]++;
    }
  }
}

function clamp(min, max, val) {
  return Math.min(Math.max(val, min), max);
}

document.addEventListener("DOMContentLoaded", () => {
  new CreativeLab("lab-canvas");
});
