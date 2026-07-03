# leodah20.github.io

Personal portfolio / résumé site. Plain HTML, CSS and JavaScript — no build step,
no framework, served directly by GitHub Pages.

Live at: https://leodah20.github.io

## Editing content

Almost everything you'll want to change lives in one file:

- [`js/content.js`](js/content.js) — name, hero bio, skills, projects, contact links.

To add a project, add an entry to the `projects` array in that file:

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
index.html        page markup (sections: whoami, education, skills, projects, contact)
css/style.css     theme tokens (dark/light), layout, components
js/content.js     editable content — start here
js/main.js        rendering + typing effect + theme toggle
```

## Running locally

Any static file server works, e.g.:

```
python -m http.server 4321
```

Then open http://localhost:4321.
