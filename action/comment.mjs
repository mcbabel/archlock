// Posts or updates ONE sticky pull-request comment with the archlock diff.
// Uses only the GITHUB_TOKEN of the workflow run and the GitHub REST API; no other services.
// Usage: node comment.mjs <markdown-file>
import { readFileSync } from "node:fs";

const MARKER = "<!-- archlock:diff -->";
const [file] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const pr = process.env.PR_NUMBER;
const api = process.env.GITHUB_API_URL || "https://api.github.com";

function warn(message) {
  // A missing permission (e.g. pull requests from forks) must not fail the build.
  console.log(`::warning title=archlock::${message}`);
}

async function request(method, path, body) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      "user-agent": "archlock-action",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function main() {
  if (!token || !repo || !pr) {
    warn(
      "not a pull request (or no token): skipping the PR comment; the diff is in the job summary.",
    );
    return;
  }
  const body = readFileSync(file, "utf8");
  let existing = null;
  for (let page = 1; page <= 50 && !existing; page++) {
    const comments = await request(
      "GET",
      `/repos/${repo}/issues/${pr}/comments?per_page=100&page=${page}`,
    );
    if (!Array.isArray(comments) || comments.length === 0) break;
    existing = comments.find((c) => typeof c.body === "string" && c.body.includes(MARKER)) ?? null;
  }
  if (existing) {
    await request("PATCH", `/repos/${repo}/issues/comments/${existing.id}`, { body });
    console.log(`archlock: updated PR comment ${existing.html_url}`);
  } else {
    const created = await request("POST", `/repos/${repo}/issues/${pr}/comments`, { body });
    console.log(`archlock: posted PR comment ${created.html_url}`);
  }
}

main().catch((e) => {
  warn(
    `could not post the PR comment (does the workflow have "pull-requests: write"?): ${e.message}`,
  );
});
