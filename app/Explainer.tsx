"use client";

import { useState } from "react";

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="section-header">
      <div className="eyebrow"><span />{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function PageNav({ items }: { items: Array<[string, string]> }) {
  return <nav className="page-nav" aria-label="On this page">{items.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>;
}

const LOOP_MERMAID = `sequenceDiagram
    autonumber
    participant L as Learner
    participant A as Learning App
    participant E as Adaptive Engine
    participant D as PostgreSQL

    A->>E: What should learner-123 practise next?
    E->>D: Read learner progress and eligible items
    D-->>E: Progress and item metadata
    E->>D: Record why an item was selected
    E-->>A: Recommend item question-102
    A->>A: Load the full question from the app's database
    A->>L: Show question-102
    L-->>A: Submit an answer
    A->>A: Grade the answer
    A->>E: question-102 was incorrect
    E->>D: Save the attempt and update fractions mastery
    E-->>A: Return the updated mastery`;

export function Explainer() {
  const [copied, setCopied] = useState(false);
  const storyTurns: Array<[string, string, string, string]> = [
    ["app", "Maths app → Engine", "“Which question ID should Mia receive next?”", "The app only sends Mia’s opaque learner ID."],
    ["engine", "Engine → Maths app", "“Question 102.”", "The engine knows only labels: fractions, difficulty 3."],
    ["app", "Maths app → Mia", "Shows the medium fractions question.", "The full question comes from the app’s own database."],
    ["learner", "Mia → Maths app", "Answers the question.", "The app grades it locally. Her answer was incorrect."],
    ["app", "Maths app → Engine", "“Mia answered Question 102 incorrectly.”", "Just the outcome—no question text, no answer key."],
    ["engine", "Engine", "Lowers its estimate of Mia’s fractions mastery.", "Next time it may recommend the easier Question 101."],
  ];
  const loopSteps: Array<[string, string, string]> = [
    ["app", "App → Engine", "“What should learner-123 practise next?”"],
    ["engine", "Engine → Database", "Reads the learner’s progress and the eligible items."],
    ["engine", "Engine → Database", "Records why a particular item was selected."],
    ["engine", "Engine → App", "Recommends item question-102 with the reason."],
    ["app", "App", "Loads the full question from its own database."],
    ["app", "App → Learner", "Shows question-102 on screen."],
    ["learner", "Learner → App", "Submits an answer."],
    ["app", "App", "Grades the answer itself. The answer key never leaves the app."],
    ["app", "App → Engine", "“question-102 was incorrect.”"],
    ["engine", "Engine → Database", "Saves the attempt and updates fractions mastery."],
    ["engine", "Engine → App", "Returns the updated mastery estimate."],
  ];
  const glossary: Array<[string, string]> = [
    ["Tenant", "One organization or app with its own private space in the engine"],
    ["API key", "The secret password a tenant’s backend uses to call the engine"],
    ["Item", "One question or exercise, known to the engine only by its labels"],
    ["Metadata", "The small labels about a question—never the question itself"],
    ["Mastery", "The engine’s 0-to-1 estimate of how strong a learner is at a skill"],
    ["Skill", "One thing being learned, such as mathematics:fractions"],
    ["Scaffold", "Choosing an easier question after repeated wrong answers"],
    ["Spiral review", "Revisiting an older, strong skill so it is not forgotten"],
    ["Idempotency key", "A receipt number that stops one answer being counted twice"],
    ["Migration", "A recorded, repeatable update to the database’s structure"],
  ];
  const faqs: Array<[string, string]> = [
    ["Does the engine know who Mia is?", "No. It only sees an opaque learner ID such as learner-123. Her name, email, and account live in the learning app. The engine never stores learner names or email addresses."],
    ["Can the engine work for subjects other than maths?", "Yes. It never reads question content, so any subject works as long as items are labelled with a skill and a difficulty from 1 to 5."],
    ["What happens on a learner’s very first question?", "Every skill starts at a neutral mastery of 0.5 because the engine does not know the learner yet. It begins with a middle-difficulty item and adjusts as evidence arrives."],
    ["Can two companies see each other’s data?", "No. Every important database record includes a tenant_id, and every request is limited to the tenant that owns the API key it was sent with."],
    ["Why not just pick random questions?", "Random practice wastes attempts on skills the learner already knows and can frustrate a struggling learner. The engine spends each attempt where it helps most—and records the reason for every choice."],
    ["What if the engine is down?", "The learning app still works. It simply falls back to its own default question order until the engine is reachable again. The engine is an adviser, not a dependency for showing questions."],
  ];
  return (
    <>
      <SectionHeader eyebrow="Zero-jargon guide" title="The adaptive engine, explained simply." description="This walkthrough assumes no knowledge of adaptive learning, APIs, Docker, or databases. It is the same system as the technical tabs—told as a plain story." />
      <PageNav items={[["mia-story","The story"],["participants","Participants"],["tenant-key","Tenants & keys"],["setup","Setup"],["practise-loop","The loop"],["mastery","Mastery"],["choosing","Choosing items"],["db-tools","Data & tools"],["explainer-faq","FAQ"]]} />

      <section className="plain-explainer explainer-section">
        <div><Badge tone="green">The entire idea in one sentence</Badge><h2>A small service that learns what each learner should practise next.</h2><p>The Adaptive Engine learns which skills a learner is strong or weak at and recommends what they should practise next. It is the brain that chooses the next exercise—it is not the screen where the learner sees or answers the exercise.</p></div>
        <aside><span>Keep this straight</span><strong>The engine decides.<br />The app displays.</strong><small>The learning app owns the questions, answers, grading, and learner identity. The engine only owns the decision about what comes next.</small></aside>
      </section>

      <section className="surface explainer-section" id="mia-story">
        <div className="surface-heading"><div><span>A simple story</span><h3>Mia and the maths app</h3></div><Badge tone="blue">One complete round</Badge></div>
        <div className="story-catalog">
          <div><span>The maths app owns the real questions</span><div className="data-chips"><span>101 · easy fractions</span><span>102 · medium fractions</span><span>103 · hard fractions</span><span>201 · easy multiplication</span></div></div>
          <div><span>The engine only knows small labels</span><pre>{`Question 101 → fractions → difficulty 1
Question 102 → fractions → difficulty 3
Question 103 → fractions → difficulty 5
Question 201 → multiplication → difficulty 1`}</pre></div>
        </div>
        <div className="story-exchange">
          {storyTurns.map(([actor, speaker, text, note], index) => <div key={index}><b className={`story-actor actor-${actor}`}>{speaker}</b><p><strong>{text}</strong><small>{note}</small></p></div>)}
        </div>
        <div className="simple-loop-note"><span>↺</span><p><strong>That repeating process is the adaptive-learning loop.</strong> Every answer teaches the engine a little more about Mia, so each recommendation is better informed than the last.</p></div>
      </section>

      <div className="guidance-label explainer-section" id="participants"><span>01</span><div><h2>The four participants</h2><p>Learner ↔ learning app ↔ Adaptive Engine ↔ PostgreSQL. The learner never talks to the engine directly.</p></div></div>
      <section className="eligibility-grid">
        {[
          ["L", "The learner", "The person practising, such as Mia. She only ever sees and uses the learning app."],
          ["A", "The learning app", "Brightwick or another product. It stores the questions and answers, displays them, decides whether an answer is correct, and talks to the engine from its backend server."],
          ["E", "The Adaptive Engine", "Receives question metadata and correct/incorrect results, estimates mastery for each learner and skill, and recommends the ID of the next question."],
          ["D", "PostgreSQL", "The engine’s memory. If the engine restarts, PostgreSQL still remembers the tenants, question metadata, learner progress, answers, and recommendations."],
        ].map(([letter, title, body]) => <article key={title}><i>{letter}</i><h3>{title}</h3><p>{body}</p></article>)}
      </section>

      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>What the engine does</span><h3>A specialist adviser behind the scenes</h3></div></div><ul className="detail-list"><li>Receives question metadata—IDs, skills, and difficulty labels</li><li>Receives correct/incorrect results after the app grades an answer</li><li>Estimates mastery for each learner and skill</li><li>Recommends the ID of the next question, with a recorded reason</li></ul></article>
        <article className="surface no-data"><div className="surface-heading"><div><span>What the engine never does</span><h3>These stay with the learning app</h3></div></div><div className="data-chips"><span>learner UI</span><span>question text</span><span>images</span><span>answer choices</span><span>answer keys</span><span>grading</span><span>learner names</span><span>email addresses</span></div><p className="explainer-note">The engine does not replace the learning app. It advises it.</p></article>
      </section>

      <div className="guidance-label explainer-section" id="tenant-key"><span>02</span><div><h2>Tenants and API keys</h2><p>Two words that make one engine safe for many companies to share.</p></div></div>
      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>Why a tenant is needed</span><h3>Think of an apartment building</h3></div></div>
          <div className="tenant-building">
            <header>One Adaptive Engine <small>the entire building</small></header>
            {[["Brightwick tenant", "its items and learners"], ["Company B tenant", "its items and learners"], ["Training App tenant", "its items and learners"]].map(([name, note]) => <div key={name}><i>⌂</i><strong>{name}</strong><span>{note}</span></div>)}
          </div>
          <p className="explainer-note">A tenant is one organization or application using the engine. Each apartment’s belongings are that tenant’s data. Every important database record includes a <code>tenant_id</code>—that is how the engine knows which tenant owns it.</p>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Why an API key is needed</span><h3>A secret password for the tenant’s backend</h3></div></div>
          <ol className="numbered-list">
            <li><b>1</b><p><strong>Who is calling?</strong><span>The key identifies which application is making the request.</span></p></li>
            <li><b>2</b><p><strong>Which tenant’s data may they use?</strong><span>The key belongs to exactly one tenant’s private space.</span></p></li>
            <li><b>3</b><p><strong>What are they allowed to do?</strong><span>Each key carries permissions, and it can be revoked at any time.</span></p></li>
          </ol>
          <div className="guidance-callout"><strong>Keep it server-side:</strong> the API key must stay on the backend server and never be placed in public browser or mobile-app code. It is not Mia’s password—Mia never needs to see it.</div>
        </article>
      </section>

      <div className="guidance-label explainer-section" id="setup"><span>03</span><div><h2>What must happen before recommendations work</h2><p>The engine cannot recommend from an empty question bank. Three things come first.</p></div></div>
      <section className="guidance-timeline explainer-setup">
        {[
          ["1", "Create a tenant and API key", "This gives the learning app its private space in the engine and the secret key its backend will use."],
          ["2", "Send item metadata to the engine", "An item means a question or exercise. The app sends only labels—ID, skill, difficulty, grade band. The actual question stays in the learning app."],
          ["3", "Use the practise loop", "The app asks for a recommendation, shows and grades the question, and reports the result. It repeats this for every attempt."],
        ].map(([number, title, body]) => <article key={number}><i>{number}</i><div><h3>{title}</h3><p>{body}</p></div></article>)}
      </section>
      <section className="surface explainer-code-panel">
        <div className="surface-heading"><div><span>Item metadata example</span><h3>Everything the engine ever learns about a question</h3></div><Badge tone="blue">Step 2 payload</Badge></div>
        <pre><code>{`{
  "itemId": "question-102",
  "skill": "mathematics:fractions",
  "difficulty": 3,
  "gradeBand": "grade-4"
}`}</code></pre>
      </section>

      <div className="guidance-label explainer-section" id="practise-loop"><span>04</span><div><h2>The complete practise loop</h2><p>One recommendation and one answer, from start to finish. Notice the learner talks only to the learning app.</p></div></div>
      <section className="surface">
        <div className="explainer-loop">
          {loopSteps.map(([actor, speaker, text], index) => <div key={index}><i>{String(index + 1).padStart(2, "0")}</i><b className={`story-actor actor-${actor}`}>{speaker}</b><p>{text}</p></div>)}
        </div>
        <div className="simple-loop-note"><span>↺</span><p><strong>Then it repeats.</strong> The next request already uses the updated mastery, so the loop gets smarter with every answer.</p></div>
      </section>

      <div className="guidance-label explainer-section" id="mastery"><span>05</span><div><h2>How the engine represents learning</h2><p>For each learner and skill, the engine keeps one number between 0 and 1.</p></div></div>
      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>The mastery score</span><h3>0 is weak, 1 is strong, 0.5 is “don’t know yet”</h3></div></div>
          <div className="mastery-scale"><div><span>0.0<small>weak</small></span><span>0.5<small>starting point</small></span><span>1.0<small>strong</small></span></div></div>
          <ul className="detail-list">
            <li>A new skill starts at 0.5 because the engine does not know the learner yet</li>
            <li>A correct answer moves mastery upward; an incorrect answer moves it downward</li>
            <li>The question’s difficulty affects how large the movement is</li>
            <li>More attempts give the engine more evidence about the learner</li>
          </ul>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Example movement</span><h3>Exact numbers depend on difficulty</h3></div></div>
          <div className="kpi-table">
            <div><span>Starting fractions mastery</span><strong>0.50</strong></div>
            <div><span>After a correct answer</span><strong>Higher than 0.50</strong></div>
            <div><span>After a later incorrect answer</span><strong>Lower than the previous score</strong></div>
          </div>
          <div className="guidance-callout"><strong>An estimate, not a grade:</strong> mastery is used for recommendations. It is not a school grade or a percentage shown to the learner unless the learning app chooses to present it.</div>
        </article>
      </section>

      <div className="guidance-label explainer-section" id="choosing"><span>06</span><div><h2>How the next item is chosen</h2><p>The engine follows a priority order, and every choice records its reason.</p></div></div>
      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>Priority order</span><h3>Support first, then weakness, then review</h3></div></div>
          <div className="decision-list">
            <div className="decision-critical"><i>1</i><p><strong>Struggling repeatedly? Scaffold.</strong><span>After two or more wrong answers in a row, stay on that skill and choose something easier.</span></p></div>
            <div><i>2</i><p><strong>Otherwise, target the weakest skill.</strong><span>Practise the skill that needs the most help—any skill below the mastery target.</span></p></div>
            <div><i>3</i><p><strong>All skills strong? Spiral review.</strong><span>Revisit a skill that has not been practised recently so it is not forgotten.</span></p></div>
            <div><i>4</i><p><strong>Nothing ideal available? Fall back.</strong><span>Avoid very recent items when fresher choices exist; otherwise relax preferences and choose the best available item.</span></p></div>
          </div>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>A concrete example</span><h3>Mia’s progress today</h3></div></div>
          <div className="document-table-wrap explainer-table"><table><caption>Mia’s mastery by skill</caption><thead><tr><th scope="col">Skill</th><th scope="col">Mastery</th><th scope="col">Meaning</th></tr></thead><tbody>
            <tr><td>Fractions</td><td>0.35</td><td>Needs practice</td></tr>
            <tr><td>Multiplication</td><td>0.78</td><td>Doing fairly well</td></tr>
            <tr><td>Addition</td><td>0.90</td><td>Strong</td></tr>
          </tbody></table></div>
          <p className="explainer-note">The engine normally prioritizes fractions because it is Mia’s weakest skill. If she gets two fractions questions wrong in a row, it stays on fractions but looks for an easier one. Once her skills are strong, it occasionally revisits something she has not practised recently.</p>
        </article>
      </section>

      <div className="guidance-label explainer-section" id="db-tools"><span>07</span><div><h2>The data and the tools around it</h2><p>What the database tables mean, and what Docker, PostgreSQL, and DBeaver each do.</p></div></div>
      <section className="surface">
        <div className="surface-heading"><div><span>What the database tables mean</span><h3>The tables you can see in DBeaver</h3></div></div>
        <div className="document-table-wrap explainer-table"><table><caption>Database tables in plain language</caption><thead><tr><th scope="col">Table</th><th scope="col">Simple meaning</th></tr></thead><tbody>
          {[
            ["tenants", "The organizations or apps using the engine"],
            ["api_keys", "The tenants’ protected access keys; only secure hashes are stored"],
            ["items", "Question IDs and learning labels, not full question content"],
            ["learner_skill_state", "The latest mastery estimate for each learner and skill"],
            ["answer_events", "A history of reported correct/incorrect attempts"],
            ["selection_events", "A history of what the engine recommended and why"],
            ["schema_migrations", "A checklist of database-structure updates already installed"],
          ].map(([table, meaning]) => <tr key={table}><td><code>{table}</code></td><td>{meaning}</td></tr>)}
        </tbody></table></div>
        <p className="explainer-note">The first two migrations created these tables, but most stay empty until a tenant is created and the learning app starts sending items and attempts.</p>
      </section>
      <section className="eligibility-grid explainer-tools">
        {[
          ["🐳", "Docker Desktop", "Runs containers on your Mac, including the local PostgreSQL container."],
          ["🗄", "PostgreSQL", "The actual database. It keeps remembering even when other tools are closed."],
          ["🔍", "DBeaver", "Only a visual window for a human to inspect the data. Closing DBeaver does not stop PostgreSQL."],
          ["⚙", "Adaptive Engine", "The service containing the recommendation logic. It reads and writes the learning data."],
        ].map(([icon, title, body]) => <article key={title}><i>{icon}</i><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Local development</span><h3>On your Mac</h3></div><Badge tone="blue">Today</Badge></div><p className="env-line">Adaptive Engine → PostgreSQL in Docker on your Mac</p><p className="explainer-note">The application code is identical in both environments. The <code>DATABASE_URL</code> setting tells it which database to use.</p></article>
        <article className="surface"><div className="surface-heading"><div><span>Production</span><h3>In the cloud</h3></div><Badge tone="gold">Next milestone</Badge></div><p className="env-line">Adaptive Engine → managed PostgreSQL on Supabase</p><p className="explainer-note">Same code, different <code>DATABASE_URL</code>. Nothing about the engine’s logic changes when it moves.</p></article>
      </section>

      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>Safe retries</span><h3>Why answers need an idempotency key</h3></div></div>
          <p className="explainer-note">Sometimes a network request is retried. Without protection, the engine could count one answer twice. Every answer attempt therefore includes a unique <code>idempotencyKey</code>—normally the learning app’s own attempt ID. If the exact request is retried, the engine recognizes it and returns the original result instead of updating mastery twice.</p>
          <div className="guidance-callout"><strong>Think of a receipt number:</strong> the same receipt cannot be charged twice.</div>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Graceful failure</span><h3>What happens when something is unavailable</h3></div></div>
          <ul className="detail-list">
            <li>No valid API key: the request is rejected</li>
            <li>No items have been sent: the engine cannot recommend anything</li>
            <li>No item matches the requested filters: it reports that no eligible item was found</li>
            <li>The same answer request is retried: it is safely replayed, not double-counted</li>
            <li>PostgreSQL is unavailable: the engine cannot remember or calculate state, so its readiness check fails</li>
          </ul>
        </article>
      </section>

      <div className="guidance-label explainer-section" id="explainer-faq"><span>08</span><div><h2>Words and questions</h2><p>A one-line glossary and the questions people usually ask next.</p></div></div>
      <section className="surface">
        <div className="surface-heading"><div><span>Words you will meet</span><h3>One plain line each</h3></div></div>
        <div className="document-table-wrap explainer-table"><table><caption>Glossary of engine terms</caption><thead><tr><th scope="col">Word</th><th scope="col">Plain meaning</th></tr></thead><tbody>
          {glossary.map(([word, meaning]) => <tr key={word}><td><strong>{word}</strong></td><td>{meaning}</td></tr>)}
        </tbody></table></div>
      </section>
      <section className="qa-list explainer-qa">
        {faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><i>＋</i></summary><p>{answer}</p></details>)}
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>The shortest possible summary</span><h3>Seven steps, endlessly repeated</h3></div></div>
        <ol className="numbered-list">
          {[
            ["Create a tenant and its secret API key", "The learning app gets its private space in the engine."],
            ["Tell the engine which item IDs exist and what skills they teach", "Metadata only—the questions stay home."],
            ["Ask the engine for the next item ID for a learner", "One request from the app’s backend."],
            ["The learning app displays and grades that item", "Content, identity, and grading never leave the app."],
            ["Tell the engine whether the answer was correct", "One small outcome event with a receipt number."],
            ["The engine updates mastery and improves its next recommendation", "Every attempt becomes evidence."],
            ["Repeat", "The loop compounds: more evidence, better decisions."],
          ].map(([title, note], index) => <li key={title}><b>{index + 1}</b><p><strong>{title}</strong><span>{note}</span></p></li>)}
        </ol>
      </section>

      <section className="mermaid-panel surface" id="explainer-mermaid"><div className="surface-heading"><div><span>Portable diagram source</span><h3>The practise loop as a Mermaid sequence diagram</h3></div><button className="secondary-button" onClick={async () => { await navigator.clipboard.writeText(LOOP_MERMAID); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied" : "Copy Mermaid"}</button></div><p>Paste this into Mermaid Live, GitHub, Notion, or a compatible presentation workflow.</p><pre><code>{LOOP_MERMAID}</code></pre></section>

      <article className="narrative-strip">
        <span>The last word</span>
        <blockquote>“The learning app owns the learning experience and content. The Adaptive Engine only supplies the memory and decision-making needed to personalize the next step.”</blockquote>
      </article>
    </>
  );
}
