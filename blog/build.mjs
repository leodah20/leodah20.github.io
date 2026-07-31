#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Static blog builder. Run with: node blog/build.mjs
//
// Reads blog/data/<slug>.json (one per project series) + the chapter Markdown
// files it points to, and emits static HTML pages under blog/<slug>/... —
// no server, no framework, matches the rest of the site (GitHub Pages just
// serves whatever this writes). Re-run after editing/adding any chapter.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown, escapeHtml } from "./_lib/markdown.mjs";

const BLOG_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(BLOG_DIR, "..");
const DATA_DIR = path.join(BLOG_DIR, "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sidebarNav(prefix) {
  const home = `${prefix}index.html`;
  return `<nav class="sidebar" id="sidebar">
  <div class="sidebar__brand">$_</div>
  <ul class="sidebar__nav">
    <li><a href="${home}#whoami"><span class="sidebar__dot" style="--dot-color:var(--accent)"></span><span class="sidebar__label">#whoami</span></a></li>
    <li><a href="${home}#skills"><span class="sidebar__dot" style="--dot-color:var(--accent-2)"></span><span class="sidebar__label">#skills</span></a></li>
    <li><a href="${home}#certifications"><span class="sidebar__dot" style="--dot-color:var(--accent-3)"></span><span class="sidebar__label">#certifications</span></a></li>
    <li><a href="${home}#github-status"><span class="sidebar__dot" style="--dot-color:var(--accent)"></span><span class="sidebar__label">#github</span></a></li>
    <li><a href="${home}#projects"><span class="sidebar__dot" style="--dot-color:var(--ok)"></span><span class="sidebar__label">#projects</span></a></li>
    <li><a href="${prefix}blog/index.html" class="is-active"><span class="sidebar__dot" style="--dot-color:var(--accent-2)"></span><span class="sidebar__label">#blog</span></a></li>
    <li><a href="${home}#contact"><span class="sidebar__dot" style="--dot-color:var(--fg-dim)"></span><span class="sidebar__label">#contact</span></a></li>
  </ul>
  <div class="sidebar__uptime" id="sidebarUptime" title="tempo nesta sessão">00:00</div>
  <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme">
    <span data-theme-icon></span>
  </button>
</nav>`;
}

function pageShell({ title, description, bodyHtml, depth }) {
  const prefix = "../".repeat(depth);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}css/style.css">
<link rel="stylesheet" href="${prefix}css/blog.css">
</head>
<body class="blog-body">
<div class="crt-overlay" aria-hidden="true"></div>
<div class="bg-aurora" aria-hidden="true"></div>
<div class="bg-stars bg-stars--large" id="bgStarsLarge" aria-hidden="true"></div>
<div class="bg-stars bg-stars--medium" id="bgStarsMedium" aria-hidden="true"></div>
<div class="bg-stars bg-stars--small" id="bgStarsSmall" aria-hidden="true"></div>
<div class="bg-grid" aria-hidden="true"></div>
${sidebarNav(prefix)}
<main class="blog-main">
${bodyHtml}
</main>
<footer class="footer">
  <p>$ echo "built by hand, not a template" <span class="caret caret--footer" aria-hidden="true"></span></p>
</footer>
<script src="${prefix}blog/blog.js"></script>
</body>
</html>
`;
}

function chapterNav(series, chapterIndex) {
  const prev = series.chapters[chapterIndex - 1];
  const next = series.chapters[chapterIndex + 1];
  const links = [];
  if (prev && prev.status === "published") {
    links.push(`<a class="article-nav__link article-nav__link--prev" href="../${prev.slug}/">&larr; ${escapeHtml(prev.title)}</a>`);
  }
  if (next && next.status === "published") {
    links.push(`<a class="article-nav__link article-nav__link--next" href="../${next.slug}/">${escapeHtml(next.title)} &rarr;</a>`);
  }
  return links.length ? `<nav class="article-nav">${links.join("")}</nav>` : "";
}

function buildChapterPage(series, chapter, chapterIndex) {
  const mdPath = path.join(DATA_DIR, series.slug, chapter.file);
  const markdown = fs.readFileSync(mdPath, "utf8");
  const { html } = renderMarkdown(markdown);

  const body = `
  <article class="article">
    <p class="article__breadcrumb">
      <a href="../../">#blog</a> / <a href="../">${escapeHtml(series.projectTitle)}</a> / cap. ${chapter.number}
    </p>
    <h1 class="article__title">${escapeHtml(chapter.articleTitle || chapter.title)}</h1>
    <p class="article__subtitle">${escapeHtml(chapter.subtitle)}</p>
    <p class="article__meta">${escapeHtml(String(chapter.readingMinutes))} min de leitura</p>
    <div class="article__body">
${html}
    </div>
    ${chapterNav(series, chapterIndex)}
  </article>`;

  return pageShell({
    title: `${chapter.articleTitle || chapter.title} — ${series.projectTitle}`,
    description: chapter.subtitle,
    bodyHtml: body,
    depth: 3,
  });
}

function buildSeriesPage(series) {
  const items = series.chapters
    .map((c) => {
      if (c.status === "published") {
        return `<li class="series-toc__item series-toc__item--published">
          <a href="${c.slug}/">
            <span class="series-toc__number">${String(c.number).padStart(2, "0")}</span>
            <span class="series-toc__title">${escapeHtml(c.title)}</span>
          </a>
          <p class="series-toc__oneline">${escapeHtml(c.oneLine)}</p>
        </li>`;
      }
      return `<li class="series-toc__item series-toc__item--planned">
        <span class="series-toc__number">${String(c.number).padStart(2, "0")}</span>
        <span class="series-toc__title">${escapeHtml(c.title)}</span>
        <span class="badge series-toc__badge">planejado</span>
        <p class="series-toc__oneline">${escapeHtml(c.oneLine)}</p>
      </li>`;
    })
    .join("\n");

  const body = `
  <section class="series">
    <p class="article__breadcrumb"><a href="../">#blog</a> / ${escapeHtml(series.projectTitle)}</p>
    <h1 class="series__title">${escapeHtml(series.projectTitle)}</h1>
    <p class="series__summary">${escapeHtml(series.seriesSummary)}</p>
    <p class="series__repo-link"><a href="${escapeHtml(series.repoUrl)}" target="_blank" rel="noopener noreferrer">source &rarr;</a></p>
    <ol class="series-toc">
${items}
    </ol>
  </section>`;

  return pageShell({
    title: `${series.projectTitle} — série`,
    description: series.seriesSummary,
    bodyHtml: body,
    depth: 2,
  });
}

function buildBlogIndex(allSeries) {
  const cards = allSeries
    .map((series) => {
      const published = series.chapters.filter((c) => c.status === "published").length;
      return `<article class="host-card series-card">
        <div class="host-card__head">
          <h3 class="host-card__name">${escapeHtml(series.projectTitle)}</h3>
          <span class="host-card__status"><span class="host-card__status-dot"></span>${published} cap. publicado${published === 1 ? "" : "s"}</span>
        </div>
        <p class="host-card__desc">${escapeHtml(series.seriesSummary)}</p>
        <div class="host-card__links">
          <a class="host-card__link" href="${series.slug}/">ler série</a>
          <a class="host-card__link" href="${escapeHtml(series.repoUrl)}" target="_blank" rel="noopener noreferrer">source</a>
        </div>
      </article>`;
    })
    .join("\n");

  const body = `
  <section class="window is-revealed" id="blog-index">
    <div class="window__chrome">
      <span class="dot dot--red"></span><span class="dot dot--yellow"></span><span class="dot dot--green"></span>
      <span class="window__title">blog/ — series</span>
    </div>
    <div class="window__body">
      <p class="line"><span class="prompt">guest@leodah20</span>:<span class="path">~</span>$ ls -la blog/ --series</p>
      <div class="hosts-grid" id="blogSeriesGrid">
${cards}
      </div>
    </div>
  </section>`;

  return pageShell({
    title: "Blog — Leonardo Cordeiro",
    description: "Bastidores reais dos meus projetos: decisões, arquitetura, código e o que deu certo (ou não).",
    bodyHtml: body,
    depth: 1,
  });
}

function main() {
  const manifestFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .sort();

  const allSeries = manifestFiles.map((f) => readJson(path.join(DATA_DIR, f)));

  for (const series of allSeries) {
    const seriesDir = path.join(BLOG_DIR, series.slug);
    fs.mkdirSync(seriesDir, { recursive: true });
    fs.writeFileSync(path.join(seriesDir, "index.html"), buildSeriesPage(series));

    series.chapters.forEach((chapter, idx) => {
      if (chapter.status !== "published") return;
      const chapterDir = path.join(seriesDir, chapter.slug);
      fs.mkdirSync(chapterDir, { recursive: true });
      fs.writeFileSync(path.join(chapterDir, "index.html"), buildChapterPage(series, chapter, idx));
    });

    console.log(`built ${series.slug}: ${series.chapters.filter((c) => c.status === "published").length} chapter(s)`);
  }

  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), buildBlogIndex(allSeries));

  // Also write a small manifest the homepage's #blog section fetches client-side.
  fs.writeFileSync(
    path.join(BLOG_DIR, "data", "index.json"),
    JSON.stringify(
      allSeries.map((s) => ({
        slug: s.slug,
        projectTitle: s.projectTitle,
        seriesSummary: s.seriesSummary,
        repoUrl: s.repoUrl,
        publishedChapters: s.chapters.filter((c) => c.status === "published").length,
        latestChapter: [...s.chapters].reverse().find((c) => c.status === "published") || null,
      })),
      null,
      2
    )
  );

  console.log(`\nblog/ built: ${allSeries.length} series, wrote blog/data/index.json`);
}

main();
