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
  return `<nav class="sidebar" id="sidebar" aria-label="Navegação principal">
  <a class="sidebar__brand" href="${home}"><span aria-hidden="true">$_</span> Leonardo</a>
  <ul class="sidebar__nav">
    <li><a href="${home}#projects"><span class="sidebar__label">Projetos</span></a></li>
    <li><a href="${home}#experience"><span class="sidebar__label">Currículo</span></a></li>
    <li><a href="${home}#skills"><span class="sidebar__label">Tecnologias</span></a></li>
    <li><a href="${home}#certifications" class="nav-detail"><span class="sidebar__label">Certificações</span></a></li>
    <li><a href="${home}#github-status" class="nav-detail"><span class="sidebar__label">GitHub</span></a></li>
    <li><a href="${home}#contact"><span class="sidebar__label">Contato</span></a></li>
    <li><a href="${prefix}blog/" aria-current="true"><span class="sidebar__label">Blog</span></a></li>
  </ul>
  <div class="sidebar__tools"><button class="theme-toggle" id="themeToggle" type="button" hidden>Alterar tema</button>
  <button class="motion-toggle" id="motionToggle" type="button" aria-pressed="false" hidden>Pausar movimento</button></div>
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
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}css/style.css">
<link rel="stylesheet" href="${prefix}css/orbital.css?v=1">
<link rel="stylesheet" href="${prefix}css/blog.css">
</head>
<body class="blog-body">
<a href="#main" class="skip-link">Pular para o conteúdo</a>
<div class="crt-overlay" aria-hidden="true"></div>
<div class="bg-aurora" aria-hidden="true"></div>
<div class="bg-stars bg-stars--large" id="bgStarsLarge" aria-hidden="true"></div>
<div class="bg-stars bg-stars--medium" id="bgStarsMedium" aria-hidden="true"></div>
<div class="bg-stars bg-stars--small" id="bgStarsSmall" aria-hidden="true"></div>
<div class="bg-grid" aria-hidden="true"></div>
${sidebarNav(prefix)}
<main class="blog-main" id="main" tabindex="-1">
${bodyHtml}
</main>
<script src="${prefix}js/shell.js"></script>
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
  links.push(`<a class="article-nav__link" href="../">Voltar à série</a>`);
  if (next && next.status === "published") {
    links.push(`<a class="article-nav__link article-nav__link--next" href="../${next.slug}/">${escapeHtml(next.title)} &rarr;</a>`);
  }
  return `<nav class="article-nav" aria-label="Capítulos da série">${links.join("")}</nav>`;
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
    <p class="article__meta">${chapter.readingMinutes} min de leitura · Parte ${chapter.number} de ${series.chapters.length}</p>
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
        return `<li class="series-toc__item series-toc__item--published">
          <a href="${c.slug}/">
            <span class="series-toc__number">${String(c.number).padStart(2, "0")}</span>
            <span class="series-toc__title">${escapeHtml(c.title)}</span>
          </a>
          <p class="series-toc__oneline">${escapeHtml(c.oneLine)}</p>
        </li>`;
    })
    .join("\n");

  const body = `
  <section class="series">
    <p class="article__breadcrumb"><a href="../">#blog</a> / ${escapeHtml(series.projectTitle)}</p>
    <h1 class="series__title">${escapeHtml(series.projectTitle)}</h1>
    <p class="series__summary">${escapeHtml(series.seriesSummary)}</p>
    <p class="article__meta">Série concluída · ${series.chapters.length} ${series.chapters.length === 1 ? "capítulo" : "capítulos"}</p>
    <p class="series__repo-link"><a href="${escapeHtml(series.repoUrl)}">${escapeHtml(series.repoLabel || "Ver código")}</a></p>
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
      return `<article class="host-card series-card${series.featured ? " host-card--featured" : ""}">
        <div class="host-card__head">
          <h2 class="host-card__name">${escapeHtml(series.projectTitle)}</h2>
          <span class="host-card__status">Série concluída · ${published} ${published === 1 ? "capítulo" : "capítulos"}</span>
        </div>
        <p class="host-card__desc">${escapeHtml(series.seriesSummary)}</p>
        <div class="host-card__links">
          <a class="host-card__link" href="${series.slug}/">Ler série</a>
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
      <h1 class="series__title">Blog de estudos</h1>
      <p class="series__summary blog-index__intro">Séries curtas sobre decisões que tomei nos meus projetos, do código à infraestrutura.</p>
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

  const allSeries = manifestFiles.map((f) => {
    const series = readJson(path.join(DATA_DIR, f));
    if (series.slug !== f.slice(0, -5) || !/^[a-z0-9-]+$/.test(series.slug)
        || !Array.isArray(series.chapters) || series.chapters.length < 1 || series.chapters.length > 3) {
      throw new Error(`Série inválida: ${f}`);
    }
    const seen = new Set();
    for (const [idx, chapter] of series.chapters.entries()) {
      if (chapter.status !== "published" || chapter.number !== idx + 1 || !/^[a-z0-9-]+$/.test(chapter.slug)
          || chapter.file !== chapter.slug + ".md" || seen.has(chapter.slug)
          || !Number.isSafeInteger(chapter.readingMinutes) || chapter.readingMinutes < 1
          || !fs.existsSync(path.join(DATA_DIR, series.slug, chapter.file))) {
        throw new Error(`Capítulo inválido ou sem texto em ${f}: ${idx + 1}`);
      }
      seen.add(chapter.slug);
    }
    return series;
  }).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

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

  // Índice de metadados para consumidores que não precisam do HTML.
  fs.writeFileSync(
    path.join(BLOG_DIR, "data", "index.json"),
    JSON.stringify(
      allSeries.map((s) => ({
        slug: s.slug,
        projectTitle: s.projectTitle,
        seriesSummary: s.seriesSummary,
        repoUrl: s.repoUrl,
        ...(s.repoLabel ? { repoLabel: s.repoLabel } : {}),
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
