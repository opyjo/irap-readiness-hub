"use client";

import { useState } from "react";

function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Code({ children }: { children: string }) { const [copied,setCopied]=useState(false); return <div className="integration-code"><button onClick={async()=>{await navigator.clipboard.writeText(children);setCopied(true);window.setTimeout(()=>setCopied(false),1500);}}>{copied?"Copied":"Copy"}</button><pre><code>{children}</code></pre></div>; }
function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="integration-step" id={`connect-${number}`}><header><i>{number}</i><div><span>Integration step</span><h2>{title}</h2></div></header>{children}</section>; }

const itemPayload=`{
  "itemId": "math-g3-times-001",
  "skill": "mathematics:g3:multiplication",
  "difficulty": 2,
  "difficultySource": "tenant",
  "gradeBand": "grade-3",
  "tags": ["math", "times-tables"],
  "active": true,
  "conceptMappings": []
}`;
const recommendation=`GET /v1/learners/learner_8f21d4c7/next-item
  ?gradeBand=grade-3&sessionGoal=practice
Authorization: Bearer YOUR_API_KEY

{
  "decisionId": "decision-uuid",
  "itemId": "math-g3-times-001",
  "skill": "mathematics:g3:multiplication",
  "reason": "weakest-skill",
  "confidence": 0.33,
  "algorithmVersion": "adaptive-v1"
}`;
const answerEvent=`POST /v1/learners/learner_8f21d4c7/events
Authorization: Bearer YOUR_API_KEY

{
  "idempotencyKey": "attempt-7f1b7ca6",
  "itemId": "math-g3-times-001",
  "correct": true,
  "occurredAt": "2026-07-14T15:00:00.000Z",
  "responseTimeMs": 8200,
  "hintCount": 0,
  "attemptNumber": 1
}`;

export function IntegrationGuide() {
  const checklist=["Client backend can reach /health/ready","Test API key works and remains server-only","Questions synchronize successfully","A new learner receives a grade-appropriate item","Correct and incorrect answers update mastery","Retrying an answer does not count it twice","Progress survives refresh and a later visit","Two learners have separate profiles","Tenant isolation is verified","Missing content, timeouts and invalid keys fail safely"];
  return <>
    <header className="section-header"><div className="eyebrow"><span/>Client onboarding guide</div><h1>How to connect your app to the Adaptive Engine.</h1><p>A practical, plain-language implementation guide for owners of quiz, tutoring, learning, and assessment applications.</p></header>
    <nav className="page-nav" aria-label="On this page"><a href="#connect-overview">Overview</a><a href="#connect-1">Credentials</a><a href="#connect-3">Catalogue</a><a href="#connect-5">Next item</a><a href="#connect-7">Report result</a><a href="#connect-backend">Backend</a><a href="#connect-test">Launch test</a></nav>

    <section className="integration-hero" id="connect-overview"><div><Badge tone="green">The division of responsibility</Badge><h2>Your app presents and grades.<br/>The engine recommends.</h2><p>Your application keeps learner accounts, questions, answer keys, grading, and the user interface. The engine receives private identifiers and learning evidence, then recommends what each learner should practise next.</p></div><div className="integration-flow"><span>Learner</span><b>→</b><span>Your app</span><b>→</b><span>Adaptive Engine</span><i>↘ your question database</i></div></section>
    <section className="content-grid equal integration-boundary"><article className="surface"><div className="surface-heading"><div><span>Stays inside your app</span><h3>Content, identity, and grading</h3></div><Badge tone="gold">Never send</Badge></div><div className="data-chips"><span>names</span><span>email addresses</span><span>birthdates</span><span>question text</span><span>answer choices</span><span>answer keys</span><span>authentication tokens</span></div></article><article className="surface"><div className="surface-heading"><div><span>What the engine needs</span><h3>Only adaptation metadata</h3></div><Badge tone="blue">Send server-side</Badge></div><div className="data-chips"><span>tenant API key</span><span>opaque learner ID</span><span>stable item IDs</span><span>skill and difficulty</span><span>correct / incorrect</span><span>optional timing and hints</span></div></article></section>

    <Step number="1" title="Receive a tenant and API key"><p>The engine operator creates separate test and production tenants and keys. Treat each key like a password: keep it in your backend secret manager, never use a public environment-variable prefix, and never commit it to Git.</p><Code>{`ADAPTIVE_ENGINE_URL=https://adaptive-api.example.ca\nADAPTIVE_ENGINE_API_KEY=your-private-key`}</Code></Step>
    <Step number="2" title="Give every learner a stable private ID"><p>Use the same opaque identifier whenever a learner returns, such as <code>learner_8f21d4c7</code>. Use an internal UUID or one-way derived ID—not a name, email, IP address, or authentication token. A changing ID prevents the engine from remembering progress.</p></Step>
    <Step number="3" title="Prepare your question catalogue"><div className="document-table-wrap"><table><caption>Required item metadata</caption><thead><tr><th>Field</th><th>Meaning</th><th>Example</th></tr></thead><tbody>{[["itemId","Permanent question ID","math-g3-times-001"],["skill","Skill being practised","mathematics:g3:multiplication"],["difficulty","Difficulty from 1 to 5","2"],["gradeBand","Intended grade","grade-3"],["tags","Optional grouping labels","math, times-tables"],["active","May be recommended","true"],["conceptMappings","Optional provincial mapping","Ontario concept code"]].map(r=><tr key={r[0]}>{r.map(c=><td key={c}><code>{c}</code></td>)}</tr>)}</tbody></table></div><Code>{itemPayload}</Code><div className="guidance-callout"><strong>Keep IDs stable:</strong> editing wording or formatting must not change the item ID. Deactivate retired questions instead of reusing their IDs.</div></Step>
    <Step number="4" title="Synchronize the catalogue"><p>Send item metadata from your backend in batches with <code>POST /v1/items/bulk</code>. Repeat synchronization when questions are added, edited, or retired. The full question and correct answer always remain in your database.</p></Step>
    <Step number="5" title="Ask for the next question"><p>When a learner begins or continues an activity, your backend requests an item ID. It then loads that question from your own database and returns it to the learner without exposing the engine API key.</p><Code>{recommendation}</Code><div className="session-goals">{[["diagnostic","Find what the learner currently knows"],["practice","Normal adaptive practice"],["remediation","Concentrate on the weakest eligible skill"],["review","Revisit skills not practised recently"]].map(([goal,body])=><div key={goal}><code>{goal}</code><span>{body}</span></div>)}</div></Step>
    <Step number="6" title="Grade the answer inside your app"><p>Your application verifies the response against its own answer key. The engine does not grade answers and never needs to receive answer choices, the learner’s raw response, or the answer key.</p></Step>
    <Step number="7" title="Report the result"><p>After grading, report correct or incorrect from your backend. The <code>idempotencyKey</code> is a permanent unique receipt for the attempt. Retry a timed-out request with the same key so one answer can never update mastery twice.</p><Code>{answerEvent}</Code></Step>
    <Step number="8" title="Repeat the adaptive loop"><div className="integration-loop">{["Ask the engine for an item ID","Load the question from your database","Show it to the learner","Grade the response in your app","Report correct or incorrect","Ask for the next item ID"].map((x,i)=><div key={x}><i>{i+1}</i><span>{x}</span>{i<5&&<b>→</b>}</div>)}</div><p>The recommendation improves as the engine receives more evidence.</p></Step>
    <Step number="9" title="Display progress when appropriate"><p>Request <code>GET /v1/learners/:learnerId/mastery</code> to retrieve mastery, evidence count, confidence, recent practice, and retention risk. Mastery is an adaptive estimate—not automatically a school grade.</p></Step>

    <div className="guidance-label" id="connect-backend"><span>API</span><div><h2>Keep the engine behind your backend</h2><p>The learner’s browser communicates with your application, never directly with the Adaptive Engine.</p></div></div>
    <section className="surface integration-backend"><Code>{`Browser → POST /api/quiz/next   → Your backend → Adaptive Engine\nBrowser → POST /api/quiz/answer → Your backend → Adaptive Engine\nBrowser → GET  /api/progress    → Your backend → Adaptive Engine`}</Code><div className="content-grid equal"><div><h3><code>/api/quiz/next</code> should</h3><ol><li>Identify the learner</li><li>Call the engine</li><li>Load the recommended question</li><li>Return it without the correct answer</li></ol></div><div><h3><code>/api/quiz/answer</code> should</h3><ol><li>Verify the item was issued</li><li>Grade the response</li><li>Create or retrieve the attempt ID</li><li>Report the result and return feedback</li></ol></div></div></section>

    <div className="guidance-label"><span>!</span><div><h2>Handle failures deliberately</h2><p>Use learner-safe fallbacks and never expose secrets or technical errors.</p></div></div>
    <section className="failure-grid">{[["401","Missing or invalid API key"],["403","Key lacks the required scope"],["404","No active item matches the filters"],["429","Wait and retry with backoff"],["5xx","Show retry state or controlled fallback"],["Timeout","Retry answer reports with the same idempotency key"]].map(([code,body])=><article key={code}><strong>{code}</strong><span>{body}</span></article>)}</section>

    <div className="guidance-label" id="connect-test"><span>✓</span><div><h2>Minimum onboarding test</h2><p>Prove these behaviours in the test environment before a learner-facing launch.</p></div></div>
    <section className="onboarding-checklist">{checklist.map(x=><label key={x}><input type="checkbox"/><i/> <span>{x}</span></label>)}</section>
    <section className="narrative-strip integration-success"><span>Successfully onboarded</span><blockquote>A client is ready when its backend connects securely, its catalogue is synchronized, learners have stable private IDs, the full loop works, retries fail safely, tenant isolation is tested, and operational responsibilities are documented.</blockquote></section>
  </>;
}
