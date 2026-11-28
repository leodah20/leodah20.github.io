# leodah20.github.io

Portfólio e currículo de Leonardo Cordeiro Sutil. HTML, CSS e JavaScript
sem framework, hospedados no GitHub Pages. A interface mantém o terminal,
a galáxia e os elementos de monitoramento, com cores orbitais e componentes
adaptados da Runavolt.

Live at: https://leodah20.github.io

## Editing content

Almost everything you'll want to change lives in one file:

- [`js/content.js`](js/content.js) — experiência, formação, tecnologias,
  certificações, projetos concluídos e contato.
- [`index.html`](index.html) — apresentação pessoal e projeto em destaque.

Notes on shapes that aren't self-explanatory:

- **Experience with a promotion**: give the entry a `roles` array instead of a flat
  `role`/`period`/`current`, e.g. the Build Engenharia entry — each item is
  `{ title, period, current }`, oldest first. Entries without a promotion just keep
  the flat shape.
- **Certifications**: add `featured: true` to put a certification in the large LED
  card row instead of the compact pill list. Keep this to a handful of entries or
  the "featured" distinction stops meaning anything.
- **Projetos**: `kind` descreve o recorte entregue. Um estudo concluído não
  implica manutenção ou disponibilidade em produção. O link `demo` é opcional.

To add a project, add an entry to the `projects` array:

```js
{
  name: "project-name",
  period: "2026",
  kind: "Estudo concluído",
  desc: "One or two sentences on what it does and why it matters.",
  stack: ["Python", "NumPy"],
  link: "https://github.com/leodah20/project-name"
}
```

Structure:

```
index.html        page markup (sidebar nav + sections: whoami, experience,
                   education, skills, certifications, projects, contact)
css/style.css      terminal, componentes e gráficos da interface
css/orbital.css    paleta, anéis, contraste, navegação e temas
js/content.js      editable content — start here
js/main.js         topologia, currículo, GitHub e projetos
js/shell.js        preferências e galáxia compartilhadas com o blog
```

## Running locally

Any static file server works, e.g.:

```
python -m http.server 4321
```

Then open http://localhost:4321.

## Blog

Cada série está em `blog/data/<slug>.json`, com um a três capítulos em
Markdown e sem cartões de rascunho no índice público. Depois de editar:

```
node blog/build.mjs
node --test blog/blog.test.mjs
```

O gerador atualiza o HTML, o índice e a navegação entre capítulos. O GitHub
Actions verifica que o HTML versionado corresponde ao conteúdo publicado.

## GitHub live status section

The "github-status" section has two data sources:

- Summary stats, language breakdown, and recent activity are fetched live
  from GitHub's public REST API client-side — no token, no backend, just
  `fetch()`. If it fails (rate limit, offline) it shows an error message
  instead of breaking the page.
- The contribution-calendar heatmap needs GitHub's **GraphQL** API instead,
  which requires an authenticated request that can't be made safely from
  client-side code. [`.github/workflows/update-contributions.yml`](.github/workflows/update-contributions.yml)
  runs on a schedule (every 6 hours) plus on every push to `main`, using the
  repo's own automatic `GITHUB_TOKEN` (no secret to manage), and commits the
  result to [`data/contributions.json`](data/contributions.json). The site
  just fetches that file — same static-site model as everything else, no
  external service, no account to create.
