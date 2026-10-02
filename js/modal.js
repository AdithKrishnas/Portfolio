/* ==========================================================================
   PROJECT DETAIL MODAL & CASE STUDY VIEWER
   ========================================================================== */

class ProjectModal {
  constructor() {
    this.modal = document.querySelector(".project-modal");
    this.backdrop = document.querySelector(".modal-backdrop");
    this.closeBtn = document.querySelector(".modal-close-btn");
    this.heroMediaWrap = document.querySelector(".modal-hero-media-wrap");
    this.titleEl = document.querySelector(".modal-title");
    this.categoryEl = document.querySelector(".modal-category-badge");
    this.subtitleEl = document.querySelector(".modal-subtitle");
    this.metaGrid = document.querySelector(".modal-meta-grid");
    this.narrativeSection = document.querySelector(".modal-narrative-section");
    this.galleryRow = document.querySelector(".modal-gallery-row");
    this.prevBtn = document.querySelector(".modal-nav-prev");
    this.nextBtn = document.querySelector(".modal-nav-next");

    this.currentProjectId = null;

    if (!this.modal) return;

    this.init();
  }

  init() {
    // Backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener("click", () => this.close());
    }

    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Keyboard ESC & Arrows
    window.addEventListener("keydown", (e) => {
      if (!this.modal.classList.contains("active")) return;
      if (e.key === "Escape") {
        this.close();
      } else if (e.key === "ArrowLeft") {
        this.navigate(-1);
      } else if (e.key === "ArrowRight") {
        this.navigate(1);
      }
    });

    // Next / Prev button triggers
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.navigate(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.navigate(1));
    }

    // Check deep link hash on load
    window.addEventListener("load", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && getProjectById(hash)) {
        this.open(hash, false);
      }
    });
  }

  open(projectId, updateHash = true) {
    const proj = getProjectById(projectId);
    if (!proj) return;

    this.currentProjectId = projectId;

    if (window.soundSystem) window.soundSystem.openModal();

    // Populate data
    if (this.titleEl) this.titleEl.textContent = proj.title;
    if (this.subtitleEl) this.subtitleEl.textContent = proj.tagline || proj.description;
    
    if (this.categoryEl) {
      this.categoryEl.innerHTML = `
        <span style="color:var(--accent-gold-bright); font-family:var(--font-mono); font-size:0.8rem; letter-spacing:0.1em; display:inline-flex; align-items:center; gap:0.4rem;">
          <span style="color:var(--accent-gold);">◈</span> ${proj.categoryName.toUpperCase()} <span style="color:var(--accent-gold);">◈</span> ${proj.year}
        </span>
      `;
    }

    // Hero media
    if (this.heroMediaWrap) {
      if (proj.videoSrc) {
        this.heroMediaWrap.innerHTML = `
          <video controls autoplay playsinline class="modal-hero-media" style="width:100%; height:100%; object-fit:contain; background:#000;">
            <source src="${proj.videoSrc}" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        `;
      } else {
        const isReel = proj.category === "reels" || proj.category === "ai-videos";
        this.heroMediaWrap.innerHTML = `
          <img class="modal-hero-media" src="${proj.cover}" alt="${proj.title}" />
          ${isReel ? `
            <div style="position: absolute; bottom: 20px; right: 20px; background: rgba(6,7,10,0.85); backdrop-filter: blur(8px); border: 1px solid var(--accent-gold); padding: 8px 16px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-gold-bright); display: flex; align-items: center; gap: 8px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent-gold);"></span>
              4K UHD MASTER // DURATION: ${proj.duration || '00:30'}
            </div>
          ` : ''}
        `;
      }
    }

    // Meta grid
    if (this.metaGrid) {
      this.metaGrid.innerHTML = `
        <div class="meta-col">
          <span class="meta-col-title">Client / Studio</span>
          <span class="meta-col-val">${proj.client || 'Direct'}</span>
        </div>
        <div class="meta-col">
          <span class="meta-col-title">Year</span>
          <span class="meta-col-val">${proj.year}</span>
        </div>
        <div class="meta-col">
          <span class="meta-col-title">Discipline &amp; Role</span>
          <span class="meta-col-val">${proj.role}</span>
        </div>
        <div class="meta-col">
          <span class="meta-col-title">Tools &amp; Pipeline</span>
          <span class="meta-col-val">${proj.tools ? proj.tools.join(" • ") : 'Design Suite'}</span>
        </div>
        ${proj.liveUrl ? `
          <div class="meta-col" style="grid-column: 1 / -1; display:flex; flex-direction:row; justify-content:space-between; align-items:center; background:rgba(0,240,255,0.08); border:1px solid rgba(0,240,255,0.3); border-radius:var(--radius-sm); padding:12px 18px;">
            <div>
              <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-cyan); font-weight:bold; display:block;">LIVE WEB PLATFORM</span>
              <span style="font-family:var(--font-mono); font-size:0.95rem; color:#fff;">${proj.liveUrl}</span>
            </div>
            <a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:0.5rem 1.2rem; font-size:0.75rem;">
              <span>Open Live Platform ↗</span>
            </a>
          </div>
        ` : ''}
      `;
    }

    // Narrative section
    if (this.narrativeSection) {
      this.narrativeSection.innerHTML = `
        <div class="narrative-block">
          <h4>◈ 01 // Tactical Brief &amp; Challenge</h4>
          <p>${proj.challenge}</p>
        </div>
        <div class="narrative-block">
          <h4>◈ 02 // Execution &amp; Creative Solution</h4>
          <p>${proj.solution}</p>
        </div>
        <div class="narrative-block" style="grid-column: 1 / -1;">
          <h4>◈ 03 // Telemetry &amp; Strategic Outcome</h4>
          <p>${proj.outcome}</p>
        </div>
      `;
    }

    // Gallery thumbnails
    if (this.galleryRow) {
      this.galleryRow.innerHTML = "";
      if (proj.gallery && proj.gallery.length > 0) {
        proj.gallery.forEach((imgSrc, i) => {
          const thumb = document.createElement("div");
          thumb.className = "modal-gallery-thumb";
          thumb.innerHTML = `<img src="${imgSrc}" alt="${proj.title} detail ${i + 1}" loading="lazy" />`;
          this.galleryRow.appendChild(thumb);
        });
      }
    }

    // Show modal & prevent background scroll
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    if (updateHash) {
      history.pushState(null, "", `#${projectId}`);
    }
  }

  close() {
    if (window.soundSystem) window.soundSystem.closeModal();
    this.modal.classList.remove("active");
    document.body.style.overflow = "";

    // Stop video playback if active
    if (this.heroMediaWrap) {
      const vid = this.heroMediaWrap.querySelector("video");
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
    }

    // Clear hash without jump
    if (window.location.hash) {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }

  navigate(direction) {
    const currentIndex = PROJECTS_DATA.findIndex((p) => p.id === this.currentProjectId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = PROJECTS_DATA.length - 1;
    if (nextIndex >= PROJECTS_DATA.length) nextIndex = 0;

    const nextProject = PROJECTS_DATA[nextIndex];
    if (nextProject) {
      this.open(nextProject.id);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.projectModal = new ProjectModal();
});
