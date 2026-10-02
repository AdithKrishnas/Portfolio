/* ==========================================================================
   ADMIN PANEL CONTROLLER
   Author: AdithKrishna S. (adithang46@gmail.com | 9495714546)
   Full CRUD suite, LocalStorage sync & 1-click GitHub Pages code generator
   ========================================================================== */

class AdminPanel {
  constructor() {
    this.modal = document.getElementById("admin-modal");
    this.openBtns = document.querySelectorAll(".open-admin-btn");
    this.closeBtn = document.querySelector(".admin-close-btn");
    this.lockScreen = document.querySelector(".admin-lock-screen");
    this.mainContent = document.querySelector(".admin-main-content");
    this.pinInput = document.getElementById("admin-pin-input");
    this.pinSubmit = document.getElementById("admin-pin-submit");
    this.pinError = document.querySelector(".admin-pin-error");

    this.defaultPin = "1234";
    this.isAuthenticated = false;

    // Tabs
    this.tabBtns = document.querySelectorAll(".admin-tab-btn");
    this.tabPanes = document.querySelectorAll(".admin-tab-pane");

    // Project List Container
    this.projectListEl = document.querySelector(".admin-project-list");

    // Form
    this.form = document.getElementById("admin-project-form");
    this.editingId = null;

    // Export & Import
    this.exportCodeEl = document.getElementById("admin-export-code");
    this.copyCodeBtn = document.getElementById("admin-copy-code-btn");
    this.downloadCodeBtn = document.getElementById("admin-download-code-btn");
    this.resetBtn = document.getElementById("admin-reset-btn");
    this.importFileInput = document.getElementById("admin-import-file");

    this.init();
  }

  isSubdomainAdmin() {
    const host = window.location.hostname.toLowerCase();
    // 1. Check if accessed via subdomain (e.g. admin.yourdomain.com, admin.localhost, admin-*)
    if (host.startsWith("admin.") || host.includes("admin-")) return true;
    // 2. Check if on dedicated standalone admin page (admin.html or /admin)
    if (window.location.pathname.endsWith("admin.html") || window.location.pathname.includes("/admin")) return true;
    // 3. Developer emergency access query (?admin=true or ?access=codex)
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("access") === "codex") return true;
    return false;
  }

  init() {
    // Hide admin panel completely if not on an authorized subdomain
    if (!this.isSubdomainAdmin()) {
      if (this.modal) {
        this.modal.remove(); // Remove modal from DOM on public domain
      }
      return;
    }

    // Open modal triggers
    this.openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Keyboard shortcut Shift + A to open Admin (Only active on admin subdomain)
    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && (e.key === "A" || e.key === "a")) {
        // Only if not actively typing in an input
        if (!["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
          e.preventDefault();
          this.toggle();
        }
      }
      if (e.key === "Escape" && this.modal && this.modal.classList.contains("active")) {
        this.close();
      }
    });

    // Hash trigger #admin (Only active on admin subdomain)
    if (window.location.hash === "#admin") {
      setTimeout(() => this.open(), 300);
    }

    // Pin Authentication
    if (this.pinSubmit && this.pinInput) {
      this.pinSubmit.addEventListener("click", () => this.checkPin());
      this.pinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.checkPin();
      });
    }

    // Tabs Navigation
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    // Project Form Submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveProjectFromForm();
      });
    }

    // Auto slug generator from title
    const titleInput = document.getElementById("proj-title");
    const idInput = document.getElementById("proj-id");
    if (titleInput && idInput) {
      titleInput.addEventListener("input", () => {
        if (!this.editingId) {
          const slug = titleInput.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
          idInput.value = slug;
        }
      });
    }

    // Export Actions
    if (this.copyCodeBtn && this.exportCodeEl) {
      this.copyCodeBtn.addEventListener("click", () => {
        this.exportCodeEl.select();
        navigator.clipboard.writeText(this.exportCodeEl.value).then(() => {
          this.copyCodeBtn.textContent = "COPIED TO CLIPBOARD ✓";
          setTimeout(() => {
            this.copyCodeBtn.textContent = "COPY DATASET CODE";
          }, 2500);
        });
      });
    }

    if (this.downloadCodeBtn) {
      this.downloadCodeBtn.addEventListener("click", () => {
        this.downloadExportFile();
      });
    }

    // Reset Defaults
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        if (confirm("Reset portfolio projects to original default dataset? Any unexported local changes will be lost.")) {
          resetProjectsToDefaults();
          this.renderProjectList();
          this.updateExportCode();
          alert("Portfolio restored to default projects!");
        }
      });
    }

    // Import JSON file
    if (this.importFileInput) {
      this.importFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data)) {
              saveProjectsToStorage(data);
              this.renderProjectList();
              this.updateExportCode();
              alert(`Successfully imported ${data.length} projects!`);
            } else {
              alert("Invalid JSON format. Expected an array of projects.");
            }
          } catch (err) {
            alert("Error parsing JSON file: " + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Initialize Music & Ambience Manager
    this.initMusicTab();
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    if (this.isAuthenticated) {
      this.showDashboard();
    } else {
      this.showLockScreen();
    }
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove("active");
    document.body.style.overflow = "";
    if (window.location.hash === "#admin") {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }

  toggle() {
    if (this.modal && this.modal.classList.contains("active")) {
      this.close();
    } else {
      this.open();
    }
  }

  showLockScreen() {
    if (this.lockScreen) this.lockScreen.style.display = "flex";
    if (this.mainContent) this.mainContent.style.display = "none";
    if (this.pinInput) {
      this.pinInput.value = "";
      setTimeout(() => this.pinInput.focus(), 100);
    }
  }

  checkPin() {
    const pin = this.pinInput ? this.pinInput.value.trim() : "";
    // Accept defaultPin or "adith"
    if (pin === this.defaultPin || pin.toLowerCase() === "adith" || pin.toLowerCase() === "adithkrishna") {
      this.isAuthenticated = true;
      if (this.pinError) this.pinError.style.display = "none";
      this.showDashboard();
    } else {
      if (this.pinError) {
        this.pinError.textContent = "Incorrect Passcode. Default is: 1234";
        this.pinError.style.display = "block";
      }
    }
  }

  showDashboard() {
    if (this.lockScreen) this.lockScreen.style.display = "none";
    if (this.mainContent) this.mainContent.style.display = "block";
    this.renderProjectList();
    this.updateExportCode();
    this.syncMusicTabUI();
  }

  switchTab(tabId) {
    this.tabBtns.forEach((b) => b.classList.remove("active"));
    this.tabPanes.forEach((p) => p.classList.remove("active"));

    const activeBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`);
    const activePane = document.getElementById(`tab-${tabId}`);

    if (activeBtn) activeBtn.classList.add("active");
    if (activePane) activePane.classList.add("active");

    if (tabId === "list") {
      this.renderProjectList();
    } else if (tabId === "export") {
      this.updateExportCode();
    } else if (tabId === "add" && !this.editingId) {
      this.resetForm();
    } else if (tabId === "music") {
      this.syncMusicTabUI();
    }
  }

  // ------------------------------------------------------------------------
  // MUSIC & AMBIENCE TAB CONTROLLER
  // ------------------------------------------------------------------------
  initMusicTab() {
    const musicFileInput = document.getElementById("admin-music-file");
    const musicFileStatus = document.getElementById("music-file-status");
    const musicUrlInput = document.getElementById("admin-music-url");
    const musicTitleInput = document.getElementById("admin-music-title");
    const musicVolInput = document.getElementById("admin-music-vol");
    const musicVolVal = document.getElementById("admin-music-vol-val");
    const saveMusicBtn = document.getElementById("admin-save-music-btn");
    const resetMusicBtn = document.getElementById("admin-reset-music-btn");
    const testPlayBtn = document.getElementById("admin-test-play-btn");
    const presetBtns = document.querySelectorAll(".music-preset-btn");

    if (musicVolInput && musicVolVal) {
      musicVolInput.addEventListener("input", () => {
        const pct = Math.round(musicVolInput.value * 100);
        musicVolVal.textContent = pct + "%";
        if (window.soundSystem) {
          window.soundSystem.customMusicVolume = parseFloat(musicVolInput.value);
          const audioEl = document.getElementById("kungfu-live-audio");
          if (audioEl) audioEl.volume = window.soundSystem.customMusicVolume;
        }
      });
    }

    // Preset buttons click
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        const title = btn.getAttribute("data-title");
        if (musicUrlInput) musicUrlInput.value = url;
        if (musicTitleInput) musicTitleInput.value = title;
        this.showMusicToast(`Selected preset: ${title}`, "info");
      });
    });

    // File Upload handling
    if (musicFileInput) {
      musicFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (musicFileStatus) {
          musicFileStatus.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
          musicFileStatus.style.display = "block";
        }

        // Auto-generate title if default
        if (musicTitleInput && (!musicTitleInput.value || musicTitleInput.value === "◈ KUNG FU AMBIENCE")) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").toUpperCase();
          musicTitleInput.value = `◈ ${cleanName}`;
        }

        // Create Blob Object URL for immediate preview
        const objectUrl = URL.createObjectURL(file);
        if (musicUrlInput) {
          musicUrlInput.value = objectUrl;
        }

        // Also read as Base64 for local persistence if under 8MB
        if (file.size < 8 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              localStorage.setItem("portfolio_custom_music_base64", event.target.result);
              this.showMusicToast(`Audio file "${file.name}" cached! Click "Save & Apply" to activate.`, "success");
            } catch (err) {
              console.warn("Audio file too large for localStorage cache, will use Object URL for current session.", err);
            }
          };
          reader.readAsDataURL(file);
        } else {
          this.showMusicToast(`Large file loaded! Remember to copy it to assets/audio/ for GitHub Pages.`, "info");
        }
      });
    }

    // Save and Apply Live Soundtrack
    if (saveMusicBtn) {
      saveMusicBtn.addEventListener("click", () => {
        let url = musicUrlInput ? musicUrlInput.value.trim() : "";
        const title = musicTitleInput ? musicTitleInput.value.trim() : "◈ KUNG FU AMBIENCE";
        const vol = musicVolInput ? parseFloat(musicVolInput.value) : 0.20;

        const cachedBase64 = localStorage.getItem("portfolio_custom_music_base64");
        if (cachedBase64 && url.startsWith("blob:")) {
          url = cachedBase64;
        }

        if (!url) {
          this.showMusicToast("Please provide an audio file or URL", "error");
          return;
        }

        if (window.soundSystem) {
          window.soundSystem.setCustomTrack(url, title, vol);
        }

        this.syncMusicTabUI();
        this.showMusicToast("Soundtrack successfully saved & applied to live portfolio! ✓", "success");
      });
    }

    // Restore Default Track
    if (resetMusicBtn) {
      resetMusicBtn.addEventListener("click", () => {
        if (confirm("Restore the default Kung Fu theme soundtrack?")) {
          localStorage.removeItem("portfolio_custom_music_base64");
          if (window.soundSystem) {
            window.soundSystem.resetToDefaultTrack();
          }
          if (musicFileInput) musicFileInput.value = "";
          if (musicFileStatus) musicFileStatus.style.display = "none";
          this.syncMusicTabUI();
          this.showMusicToast("Default soundtrack restored! ✓", "success");
        }
      });
    }

    // Test / Preview Audio Button
    if (testPlayBtn) {
      testPlayBtn.addEventListener("click", () => {
        if (window.soundSystem) {
          window.soundSystem.toggle();
          this.updateTestPlayButtonState();
        }
      });
    }
  }

  syncMusicTabUI() {
    if (!window.soundSystem) return;
    const info = window.soundSystem.getTrackInfo();

    const musicUrlInput = document.getElementById("admin-music-url");
    const musicTitleInput = document.getElementById("admin-music-title");
    const musicVolInput = document.getElementById("admin-music-vol");
    const musicVolVal = document.getElementById("admin-music-vol-val");
    const monitorTitle = document.getElementById("music-monitor-title");
    const monitorSrc = document.getElementById("music-monitor-src");
    const monitorBadge = document.getElementById("music-monitor-badge");

    if (musicUrlInput && !musicUrlInput.value.startsWith("blob:")) {
      musicUrlInput.value = info.url.startsWith("data:") ? "[Local Uploaded File Cache]" : info.url;
    }
    if (musicTitleInput) musicTitleInput.value = info.title;
    if (musicVolInput) {
      musicVolInput.value = info.volume;
      if (musicVolVal) musicVolVal.textContent = Math.round(info.volume * 100) + "%";
    }

    if (monitorTitle) monitorTitle.textContent = info.title;
    if (monitorSrc) {
      monitorSrc.textContent = info.url.startsWith("data:") ? "[Cached Base64 Audio File]" : info.url;
    }
    if (monitorBadge) {
      if (info.isPlaying) {
        monitorBadge.textContent = "PLAYING NOW";
        monitorBadge.style.background = "rgba(0, 240, 255, 0.2)";
        monitorBadge.style.color = "var(--accent-cyan)";
      } else {
        monitorBadge.textContent = "MUTED / READY";
        monitorBadge.style.background = "rgba(212, 175, 55, 0.15)";
        monitorBadge.style.color = "var(--accent-gold-bright)";
      }
    }

    this.updateTestPlayButtonState();
  }

  updateTestPlayButtonState() {
    const testPlayBtn = document.getElementById("admin-test-play-btn");
    const testPlayIcon = document.getElementById("test-play-icon");
    const testPlayLabel = document.getElementById("test-play-label");
    const monitorBadge = document.getElementById("music-monitor-badge");

    if (!window.soundSystem || !testPlayBtn) return;
    const info = window.soundSystem.getTrackInfo();

    if (info.isPlaying) {
      if (testPlayIcon) testPlayIcon.textContent = "⏸";
      if (testPlayLabel) testPlayLabel.textContent = "Pause Music Preview";
      testPlayBtn.style.background = "linear-gradient(135deg, #c81d25 0%, #ff4365 100%)";
      if (monitorBadge) {
        monitorBadge.textContent = "PLAYING NOW";
        monitorBadge.style.background = "rgba(0, 240, 255, 0.2)";
        monitorBadge.style.color = "var(--accent-cyan)";
      }
    } else {
      if (testPlayIcon) testPlayIcon.textContent = "▶";
      if (testPlayLabel) testPlayLabel.textContent = "Preview / Test Music";
      testPlayBtn.style.background = "";
      if (monitorBadge) {
        monitorBadge.textContent = "MUTED / READY";
        monitorBadge.style.background = "rgba(212, 175, 55, 0.15)";
        monitorBadge.style.color = "var(--accent-gold-bright)";
      }
    }
  }

  showMusicToast(msg, type = "success") {
    const toast = document.getElementById("music-toast-message");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    if (type === "error") {
      toast.style.background = "rgba(200, 29, 37, 0.2)";
      toast.style.color = "#ff4365";
      toast.style.border = "1px solid rgba(200, 29, 37, 0.4)";
    } else if (type === "info") {
      toast.style.background = "rgba(0, 240, 255, 0.15)";
      toast.style.color = "var(--accent-cyan)";
      toast.style.border = "1px solid rgba(0, 240, 255, 0.3)";
    } else {
      toast.style.background = "rgba(212, 175, 55, 0.15)";
      toast.style.color = "var(--accent-gold-bright)";
      toast.style.border = "1px solid rgba(212, 175, 55, 0.4)";
    }
    setTimeout(() => {
      toast.style.display = "none";
    }, 4500);
  }

  renderProjectList() {
    if (!this.projectListEl) return;
    this.projectListEl.innerHTML = "";

    PROJECTS_DATA.forEach((proj, idx) => {
      const row = document.createElement("div");
      row.className = "admin-project-row";
      row.innerHTML = `
        <div class="admin-row-thumb">
          <img src="${proj.cover}" alt="${proj.title}" onerror="this.src='assets/images/reels/hero-showreel.svg'" />
        </div>
        <div class="admin-row-info">
          <div class="admin-row-title">
            <strong>${proj.title}</strong>
            ${proj.budget ? `<span class="admin-badge-budget">${proj.budget} Spend</span>` : ""}
            ${proj.featuredInShowcase ? `<span class="admin-badge-showcase">Showcase</span>` : ""}
          </div>
          <div class="admin-row-meta">
            <span>Category: <strong>${proj.categoryName}</strong></span>
            <span>Client: ${proj.client}</span>
            <span>Year: ${proj.year}</span>
          </div>
        </div>
        <div class="admin-row-actions">
          <button class="admin-btn-action admin-btn-edit" data-id="${proj.id}" title="Edit Project">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="admin-btn-action admin-btn-del" data-id="${proj.id}" title="Delete Project">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      `;

      // Bind edit
      row.querySelector(".admin-btn-edit").addEventListener("click", () => {
        this.loadProjectIntoForm(proj.id);
      });

      // Bind delete
      row.querySelector(".admin-btn-del").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete "${proj.title}"?`)) {
          deleteProject(proj.id);
          this.renderProjectList();
          this.updateExportCode();
        }
      });

      this.projectListEl.appendChild(row);
    });
  }

  loadProjectIntoForm(projectId) {
    const proj = getProjectById(projectId);
    if (!proj) return;

    this.editingId = projectId;
    this.switchTab("add");

    document.getElementById("form-header-title").textContent = `Edit Project: ${proj.title}`;
    document.getElementById("form-submit-btn-text").textContent = "Update Project Changes";

    document.getElementById("proj-id").value = proj.id;
    document.getElementById("proj-id").disabled = true;
    document.getElementById("proj-title").value = proj.title;
    document.getElementById("proj-category").value = proj.category;
    document.getElementById("proj-category-name").value = proj.categoryName;
    document.getElementById("proj-client").value = proj.client || "";
    document.getElementById("proj-year").value = proj.year || "2026";
    document.getElementById("proj-role").value = proj.role || "";
    document.getElementById("proj-duration").value = proj.duration || "";
    document.getElementById("proj-budget").value = proj.budget || "";
    document.getElementById("proj-tagline").value = proj.tagline || "";
    document.getElementById("proj-desc").value = proj.description || "";
    document.getElementById("proj-challenge").value = proj.challenge || "";
    document.getElementById("proj-solution").value = proj.solution || "";
    document.getElementById("proj-outcome").value = proj.outcome || "";
    document.getElementById("proj-tools").value = (proj.tools || []).join(", ");
    document.getElementById("proj-tags").value = (proj.tags || []).join(", ");
    document.getElementById("proj-cover").value = proj.cover || "";
    document.getElementById("proj-gallery").value = (proj.gallery || []).join(", ");
    
    const videoInput = document.getElementById("proj-video-src");
    if (videoInput) videoInput.value = proj.videoSrc || "";
    
    const liveUrlInput = document.getElementById("proj-live-url");
    if (liveUrlInput) liveUrlInput.value = proj.liveUrl || "";

    document.getElementById("proj-grid-span").value = proj.gridSpan || "col-span-6";
    document.getElementById("proj-aspect").value = proj.aspect || "aspect-wide";
    document.getElementById("proj-showcase").checked = !!proj.featuredInShowcase;
  }

  resetForm() {
    this.editingId = null;
    if (this.form) this.form.reset();
    const videoInput = document.getElementById("proj-video-src");
    if (videoInput) videoInput.value = "";
    const liveUrlInput = document.getElementById("proj-live-url");
    if (liveUrlInput) liveUrlInput.value = "";

    document.getElementById("form-header-title").textContent = "Add New Creative Project";
    document.getElementById("form-submit-btn-text").textContent = "Publish Project to Portfolio";
    document.getElementById("proj-id").disabled = false;
  }

  saveProjectFromForm() {
    const id = document.getElementById("proj-id").value.trim();
    const title = document.getElementById("proj-title").value.trim();
    const category = document.getElementById("proj-category").value;
    const categoryName = document.getElementById("proj-category-name").value.trim();
    const client = document.getElementById("proj-client").value.trim();
    const year = document.getElementById("proj-year").value.trim() || "2026";
    const role = document.getElementById("proj-role").value.trim();
    const duration = document.getElementById("proj-duration").value.trim();
    const budget = document.getElementById("proj-budget").value.trim();
    const tagline = document.getElementById("proj-tagline").value.trim();
    const description = document.getElementById("proj-desc").value.trim();
    const challenge = document.getElementById("proj-challenge").value.trim();
    const solution = document.getElementById("proj-solution").value.trim();
    const outcome = document.getElementById("proj-outcome").value.trim();
    
    const tools = document.getElementById("proj-tools").value.split(",").map(s => s.trim()).filter(Boolean);
    const tags = document.getElementById("proj-tags").value.split(",").map(s => s.trim()).filter(Boolean);
    
    let cover = document.getElementById("proj-cover").value.trim();
    if (!cover) {
      cover = "assets/images/graphic-design/meta-ad-15k.svg";
    }

    let gallery = document.getElementById("proj-gallery").value.split(",").map(s => s.trim()).filter(Boolean);
    if (gallery.length === 0) {
      gallery = [cover];
    }

    const videoSrcInput = document.getElementById("proj-video-src");
    const videoSrc = videoSrcInput ? videoSrcInput.value.trim() : "";

    const liveUrlInput = document.getElementById("proj-live-url");
    const liveUrl = liveUrlInput ? liveUrlInput.value.trim() : "";

    const gridSpan = document.getElementById("proj-grid-span").value;
    const aspect = document.getElementById("proj-aspect").value;
    const featuredInShowcase = document.getElementById("proj-showcase").checked;

    const projectData = {
      id,
      title,
      category,
      categoryName,
      client,
      year,
      role,
      duration: duration || undefined,
      budget: budget || undefined,
      tagline,
      description,
      challenge,
      solution,
      outcome,
      tools,
      tags,
      cover,
      gallery,
      videoSrc: videoSrc || undefined,
      liveUrl: liveUrl || undefined,
      gridSpan,
      aspect,
      featuredInShowcase
    };

    if (this.editingId) {
      updateProject(this.editingId, projectData);
      alert(`Project "${title}" updated successfully!`);
    } else {
      if (getProjectById(id)) {
        alert(`A project with ID "${id}" already exists. Please choose a unique ID.`);
        return;
      }
      addProject(projectData);
      alert(`Project "${title}" added to your portfolio!`);
    }

    this.resetForm();
    this.switchTab("list");
  }

  updateExportCode() {
    if (!this.exportCodeEl) return;
    const code = `// ==========================================================================\n// PROJECT DATASET - EXPORTED FROM ADITHKRISHNA S. ADMIN PANEL\n// Updated at: ${new Date().toISOString()}\n// ==========================================================================\n\nconst DEFAULT_PROJECTS_DATA = ${JSON.stringify(PROJECTS_DATA, null, 2)};\n`;
    this.exportCodeEl.value = code;
  }

  downloadExportFile() {
    this.updateExportCode();
    const content = this.exportCodeEl.value;
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects-data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.adminPanel = new AdminPanel();
});
