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
