import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the adaptive engine console", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Opyjo Adaptive Engine \| Canadian Learning Intelligence/i);
  assert.match(html, /Your adaptive engine is healthy/i);
  assert.match(html, /Ontario coverage/i);
  assert.match(html, /All systems operational/i);
});

test("includes curriculum, adaptation, analytics, trust and integration workspaces", async () => {
  const [component, data, css] = await Promise.all([readFile(new URL("../app/AdaptiveHub.tsx", import.meta.url), "utf8"), readFile(new URL("../app/adaptiveData.ts", import.meta.url), "utf8"), readFile(new URL("../app/globals.css", import.meta.url), "utf8")]);
  assert.match(component, /function Curriculum/);
  assert.match(component, /function Sessions/);
  assert.match(component, /function Trust/);
  assert.match(component, /function Api/);
  assert.match(data, /Financial Literacy/);
  assert.match(data, /PREREQUISITE_GAP/);
  assert.match(css, /@media\(max-width:580px\)/);
});
