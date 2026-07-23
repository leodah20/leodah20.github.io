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

  /* ---------- sidebar active-section tracking ---------- */
  const sidebarLinks = Array.from(document.querySelectorAll(".sidebar__nav a"));
  const observedSections = sidebarLinks
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          sidebarLinks.forEach((a) => {
            a.classList.toggle("is-active", a.dataset.section === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

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
    const isCurrent = job.current || (job.roles && job.roles.some((r) => r.current));
    entry.className = "entry" + (isCurrent ? " entry--active" : "");

    const title = document.createElement("h3");
    title.className = "entry__title";

    if (job.roles && job.roles.length) {
      job.roles.forEach((r, i) => {
        if (i > 0) {
          const arrow = document.createElement("span");
          arrow.className = "entry__roles-arrow";
          arrow.textContent = " → ";
          title.appendChild(arrow);
        }
        const roleSpan = document.createElement("span");
        roleSpan.className = "entry__roles-title" + (r.current ? " is-current" : "");
        roleSpan.textContent = r.title;
        title.appendChild(roleSpan);
        if (r.current) {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = "atual";
          roleSpan.appendChild(badge);
        }
      });
      title.appendChild(document.createTextNode(" — " + job.company));
      entry.appendChild(title);

      const meta = document.createElement("p");
      meta.className = "entry__meta";
      meta.textContent = job.roles.map((r) => r.period).join("  ·  ");
      entry.appendChild(meta);
    } else {
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
    }

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

  /* ---------- skills topology ---------- */
  function computeRadialPositions(count, cx, cy, radius, startAngleDeg) {
    const positions = [];
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const angleDeg = startAngleDeg + step * i;
      const angleRad = (angleDeg * Math.PI) / 180;
      positions.push({
        x: cx + radius * Math.cos(angleRad),
        y: cy + radius * Math.sin(angleRad)
      });
    }
    return positions;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const topologySvg = document.getElementById("topologySvg");
  const topologyDetail = document.getElementById("topologyDetail");
  const topologyFallback = document.getElementById("topologyFallback");

  const TOPOLOGY_CENTER = { x: 230, y: 230 };
  const TOPOLOGY_RADIUS = 160;
  const NODE_R = 20;
  const CENTER_R = 24;

  function makeSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
    return el;
  }

  const nodePositions = computeRadialPositions(
    CONTENT.skills.length, TOPOLOGY_CENTER.x, TOPOLOGY_CENTER.y, TOPOLOGY_RADIUS, -90
  );

  CONTENT.skills.forEach((group, i) => {
    const pos = nodePositions[i];
    topologySvg.appendChild(makeSvgEl("line", {
      class: "topology-link",
      x1: TOPOLOGY_CENTER.x, y1: TOPOLOGY_CENTER.y, x2: pos.x, y2: pos.y
    }));
  });

  const centerGroup = makeSvgEl("g", { class: "topology-node is-center" });
  centerGroup.appendChild(makeSvgEl("circle", { cx: TOPOLOGY_CENTER.x, cy: TOPOLOGY_CENTER.y, r: CENTER_R }));
  const centerLabel = makeSvgEl("text", { x: TOPOLOGY_CENTER.x, y: TOPOLOGY_CENTER.y + 4 });
  centerLabel.textContent = "você";
  centerGroup.appendChild(centerLabel);
  topologySvg.appendChild(centerGroup);

  const nodeGroups = CONTENT.skills.map((group, i) => {
    const pos = nodePositions[i];
    const g = makeSvgEl("g", { class: "topology-node", tabindex: "0", role: "button" });
    g.appendChild(makeSvgEl("circle", { cx: pos.x, cy: pos.y, r: NODE_R }));
    const label = makeSvgEl("text", { x: pos.x, y: pos.y + NODE_R + 16 });
    label.textContent = group.category.replace(/_/g, " ");
    g.appendChild(label);
    g.addEventListener("click", () => selectSkillCategory(i));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSkillCategory(i); }
    });
    topologySvg.appendChild(g);
    return g;
  });

  CONTENT.skills.forEach((group, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = group.category.replace(/_/g, " ");
    btn.addEventListener("click", () => selectSkillCategory(i));
    li.appendChild(btn);
    topologyFallback.appendChild(li);
  });

  function selectSkillCategory(index) {
    const group = CONTENT.skills[index];

    nodeGroups.forEach((g, i) => g.classList.toggle("is-active", i === index));
    Array.from(topologyFallback.querySelectorAll("button")).forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
    });

    topologyDetail.innerHTML = "";
    const title = document.createElement("p");
    title.className = "topology__detail-title";
    title.textContent = group.category.replace(/_/g, " ");
    topologyDetail.appendChild(title);

    const list = document.createElement("ul");
    list.className = "topology__detail-list";
    group.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    topologyDetail.appendChild(list);
  }

  selectSkillCategory(0);

  /* ---------- projects (host cards) ---------- */
  const hostsGrid = document.getElementById("hostsGrid");
  if (!CONTENT.projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "cannot access 'hosts/*': entries coming soon";
    hostsGrid.appendChild(empty);
  } else {
    CONTENT.projects.forEach((p) => {
      const card = document.createElement("article");
      card.className = "host-card";

      const head = document.createElement("div");
      head.className = "host-card__head";

      const name = document.createElement("h3");
      name.className = "host-card__name";
      name.textContent = p.name;
      head.appendChild(name);

      const isOnline = Boolean(p.demo);
      const status = document.createElement("span");
      status.className = "host-card__status" + (isOnline ? "" : " is-source");
      const statusDot = document.createElement("span");
      statusDot.className = "host-card__status-dot";
      status.appendChild(statusDot);
      status.appendChild(document.createTextNode(isOnline ? "online" : "source only"));
      head.appendChild(status);

      card.appendChild(head);

      if (p.period) {
        const period = document.createElement("p");
        period.className = "host-card__period";
        period.textContent = p.period;
        card.appendChild(period);
      }

      const desc = document.createElement("p");
      desc.className = "host-card__desc";
      desc.textContent = p.desc;
      card.appendChild(desc);

      if (p.stack && p.stack.length) {
        const stack = document.createElement("div");
        stack.className = "host-card__stack";
        p.stack.forEach((s) => {
          const span = document.createElement("span");
          span.textContent = s;
          stack.appendChild(span);
        });
        card.appendChild(stack);
      }

      if (p.note) {
        const note = document.createElement("p");
        note.className = "host-card__note";
        note.textContent = p.note;
        card.appendChild(note);
      }

      const links = document.createElement("div");
      links.className = "host-card__links";

      if (p.demo) {
        const demo = document.createElement("a");
        demo.className = "host-card__link";
        demo.href = p.demo;
        demo.target = "_blank";
        demo.rel = "noopener noreferrer";
        demo.textContent = "live demo";
        links.appendChild(demo);
      }

      if (p.link) {
        const link = document.createElement("a");
        link.className = "host-card__link";
        link.href = p.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "source";
        links.appendChild(link);
      }

      card.appendChild(links);

      hostsGrid.appendChild(card);
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
