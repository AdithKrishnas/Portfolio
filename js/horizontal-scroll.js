/* ==========================================================================
   HORIZONTAL SCROLL SHOWCASE CONTROLLER (CINEMA & REELS)
   ========================================================================== */

class HorizontalShowcase {
  constructor() {
    this.container = document.querySelector(".horizontal-track-container");
    this.track = document.querySelector(".horizontal-track");
    this.progressBar = document.querySelector(".horizontal-progress-fill");
    this.prevBtn = document.querySelector(".slider-btn-prev");
    this.nextBtn = document.querySelector(".slider-btn-next");

    if (!this.container || !this.track) return;

    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;

    this.init();
  }

  init() {
    this.renderCards();
    this.bindEvents();
    this.updateProgress();
  }

  renderCards() {
    const featuredProjects = getFeaturedShowcaseProjects();
    this.track.innerHTML = "";

    featuredProjects.forEach((proj) => {
      const isReel = proj.category === "reels" || proj.category === "ai-videos";
      const card = document.createElement("article");
      card.className = `showcase-card ${isReel ? "vertical-reel" : "cinema-card"}`;
      card.setAttribute("data-cursor", isReel ? "play" : "view");
      card.setAttribute("data-id", proj.id);

      card.innerHTML = `
        <img class="showcase-card-media" src="${proj.cover}" alt="${proj.title}" loading="lazy" />
        <div class="showcase-card-overlay">
          <div class="showcase-card-top">
            <span class="showcase-tag-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              ${proj.categoryName}
            </span>
            ${proj.duration ? `<span class="reel-duration">${proj.duration}</span>` : ""}
          </div>
          <div class="showcase-card-bottom">
            <h3 class="showcase-card-title">${proj.title}</h3>
            <div class="showcase-card-meta">
              <span>${proj.client}</span>
              <span>${proj.year}</span>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        if (window.projectModal) window.projectModal.open(proj.id);
      });

      card.addEventListener("mouseenter", () => {
        if (window.soundSystem) window.soundSystem.hover();
      });

      this.track.appendChild(card);
    });
  }

  bindEvents() {
    // Mouse Drag Interaction
    this.container.addEventListener("mousedown", (e) => {
      this.isDown = true;
      this.container.classList.add("dragging");
      this.startX = e.pageX - this.container.offsetLeft;
      this.scrollLeft = this.container.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      this.isDown = false;
      this.container.classList.remove("dragging");
    });

    this.container.addEventListener("mousemove", (e) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.pageX - this.container.offsetLeft;
      const walk = (x - this.startX) * 1.8;
      this.container.scrollLeft = this.scrollLeft - walk;
      this.updateProgress();
    });

    // Touch Drag Interaction for Mobile & Tablet
    this.container.addEventListener("touchstart", (e) => {
      this.isDown = true;
      this.startX = e.touches[0].pageX - this.container.offsetLeft;
      this.scrollLeft = this.container.scrollLeft;
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isDown = false;
    }, { passive: true });

    this.container.addEventListener("touchmove", (e) => {
      if (!this.isDown) return;
      const x = e.touches[0].pageX - this.container.offsetLeft;
      const walk = (x - this.startX) * 1.4;
      this.container.scrollLeft = this.scrollLeft - walk;
      this.updateProgress();
    }, { passive: true });

    // Scroll progress update
    this.container.addEventListener("scroll", () => {
      this.updateProgress();
    });

    // Arrow Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        this.container.scrollBy({ left: -420, behavior: "smooth" });
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        this.container.scrollBy({ left: 420, behavior: "smooth" });
      });
    }

    // Reactive update from Admin Panel
    window.addEventListener("projectsUpdated", () => {
      this.renderCards();
      this.updateProgress();
    });
  }

  updateProgress() {
    const maxScroll = this.container.scrollWidth - this.container.clientWidth;
    if (maxScroll <= 0) {
      if (this.progressBar) this.progressBar.style.width = "100%";
      return;
    }
    const ratio = (this.container.scrollLeft / maxScroll) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(100, Math.max(10, ratio))}%`;
    }

    // Toggle button disabled states
    if (this.prevBtn) this.prevBtn.disabled = this.container.scrollLeft <= 5;
    if (this.nextBtn) this.nextBtn.disabled = this.container.scrollLeft >= maxScroll - 5;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.horizontalShowcase = new HorizontalShowcase();
});

