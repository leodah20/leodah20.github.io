// Cloudflare Worker — proxies GitHub's GraphQL contribution calendar so the
// static portfolio can show it without ever exposing a GitHub token in
// client-side code. See ../worker/README.md for deployment steps.
//
// The GitHub REST API (used everywhere else on this site) does not expose
// contribution-calendar data at all — it only exists on the GraphQL API,
// which requires an authenticated request. This Worker holds that token as
// a server-side secret (env.GITHUB_TOKEN) and returns only the public
// calendar data (dates + counts), nothing else, to a locked-down origin.

const GITHUB_USER = "leodah20";
const ALLOWED_ORIGIN = "https://leodah20.github.io";

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "public, max-age=3600"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: "worker_misconfigured" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    let ghResponse;
    try {
      ghResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.GITHUB_TOKEN,
          "Content-Type": "application/json",
          "User-Agent": "leodah20-portfolio-contributions-worker"
        },
        body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USER } })
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "upstream_unreachable" }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    if (!ghResponse.ok) {
      return new Response(JSON.stringify({ error: "upstream_error", status: ghResponse.status }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const data = await ghResponse.json();
    const calendar = data && data.data && data.data.user
      ? data.data.user.contributionsCollection.contributionCalendar
      : null;

    if (!calendar) {
      return new Response(JSON.stringify({ error: "no_data" }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(calendar), {
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
