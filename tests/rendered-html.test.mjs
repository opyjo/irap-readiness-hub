import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete IRAP readiness application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>IRAP Readiness Hub \| Opyjo Adaptive Engine<\/title>/i);
  assert.match(html, /Walk into the meeting with one precise story/);
  assert.match(html, /Adaptive learning infrastructure, built in Canada/);
  assert.match(html, /Command centre/);
  assert.match(html, /Adaptive engine explained/);
  assert.match(html, /Connect your app/);
  assert.match(html, /Owner runbook/);
  assert.match(html, /Founder research/);
  assert.match(html, /Founder pitch toolkit/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("supports shareable workspace URLs and reading navigation", async () => {
  const response = await render("/pitch-toolkit");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Master the Adaptive Engine story/);
  assert.match(html, /Reading preferences/);
  assert.match(html, /Reading progress/);
  assert.match(html, /Founder pitch toolkit/);
});

test("includes business, technical, research and funding workspaces", async () => {
  const [component, data, css, packageJson] = await Promise.all([
    readFile(new URL("../app/PrepHub.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(component, /function BusinessCase/);
  assert.match(component, /function Architecture/);
  assert.match(component, /function Research/);
  assert.match(component, /function Funding/);
  assert.match(component, /localStorage/);
  assert.match(component, /Start meeting mode/);
  assert.match(component, /view === "explainer" && <Explainer/);
  assert.match(component, /view === "integration" && <IntegrationGuide/);
  assert.match(component, /view === "runbook" && <OwnerRunbook/);
  assert.match(component, /view === "founder-research" && <FounderResearch/);
  assert.match(component, /view === "pitch-toolkit" && <PitchToolkit/);
  assert.match(data, /Learner model under sparse data/);
  assert.match(data, /What would IRAP accelerate/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
