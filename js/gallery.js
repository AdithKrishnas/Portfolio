/* ==========================================================================
   SELECTED WORK GALLERY CONTROLLER
   Filterable masonry grid, category pills, search filter & animations
   ========================================================================== */

class GalleryController {
  constructor() {
    this.grid = document.querySelector(".gallery-grid");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.searchInput = document.querySelector(".gallery-search-input");
    this.activeCategory = "all";
    this.searchQuery = "";

    if (!this.grid) return;

    this.init();
  }

  init() {
    this.renderCategoryCounts();
    this.renderProjects();
    this.bindEvents();
  }

  renderCategoryCounts() {
    this.filterButtons.forEach((btn) => {
      const cat = btn.getAttribute("data-filter");
      const countBadge = btn.querySelector(".count-badge");
      if (!countBadge) return;

      if (cat === "all") {
        countBadge.textContent = PROJECTS_DATA.length;
      } else {
        const count = PROJECTS_DATA.filter((p) => p.category === cat).length;
        countBadge.textContent = count;
      }
    });
  }

  renderProjects() {
    let filtered = PROJECTS_DATA;

    // Filter by Category
    if (this.activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery.trim() !== "") {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.tools.some((t) => t.toLowerCase().includes(q))
      );
    }

    this.grid.innerHTML = "";

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
          <p style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem; color: #fff;">No projects matched your criteria.</p>
          <p style="font-family: var(--font-mono); font-size: 0.9rem;">Try selecting another category or clearing your search.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((proj, index) => {
      const isVideo = !!proj.videoSrc || proj.category === "reels" || proj.category === "ai-videos";
      const card = document.createElement("article");
      card.className = `gallery-item ${proj.gridSpan || "col-span-6"} ${proj.aspect || ""}`;
      card.setAttribute("data-cursor", isVideo ? "play" : "view");
      card.setAttribute("data-id", proj.id);
      card.setAttribute("data-reveal", "");
      card.setAttribute("data-delay", `${((index % 4) + 1) * 100}`);

      card.innerHTML = `
        <div class="gallery-media-wrapper">
          ${proj.videoSrc ? `
            <video class="gallery-media gallery-video" loop muted playsinline preload="metadata">
              <source src="${proj.videoSrc}" type="video/mp4" />
            </video>
            <div class="video-play-indicator" style="position:absolute; top:16px; right:16px; width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:2;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccff00"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          ` : `
            <img class="gallery-media" src="${proj.cover}" alt="${proj.title}" loading="lazy" />
          `}
          <div class="gallery-item-overlay">
            <div class="gallery-item-top">
              <span class="item-badge">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                ${proj.categoryName}
              </span>
              <div class="view-btn-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </div>
            <div class="gallery-item-content">
              <h3 class="gallery-item-title">${proj.title}</h3>
              <p class="gallery-item-desc">${proj.tagline || proj.description}</p>
              <div class="gallery-item-tags">
                ${proj.tags.slice(0, 3).map((t) => `<span class="tag-mini">#${t}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      const videoEl = card.querySelector(".gallery-video");

      card.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        if (window.projectModal) window.projectModal.open(proj.id);
      });

      card.addEventListener("mouseenter", () => {
        if (window.soundSystem) window.soundSystem.hover();
        if (videoEl) videoEl.play().catch(() => {});
      });

      card.addEventListener("mouseleave", () => {
        if (videoEl) videoEl.pause();
      });

      this.grid.appendChild(card);
    });

    // Trigger reveal animations
    setTimeout(() => {
      const items = this.grid.querySelectorAll("[data-reveal]");
      items.forEach((item) => item.classList.add("revealed"));
    }, 50);
  }

  bindEvents() {
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.filterSwitch();
        this.filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.getAttribute("data-filter");
        this.renderProjects();
      });
    });

    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderProjects();
      });
    }

    // Reactive update from Admin Panel
    window.addEventListener("projectsUpdated", () => {
      this.renderCategoryCounts();
      this.renderProjects();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.galleryController = new GalleryController();
});
