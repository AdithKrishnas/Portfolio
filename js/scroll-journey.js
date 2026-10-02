/* ==========================================================================
   SCROLL JOURNEY CONTROLLER
   Author: AdithKrishna S.
   Handles:
   1. Interactive 3D Computer Workstation zoom transition into Timeline
   2. Project Timeline Odyssey navigation
   3. Design Suite Portals (Illustrator, Photoshop, Canva) showcase
   4. World of AI Video playback
   5. Live Platforms (podiyo.in, keralaalert.in)
   ========================================================================== */

class ScrollJourney {
  constructor() {
    this.computer = document.getElementById("hero-computer-wrap");
    this.timelineSection = document.getElementById("timeline-journey");
    this.timelineContainer = document.querySelector(".timeline-track");

    // Design Suite Portals
    this.suiteTabs = document.querySelectorAll(".suite-portal-btn");
    this.suiteGallery = document.querySelector(".suite-projects-grid");

    this.init();
  }

  init() {
    this.bindComputerZoom();
    this.renderTimeline();
    this.bindSuitePortals();
    this.bindVideoHovers();
  }

  // 1. Computer Zoom Transition
  bindComputerZoom() {
    if (!this.computer) return;

    this.computer.addEventListener("click", () => {
      if (window.soundSystem) window.soundSystem.click();
      this.triggerZoomIntoTimeline();
    });

    // Scroll trigger: when scrolling down from hero, add perspective zoom
    window.addEventListener("scroll", () => {
      const scrollY = window.pageYOffset;
      if (scrollY < window.innerHeight) {
        const factor = Math.min(1.3, 1 + scrollY * 0.0008);
        const opacity = Math.max(0, 1 - scrollY * 0.0018);
        this.computer.style.transform = `scale(${factor})`;
        this.computer.style.opacity = `${opacity}`;
      }
    });
  }

  triggerZoomIntoTimeline() {
    this.computer.classList.add("zooming");
    setTimeout(() => {
      if (this.timelineSection) {
        this.timelineSection.scrollIntoView({ behavior: "smooth" });
      }
      setTimeout(() => {
        this.computer.classList.remove("zooming");
        this.computer.style.transform = "";
        this.computer.style.opacity = "";
      }, 1000);
    }, 400);
  }

  // 2. Render Timeline
  renderTimeline() {
    if (!this.timelineContainer || typeof TIMELINE_DATA === "undefined") return;

    this.timelineContainer.innerHTML = "";

    TIMELINE_DATA.forEach((item, index) => {
      const node = document.createElement("div");
      node.className = "timeline-node";
      node.setAttribute("data-reveal", "");
      node.setAttribute("data-delay", `${(index + 1) * 100}`);

      node.innerHTML = `
        <div class="timeline-node-marker">
          <span class="timeline-step-num">${item.step}</span>
          <div class="timeline-beacon"></div>
        </div>
        <div class="timeline-node-card">
          <div class="timeline-card-header">
            <span class="timeline-year-badge">${item.year}</span>
            <span class="timeline-category-tag">${item.category}</span>
          </div>
          <h3 class="timeline-card-title">${item.title}</h3>
          <p class="timeline-card-subtitle">${item.subtitle}</p>
          <p class="timeline-card-desc">${item.description}</p>
          <div class="timeline-card-footer">
            <span class="timeline-metric-pill">${item.metric}</span>
            <button class="timeline-view-btn magnetic-target" data-proj="${item.relatedProjectId}">
              <span>Inspect Campaign</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;

      node.querySelector(".timeline-view-btn").addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        if (window.projectModal) window.projectModal.open(item.relatedProjectId);
      });

      this.timelineContainer.appendChild(node);
    });
  }

  // 3. Design Suite Portals (Illustrator, Photoshop, Canva)
  bindSuitePortals() {
    if (!this.suiteTabs || !this.suiteGallery) return;

    this.suiteTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.filterSwitch();
        this.suiteTabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const suite = btn.getAttribute("data-suite");
        this.renderSuiteProjects(suite);
      });
    });

    // Default to 'all' or 'photoshop'
    this.renderSuiteProjects("all");
  }

  renderSuiteProjects(suiteFilter) {
    if (!this.suiteGallery) return;

    const filtered = typeof getProjectsBySuite === "function" 
      ? getProjectsBySuite(suiteFilter) 
      : PROJECTS_DATA.filter(p => p.category === "graphic-design" || p.category === "posters" || p.category === "brochures");

    this.suiteGallery.innerHTML = "";

    if (filtered.length === 0) {
      this.suiteGallery.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(14,18,27,0.7); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-display); font-size: 1.25rem; color: var(--accent-gold-bright); margin-bottom: 0.5rem;">
            ◈ NO SYNCHRONIZED MEMORIES IN THIS VAULT ◈
          </div>
          <p style="font-family: var(--font-classical); font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Switch to "All Design Suites" to explore all visual branding artifacts.
          </p>
          <button class="btn-primary" onclick="document.querySelector('[data-suite=all]').click()">
            <span>View All Artifacts</span>
          </button>
        </div>
      `;
      return;
    }

    filtered.forEach((proj, idx) => {
      const card = document.createElement("div");
      card.className = "suite-card ac-ornament-card magnetic-target";
      card.setAttribute("data-cursor", "view");
      card.setAttribute("data-reveal", "");
      card.style.animationDelay = `${idx * 0.08}s`;

      const toolsBadges = (proj.tools || []).slice(0, 3).map(t => `<span class="suite-tool-pill">${t}</span>`).join("");

      card.innerHTML = `
        <div class="suite-card-media-wrap">
          <img src="${proj.cover}" alt="${proj.title}" loading="lazy" />
          <div class="suite-card-overlay">
            <div class="suite-card-top-row">
              <span class="suite-badge-tag">◈ ${proj.categoryName || "Visual Craft"}</span>
              <div class="suite-tools-row">${toolsBadges}</div>
            </div>
            <div class="suite-card-info">
              <h4>${proj.title}</h4>
              <p>${proj.tagline || proj.description}</p>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (window.soundSystem) window.soundSystem.click();
        if (window.projectModal) window.projectModal.open(proj.id);
      });

      this.suiteGallery.appendChild(card);
    });
  }

  // 4. Video Playback & Hover Preview in Commercial Ads & AI Video
  bindVideoHovers() {
    const cards = document.querySelectorAll(".ai-video-card");
    cards.forEach((card) => {
      const vid = card.querySelector("video");
      if (!vid) return;
      card.addEventListener("mouseenter", () => {
        vid.play().catch(() => {});
      });
      card.addEventListener("mouseleave", () => {
        vid.pause();
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.scrollJourney = new ScrollJourney();
});
