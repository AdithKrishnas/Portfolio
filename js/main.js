/* ==========================================================================
   MAIN APPLICATION LOGIC
   Preloader, navigation, sound toggle, scroll triggers, forms & clocks
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. PRELOADER SEQUENCE
  // ------------------------------------------------------------------------
  const preloader = document.querySelector(".preloader");
  const preloaderNumber = document.querySelector(".preloader-number");
  const preloaderBar = document.querySelector(".preloader-progress-bar");

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3;
    if (progress > 100) progress = 100;

    if (preloaderNumber) {
      preloaderNumber.textContent = `${progress < 10 ? "0" : ""}${progress}%`;
    }
    if (preloaderBar) {
      preloaderBar.style.width = `${progress}%`;
    }

    if (progress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add("preloader-done");
        }
        // Trigger initial reveal animations
        revealElements();
      }, 350);
    }
  }, 35);

  // ------------------------------------------------------------------------
  // 2. HEADER SCROLL & ACTIVE SECTION NAVIGATION
  // ------------------------------------------------------------------------
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;

    // Header glass background toggle
    if (scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Active navigation highlight
    let currentId = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  });

  // ------------------------------------------------------------------------
  // 3. SOUND TOGGLE BUTTON
  // ------------------------------------------------------------------------
  const soundBtn = document.querySelector(".sound-toggle-btn");
  if (soundBtn) {
    // Initial state reflection
    if (window.soundSystem && window.soundSystem.isEnabled()) {
      soundBtn.classList.add("sound-active");
    }

    soundBtn.addEventListener("click", () => {
      if (window.soundSystem) {
        const active = window.soundSystem.toggle();
        if (active) {
          soundBtn.classList.add("sound-active");
        } else {
          soundBtn.classList.remove("sound-active");
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. MOBILE DRAWER NAVIGATION
  // ------------------------------------------------------------------------
  const mobileBtn = document.querySelector(".mobile-menu-btn");
  const mobileOverlay = document.querySelector(".mobile-nav-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (mobileBtn && mobileOverlay) {
    mobileBtn.addEventListener("click", () => {
      if (window.soundSystem) window.soundSystem.click();
      mobileBtn.classList.toggle("active");
      mobileOverlay.classList.toggle("open");
      document.body.style.overflow = mobileOverlay.classList.contains("open") ? "hidden" : "";
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileBtn.classList.remove("active");
        mobileOverlay.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. LIVE TIME CLOCK (STUDIO AVAILABILITY)
  // ------------------------------------------------------------------------
  const clockEl = document.querySelector(".live-clock-val");
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMins = now.getUTCMinutes();
    const utcSecs = now.getUTCSeconds();
    const formatted = `${utcHours < 10 ? "0" : ""}${utcHours}:${utcMins < 10 ? "0" : ""}${utcMins}:${utcSecs < 10 ? "0" : ""}${utcSecs} UTC`;
    clockEl.textContent = formatted;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ------------------------------------------------------------------------
  // 6. COPY EMAIL & PHONE CLIPBOARD ACTION
  // ------------------------------------------------------------------------
  const copyCard = document.querySelector(".contact-email-card");
  const copyBadge = document.querySelector(".copy-badge");

  if (copyCard && copyBadge) {
    copyCard.addEventListener("click", () => {
      const email = copyCard.getAttribute("data-email") || "adithang46@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        if (window.soundSystem) window.soundSystem.click();
        copyBadge.textContent = "COPIED TO CLIPBOARD!";
        copyBadge.style.background = "var(--accent-lime)";
        copyBadge.style.color = "#070709";

        setTimeout(() => {
          copyBadge.textContent = "CLICK TO COPY";
          copyBadge.style.background = "";
          copyBadge.style.color = "";
        }, 2500);
      });
    });
  }

  const phoneCard = document.querySelector(".contact-phone-card");
  const phoneBadge = document.querySelector(".phone-copy-badge");
  if (phoneCard && phoneBadge) {
    phoneCard.addEventListener("click", (e) => {
      // If clicking call directly, let link work; otherwise copy
      if (!e.target.closest("a")) {
        const phone = phoneCard.getAttribute("data-phone") || "9495714546";
        navigator.clipboard.writeText(phone).then(() => {
          if (window.soundSystem) window.soundSystem.click();
          phoneBadge.textContent = "COPIED!";
          setTimeout(() => {
            phoneBadge.textContent = "CLICK TO CALL / COPY";
          }, 2500);
        });
      }
    });
  }

  // ------------------------------------------------------------------------
  // 7. INTERACTIVE PROJECT INQUIRY FORM
  // ------------------------------------------------------------------------
  const chips = document.querySelectorAll(".type-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (window.soundSystem) window.soundSystem.click();
      chip.classList.toggle("selected");
    });
  });

  const inquiryForm = document.getElementById("inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (window.soundSystem) window.soundSystem.click();

      const btn = inquiryForm.querySelector(".form-submit-btn");
      const originalText = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = `<span>TRANSMITTING MESSAGE...</span>`;

      setTimeout(() => {
        btn.innerHTML = `<span style="color:#000;">MESSAGE DISPATCHED ✓</span>`;
        btn.style.background = "var(--accent-cyan)";

        // Show brief success alert
        alert("Thank you! Your project inquiry has been recorded. I'll get back to you within 24 hours.");

        inquiryForm.reset();
        chips.forEach((c) => c.classList.remove("selected"));

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.background = "";
        }, 3000);
      }, 1000);
    });
  }

  // ------------------------------------------------------------------------
  // 8. BACK TO TOP BUTTON
  // ------------------------------------------------------------------------
  const backToTop = document.querySelector(".back-to-top-btn");
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.soundSystem) window.soundSystem.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ------------------------------------------------------------------------
  // 9. VIEWPORT SCROLL REVEAL OBSERVER
  // ------------------------------------------------------------------------
  function revealElements() {
    const reveals = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach((el) => observer.observe(el));
  }
});
