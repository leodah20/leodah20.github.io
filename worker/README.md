# Contribution-calendar Worker

The portfolio's GitHub stats section (languages, activity, repo count) works
with zero backend — it calls GitHub's public REST API directly from the
browser. The one exception is the "quadradinhos" contribution calendar: that
data only exists on GitHub's **GraphQL** API, which requires an authenticated
request. A static site can't hold that secret safely on its own, so this tiny
Cloudflare Worker holds it instead and hands back only the public calendar
data (dates + counts) — never the token itself.

This is the one piece of the site that isn't 100% static. Everything else
(`index.html`, `css/`, `js/`) is unaffected either way.

## What you need

- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
- A GitHub **classic** personal access token with **no scopes checked**
  (contribution data on a public profile doesn't need any — the token just
  needs to prove you're an authenticated GitHub user to unlock the GraphQL
  endpoint). Create one at
  <https://github.com/settings/tokens> → "Generate new token (classic)" →
  give it a name like `portfolio-contributions-readonly`, leave every scope
  checkbox empty, set an expiration you're comfortable with.

**Never paste this token into a chat with anyone, including Claude.** It
only ever goes into Cloudflare's own "secret" storage below.

## Deploy steps

1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** →
   **Create Worker**. Give it any name (e.g. `portfolio-contributions`).
2. Open the new Worker's editor and replace the default code with the
   contents of [`contributions-worker.js`](contributions-worker.js) in this
   folder. Deploy.
3. Go to the Worker's **Settings → Variables and Secrets** → **Add** →
   name it `GITHUB_TOKEN`, type **Secret**, paste the token you generated
   above, save.
4. Copy the Worker's URL — it looks like
   `https://portfolio-contributions.<your-subdomain>.workers.dev`.
5. Open [`js/content.js`](../js/content.js) in the portfolio repo and paste
   that URL into `contributionsWorkerUrl` (it's near the top, already has an
   `EDIT ME` comment above it). Commit and push — the contribution calendar
   turns on automatically once that field is non-empty.

## Verifying it works

Visit the Worker's URL directly in a browser (e.g.
`https://portfolio-contributions.<you>.workers.dev`) — you should get back
JSON like `{"totalContributions": 123, "weeks": [...]}`. If you instead see
`{"error": "worker_misconfigured"}`, the secret wasn't saved correctly; if
you see `{"error": "upstream_error", ...}`, double-check the token wasn't
revoked or mistyped.

The Worker only accepts cross-origin requests from
`https://leodah20.github.io` (see `ALLOWED_ORIGIN` in the code) — that's
deliberate, so nobody else can point their own site at your Worker and burn
your GitHub API quota.
