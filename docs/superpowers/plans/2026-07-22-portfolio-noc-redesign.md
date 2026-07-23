# Portfolio NOC Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `leodah20.github.io` from a flat terminal-text layout into an interactive "NOC Dashboard" — sidebar navigation, a clickable SVG skills-topology diagram, project "host" status cards, and a certifications "LED wall" — per `docs/superpowers/specs/2026-07-22-portfolio-noc-redesign-design.md`.

**Architecture:** Still a single static page (`index.html` + `css/style.css` + `js/content.js` + `js/main.js`), zero build step, zero external JS/CSS dependencies. `content.js` remains the sole editable data source; `main.js` renders it into the DOM (including generating an SVG diagram from plain JS/DOM APIs — no charting library).

**Tech Stack:** Plain HTML5, CSS3 (custom properties, `color-mix()`, CSS Grid/Flexbox), vanilla ES2017 JS (`IntersectionObserver`, `createElementNS` for SVG). No npm, no bundler, no test framework — this repo has none today and the spec explicitly forbids adding a build step.

## Global Constraints

- No build step, no framework, no external JS/CSS libraries (spec: "Site continua estático ... sem dependências externas quebráveis").
- No fabricated data anywhere (spec: "Sem dados inventados") — e.g. project "host" cards must not show invented uptime/ping numbers, only a real online/source-only status derived from whether a `demo` link exists.
- Keep the JetBrains Mono / terminal-window-chrome visual language as the connective thread (spec: "linguagem de terminal/CLI ... mantida como fio condutor").
- Dark/light theme toggle must keep working (spec: "Toggle claro/escuro é mantido").
- **Testing adaptation:** this repo has no test runner and the spec forbids adding build tooling, so "test cycle" per task means: (a) `node --check <file>` for JS syntax validity, (b) `grep`-based structural assertions for markup/content correctness, (c) for the one piece of pure logic (radial node positioning) a real Node-executed assertion, and (d) a manual/browser verification checklist at the end of each task. Do not introduce Jest/Vitest/jsdom/etc. — that would violate the no-build-step constraint for a personal static site that doesn't need it.
- All commits go directly on the current branch (no new dependencies to lock/install).

---

## File Structure

| File | Responsibility |
|---|---|
| `js/content.js` | All editable content — data only, no rendering logic. |
| `js/main.js` | All rendering/interaction logic (theme, hero typing, experience/education, skills topology, host cards, certifications LED wall, sidebar nav + active-section tracking). |
| `css/style.css` | Theme tokens (dark/light), sidebar layout, all component styles. |
| `index.html` | Page markup/structure only — no inline logic beyond the two `<script src>` tags. |
| `README.md` | Human-facing docs of the content/structure — updated to match the new shapes. |

No new files are needed; this redesign reshapes the existing four files in place.

---

### Task 1: Content data + experience-progression rendering, skill additions, certification accuracy

**Files:**
- Modify: `js/content.js` (replace entire file)
- Modify: `js/main.js` (experience-rendering block — must be updated in the same task, otherwise the Build Engenharia entry renders as `undefined — Build Engenharia` the moment the new data shape lands)
- Modify: `css/style.css` ("Education" section comment block — add 3 small rules for the stacked-role title)

**Interfaces:**
- Produces: `CONTENT.experience[0]` (Build Engenharia entry) now has a `roles: [{title, period, current}, ...]` array instead of top-level `role`/`period`/`current` fields. All other experience entries keep the existing flat shape (`role`, `period`, `current`, `desc`, optional `highlights`).
- Produces/consumes (same task): the experience-rendering block in `js/main.js` branches on `job.roles` vs the flat shape — this is the only place that reads `job.roles`, so it's self-contained within this task.
- Produces: `CONTENT.certifications[].featured` boolean (already existed, now correctly assigned to exactly 3 entries) — Task 6 (LED wall) reads this flag.
- Produces: `CONTENT.skills[].items` arrays include the newly confirmed items — Task 4 (topology diagram) reads `CONTENT.skills` directly, no shape change needed there.

- [ ] **Step 1: Replace `js/content.js` with the corrected/expanded content**

```js
// ---------------------------------------------------------------------------
// All editable content lives here. Edit this file to update the site —
// no HTML/CSS knowledge required.
// ---------------------------------------------------------------------------

const CONTENT = {

  name: "Leonardo Cordeiro Sutil",

  // Lines typed out in the hero terminal, in order.
  heroTyped: "whoami",
  heroOutput: [
    "Leonardo Cordeiro Sutil",
    "Analista de Redes Jr. -> Build Engenharia",
    "",
    "Infraestrutura, servidores e redes corporativas em ambiente",
    "produtivo real: Windows Server, Linux, VMware, Zabbix, FortiGate,",
    "MikroTik. Estudante de Ciencia da Computacao (UNIP, form. 2026)."
  ],

  // Newest first. Build Engenharia uses `roles` (an array) to show a real
  // promotion; every other entry uses the flat role/period/current shape.
  experience: [
    {
      company: "Build Engenharia",
      roles: [
        { title: "Estagiario em Infraestrutura de TI e Automacao Predial", period: "set. 2025 - jul. 2026", current: false },
        { title: "Analista de Redes Jr.", period: "jul. 2026 - atual", current: true }
      ],
      desc: "Empresa especializada em tecnologia predial e seguranca eletronica. Atuacao dividida em tres frentes:",
      highlights: [
        "Servidores: montagem de hardware, instalacao e configuracao de Windows Server 2016/2019/2022 e Linux Ubuntu Server; DHCP, DNS e File Server; virtualizacao com VMware ESXi e Hyper-V.",
        "Redes corporativas: switches Cisco e HP, roteadores MikroTik, firewalls pfSense e FortiGate; criacao de VLANs e regras de firewall; monitoramento via SNMP e Zabbix; diagnostico de incidentes em producao.",
        "Automacao predial e seguranca: CFTV, controle de acesso e CLPs (Controladores Logicos Programaveis)."
      ]
    },
    {
      company: "Subway",
      role: "Atendimento ao cliente",
      period: "jun. 2024 - mar. 2025",
      current: false,
      desc: "Atendimento direto ao cliente e operacao de caixa em ambiente de alto volume."
    },
    {
      company: "Lemos e Lemos Assessoria em Seguranca do Trabalho",
      role: "Estagiario de engenharia",
      period: "dez. 2021 - abr. 2022",
      current: false,
      desc: "Suporte administrativo: relatorios tecnicos, controle de contas a pagar/receber e prazos contratuais."
    },
    {
      company: "Incubadora Tecnologica UTFPR",
      role: "Bolsista de gestao",
      period: "nov. 2020 - nov. 2021",
      current: false,
      desc: "Suporte a startups em fase de incubacao: acompanhamento de indicadores, relatorios tecnicos e gerenciais."
    }
  ],

  education: [
    {
      title: "Bacharelado em Ciencia da Computacao",
      place: "Universidade Paulista (UNIP), Sao Paulo",
      period: "ago. 2022 - ago. 2026 (previsto)",
      current: true,
      desc: "Formacao em curso, conciliada com atuacao pratica em infraestrutura de TI."
    }
  ],

  skills: [
    {
      category: "redes",
      items: ["TCP/IP", "VLANs", "DHCP / DNS", "SNMP", "Wireshark", "Cabeamento estruturado", "Cisco Packet Tracer"]
    },
    {
      category: "servidores_e_virtualizacao",
      items: ["Windows Server 2016/2019/2022", "Linux Ubuntu Server", "VMware ESXi", "Hyper-V", "File Server", "Active Directory"]
    },
    {
      category: "seguranca_e_firewall",
      items: ["pfSense", "FortiGate", "Zabbix (monitoramento)", "Controle de acesso", "CFTV", "VPN", "Hardening basico"]
    },
    {
      category: "equipamentos",
      items: ["Switches Cisco / HP", "Roteadores MikroTik", "CLPs (automacao predial)"]
    },
    {
      category: "linguagens_e_dev",
      items: ["Python", "Java", "JavaScript", "HTML5 / CSS3", "Git / GitHub", "Bash"]
    },
    {
      category: "idiomas",
      items: ["Ingles - C2 Proficient (Cambridge / EF SET 75/100)"]
    }
  ],

  // featured: true => rendered as a lit LED card in the "featured" row.
  // Everything else renders as a compact dim-LED pill. Keep featured to a
  // small set (3) or the LED wall stops reading as "featured".
  certifications: [
    { name: "AWS Educate: Introduction to Generative AI", issuer: "Amazon Web Services", date: "mar. 2025", featured: true },
    { name: "Conceitos Basicos de Redes", issuer: "Cisco Networking Academy", date: "22 mai. 2026", featured: true },
    { name: "Treinamento Invenzi W-Access", issuer: "Invenzi", date: "18 mai. 2026 (valido ate 18/06/2028)", featured: true },
    { name: "Comecando com o Cisco Packet Tracer", issuer: "Cisco Networking Academy", date: "16 abr. 2026" },
    { name: "Linux Essentials", issuer: "Cisco Networking Academy (NDG)", date: "22 mai. 2026" },
    { name: "Linux Unhatched", issuer: "Cisco Networking Academy (NDG)", date: "22 mai. 2026" },
    { name: "C++ Essentials 1", issuer: "Cisco Networking Academy (C++ Institute)", date: "27 mai. 2026" },
    { name: "Introducao a Ciberseguranca com o Santander", issuer: "Santander Brasil", date: "abr. 2025" },
    { name: "Fundamentos de HTTP para Desenvolvedores", issuer: "LinkedIn Learning", date: "03 abr. 2025" },
    { name: "Seguranca da Informacao e a Protecao de Dados nos Dias Atuais", issuer: "Universidade Paulista (palestra)", date: "21 out. 2024" },
    { name: "Integrando Inteligencia Artificial nas Empresas", issuer: "Universidade Paulista (palestra)", date: "31 out. 2024" },
    { name: "EFSET English Certificate 75/100 (C2 Proficient)", issuer: "EF SET", date: "22 set. 2021" }
  ],

  // EDIT ME: add one object per project. Newest first. `demo` presence
  // controls the host-card status label (online vs source-only) — do not
  // add a demo link unless it is a real, reachable URL.
  projects: [
    {
      name: "ecofuturo",
      period: "2026",
      desc: "Site sobre energias renovaveis no Brasil, feito para a disciplina de Programacao Web Responsiva (UNIP). Tabela comparativa de fontes de energia, grafico interativo (Chart.js), calculadora de pegada de carbono, simulador de energia solar com dados do INPE/CRESESB e quiz interativo.",
      stack: ["HTML5", "CSS3", "JavaScript", "Chart.js"],
      demo: "https://leodah20.github.io/APS/",
      link: "https://github.com/leodah20/APS"
    },
    {
      name: "chatbot-front",
      period: "2025 - atual",
      desc: "Painel administrativo (Flask) para gestao academica universitaria: avisos, conteudo, calendario, docentes e duvidas frequentes. Consome uma API REST (FastAPI + Supabase) e se integra a um chatbot com NLU em Rasa. Projeto em grupo (TCC) — atuacao no front-end e na integracao com a API.",
      note: "O demo abaixo e um prototipo estatico (sem backend real) so para mostrar o front-end.",
      stack: ["Python", "Flask", "Jinja2", "REST API"],
      demo: "https://leodah20.github.io/chatbot-front-demo/",
      link: "https://github.com/leodah20/chatbot-front"
    }
  ],

  contact: [
    { label: "github",   value: "github.com/leodah20",                          href: "https://github.com/leodah20" },
    { label: "linkedin", value: "linkedin.com/in/leonardo-cordeiro-sutil",       href: "https://www.linkedin.com/in/leonardo-cordeiro-sutil" },
    { label: "blog",     value: "medium.com/@leoh.cordeiros",                    href: "https://medium.com/@leoh.cordeiros" },
    { label: "email",    value: "leoh.cordeiros@gmail.com",                      href: "mailto:leoh.cordeiros@gmail.com" }
  ]

};
```

- [ ] **Step 2: Update the experience-rendering block in `js/main.js` to handle the `roles` shape**

Replace:
```js
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
```

with:
```js
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
```

- [ ] **Step 3: Add stacked-role styles to `css/style.css`**

In the "Education" comment block (the block containing `.entry`, `.entry--active`, `.entry__title`, etc.), add these three rules directly after the existing `.entry__title` rule:

```css
.entry__roles-arrow{ color: var(--fg-dim); margin: 0 4px; font-weight: 400; }
.entry__roles-title{ color: var(--fg-dim); }
.entry__roles-title.is-current{ color: var(--fg); }
```

- [ ] **Step 4: Verify syntax is valid**

Run: `node --check js/content.js && node --check js/main.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify the data shape programmatically**

Run:
```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('js/content.js', 'utf8');
const CONTENT = (new Function(code + '; return CONTENT;'))();
const assert = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); };

assert(Array.isArray(CONTENT.experience[0].roles) && CONTENT.experience[0].roles.length === 2, 'Build Engenharia should have 2 stacked roles');
assert(CONTENT.experience[0].roles[1].title === 'Analista de Redes Jr.' && CONTENT.experience[0].roles[1].current === true, 'current role should be Analista de Redes Jr.');
assert(CONTENT.experience[1].role === 'Atendimento ao cliente', 'Subway entry should keep the flat role shape');

const featured = CONTENT.certifications.filter(c => c.featured);
assert(featured.length === 3, 'exactly 3 certifications should be featured, got ' + featured.length);
assert(featured.some(c => c.name.includes('AWS')), 'AWS cert should be featured');
assert(featured.some(c => c.name.includes('Conceitos Basicos de Redes')), 'Networking Basics cert should be featured');
assert(featured.some(c => c.name.includes('Invenzi')), 'Invenzi cert should be featured');

const unhatched = CONTENT.certifications.find(c => c.name === 'Linux Unhatched');
assert(unhatched.issuer === 'Cisco Networking Academy (NDG)', 'Linux Unhatched issuer should be corrected, got ' + unhatched.issuer);
assert(unhatched.date === '22 mai. 2026', 'Linux Unhatched date should be set, got ' + unhatched.date);

assert(CONTENT.skills.find(s => s.category === 'redes').items.includes('Cisco Packet Tracer'), 'redes should include Cisco Packet Tracer');
assert(CONTENT.skills.find(s => s.category === 'seguranca_e_firewall').items.includes('VPN'), 'seguranca_e_firewall should include VPN');
assert(CONTENT.skills.find(s => s.category === 'linguagens_e_dev').items.includes('Bash'), 'linguagens_e_dev should include Bash');

console.log('OK: content.js shape verified');
"
```
Expected: `OK: content.js shape verified` printed, exit code 0.

- [ ] **Step 6: Verify the experience markup wiring**

Run:
```bash
grep -c "entry__roles-title" css/style.css
grep -c "job.roles" js/main.js
```
Expected: `2` (the base rule plus the `.is-current` rule), `4` or more (referenced in the `isCurrent` check, the `if`, the `.forEach`, and the `.map` for periods).

- [ ] **Step 7: Manual browser check**

Serve the site (`python -m http.server 4321` from the repo root) and open `http://localhost:4321`:
- The Build Engenharia entry shows "Estagiário em Infraestrutura de TI e Automação Predial → Analista de Redes Jr. [atual] — Build Engenharia" with both periods on the meta line, separated by "·".
- The other three experience entries (Subway, Lemos e Lemos, Incubadora UTFPR) render exactly as before — single role, single period.
- The Build Engenharia entry still gets the `entry--active` left-border highlight (since its current sub-role is current).

- [ ] **Step 8: Commit**

```bash
git add js/content.js js/main.js css/style.css
git commit -m "content: confirm role progression, add skills, fix cert accuracy"
```

---

### Task 2: Theme tokens, page shell, and decorative background grid

**Files:**
- Modify: `css/style.css:1-63` (theme tokens block + CRT overlay block)

**Interfaces:**
- Produces: new CSS custom properties `--accent-3` (violet, certifications only) and `--sidebar-w` (used by Task 3's sidebar CSS). All later tasks style with `var(--accent)`, `var(--accent-2)`, `var(--accent-3)`, `var(--ok)` etc. — do not introduce new ad-hoc hex colors in later tasks.
- Produces: `.bg-grid` class — Task 3 adds the matching `<div class="bg-grid">` markup in `index.html`.

- [ ] **Step 1: Replace the theme-tokens + CRT-overlay block (lines 1-63) with the new palette**

Replace this region of `css/style.css`:

```css
/* ---------------------------------------------------------------------------
   Theme tokens
--------------------------------------------------------------------------- */
:root{
  --bg:        #0b0e11;
  --bg-alt:    #12161b;
  --bg-raised: #171c22;
  --fg:        #d9e0e8;
  --fg-dim:    #6d7a87;
  --border:    #232b33;
  --accent:    #5eead4;
  --accent-2:  #f5a623;
  --danger:    #ff5f56;
  --warn:      #ffbd2e;
  --ok:        #27c93f;
  --shadow: 0 8px 30px rgba(0,0,0,.35);
  --radius: 7px;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

:root[data-theme="light"]{
  --bg:        #f3efe6;
  --bg-alt:    #fffdf8;
  --bg-raised: #ffffff;
  --fg:        #1c2126;
  --fg-dim:    #6a6157;
  --border:    #ddd5c4;
  --accent:    #0d8a7c;
  --accent-2:  #b4530a;
  --shadow: 0 8px 24px rgba(30,25,15,.08);
}

*{ box-sizing: border-box; }
html{ scroll-behavior: smooth; }

body{
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.65;
  transition: background .25s ease, color .25s ease;
}

a{ color: var(--accent); text-decoration: none; }
a:hover{ text-decoration: underline; }

/* ---------------------------------------------------------------------------
   CRT / scanline texture (subtle, decorative only)
--------------------------------------------------------------------------- */
.crt-overlay{
  position: fixed; inset: 0; pointer-events: none; z-index: 999;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,.02) 0px,
    rgba(255,255,255,.02) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: .5;
  mix-blend-mode: overlay;
}
```

with:

```css
/* ---------------------------------------------------------------------------
   Theme tokens — "Console Elevado"
--------------------------------------------------------------------------- */
:root{
  --bg:        #0c1210;
  --bg-alt:    #101d19;
  --bg-raised: #16241f;
  --fg:        #e6f2ee;
  --fg-dim:    #7a8f8a;
  --border:    #1e332c;
  --accent:    #5eead4;
  --accent-2:  #f5a623;
  --accent-3:  #a78bfa;
  --danger:    #ff5f56;
  --warn:      #ffbd2e;
  --ok:        #3ddc84;
  --shadow: 0 8px 30px rgba(0,0,0,.35);
  --radius: 7px;
  --sidebar-w: 200px;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

:root[data-theme="light"]{
  --bg:        #eef3f1;
  --bg-alt:    #ffffff;
  --bg-raised: #ffffff;
  --fg:        #14201c;
  --fg-dim:    #5b6b66;
  --border:    #d7e2de;
  --accent:    #0d8a7c;
  --accent-2:  #b4530a;
  --accent-3:  #6d4fc7;
  --shadow: 0 8px 24px rgba(20,30,25,.08);
}

*{ box-sizing: border-box; }
html{ scroll-behavior: smooth; }

body{
  margin: 0;
  min-height: 100vh;
  display: flex;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.65;
  transition: background .25s ease, color .25s ease;
}

a{ color: var(--accent); text-decoration: none; }
a:hover{ text-decoration: underline; }

/* ---------------------------------------------------------------------------
   CRT / scanline texture (subtle, decorative only)
--------------------------------------------------------------------------- */
.crt-overlay{
  position: fixed; inset: 0; pointer-events: none; z-index: 999;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,.02) 0px,
    rgba(255,255,255,.02) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: .5;
  mix-blend-mode: overlay;
}

/* ---------------------------------------------------------------------------
   Decorative background grid — fills empty space on ultra-wide viewports
--------------------------------------------------------------------------- */
.bg-grid{
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    repeating-linear-gradient(to right, var(--border) 0, var(--border) 1px, transparent 1px, transparent 64px),
    repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 1px, transparent 1px, transparent 64px);
  opacity: .35;
}
```

Note: `body{ display:flex }` is added here in preparation for the sidebar (Task 3) — with no `.sidebar` element yet in the DOM this has no visible effect on the single remaining flex child (`main`).

- [ ] **Step 2: Verify the new tokens are present and old ones are gone**

Run:
```bash
grep -c -- "--accent-3:" css/style.css
grep -c -- "--sidebar-w:" css/style.css
grep -c "\.bg-grid{" css/style.css
grep -c "#f3efe6" css/style.css
```
Expected: `1`, `1`, `1`, `0` (the old light-theme cream background hex is fully gone).

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: adopt Console Elevado palette and decorative bg grid"
```

---

### Task 3: Sidebar navigation (replaces the top bar)

**Files:**
- Modify: `index.html:16-34` (the `<div class="crt-overlay">` + `<header class="topbar">` block)
- Modify: `css/style.css` (remove `.topbar*` rules, remove old `main{ max-width:820px }` rule, add `.sidebar*` + new `main` rule)
- Modify: `js/main.js:1-22` (the theme block)

**Interfaces:**
- Produces: `<nav class="sidebar" id="sidebar">` with five links (`data-section="whoami|skills|certifications|projects|contact"`), each holding a `.sidebar__dot` and `.sidebar__label`. Task 4/6/7 do not need to touch this; it only needs section ids `#whoami`, `#skills`, `#certifications`, `#projects`, `#contact` to exist elsewhere in `index.html` (they already do).
- Consumes: nothing new — `#themeToggle` keeps the same id/behavior as before, just moved inside `.sidebar`.

- [ ] **Step 1: Replace the top-of-body markup in `index.html`**

Replace:
```html
<div class="crt-overlay" aria-hidden="true"></div>

<header class="topbar">
  <div class="topbar__inner">
    <span class="topbar__logo">leodah20@portfolio</span>
    <nav class="topbar__nav">
      <a href="#whoami">whoami</a>
      <a href="#experience">experience</a>
      <a href="#education">education</a>
      <a href="#skills">skills</a>
      <a href="#certifications">certifications</a>
      <a href="#projects">projects</a>
      <a href="#contact">contact</a>
    </nav>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme">
      <span data-theme-icon></span>
    </button>
  </div>
</header>
```

with:
```html
<div class="crt-overlay" aria-hidden="true"></div>
<div class="bg-grid" aria-hidden="true"></div>

<nav class="sidebar" id="sidebar">
  <div class="sidebar__brand">$_</div>
  <ul class="sidebar__nav">
    <li><a href="#whoami" data-section="whoami"><span class="sidebar__dot" style="--dot-color:var(--accent)"></span><span class="sidebar__label">#whoami</span></a></li>
    <li><a href="#skills" data-section="skills"><span class="sidebar__dot" style="--dot-color:var(--accent-2)"></span><span class="sidebar__label">#skills</span></a></li>
    <li><a href="#certifications" data-section="certifications"><span class="sidebar__dot" style="--dot-color:var(--accent-3)"></span><span class="sidebar__label">#certifications</span></a></li>
    <li><a href="#projects" data-section="projects"><span class="sidebar__dot" style="--dot-color:var(--ok)"></span><span class="sidebar__label">#projects</span></a></li>
    <li><a href="#contact" data-section="contact"><span class="sidebar__dot" style="--dot-color:var(--fg-dim)"></span><span class="sidebar__label">#contact</span></a></li>
  </ul>
  <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme">
    <span data-theme-icon></span>
  </button>
</nav>
```

Note: this leaves `<main>` immediately after — no other change to `index.html` in this step. The `experience`/`education` sections stay in `<main>` unchanged, reached by scrolling past `#whoami` (they intentionally don't get their own sidebar entry, matching the 5-icon sidebar mockup the user approved).

- [ ] **Step 2: Remove the old `.topbar*` rules and old `main` rule from `css/style.css`**

Remove this whole block:
```css
/* ---------------------------------------------------------------------------
   Topbar
--------------------------------------------------------------------------- */
.topbar{
  position: sticky; top: 0; z-index: 100;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.topbar__inner{
  max-width: 820px; margin: 0 auto;
  padding: 14px 20px;
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px 24px;
}
.topbar__logo{
  color: var(--accent); font-weight: 700; font-size: 14px;
  white-space: nowrap;
}
.topbar__nav{
  display: flex; flex-wrap: wrap; gap: 8px 16px; flex: 1;
}
.topbar__nav a{
  color: var(--fg-dim); font-size: 13px; white-space: nowrap;
}
.topbar__nav a::before{ content: "#"; margin-right: 3px; color: var(--border); }
.topbar__nav a:hover{ color: var(--fg); text-decoration: none; }

.theme-toggle{
  background: var(--bg-raised); border: 1px solid var(--border);
  color: var(--fg); border-radius: var(--radius);
  width: 30px; height: 30px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 13px;
  flex-shrink: 0;
}
.theme-toggle:hover{ border-color: var(--accent); color: var(--accent); }

/* ---------------------------------------------------------------------------
   Layout
--------------------------------------------------------------------------- */
main{
  max-width: 820px; margin: 0 auto; padding: 40px 20px 20px;
  display: flex; flex-direction: column; gap: 28px;
}
```

Replace it with:
```css
/* ---------------------------------------------------------------------------
   Sidebar
--------------------------------------------------------------------------- */
.sidebar{
  width: var(--sidebar-w);
  flex-shrink: 0;
  position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column; gap: 18px;
  padding: 18px 10px;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(8px);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.sidebar__brand{ color: var(--accent); font-weight: 700; font-size: 14px; text-align: center; }
.sidebar__nav{ list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.sidebar__nav a{
  display: flex; align-items: center; gap: 8px;
  padding: 8px 8px; border-radius: var(--radius);
  color: var(--fg-dim); font-size: 12.5px; white-space: nowrap;
}
.sidebar__nav a:hover, .sidebar__nav a.is-active{ color: var(--fg); background: var(--bg-raised); text-decoration: none; }
.sidebar__nav a.is-active .sidebar__dot{ box-shadow: 0 0 6px var(--dot-color); }
.sidebar__dot{ width: 8px; height: 8px; border-radius: 50%; background: var(--dot-color); flex-shrink: 0; }
.sidebar .theme-toggle{ align-self: center; }

.theme-toggle{
  background: var(--bg-raised); border: 1px solid var(--border);
  color: var(--fg); border-radius: var(--radius);
  width: 30px; height: 30px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 13px;
  flex-shrink: 0;
}
.theme-toggle:hover{ border-color: var(--accent); color: var(--accent); }

/* ---------------------------------------------------------------------------
   Layout
--------------------------------------------------------------------------- */
main{
  flex: 1; min-width: 0;
  max-width: 1180px; margin: 0 auto; padding: 40px 28px 20px;
  display: flex; flex-direction: column; gap: 28px;
}

@media (min-width: 621px) and (max-width: 900px){
  .sidebar{ width: 56px; }
  .sidebar__label{ display: none; }
}

@media (max-width: 620px){
  body{ flex-direction: column; }
  .sidebar{
    position: sticky; top: 0; width: 100%; height: auto;
    flex-direction: row; align-items: center; gap: 10px;
    padding: 10px 14px; overflow-x: auto; overflow-y: visible;
    border-right: none; border-bottom: 1px solid var(--border);
    z-index: 100;
  }
  .sidebar__nav{ flex-direction: row; flex: 1; gap: 14px; }
  .sidebar__brand{ display: none; }
  main{ padding: 24px 16px 20px; }
}
```

- [ ] **Step 3: Update the responsive block at the bottom of `css/style.css`**

Replace:
```css
/* ---------------------------------------------------------------------------
   Responsive
--------------------------------------------------------------------------- */
@media (max-width: 620px){
  .skills-grid, .projects-grid{ grid-template-columns: 1fr; }
  .topbar__nav{ gap: 14px; }
  .topbar__logo{ display: none; }
}
```
with:
```css
/* ---------------------------------------------------------------------------
   Responsive (component-specific breakpoints live with their components;
   this block is only for cross-cutting page-level rules)
--------------------------------------------------------------------------- */
```
(component grids get their own `@media` rules in Tasks 4-6, replacing this catch-all).

- [ ] **Step 4: Add active-section tracking to `js/main.js`**

The theme block at the top of `js/main.js` currently reads:
```js
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
```

Leave that block exactly as-is (the `#themeToggle` id didn't change) and insert this new block immediately after it, still inside the same IIFE:

```js
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
```

- [ ] **Step 5: Verify markup and script syntax**

Run:
```bash
grep -c 'class="sidebar"' index.html
grep -c 'data-section="whoami"' index.html
grep -c "topbar" index.html css/style.css
node --check js/main.js
```
Expected: `1`, `1`, `0` (no remaining `topbar` references anywhere), then no output from `node --check` (exit 0).

- [ ] **Step 6: Manual browser check**

Serve the site (`python -m http.server 4321` from the repo root, per `.claude/launch.json`) and open `http://localhost:4321`:
- Sidebar is visible on the left with 5 links + theme toggle at the bottom.
- Clicking a sidebar link scrolls to the matching section.
- Resize the window under 620px wide: sidebar becomes a horizontal bar at the top.
- Toggle the theme button: colors switch and persist on reload.

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: replace top bar with NOC-style sidebar navigation"
```

---

### Task 4: Skills topology diagram

**Files:**
- Modify: `index.html` (skills `<section>`)
- Modify: `css/style.css` (remove `.skills-grid`/`.skill-card*`, add `.topology*`)
- Modify: `js/main.js` (remove the old skills-grid rendering block, add topology rendering)

**Interfaces:**
- Produces: `computeRadialPositions(count, cx, cy, radius, startAngleDeg)` — pure function, returns `[{x, y}, ...]`. No other task needs to call this, but it must stay a standalone, side-effect-free function so it's unit-testable in isolation.
- Produces: `selectSkillCategory(index)` — called by both the SVG nodes and the mobile fallback list; not consumed by other tasks.
- Consumes: `CONTENT.skills` from Task 1 (array of `{category, items}`).

- [ ] **Step 1: Replace the skills `<section>` in `index.html`**

Replace:
```html
  <section class="window" id="skills">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">skills/</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ ls -la skills/</p>
      <div id="skillsGrid" class="skills-grid"></div>
    </div>
  </section>
```
with:
```html
  <section class="window" id="skills">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">skills/ — topology</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ map skills/ --topology</p>
      <div class="topology">
        <div class="topology__diagram">
          <svg id="topologySvg" viewBox="0 0 460 460" role="img" aria-label="Diagrama de categorias de skills"></svg>
        </div>
        <div class="topology__detail" id="topologyDetail">
          <p class="topology__hint">clique num nó para ver as skills daquela categoria</p>
        </div>
        <ul class="topology__fallback" id="topologyFallback"></ul>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Remove old skills CSS, add topology CSS**

Remove:
```css
/* ---------------------------------------------------------------------------
   Skills
--------------------------------------------------------------------------- */
.skills-grid{
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;
}
.skill-card__title{
  color: var(--accent-2); font-size: 12.5px; margin: 0 0 8px;
}
.skill-card__title::before{ content: "# "; color: var(--fg-dim); }
.skill-card__list{ list-style: none; margin: 0; padding: 0; }
.skill-card__list li{ font-size: 13.5px; padding: 2px 0; }
.skill-card__list li::before{ content: "- "; color: var(--fg-dim); }
```

Add in its place:
```css
/* ---------------------------------------------------------------------------
   Skills — topology diagram
--------------------------------------------------------------------------- */
.topology{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.topology__diagram svg{ width: 100%; height: auto; display: block; }
.topology__detail{ background: var(--bg-raised); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; min-height: 160px; }
.topology__hint{ color: var(--fg-dim); font-size: 13px; margin: 0; }
.topology__detail-title{ color: var(--accent-2); font-size: 13px; margin: 0 0 8px; }
.topology__detail-title::before{ content: "# "; color: var(--fg-dim); }
.topology__detail-list{ list-style: none; margin: 0; padding: 0; }
.topology__detail-list li{ font-size: 13.5px; padding: 2px 0; }
.topology__detail-list li::before{ content: "- "; color: var(--fg-dim); }

.topology-node{ cursor: pointer; }
.topology-node circle{ fill: var(--bg-alt); stroke: var(--accent); stroke-width: 2; transition: stroke .15s ease, fill .15s ease; }
.topology-node.is-center circle{ stroke: var(--accent); fill: var(--bg-raised); }
.topology-node.is-active circle{ stroke: var(--accent-2); fill: color-mix(in srgb, var(--accent-2) 15%, var(--bg-alt)); }
.topology-node text{ fill: var(--fg-dim); font-family: var(--mono); font-size: 12px; text-anchor: middle; }
.topology-node.is-active text{ fill: var(--accent-2); }
.topology-node.is-center text{ fill: var(--fg); }
.topology-link{ stroke: var(--border); stroke-width: 1.5; }

.topology__fallback{ display: none; list-style: none; margin: 0; padding: 0; grid-column: 1 / -1; }
.topology__fallback li{ margin-bottom: 6px; }
.topology__fallback button{
  width: 100%; text-align: left; background: var(--bg-raised); border: 1px solid var(--border);
  color: var(--fg); font-family: var(--mono); font-size: 13px; padding: 8px 10px; border-radius: var(--radius); cursor: pointer;
}
.topology__fallback button.is-active{ border-color: var(--accent-2); color: var(--accent-2); }

@media (max-width: 720px){
  .topology{ grid-template-columns: 1fr; }
  .topology__diagram{ display: none; }
  .topology__fallback{ display: block; }
}
```

- [ ] **Step 3: Replace the skills-rendering block in `js/main.js`**

Remove:
```js
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
```

Replace with:
```js
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
```

- [ ] **Step 4: Unit-test the pure `computeRadialPositions` function**

Run:
```bash
node -e "
function computeRadialPositions(count, cx, cy, radius, startAngleDeg) {
  const positions = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const angleDeg = startAngleDeg + step * i;
    const angleRad = (angleDeg * Math.PI) / 180;
    positions.push({ x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) });
  }
  return positions;
}
const assert = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); };

const four = computeRadialPositions(4, 0, 0, 100, -90);
assert(four.length === 4, 'should return 4 positions for count=4');
assert(Math.abs(four[0].x - 0) < 1e-9 && Math.abs(four[0].y - (-100)) < 1e-9, 'first node at -90deg should be straight up (0,-100), got ' + JSON.stringify(four[0]));

const six = computeRadialPositions(6, 230, 230, 160, -90);
assert(six.length === 6, 'should return 6 positions for count=6');
six.forEach((p) => {
  const dist = Math.sqrt((p.x - 230) ** 2 + (p.y - 230) ** 2);
  assert(Math.abs(dist - 160) < 1e-9, 'every node should sit exactly on the radius, got dist=' + dist);
});

console.log('OK: computeRadialPositions verified');
"
```
Expected: `OK: computeRadialPositions verified` printed, exit code 0.

- [ ] **Step 5: Verify markup/CSS/JS wiring**

Run:
```bash
grep -c 'id="topologySvg"' index.html
grep -c "skills-grid\|skill-card" index.html css/style.css js/main.js
node --check js/main.js
```
Expected: `1`, `0` (no leftover references to the removed skills-grid classes anywhere), then no output from `node --check`.

- [ ] **Step 6: Manual browser check**

With the local server running, open the skills section:
- 6 outer nodes appear around a center "você" node, each labeled below the circle (not overlapping it).
- Clicking a node highlights it (amber ring) and the right-hand panel lists that category's items.
- Keyboard: Tab to a node, press Enter — same effect as a click.
- Resize under 720px: the SVG diagram hides and a vertical list of category buttons appears instead, with the same click behavior.

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: replace static skills grid with clickable topology diagram"
```

---

### Task 5: Project host cards

**Files:**
- Modify: `index.html` (projects `<section>`)
- Modify: `css/style.css` (remove `.projects-grid`/`.project-card*`/`.empty-state`, add `.hosts-grid`/`.host-card*`)
- Modify: `js/main.js` (replace the projects-rendering block)

**Interfaces:**
- Consumes: `CONTENT.projects` from Task 1 (unchanged shape: `name, period, desc, stack, demo?, link?, note?`).
- Produces: nothing consumed by later tasks — self-contained section.

- [ ] **Step 1: Replace the projects `<section>` in `index.html`**

Replace:
```html
  <section class="window" id="projects">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">projects/</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ ls -la projects/ --sort=date</p>
      <div id="projectsGrid" class="projects-grid"></div>
    </div>
  </section>
```
with:
```html
  <section class="window" id="projects">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">projects/ — hosts</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ status hosts/ --all</p>
      <div id="hostsGrid" class="hosts-grid"></div>
    </div>
  </section>
```

- [ ] **Step 2: Remove old projects CSS, add host-card CSS**

Remove:
```css
/* ---------------------------------------------------------------------------
   Projects
--------------------------------------------------------------------------- */
.projects-grid{
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
.project-card{
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  background: var(--bg-raised);
  transition: border-color .15s ease, transform .15s ease;
}
.project-card:hover{ border-color: var(--accent); transform: translateY(-2px); }
.project-card__name{
  margin: 0 0 4px; font-size: 14.5px; color: var(--fg);
}
.project-card__name::before{ content: "> "; color: var(--accent); }
.project-card__period{ color: var(--fg-dim); font-size: 12px; margin: 0 0 8px; }
.project-card__desc{ font-size: 13px; margin: 0 0 10px; color: var(--fg); }
.project-card__stack{
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
}
.project-card__stack span{
  font-size: 11px; color: var(--fg-dim);
  border: 1px solid var(--border); border-radius: 4px; padding: 1px 7px;
}
.project-card__note{ font-size: 12px; color: var(--fg-dim); font-style: italic; margin: 0 0 10px; }
.project-card__links{ display: flex; gap: 16px; flex-wrap: wrap; }
.project-card__link{ font-size: 13px; }
.project-card__link::after{ content: " ->"; }

.empty-state{
  color: var(--fg-dim); font-size: 13.5px; grid-column: 1 / -1;
}
.empty-state::before{ content: "ls: "; }
```

Add:
```css
/* ---------------------------------------------------------------------------
   Projects — host cards
--------------------------------------------------------------------------- */
.hosts-grid{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.host-card{
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  background: var(--bg-raised);
  transition: border-color .15s ease, transform .15s ease;
}
.host-card:hover{ border-color: var(--accent); transform: translateY(-2px); }
.host-card__head{ display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 6px; }
.host-card__name{ margin: 0; font-size: 14px; color: var(--fg); }
.host-card__name::before{ content: "host: "; color: var(--fg-dim); }
.host-card__status{ font-size: 11px; color: var(--fg-dim); display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.host-card__status-dot{ width: 7px; height: 7px; border-radius: 50%; background: var(--ok); display: inline-block; }
.host-card__status.is-source .host-card__status-dot{ background: var(--fg-dim); }
.host-card__period{ color: var(--fg-dim); font-size: 12px; margin: 0 0 8px; }
.host-card__desc{ font-size: 13px; margin: 0 0 10px; color: var(--fg); }
.host-card__stack{ display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.host-card__stack span{
  font-size: 11px; color: var(--fg-dim);
  border: 1px solid var(--border); border-radius: 4px; padding: 1px 7px;
}
.host-card__note{ font-size: 12px; color: var(--fg-dim); font-style: italic; margin: 0 0 10px; }
.host-card__links{ display: flex; gap: 16px; flex-wrap: wrap; }
.host-card__link{ font-size: 13px; }
.host-card__link::after{ content: " ->"; }

.empty-state{ color: var(--fg-dim); font-size: 13.5px; grid-column: 1 / -1; }
.empty-state::before{ content: "ls: "; }

@media (max-width: 720px){
  .hosts-grid{ grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Replace the projects-rendering block in `js/main.js`**

Replace the entire existing block (from `/* ---------- projects ---------- */` down through its closing `}` before the contact block) with:

```js
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
```

- [ ] **Step 4: Verify wiring**

Run:
```bash
grep -c 'id="hostsGrid"' index.html
grep -c "projectsGrid\|project-card\|projects-grid" index.html css/style.css js/main.js
node --check js/main.js
```
Expected: `1`, `0`, then no output from `node --check`.

- [ ] **Step 5: Manual browser check**

Open the projects section:
- Both `ecofuturo` and `chatbot-front` render as cards with an "● online" status (both have real `demo` links).
- Hovering a card lifts it slightly and its border turns teal.
- "live demo" and "source" links open in a new tab.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: restyle project cards as monitoring host tiles"
```

---

### Task 6: Certifications LED wall

**Files:**
- Modify: `index.html` (certifications `<section>`)
- Modify: `css/style.css` (remove `.cert-list*`, add `.led-wall*`/`.led-card*`/`.led-pill*`)
- Modify: `js/main.js` (replace the certifications-rendering block)

**Interfaces:**
- Consumes: `CONTENT.certifications` from Task 1 (`name, issuer, date, featured?`).
- Produces: nothing consumed by later tasks — self-contained section.

- [ ] **Step 1: Replace the certifications `<section>` in `index.html`**

Replace:
```html
  <section class="window" id="certifications">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">certifications/</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ ls -la certifications/</p>
      <ul class="cert-list" id="certList"></ul>
    </div>
  </section>
```
with:
```html
  <section class="window" id="certifications">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">certifications/ — led wall</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ ls -la certifications/ --led</p>
      <div class="led-wall">
        <div class="led-wall__featured" id="certsFeatured"></div>
        <div class="led-wall__regular" id="certsRegular"></div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Remove old certifications CSS, add LED-wall CSS**

Remove:
```css
/* ---------------------------------------------------------------------------
   Certifications
--------------------------------------------------------------------------- */
.cert-list{ list-style: none; margin: 0; padding: 0; }
.cert-list li{
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding: 8px 0; font-size: 13px;
  border-bottom: 1px dashed var(--border);
}
.cert-list li:last-child{ border-bottom: none; }
.cert-list li::before{ content: "*"; color: var(--accent); margin-right: 8px; }
.cert-list li.is-featured{
  background: color-mix(in srgb, var(--accent-2) 8%, transparent);
  border-radius: 6px; padding: 10px 10px; margin: 0 -10px 4px;
  border-bottom: none;
}
.cert-list li.is-featured::before{ color: var(--accent-2); }
.cert-list__name{ flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; }
.cert-list__badge{ font-size: 9.5px; padding: 1px 7px; }
.cert-list__meta{ color: var(--fg-dim); font-size: 12px; white-space: nowrap; }
```

Add:
```css
/* ---------------------------------------------------------------------------
   Certifications — LED wall
--------------------------------------------------------------------------- */
.led-wall__featured{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.led-card{
  display: flex; gap: 10px; align-items: flex-start;
  background: color-mix(in srgb, var(--accent-3) 10%, var(--bg-raised));
  border: 1px solid color-mix(in srgb, var(--accent-3) 45%, var(--border));
  border-radius: var(--radius); padding: 12px 14px;
}
.led-card__dot{ width: 9px; height: 9px; margin-top: 4px; border-radius: 50%; background: var(--accent-3); box-shadow: 0 0 8px var(--accent-3); flex-shrink: 0; }
.led-card__name{ margin: 0 0 4px; font-size: 13px; color: var(--fg); }
.led-card__meta{ margin: 0; font-size: 11.5px; color: var(--fg-dim); }

.led-wall__regular{ display: flex; flex-wrap: wrap; gap: 8px; }
.led-pill{ display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); border-radius: 100px; padding: 5px 12px; font-size: 11.5px; }
.led-pill__dot{ width: 6px; height: 6px; border-radius: 50%; background: var(--fg-dim); flex-shrink: 0; }
.led-pill__name{ color: var(--fg); }
.led-pill__meta{ color: var(--fg-dim); }
.led-pill__meta::before{ content: " · "; }

@media (max-width: 720px){
  .led-wall__featured{ grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Replace the certifications-rendering block in `js/main.js`**

Replace the entire existing block (from `/* ---------- certifications ---------- */` down through its closing `}` before the skills block) with:

```js
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
```

- [ ] **Step 4: Verify wiring**

Run:
```bash
grep -c 'id="certsFeatured"' index.html
grep -c 'id="certsRegular"' index.html
grep -c "certList\|cert-list" index.html css/style.css js/main.js
node --check js/main.js
```
Expected: `1`, `1`, `0`, then no output from `node --check`.

- [ ] **Step 5: Manual browser check**

Open the certifications section:
- 3 larger violet-glow cards (AWS Educate, Conceitos Básicos de Redes, Invenzi W-Access) appear in a row.
- The remaining 9 certifications appear as compact pills below, each with a dim dot and visible issuer/date (not hidden behind hover).
- Under 720px width, the featured row stacks to a single column.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: split certifications into featured LED cards and regular pills"
```

---

### Task 7: Cross-section responsive pass

**Files:**
- Modify: `css/style.css` (experience/education entry styles — confirm they read well against the new palette; add one small breakpoint if needed)

**Interfaces:** none — this task only tunes existing CSS, no markup or JS shape changes.

- [ ] **Step 1: Manual review across breakpoints**

With the local server running, open the site and check at three widths (use the browser's responsive mode or resize the window): 1400px, 800px, 375px.

At each width confirm:
- No horizontal scrollbar appears anywhere on the page.
- Sidebar behaves as specified (full sidebar / icon-rail / top bar per Task 3).
- Skills topology / fallback list switch correctly at 720px (Task 4).
- Host cards grid (Task 5) and LED wall (Task 6) both collapse to a single column under 720px.
- Experience/education entries (unchanged markup from the original site) still have comfortable line lengths and don't collide with the sidebar.

- [ ] **Step 2: Fix any overflow found**

If the experience `.entry__desc`/`.entry__highlights` `max-width: 62ch`/`64ch` rules (in `css/style.css`, "Education" section comment block) cause awkward wrapping at the new 1180px `main` width, tighten them to `58ch` — this is the only anticipated tweak; do not change anything else unless an actual overflow is observed.

- [ ] **Step 3: Verify no horizontal overflow programmatically**

Run:
```bash
node --check js/main.js
node --check js/content.js
```
Expected: no output from either (exit 0) — confirms Task 7 didn't introduce a JS syntax error (it shouldn't touch JS at all).

- [ ] **Step 4: Commit** (only if Step 2 required a change)

```bash
git add css/style.css
git commit -m "style: tune entry text width for the wider content column"
```
If no fix was needed, skip this commit — do not create an empty one.

---

### Task 8: Documentation update and final integration pass

**Files:**
- Modify: `README.md` (replace entire file)

**Interfaces:** none.

- [ ] **Step 1: Replace `README.md`**

```markdown
# leodah20.github.io

Personal portfolio / résumé site. Plain HTML, CSS and JavaScript — no build step,
no framework, served directly by GitHub Pages. Visual concept: a "NOC dashboard" —
a clickable skills topology diagram, project cards styled as monitored hosts, and a
certifications "LED wall".

Live at: https://leodah20.github.io

## Editing content

Almost everything you'll want to change lives in one file:

- [`js/content.js`](js/content.js) — name, hero bio, experience, education, skills,
  certifications, projects, contact links.

Notes on shapes that aren't self-explanatory:

- **Experience with a promotion**: give the entry a `roles` array instead of a flat
  `role`/`period`/`current`, e.g. the Build Engenharia entry — each item is
  `{ title, period, current }`, oldest first. Entries without a promotion just keep
  the flat shape.
- **Certifications**: add `featured: true` to put a certification in the large LED
  card row instead of the compact pill list. Keep this to a handful of entries or
  the "featured" distinction stops meaning anything.
- **Projects**: only set a `demo` link if it's real and reachable — the host card's
  "online" vs "source only" status is derived directly from whether `demo` is set,
  nothing is fabricated.

To add a project, add an entry to the `projects` array:

```js
{
  name: "project-name",
  period: "2026",
  desc: "One or two sentences on what it does and why it matters.",
  stack: ["Python", "NumPy"],
  link: "https://github.com/leodah20/project-name"
}
```

Structure:

```
index.html        page markup (sidebar nav + sections: whoami, experience,
                   education, skills, certifications, projects, contact)
css/style.css      theme tokens (dark/light), sidebar layout, component styles
js/content.js      editable content — start here
js/main.js         rendering + interaction (theme, typing effect, skills
                   topology diagram, host cards, LED wall, sidebar nav)
```

## Running locally

Any static file server works, e.g.:

```
python -m http.server 4321
```

Then open http://localhost:4321.
```

- [ ] **Step 2: Full-site final manual QA**

With the local server running, walk the whole page top to bottom and confirm:
- Hero shows the typed `whoami` effect and the correct current role.
- Experience section shows Build Engenharia with both stacked roles (Estagiário → Analista de Redes Jr., the second marked "atual"), and the other three jobs unchanged.
- Education section unchanged.
- Skills topology diagram works as described in Task 4's manual check.
- Certifications LED wall works as described in Task 6's manual check.
- Projects host cards work as described in Task 5's manual check.
- Contact list unchanged, all links correct.
- Toggle the theme: every section (including the LED wall's violet accent and the topology diagram) stays legible in both themes.
- No `console.error` output in the browser dev tools console on load or after clicking through the diagram/nav.

- [ ] **Step 3: Final full-repo syntax check**

Run:
```bash
node --check js/content.js
node --check js/main.js
grep -rc "topbar\|skills-grid\|skill-card\|projects-grid\|project-card\|cert-list\|certList\|skillsGrid\|projectsGrid" index.html css/style.css js/main.js
```
Expected: no output from the two `node --check` calls, and every `grep -c` result is `0` — confirms no dead selectors/ids from the old design remain anywhere.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README for the NOC-dashboard content shapes"
```

---

## Self-Review

**Spec coverage:**
- Content corrections (role progression, skills additions, certification accuracy/tiers, Linux Unhatched fix) → Task 1.
- Palette "Console Elevado" → Task 2.
- Sidebar nav resolving the wide-screen empty-space complaint → Tasks 2 (bg-grid, wider `main`) + 3 (sidebar).
- Skills topology diagram → Task 4.
- Project host cards → Task 5.
- Certifications LED wall → Task 6.
- Responsive behavior for all new components → Tasks 3, 4, 5, 6 (each owns its own breakpoint) + Task 7 (cross-section pass).
- No fabricated data → enforced explicitly in Task 5 (online/source-only derived from real `demo` presence, no invented uptime/ping).
- Documentation → Task 8.
- No requirement from the design spec was left without an owning task.

**Placeholder scan:** no TBD/TODO markers; every step has literal, complete code.

**Type/interface consistency:** `CONTENT.skills`/`CONTENT.certifications`/`CONTENT.experience`/`CONTENT.projects` shapes are defined once in Task 1 and used with matching field names in Tasks 4-6 (`c.featured`, `p.demo`, `group.category`/`group.items`). Caught during self-review: the first draft of this plan introduced `job.roles` in Task 1's data but never updated the code that reads `job.role`/`job.period`/`job.current` — that would have rendered the Build Engenharia entry as `undefined — Build Engenharia`. Fixed by folding the experience-rendering update and its CSS into Task 1 itself (Steps 2-3), since the data shape and its renderer must land together or the site breaks between commits.

**Scope:** single cohesive redesign of one static site; no sub-project decomposition needed.

---

## Execution Handoff

This plan will be executed by a single remote agent (per the user's request to avoid keeping their local machine on), covering Tasks 1-8 end to end, then opening a pull request against `main` for review — rather than the usual in-session Subagent-Driven or Inline choice, since both of those require this local session to stay alive.
