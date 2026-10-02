/* ==========================================================================
   CUSTOM MAGNETIC CURSOR CONTROLLER
   ========================================================================== */

class CursorController {
  constructor() {
    this.cursor = document.querySelector(".custom-cursor");
    this.follower = document.querySelector(".custom-cursor-follower");
    this.cursorText = document.querySelector(".cursor-text");

    if (!this.cursor || !this.follower) return;

    this.mouse = { x: -100, y: -100 };
    this.pos = { x: -100, y: -100 };
    this.speed = 0.16; // Follower smooth lag factor
    this.rafId = null;

    this.init();
  }

  init() {
    // Only enable if pointer device supports hover
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Position inner cursor instantly
      this.cursor.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px) translate(-50%, -50%)`;
    });

    this.render();
    this.bindHoverTargets();
  }

  render() {
    // Linear interpolation for smooth follower trail
    this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
    this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

    this.follower.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;

    this.rafId = requestAnimationFrame(() => this.render());
  }

  bindHoverTargets() {
    const body = document.body;

    // View action on project cards
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("[data-cursor]");
      if (target) {
        const cursorType = target.getAttribute("data-cursor");
        body.classList.add("cursor-hover");
        
        if (cursorType === "view") {
          body.classList.add("cursor-view");
          this.cursorText.textContent = "VIEW";
        } else if (cursorType === "play") {
          body.classList.add("cursor-play");
          this.cursorText.textContent = "PLAY";
        } else if (cursorType === "drag") {
          body.classList.add("cursor-drag");
          this.cursorText.textContent = "DRAG";
        } else {
          this.cursorText.textContent = "";
        }
      } else if (e.target.closest("a, button, input, select, textarea, .filter-btn")) {
        body.classList.add("cursor-hover");
        this.cursorText.textContent = "";
      }
    });

    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest("[data-cursor], a, button, input, select, textarea, .filter-btn");
      if (target) {
        body.classList.remove("cursor-hover", "cursor-view", "cursor-play", "cursor-drag");
        this.cursorText.textContent = "";
      }
    });

    // Magnetic button pull effect
    const magneticItems = document.querySelectorAll(".magnetic-target");
    magneticItems.forEach((item) => {
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;
        item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "translate(0px, 0px)";
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CursorController();
});
