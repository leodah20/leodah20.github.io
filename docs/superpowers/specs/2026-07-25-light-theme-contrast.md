# Light theme — WCAG AA contrast audit

Date: 2026-07-25

## Why

Feedback (from the site owner and a friend reviewing the live site) reported
that the light theme lost the site's visual identity entirely — cards had no
visible outline, the aurora/starfield "cyberspace" effect was imperceptible,
and several text elements were hard to read. The root cause: the light theme
used near-white backgrounds (`--bg-alt: #ffffff`) with a very pale border
(`--border: #d7e2de`) and left `--danger`/`--warn`/`--ok` undefined, silently
falling back to the dark theme's saturated values (`#ff5f56`/`#ffbd2e`/`#3ddc84`)
which have poor contrast on a light background.

## Method

Contrast ratios computed with the standard WCAG 2.1 relative-luminance
formula (`L = 0.2126R + 0.7152G + 0.0722B` on linearized channels,
`contrast = (L1+0.05)/(L2+0.05)`). Targets: **4.5:1** for text (this site's
body text is 15px/normal weight, so it does not qualify for the "large text"
3:1 exception), **3:1** for borders and other non-text UI components
(WCAG 1.4.11).

## Before (failing pairs)

| Pair | Ratio | Needed | Result |
|---|---|---|---|
| `--border` (#d7e2de) vs `--bg-alt` (#ffffff) | 1.33:1 | 3:1 | FAIL |
| `--border` (#d7e2de) vs `--bg` (#eef3f1) | 1.18:1 | 3:1 | FAIL |
| `--accent` (#0d8a7c) vs `--bg-alt` (#ffffff) | 4.25:1 | 4.5:1 | FAIL |
| `--ok` (#3ddc84, inherited from dark) vs `--bg-alt` | 1.78:1 | 3:1 | FAIL |
| `--danger` (#ff5f56, inherited from dark) vs `--bg-alt` | 2.99:1 | 3:1 | FAIL |
| badge text (`--bg`) on `--accent-2` (#b4530a) | 4.48:1 | 4.5:1 | FAIL (borderline) |

## After (this fix)

All pairs actually used across the site verified passing:

| Pair | Ratio |
|---|---|
| `--fg` vs `--bg-alt` / `--bg-raised` / `--bg` | 16.02:1 / 17.25:1 / 11.60:1 |
| `--fg-dim` vs `--bg-alt` / `--bg-raised` | 7.17:1 / 7.71:1 |
| `--border` vs `--bg-alt` / `--bg-raised` / `--bg` | 4.45:1 / 4.79:1 / 3.22:1 |
| `--accent` vs `--bg-alt` / `--bg-raised` | 5.82:1 / 6.26:1 |
| `--accent-2` vs `--bg-alt` | 5.79:1 |
| `--accent-3` vs `--bg-alt` | 7.34:1 |
| `--danger`/`--warn`/`--ok` (status dots) vs `--bg-raised` | 5.41:1 / 5.70:1 / 5.11:1 |
| badge text (`--on-accent`) on `--accent-2` / `--accent-3` | 6.23:1 / 7.90:1 |

Note: `.badge{ color: var(--bg) }` originally reused the page-background
token as badge text color. That happened to work in the dark theme (`--bg`
is the darkest of the three dark surface tokens, giving strong contrast
against a bright badge) but broke in the new light theme, where `--bg` is
now the *darkest* of the light surface tokens (by design, see below) —
using it as light-on-badge text only reached 4.19:1 against `--accent-2`.
Added a dedicated `--on-accent` token instead (`#0c1210` dark /
`#f8fbfb` light) decoupled from the page/card/chrome surface hierarchy, so
badge text contrast doesn't depend on which surface token happens to be
lightest or darkest in a given theme.

## Design change alongside the fix

Rather than just darkening individual colors in place, the light theme's
background hierarchy was restructured to mirror the dark theme's logic: the
page background (`--bg`) is now a distinctly colored, medium-light
cool slate-teal (`#c3d3d3`) rather than a near-white wash, and cards
(`--bg-alt`) sit visibly lighter on top of it as a "raised" surface
(`#eef3f3`), same relationship as dark mode (page darkest, card lighter,
chrome lightest) just inverted in absolute lightness. This is what actually
fixes "everything is just white" — a card and a border can only look
distinct from the page if there's real luminance/color separation between
them, which a near-white-on-white palette can never provide regardless of
how dark you make the text.

The starfield/nebula nebula tint opacity inside cards was also bumped
slightly (10%/9% → 14%/13%) since the deepened accent colors alone were not
quite enough to keep the effect visible against the new lighter (but no
longer near-white) card surface.
