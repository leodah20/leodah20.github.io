// ---------------------------------------------------------------------------
// Chrome shared by every generated blog page (theme, starfield, uptime).
// Deliberately independent from js/main.js — blog pages don't load
// js/content.js, so main.js's content-rendering code would throw here.
// ---------------------------------------------------------------------------
(function () {
  "use strict";

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      const iconEl = toggleBtn.querySelector("[data-theme-icon]");
      if (iconEl) iconEl.textContent = theme === "light" ? "☾" : "☀";
    }
    localStorage.setItem("theme", theme);
  }

  const savedTheme = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(savedTheme || (prefersLight ? "light" : "dark"));

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  /* ---------- session uptime ticker ---------- */
  const uptimeEl = document.getElementById("sidebarUptime");
  if (uptimeEl) {
    const sessionStartedAt = Date.now();
    function formatUptime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    }
    function tickUptime() {
      uptimeEl.textContent = formatUptime(Date.now() - sessionStartedAt);
    }
    tickUptime();
    setInterval(tickUptime, 1000);
  }

  /* ---------- twinkling starfield ---------- */
  function generateStarShadows(count, size) {
    const w = window.innerWidth * 1.4;
    const h = window.innerHeight * 1.4;
    const offsetX = w * 0.2;
    const offsetY = h * 0.2;
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.round(Math.random() * w - offsetX);
      const y = Math.round(Math.random() * h - offsetY);
      shadows.push(x + "px " + y + "px 0 " + size + "px var(--fg)");
    }
    return shadows.join(",");
  }

  function paintStars(id, count, size) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.background = "transparent";
    el.style.boxShadow = generateStarShadows(count, size);
  }

  paintStars("bgStarsLarge", 22, 1.6);
  paintStars("bgStarsMedium", 40, 1.05);
  paintStars("bgStarsSmall", 65, 0.6);

  /* ---------- reveal on load (blog pages have no scroll-reveal sections) ---------- */
  document.querySelectorAll(".window, .article, .series").forEach((el) => el.classList.add("is-revealed"));
})();
