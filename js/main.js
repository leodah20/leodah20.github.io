(function () {
  "use strict";

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const iconEl = toggleBtn.querySelector("[data-theme-icon]");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    iconEl.textContent = theme === "light" ? "☾" : "☀";
    localStorage.setItem("theme", theme);
  }

  const savedTheme = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(savedTheme || (prefersLight ? "light" : "dark"));

  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    applyTheme(current === "light" ? "dark" : "light");
  });

  /* ---------- hero typing effect ---------- */
  const typedCmdEl = document.getElementById("typedCmd");
  const typedOutputEl = document.getElementById("typedOutput");

  function typeText(el, text, speed, done) {
    let i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    })();
  }

  typedOutputEl.textContent = CONTENT.heroOutput.join("\n");
  typeText(typedCmdEl, CONTENT.heroTyped, 90, () => {
    setTimeout(() => typedOutputEl.classList.add("is-visible"), 150);
  });

  /* ---------- experience ---------- */
  const experienceList = document.getElementById("experienceList");
  CONTENT.experience.forEach((job) => {
    const entry = document.createElement("article");
    entry.className = "entry" + (job.current ? " entry--active" : "");

    const title = document.createElement("h3");
    title.className = "entry__title";
    title.textContent = job.role + " — " + job.company;
    if (job.current) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "atual";
      title.appendChild(badge);
    }
    entry.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "entry__meta";
    meta.textContent = job.period;
    entry.appendChild(meta);

    const desc = document.createElement("p");
    desc.className = "entry__desc";
    desc.textContent = job.desc;
    entry.appendChild(desc);

    if (job.highlights && job.highlights.length) {
      const list = document.createElement("ul");
      list.className = "entry__highlights";
      job.highlights.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        list.appendChild(li);
      });
      entry.appendChild(list);
    }

    experienceList.appendChild(entry);
  });

  /* ---------- education ---------- */
  const educationList = document.getElementById("educationList");
  CONTENT.education.forEach((ed) => {
    const entry = document.createElement("article");
    entry.className = "entry" + (ed.current ? " entry--active" : "");

    const title = document.createElement("h3");
    title.className = "entry__title";
    title.textContent = ed.title;
    entry.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "entry__meta";
    meta.textContent = ed.place + " — " + ed.period;
    entry.appendChild(meta);

    const desc = document.createElement("p");
    desc.className = "entry__desc";
    desc.textContent = ed.desc;
    entry.appendChild(desc);

    educationList.appendChild(entry);
  });

  /* ---------- certifications ---------- */
  const certList = document.getElementById("certList");
  CONTENT.certifications.forEach((c) => {
    const li = document.createElement("li");
    if (c.featured) li.className = "is-featured";

    const name = document.createElement("span");
    name.className = "cert-list__name";
    name.textContent = c.name;
    if (c.featured) {
      const badge = document.createElement("span");
      badge.className = "badge cert-list__badge";
      badge.textContent = "destaque";
      name.appendChild(badge);
    }
    li.appendChild(name);

    const meta = document.createElement("span");
    meta.className = "cert-list__meta";
    meta.textContent = [c.issuer, c.date].filter(Boolean).join(" · ");
    li.appendChild(meta);

    certList.appendChild(li);
  });

  /* ---------- skills ---------- */
  const skillsGrid = document.getElementById("skillsGrid");
  CONTENT.skills.forEach((group) => {
    const card = document.createElement("div");
    card.className = "skill-card";

    const title = document.createElement("p");
    title.className = "skill-card__title";
    title.textContent = group.category.replace(/_/g, " ");
    card.appendChild(title);

    const list = document.createElement("ul");
    list.className = "skill-card__list";
    group.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    card.appendChild(list);

    skillsGrid.appendChild(card);
  });

  /* ---------- projects ---------- */
  const projectsGrid = document.getElementById("projectsGrid");
  if (!CONTENT.projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "cannot access 'projects/*': entries coming soon";
    projectsGrid.appendChild(empty);
  } else {
    CONTENT.projects.forEach((p) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const name = document.createElement("h3");
      name.className = "project-card__name";
      name.textContent = p.name;
      card.appendChild(name);

      if (p.period) {
        const period = document.createElement("p");
        period.className = "project-card__period";
        period.textContent = p.period;
        card.appendChild(period);
      }

      const desc = document.createElement("p");
      desc.className = "project-card__desc";
      desc.textContent = p.desc;
      card.appendChild(desc);

      if (p.stack && p.stack.length) {
        const stack = document.createElement("div");
        stack.className = "project-card__stack";
        p.stack.forEach((s) => {
          const span = document.createElement("span");
          span.textContent = s;
          stack.appendChild(span);
        });
        card.appendChild(stack);
      }

      if (p.note) {
        const note = document.createElement("p");
        note.className = "project-card__note";
        note.textContent = p.note;
        card.appendChild(note);
      }

      const links = document.createElement("div");
      links.className = "project-card__links";

      if (p.demo) {
        const demo = document.createElement("a");
        demo.className = "project-card__link";
        demo.href = p.demo;
        demo.target = "_blank";
        demo.rel = "noopener noreferrer";
        demo.textContent = "live demo";
        links.appendChild(demo);
      }

      if (p.link) {
        const link = document.createElement("a");
        link.className = "project-card__link";
        link.href = p.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "source";
        links.appendChild(link);
      }

      card.appendChild(links);

      projectsGrid.appendChild(card);
    });
  }

  /* ---------- contact ---------- */
  const contactList = document.getElementById("contactList");
  CONTENT.contact.forEach((c) => {
    const li = document.createElement("li");

    const k = document.createElement("span");
    k.className = "k";
    k.textContent = c.label + ":";
    li.appendChild(k);

    const a = document.createElement("a");
    a.href = c.href;
    a.textContent = c.value;
    if (c.href.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    li.appendChild(a);

    contactList.appendChild(li);
  });
})();
