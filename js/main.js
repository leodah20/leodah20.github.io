(function () {
  "use strict";


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

  // The observer's trigger band sits around 40-45% down the viewport, which
  // the last section's top never reaches once the page runs out of room to
  // scroll further -- so it never got marked active. Force it when scrolled
  // to the bottom of the page.
  const lastObservedSection = observedSections[observedSections.length - 1];
  if (lastObservedSection) {
    function markActiveIfAtBottom() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (!atBottom) return;
      sidebarLinks.forEach((a) => {
        a.classList.toggle("is-active", a.dataset.section === lastObservedSection.id);
      });
    }
    window.addEventListener("scroll", markActiveIfAtBottom, { passive: true });
    window.addEventListener("resize", markActiveIfAtBottom);
    markActiveIfAtBottom();
  }


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

  /* ---------- certifications (led wall) ---------- */
  const certsFeatured = document.getElementById("certsFeatured");
  const certsRegular = document.getElementById("certsRegular");

  CONTENT.certifications.forEach((c) => {
    if (c.featured) {
      const card = document.createElement("div");
      card.className = "led-card";

      const dot = document.createElement("span");
      dot.className = "led-card__dot";
      card.appendChild(dot);

      const body = document.createElement("div");
      const name = document.createElement("p");
      name.className = "led-card__name";
      name.textContent = c.name;
      body.appendChild(name);

      const meta = document.createElement("p");
      meta.className = "led-card__meta";
      meta.textContent = [c.issuer, c.date].filter(Boolean).join(" · ");
      body.appendChild(meta);

      card.appendChild(body);
      certsFeatured.appendChild(card);
    } else {
      const pill = document.createElement("div");
      pill.className = "led-pill";

      const dot = document.createElement("span");
      dot.className = "led-pill__dot";
      pill.appendChild(dot);

      const name = document.createElement("span");
      name.className = "led-pill__name";
      name.textContent = c.name;
      pill.appendChild(name);

      const meta = document.createElement("span");
      meta.className = "led-pill__meta";
      meta.textContent = [c.issuer, c.date].filter(Boolean).join(" · ");
      pill.appendChild(meta);

      certsRegular.appendChild(pill);
    }
  });

  /* ---------- certifications timeline (real dates, oldest first) ---------- */
  const PT_MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };

  function parseCertDate(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{1,2}\s+)?([a-z]{3})\.\s*(\d{4})/i);
    if (!match) return null;
    const month = PT_MONTHS[match[2].toLowerCase()];
    if (month === undefined) return null;
    const day = match[1] ? parseInt(match[1], 10) : 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const certTimeline = document.getElementById("certTimeline");
  const sortedCerts = CONTENT.certifications
    .map((c) => ({ cert: c, parsedDate: parseCertDate(c.date) }))
    .filter((entry) => entry.parsedDate)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  sortedCerts.forEach((entry, i) => {
    const c = entry.cert;
    const item = document.createElement("div");
    item.className = "cert-timeline__item" + (c.featured ? " is-featured" : "");
    item.style.transitionDelay = (i * 0.05) + "s";

    const dot = document.createElement("span");
    dot.className = "cert-timeline__dot";
    item.appendChild(dot);

    const year = document.createElement("p");
    year.className = "cert-timeline__year";
    year.textContent = entry.parsedDate.getFullYear();
    item.appendChild(year);

    const name = document.createElement("p");
    name.className = "cert-timeline__name";
    name.textContent = c.name;
    item.appendChild(name);

    const meta = document.createElement("p");
    meta.className = "cert-timeline__meta";
    meta.textContent = [c.issuer, c.date].filter(Boolean).join(" · ");
    item.appendChild(meta);

    certTimeline.appendChild(item);
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

  // SVG <text> never wraps on its own (unlike HTML), so a long label like
  // "servidores e virtualizacao" would render as one line and run past the
  // viewBox edge, getting clipped. Greedily wraps on word boundaries instead.
  function wrapSvgLabel(text, maxChars) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const candidate = current ? current + " " + word : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function setSvgTextLines(textEl, lines, lineHeight) {
    const x = textEl.getAttribute("x");
    lines.forEach((line, i) => {
      const tspan = makeSvgEl("tspan", { x: x, dy: i === 0 ? 0 : lineHeight });
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });
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
    setSvgTextLines(label, wrapSvgLabel(group.category.replace(/_/g, " "), 16), 12);
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
    Array.from(document.querySelectorAll(".skills-chart__row")).forEach((row, i) => {
      row.classList.toggle("is-active", i === index);
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

  /* ---------- skills distribution chart ---------- */
  const skillsChart = document.getElementById("skillsChart");
  const maxSkillCount = Math.max(...CONTENT.skills.map((group) => group.items.length));

  CONTENT.skills.forEach((group, i) => {
    const row = document.createElement("div");
    row.className = "skills-chart__row";
    row.style.transitionDelay = (i * 0.06) + "s";

    const label = document.createElement("span");
    label.className = "skills-chart__label";
    label.textContent = group.category.replace(/_/g, " ");
    row.appendChild(label);

    const track = document.createElement("div");
    track.className = "skills-chart__track";
    const bar = document.createElement("div");
    bar.className = "skills-chart__bar";
    bar.dataset.width = Math.round((group.items.length / maxSkillCount) * 100) + "%";
    track.appendChild(bar);
    row.appendChild(track);

    const count = document.createElement("span");
    count.className = "skills-chart__count";
    count.textContent = group.items.length;
    row.appendChild(count);

    skillsChart.appendChild(row);
  });

  selectSkillCategory(0);

  /* ---------- github live status ---------- */
  const ghSummary = document.getElementById("ghSummary");
  const ghLanguages = document.getElementById("ghLanguages");
  const ghActivity = document.getElementById("ghActivity");
  const ghContributions = document.getElementById("ghContributions");
  const GH_CACHE_KEY = "gh-status-cache-v1";
  const GH_CACHE_TTL_MS = 10 * 60 * 1000;

  const GH_EVENT_LABELS = {
    PushEvent: (e) => "push em " + e.repo.name,
    CreateEvent: (e) => "criou " + (e.payload.ref_type || "algo") + " em " + e.repo.name,
    PublicEvent: (e) => "tornou " + e.repo.name + " publico",
    WatchEvent: (e) => "deu star em " + e.repo.name,
    IssuesEvent: (e) => (e.payload.action || "atualizou") + " issue em " + e.repo.name,
    PullRequestEvent: (e) => (e.payload.action || "atualizou") + " pull request em " + e.repo.name,
    ForkEvent: (e) => "fez fork de " + e.repo.name,
    DeleteEvent: (e) => "removeu " + (e.payload.ref_type || "algo") + " em " + e.repo.name
  };

  function formatRelativeTime(isoDate) {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return "ha " + mins + "min";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return "ha " + hours + "h";
    const days = Math.floor(hours / 24);
    return "ha " + days + "d";
  }

  function renderGithubSummary(user, repos) {
    ghSummary.innerHTML = "";
    const ownRepos = repos.filter((r) => !r.fork);
    const stats = [
      { value: user.public_repos, label: "repos publicos" },
      { value: ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0), label: "stars recebidas" },
      { value: user.followers, label: "seguidores" },
      { value: new Date(user.created_at).getFullYear(), label: "no github desde" }
    ];
    stats.forEach((s) => {
      const stat = document.createElement("div");
      stat.className = "gh-summary__stat";
      const value = document.createElement("p");
      value.className = "gh-summary__value";
      value.textContent = s.value;
      stat.appendChild(value);
      const label = document.createElement("p");
      label.className = "gh-summary__label";
      label.textContent = s.label;
      stat.appendChild(label);
      ghSummary.appendChild(stat);
    });
  }

  function renderGithubLanguages(repos) {
    ghLanguages.innerHTML = "";
    const counts = {};
    repos.filter((r) => !r.fork && r.language).forEach((r) => {
      counts[r.language] = (counts[r.language] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    const max = entries[0][1];

    entries.forEach(([lang, count], i) => {
      const row = document.createElement("div");
      row.className = "gh-lang-chart__row";

      const label = document.createElement("span");
      label.className = "gh-lang-chart__label";
      label.textContent = lang;
      row.appendChild(label);

      const track = document.createElement("div");
      track.className = "gh-lang-chart__track";
      const bar = document.createElement("div");
      bar.className = "gh-lang-chart__bar";
      bar.style.width = Math.round((count / max) * 100) + "%";
      track.appendChild(bar);
      row.appendChild(track);

      const countEl = document.createElement("span");
      countEl.className = "gh-lang-chart__count";
      countEl.textContent = count;
      row.appendChild(countEl);

      ghLanguages.appendChild(row);
    });
  }

  function renderGithubActivity(events) {
    ghActivity.innerHTML = "";
    if (!events.length) {
      const li = document.createElement("li");
      li.textContent = "sem atividade publica recente";
      ghActivity.appendChild(li);
      return;
    }
    events.slice(0, 8).forEach((e) => {
      const li = document.createElement("li");
      const desc = document.createElement("span");
      desc.className = "gh-activity__desc";
      const format = GH_EVENT_LABELS[e.type];
      desc.textContent = format ? format(e) : "atividade em " + e.repo.name;
      li.appendChild(desc);

      const time = document.createElement("span");
      time.className = "gh-activity__time";
      time.textContent = formatRelativeTime(e.created_at);
      li.appendChild(time);

      ghActivity.appendChild(li);
    });
  }

  async function renderGithubContributions(dataUrl) {
    try {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error("contributions data not found");
      const calendar = await res.json();
      ghContributions.innerHTML = "";

      const grid = document.createElement("div");
      grid.className = "gh-contributions__grid";
      calendar.weeks.forEach((week) => {
        week.contributionDays.forEach((day) => {
          const cell = document.createElement("div");
          cell.className = "gh-contributions__day";
          cell.title = day.date + " — " + day.contributionCount + " contribuicao(oes)";
          if (day.contributionCount > 0) {
            const intensity = Math.min(1, day.contributionCount / 10);
            cell.style.background = "color-mix(in srgb, var(--accent) " + Math.round(intensity * 100) + "%, var(--bg-alt))";
            cell.style.borderColor = "var(--accent)";
          }
          grid.appendChild(cell);
        });
      });
      ghContributions.appendChild(grid);

      const total = document.createElement("p");
      total.className = "gh-status__hint";
      total.textContent = calendar.totalContributions + " contribuicoes no ultimo ano";
      ghContributions.appendChild(total);
    } catch (err) {
      ghContributions.innerHTML = "";
      const msg = document.createElement("p");
      msg.className = "gh-status__error";
      msg.textContent = "nao foi possivel carregar o calendario de contribuicoes agora.";
      ghContributions.appendChild(msg);
    }
  }

  async function loadGithubStatus() {
    const username = CONTENT.githubUsername;
    if (!username) return;

    try {
      const cachedRaw = sessionStorage.getItem(GH_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Date.now() - cached.fetchedAt < GH_CACHE_TTL_MS) {
          renderGithubSummary(cached.user, cached.repos);
          renderGithubLanguages(cached.repos);
          renderGithubActivity(cached.events);
          renderGithubContributions("data/contributions.json");
          return;
        }
      }
    } catch (e) {
      // Corrupt cache entry — ignore and re-fetch from the network below.
    }

    try {
      const [userRes, reposRes, eventsRes] = await Promise.all([
        fetch("https://api.github.com/users/" + username),
        fetch("https://api.github.com/users/" + username + "/repos?per_page=100&type=owner"),
        fetch("https://api.github.com/users/" + username + "/events/public?per_page=10")
      ]);
      if (!userRes.ok || !reposRes.ok || !eventsRes.ok) throw new Error("github api error");

      const user = await userRes.json();
      const repos = await reposRes.json();
      const events = await eventsRes.json();

      sessionStorage.setItem(GH_CACHE_KEY, JSON.stringify({ user, repos, events, fetchedAt: Date.now() }));

      renderGithubSummary(user, repos);
      renderGithubLanguages(repos);
      renderGithubActivity(events);
      renderGithubContributions("data/contributions.json");
    } catch (err) {
      ghSummary.innerHTML = "";
      const msg = document.createElement("p");
      msg.className = "gh-status__error";
      msg.textContent = "nao foi possivel carregar os dados do GitHub agora (limite de requisicoes ou offline) — tente novamente mais tarde.";
      ghSummary.appendChild(msg);
    }
  }

  loadGithubStatus();

  /* ---------- completed portfolio work ---------- */
  const hostsGrid = document.getElementById("hostsGrid");
  for (const project of CONTENT.projects) {
    const card = document.createElement("article");
    card.className = "host-card";
    const title = document.createElement("h4");
    title.className = "host-card__name";
    title.textContent = project.name;
    const status = document.createElement("p");
    status.className = "host-card__period";
    status.textContent = project.kind + " · " + project.period;
    const description = document.createElement("p");
    description.className = "host-card__desc";
    description.textContent = project.desc;
    const stack = document.createElement("div");
    stack.className = "host-card__stack";
    for (const technology of project.stack) {
      const label = document.createElement("span");
      label.textContent = technology;
      stack.append(label);
    }
    const actions = document.createElement("div");
    actions.className = "host-card__links";
    for (const [label, href] of [["Ver código", project.link], ["Ver demonstração", project.demo], ["Ler estudo", project.blog]]) {
      if (!href) continue;
      const link = document.createElement("a");
      link.className = "host-card__link";
      link.textContent = label;
      link.href = href;
      actions.append(link);
    }
    card.append(title, status, description, stack, actions);
    hostsGrid.append(card);
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

  document.querySelectorAll(".skills-chart__bar[data-width]").forEach(bar => {
    bar.style.width = bar.dataset.width;
  });
})();
