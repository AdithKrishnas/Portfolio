/* ==========================================================================
   WEB AUDIO API SOUND SYSTEM & VINTAGE KUNG FU CINEMA SOUNDSCAPE
   Light, authentic vintage Kung Fu soundtrack & haptic feedback synthesis
   ========================================================================== */

class SoundSystem {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = false;
    this.kungFuMusicPlaying = false;
    this.musicTimer = null;
    this.gongTimer = null;
    this.vinylNode = null;
    this.droneOsc = null;
    this.musicMasterGain = null;
    this.hapticMasterGain = null;

    this.initAudioContext();
  }

  initAudioContext() {
    // Check saved state - default to enabled on user preference
    const saved = localStorage.getItem("portfolio_kungfu_music_enabled");
    if (saved === "true" || saved === null) {
      this.soundEnabled = true;
    }
    this.customMusicUrl = localStorage.getItem("portfolio_custom_music_url") || "assets/audio/kungfu-vintage-theme.mp3";
    this.customMusicTitle = localStorage.getItem("portfolio_custom_music_title") || "◈ KUNG FU AMBIENCE";
    const savedVol = localStorage.getItem("portfolio_custom_music_volume");
    this.customMusicVolume = savedVol !== null ? parseFloat(savedVol) : 0.20;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        // Master gain for haptics
        this.hapticMasterGain = this.audioCtx.createGain();
        this.hapticMasterGain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
        this.hapticMasterGain.connect(this.audioCtx.destination);

        // Master gain for Kung Fu background music - calibrated to light volume
        this.musicMasterGain = this.audioCtx.createGain();
        this.musicMasterGain.gain.setValueAtTime(this.customMusicVolume, this.audioCtx.currentTime);
        this.musicMasterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.ensureContext();
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem("portfolio_kungfu_music_enabled", this.soundEnabled);

    if (this.soundEnabled) {
      this.startKungFuSoundscape();
      this.click();
    } else {
      this.stopKungFuSoundscape();
    }
    this.updateUI();
    return this.soundEnabled;
  }

  isEnabled() {
    return this.soundEnabled;
  }

  // ------------------------------------------------------------------------
  // VINTAGE KUNG FU LIVE SOUNDSCAPE GENERATOR & CUSTOM TRACK ENGINE
  // ------------------------------------------------------------------------
  startKungFuSoundscape() {
    if (!this.soundEnabled || this.kungFuMusicPlaying) return;
    this.ensureContext();

    this.kungFuMusicPlaying = true;

    // Check if user selected procedural synth mode only
    if (this.customMusicUrl === "procedural") {
      const audioEl = document.getElementById("kungfu-live-audio");
      if (audioEl) audioEl.pause();
      this.startProceduralSynth();
      return;
    }

    // Check if an external audio track exists
    const audioEl = document.getElementById("kungfu-live-audio");
    if (audioEl) {
      // Synchronize custom music source if set
      if (this.customMusicUrl && audioEl.getAttribute("src") !== this.customMusicUrl) {
        audioEl.src = this.customMusicUrl;
      }

      if (!this.audioEventsBound) {
        this.audioEventsBound = true;
        audioEl.addEventListener("play", () => {
          this.kungFuMusicPlaying = true;
          this.updateUI();
        });
        audioEl.addEventListener("pause", () => {
          if (!this.soundEnabled) {
            this.kungFuMusicPlaying = false;
            this.updateUI();
          }
        });
        audioEl.addEventListener("error", () => {
          console.warn("Audio file error, falling back to procedural synthesizer");
          this.startProceduralSynth();
        });
      }

      // Configured volume calibration
      audioEl.volume = this.customMusicVolume !== undefined ? this.customMusicVolume : 0.20;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.kungFuMusicPlaying = true;
          this.updateUI();
        }).catch((err) => {
          console.log("Audio waiting for user gesture:", err.message);
        });
      }
      this.updateUI();
      return;
    }

    this.startProceduralSynth();
  }

  startProceduralSynth() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;

      // 1. Vintage Vinyl Crackle & Analog Warmth
      this.startVintageVinylNoise();

      // 2. Warm Sacred Drone (D2 / A2 fundamental)
      this.startWarmDrone();

      // 3. Initiate the Kung Fu Pentatonic Flute & Guqin Melody Sequencer
      this.scheduleNextMelodyPhrase();

      // 4. Distant Bronze Temple Gong every 22 seconds
      this.triggerBronzeTempleGong();
      this.gongTimer = setInterval(() => {
        if (this.kungFuMusicPlaying) {
          this.triggerBronzeTempleGong();
        }
      }, 22000);

      this.updateUI();
    } catch (e) {
      console.warn("Audio autoplay blocked until user gesture", e);
    }
  }

  stopKungFuSoundscape() {
    this.kungFuMusicPlaying = false;

    // Stop audio element if playing
    const audioEl = document.getElementById("kungfu-live-audio");
    if (audioEl) {
      audioEl.pause();
    }

    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.gongTimer) {
      clearInterval(this.gongTimer);
      this.gongTimer = null;
    }

    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (e) {}
      this.droneOsc = null;
    }

    if (this.vinylNode) {
      try {
        this.vinylNode.stop();
        this.vinylNode.disconnect();
      } catch (e) {}
      this.vinylNode = null;
    }

    this.updateUI();
  }

  // 1. Vintage Vinyl Record Texture (1970s Kung Fu Shaw Brothers Film Atmosphere)
  startVintageVinylNoise() {
    if (!this.audioCtx || this.vinylNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Gentle pink noise + random subtle dust pops
      const white = Math.random() * 2 - 1;
      const crackle = Math.random() > 0.9996 ? (Math.random() * 0.8 - 0.4) : 0;
      data[i] = white * 0.015 + crackle * 0.08;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime); // Very soft vinyl bed

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    noise.start();
    this.vinylNode = noise;
  }

  // 2. Warm Sacred Drone
  startWarmDrone() {
    if (!this.audioCtx || this.droneOsc) return;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(73.42, this.audioCtx.currentTime); // D2 fundamental

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.045, this.audioCtx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start();
    this.droneOsc = osc;
  }

  // 3. Bamboo Flute & Guqin Pentatonic Melody Sequencer
  // Classical Chinese Martial Arts Pentatonic Scale: D - F - G - A - C
  scheduleNextMelodyPhrase() {
    if (!this.kungFuMusicPlaying || !this.audioCtx) return;

    const scale = [
      293.66, // D4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      783.99  // G5
    ];

    // Classic meditative Kung Fu cinematic motifs
    const motifs = [
      [0, 2, 3, 5, 4, 3, 2, 0],
      [3, 5, 7, 5, 3, 2, 0],
      [2, 3, 5, 3, 2, 0, 1, 0],
      [5, 4, 3, 5, 7, 5, 3],
      [0, 3, 2, 3, 5, 3, 0]
    ];

    const motif = motifs[Math.floor(Math.random() * motifs.length)];
    let delay = 0;

    motif.forEach((noteIdx, i) => {
      const freq = scale[noteIdx];
      const duration = (i === motif.length - 1) ? 2.8 : (Math.random() > 0.4 ? 1.4 : 0.8);
      const isFlute = Math.random() > 0.4;

      setTimeout(() => {
        if (this.kungFuMusicPlaying) {
          if (isFlute) {
            this.playBambooFlute(freq, duration);
          } else {
            this.playGuqinPluck(freq, duration);
          }
        }
      }, delay * 1000);

      delay += duration * 0.85;
    });

    // Schedule the next phrase with breath space
    const nextPhraseDelay = (delay + 3.5 + Math.random() * 4.5) * 1000;
    this.musicTimer = setTimeout(() => {
      this.scheduleNextMelodyPhrase();
    }, nextPhraseDelay);
  }

  // Authentic Bamboo Flute (Shakuhachi / Dizi) Timbre
  playBambooFlute(freq, duration = 1.6) {
    if (!this.kungFuMusicPlaying || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const oscHarmonic = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      // Gentle pitch vibrato LFO (5Hz)
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(5.2, t);
      lfoGain.gain.setValueAtTime(freq * 0.015, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t + 0.2); // Vibrato sets in after note attack
      lfo.stop(t + duration);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      // Flute harmonic overtone
      oscHarmonic.type = "triangle";
      oscHarmonic.frequency.setValueAtTime(freq * 2, t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3, t);

      // Soft breathy attack and long release
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.055, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicMasterGain);

      osc.start(t);
      oscHarmonic.start(t);
      osc.stop(t + duration);
      oscHarmonic.stop(t + duration);
    } catch (e) {}
  }

  // Plucked String (Guqin / Guzheng) Timbre
  playGuqinPluck(freq, duration = 2.0) {
    if (!this.kungFuMusicPlaying || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 4, t);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.8);

      // Pluck attack: instant rise, natural resonance decay
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicMasterGain);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  // Distant Bronze Temple Gong
  triggerBronzeTempleGong() {
    if (!this.kungFuMusicPlaying || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const gongFreqs = [184, 276, 414, 552];

      gongFreqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t);

        const gongVol = 0.035 / (idx + 1);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(gongVol, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 9.0);

        osc.connect(gain);
        gain.connect(this.musicMasterGain);

        osc.start(t);
        osc.stop(t + 9.5);
      });
    } catch (e) {}
  }

  // ------------------------------------------------------------------------
  // HAPTIC UI INTERACTION AUDIO
  // ------------------------------------------------------------------------
  playTone(freq, type = "sine", duration = 0.05, gainValue = 0.04) {
    if (!this.soundEnabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.hapticMasterGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);

      // Subtle metallic Animus harmonic overtone
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 1.5, this.audioCtx.currentTime);
      gain2.gain.setValueAtTime(gainValue * 0.35, this.audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration * 1.2);
      osc2.connect(gain2);
      gain2.connect(this.hapticMasterGain);
      osc2.start();
      osc2.stop(this.audioCtx.currentTime + duration * 1.2);
    } catch (e) {}
  }

  click() {
    this.playTone(720, "triangle", 0.06, 0.04);
  }

  hover() {
    this.playTone(380, "sine", 0.03, 0.015);
  }

  openModal() {
    this.playTone(280, "sine", 0.14, 0.04);
    setTimeout(() => this.playTone(560, "triangle", 0.18, 0.035), 70);
  }

  closeModal() {
    this.playTone(520, "sine", 0.09, 0.03);
    setTimeout(() => this.playTone(260, "sine", 0.12, 0.03), 60);
  }

  filterSwitch() {
    this.playTone(640, "triangle", 0.06, 0.03);
  }

  setCustomTrack(url, title, volume) {
    if (url !== undefined) {
      this.customMusicUrl = url;
      localStorage.setItem("portfolio_custom_music_url", url);
    }
    if (title !== undefined) {
      this.customMusicTitle = title;
      localStorage.setItem("portfolio_custom_music_title", title);
    }
    if (volume !== undefined) {
      this.customMusicVolume = parseFloat(volume);
      localStorage.setItem("portfolio_custom_music_volume", this.customMusicVolume);
    }

    const audioEl = document.getElementById("kungfu-live-audio");
    if (this.customMusicUrl === "procedural") {
      if (audioEl) audioEl.pause();
      if (this.soundEnabled) {
        this.startProceduralSynth();
      }
    } else if (audioEl) {
      this.stopProceduralSynth();
      audioEl.src = this.customMusicUrl;
      audioEl.volume = this.customMusicVolume;
      if (this.soundEnabled) {
        audioEl.play().catch(() => {});
        this.kungFuMusicPlaying = true;
      }
    }
    this.updateUI();
  }

  stopProceduralSynth() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.gongTimer) {
      clearInterval(this.gongTimer);
      this.gongTimer = null;
    }
    if (this.droneOsc) {
      try { this.droneOsc.stop(); this.droneOsc.disconnect(); } catch (e) {}
      this.droneOsc = null;
    }
    if (this.vinylNode) {
      try { this.vinylNode.stop(); this.vinylNode.disconnect(); } catch (e) {}
      this.vinylNode = null;
    }
  }

  getTrackInfo() {
    return {
      url: this.customMusicUrl || "assets/audio/kungfu-vintage-theme.mp3",
      title: this.customMusicTitle || "◈ KUNG FU AMBIENCE",
      volume: this.customMusicVolume !== undefined ? this.customMusicVolume : 0.20,
      isPlaying: this.kungFuMusicPlaying,
      isEnabled: this.soundEnabled
    };
  }

  resetToDefaultTrack() {
    localStorage.removeItem("portfolio_custom_music_url");
    localStorage.removeItem("portfolio_custom_music_title");
    localStorage.removeItem("portfolio_custom_music_volume");
    this.customMusicUrl = "assets/audio/kungfu-vintage-theme.mp3";
    this.customMusicTitle = "◈ KUNG FU AMBIENCE";
    this.customMusicVolume = 0.20;
    const audioEl = document.getElementById("kungfu-live-audio");
    if (audioEl) {
      audioEl.src = this.customMusicUrl;
      audioEl.volume = this.customMusicVolume;
      if (this.soundEnabled) {
        audioEl.play().catch(() => {});
      }
    }
    this.updateUI();
  }

  updateUI() {
    // 1. Header & standard sound toggle buttons
    const btns = document.querySelectorAll(".sound-toggle-btn, #kungfu-audio-toggle");
    btns.forEach(btn => {
      const titleSpan = btn.querySelector(".kungfu-audio-title-text");
      if (titleSpan && this.customMusicTitle) {
        titleSpan.textContent = this.customMusicTitle;
      }
      const actionLabel = btn.querySelector(".kungfu-audio-action-label");
      const statusEl = btn.querySelector(".kungfu-audio-status");

      if (this.soundEnabled) {
        btn.classList.add("active");
        btn.setAttribute("title", "Turn Off Background Music");
        btn.setAttribute("aria-label", "Turn Off Background Music");
        if (actionLabel) actionLabel.textContent = "TURN OFF MUSIC";
        if (statusEl) {
          statusEl.textContent = "ON";
          statusEl.style.color = "var(--accent-gold-bright)";
        }
      } else {
        btn.classList.remove("active");
        btn.setAttribute("title", "Play Background Music");
        btn.setAttribute("aria-label", "Play Background Music");
        if (actionLabel) actionLabel.textContent = "PLAY MUSIC";
        if (statusEl) {
          statusEl.textContent = "MUTED";
          statusEl.style.color = "#94a3b8";
        }
      }
    });

    // 2. Dedicated Floating Turn Off / Play Music Button
    const floatingPills = document.querySelectorAll("#floating-music-toggle, .floating-music-pill");
    floatingPills.forEach(pill => {
      const textEl = pill.querySelector(".music-pill-text");
      const iconEl = pill.querySelector(".music-pill-icon");
      if (this.soundEnabled) {
        pill.classList.add("active");
        pill.classList.remove("muted");
        pill.setAttribute("title", "Turn Off Background Music");
        pill.setAttribute("aria-label", "Turn Off Background Music");
        if (textEl) textEl.textContent = "TURN OFF MUSIC";
        if (iconEl) iconEl.textContent = "🔊";
      } else {
        pill.classList.remove("active");
        pill.classList.add("muted");
        pill.setAttribute("title", "Play Background Music");
        pill.setAttribute("aria-label", "Play Background Music");
        if (textEl) textEl.textContent = "PLAY MUSIC";
        if (iconEl) iconEl.textContent = "🔇";
      }
    });
  }
}

// Global singleton instance
window.soundSystem = new SoundSystem();

// Auto-start Kung Fu live soundscape on first user interaction with the page
document.addEventListener("DOMContentLoaded", () => {
  const startAudioOnFirstGesture = () => {
    if (window.soundSystem && window.soundSystem.isEnabled()) {
      window.soundSystem.ensureContext();
      window.soundSystem.startKungFuSoundscape();
    }
    window.removeEventListener("click", startAudioOnFirstGesture);
    window.removeEventListener("scroll", startAudioOnFirstGesture);
    window.removeEventListener("keydown", startAudioOnFirstGesture);
  };

  window.addEventListener("click", startAudioOnFirstGesture, { once: true });
  window.addEventListener("scroll", startAudioOnFirstGesture, { once: true });
  window.addEventListener("keydown", startAudioOnFirstGesture, { once: true });

  // Bind all sound toggle buttons including persistent floating pill
  const soundBtns = document.querySelectorAll(".sound-toggle-btn, #kungfu-audio-toggle, #floating-music-toggle, .floating-music-pill");
  soundBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.soundSystem.toggle();
    });
  });
});
