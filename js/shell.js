(function () {
  "use strict";
  const root = document.documentElement;
  const theme = document.getElementById("themeToggle");
  const motion = document.getElementById("motionToggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const store = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferência desta página. */ } };
  if (theme) {
    theme.innerHTML = '<span class="t-icon-swap" aria-hidden="true"><span class="t-icon" data-icon="a"><svg viewBox="0 0 24 24"><path d="M20.5 15.3A8.9 8.9 0 0 1 8.7 3.5a9 9 0 1 0 11.8 11.8Z"/></svg></span><span class="t-icon" data-icon="b"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19"/></svg></span></span><span data-theme-label></span>';
    const apply = value => {
      const light = value === "light";
      root.dataset.theme = light ? "light" : "dark";
      theme.querySelector(".t-icon-swap").dataset.state = light ? "b" : "a";
      theme.querySelector("[data-theme-label]").textContent = light ? "Claro" : "Escuro";
      theme.setAttribute("aria-label", light ? "Tema claro, mudar para escuro" : "Tema escuro, mudar para claro");
    };
    apply(read("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    theme.addEventListener("click", () => {
      const value = root.dataset.theme === "light" ? "dark" : "light";
      apply(value);
      store("theme", value);
    });
    theme.hidden = false;
  }
  if (motion) {
    const apply = () => {
      const paused = reduced.matches || read("portfolio-motion") === "paused";
      root.dataset.motion = paused ? "paused" : "playing";
      motion.hidden = reduced.matches;
      motion.setAttribute("aria-pressed", String(paused));
      motion.textContent = paused ? "Retomar movimento" : "Pausar movimento";
    };
    motion.addEventListener("click", () => {
      store("portfolio-motion", root.dataset.motion === "paused" ? "playing" : "paused");
      apply();
    });
    reduced.addEventListener("change", apply);
    apply();
  }
  for (const [id,count,size] of [["Large",20,1],["Medium",40,.8],["Small",63,.5]]) {
    const stars = document.getElementById("bgStars" + id);
    if (!stars) continue;
    stars.style.width = stars.style.height = "1px";
    stars.style.boxShadow = Array.from({length:count},() =>
      `${(Math.random() * 100).toFixed(2)}vw ${(Math.random() * 100).toFixed(2)}vh 0 ${size}px var(--fg)`).join(",");
  }
})();
