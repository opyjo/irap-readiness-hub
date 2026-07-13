"use client";

import { useEffect, useMemo, useState } from "react";
import {
  callQuestions,
  navGroups,
  officialSources,
  prepTasks,
  workPackages,
  type TaskStatus,
  type ViewId,
} from "./data";
import { documentCategories, irapDocuments, type IrapDocument } from "./irapDocuments";
import { cad, calculate, defaults, normalize, type EstimateInputs, type ScenarioId } from "./estimates";

const MEETING_AT = new Date("2026-07-16T12:00:00-04:00");
const STATUS_ORDER: TaskStatus[] = ["todo", "progress", "done"];

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const difference = MEETING_AT.getTime() - now.getTime();
  if (difference <= 0) return { days: 0, label: "Meeting time reached" };
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  return { days, label: `${days}d ${hours}h remaining` };
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="section-header">
      <div className="eyebrow"><span />{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Metric({ value, label, tone = "plain" }: { value: string; label: string; tone?: "plain" | "dark" | "gold" }) {
  return (
    <article className={`metric metric-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function PageNav({ items }: { items: Array<[string, string]> }) {
  return <nav className="page-nav" aria-label="On this page">{items.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>;
}

export function PrepHub() {
  const [view, setView] = useState<ViewId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [meetingMode, setMeetingMode] = useState(false);
  const [meetingSlide, setMeetingSlide] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(() =>
    Object.fromEntries(prepTasks.map((task) => [task.id, task.initialStatus])),
  );
  const [notes, setNotes] = useState("");
  const [scenario, setScenario] = useState<ScenarioId>("base");
  const [estimates, setEstimates] = useState<Record<ScenarioId, EstimateInputs>>(defaults);
  const countdown = useCountdown();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedStatuses = window.localStorage.getItem("irap-task-statuses");
      const storedNotes = window.localStorage.getItem("irap-meeting-notes");
      const hash = window.location.hash.replace("#", "") as ViewId;
      const storedEstimates = window.localStorage.getItem("irap-estimates");
      if (storedStatuses) {
        try { setStatuses((current) => ({ ...current, ...JSON.parse(storedStatuses) })); } catch { /* ignore invalid local data */ }
      }
      if (storedNotes) setNotes(storedNotes);
      if (storedEstimates) { try { const saved = JSON.parse(storedEstimates); setScenario(saved.scenario ?? "base"); setEstimates({ ...defaults, ...saved.estimates }); } catch { /* ignore */ } }
      if (navGroups.some((group) => group.items.some((item) => item.id === hash))) setView(hash);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("irap-task-statuses", JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    window.localStorage.setItem("irap-meeting-notes", notes);
  }, [notes]);
  useEffect(() => { window.localStorage.setItem("irap-estimates", JSON.stringify({ scenario, estimates })); }, [scenario, estimates]);

  function navigate(id: ViewId) {
    setView(id);
    setMobileOpen(false);
    setSearch("");
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cycleTask(id: string) {
    setStatuses((current) => {
      const index = STATUS_ORDER.indexOf(current[id] ?? "todo");
      return { ...current, [id]: STATUS_ORDER[(index + 1) % STATUS_ORDER.length]! };
    });
  }

  const completed = prepTasks.filter((task) => statuses[task.id] === "done").length;
  const inProgress = prepTasks.filter((task) => statuses[task.id] === "progress").length;
  const readiness = Math.round(((completed + inProgress * 0.5) / prepTasks.length) * 100);
  const currentLabel = navGroups.flatMap((group) => group.items).find((item) => item.id === view)?.label;
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return navGroups.flatMap((group) => group.items)
      .filter((item) => `${item.label} ${item.id}`.toLowerCase().includes(query));
  }, [search]);

  return (
    <div className="app-shell">
      <button className={cx("nav-scrim", mobileOpen && "visible")} onClick={() => setMobileOpen(false)} aria-label="Close menu" />
      <aside className={cx("sidebar", mobileOpen && "open")}>
        <div className="brand-block">
          <div className="brand-mark">O</div>
          <div><strong>Opyjo</strong><span>IRAP readiness hub</span></div>
        </div>
        <nav aria-label="Application sections">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <button key={item.id} className={cx("nav-item", view === item.id && "active")} onClick={() => navigate(item.id)}>
                  <span>{item.index}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="meeting-pulse"><i /> Meeting with Deepak</div>
          <strong>Thu · Jul 16 · 12:00</strong>
          <span>{countdown.label}</span>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
          <div className="breadcrumb"><span>IRAP /</span> {currentLabel}</div>
          <div className="top-actions">
            <div className="search-wrap">
              <label>
                <span>⌕</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Jump to a section…" aria-label="Search sections" />
              </label>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => <button key={result.id} onClick={() => navigate(result.id)}>{result.label}<span>↗</span></button>)}
                </div>
              )}
            </div>
            <button className="secondary-button" onClick={() => window.print()}>Print brief</button>
            <button className="primary-button" onClick={() => { setMeetingSlide(0); setMeetingMode(true); }}>Start meeting mode</button>
          </div>
        </header>

        <div className="workspace">
          {view === "overview" && <Overview readiness={readiness} completed={completed} navigate={navigate} countdown={countdown} statuses={statuses} cycleTask={cycleTask} />}
          {view === "business" && <BusinessCase />}
          {view === "engine" && <Engine />}
          {view === "architecture" && <Architecture />}
          {view === "research" && <Research />}
          {view === "funding" && <Funding />}
          {view === "estimates" && <Estimates scenario={scenario} setScenario={setScenario} estimates={estimates} setEstimates={setEstimates} />}
          {view === "guidance" && <Guidance />}
          {view === "documents" && <DocumentVault />}
          {view === "call" && <CallRoom notes={notes} setNotes={setNotes} startMeeting={() => setMeetingMode(true)} />}
          {view === "actions" && <ActionCentre statuses={statuses} cycleTask={cycleTask} notes={notes} setNotes={setNotes} />}
        </div>
      </main>

      {meetingMode && (
        <div className="meeting-overlay" role="dialog" aria-modal="true" aria-label="Meeting presentation mode">
          <div className="meeting-toolbar">
            <span>IRAP conversation guide · {meetingSlide + 1} / {callQuestions.length + 1}</span>
            <button onClick={() => setMeetingMode(false)}>Exit</button>
          </div>
          <div className="meeting-stage">
            {meetingSlide === 0 ? (
              <div className="meeting-card opener-card">
                <span className="meeting-kicker">Opening statement</span>
                <h2>We have built the foundation.<br />The R&D question is what comes next.</h2>
                <p>Opyjo operates live learning products and has now built a standalone adaptive-learning service. The service is code-complete and locally validated. We are preparing production deployment and seeking support for the uncertain learner-model, calibration and outcome-measurement work required to turn it into defensible Canadian learning infrastructure.</p>
              </div>
            ) : (
              <div className="meeting-card">
                <span className="meeting-kicker">Likely advisor question</span>
                <h2>{callQuestions[meetingSlide - 1]?.question}</h2>
                <p>{callQuestions[meetingSlide - 1]?.answer}</p>
              </div>
            )}
          </div>
          <div className="meeting-controls">
            <button disabled={meetingSlide === 0} onClick={() => setMeetingSlide((slide) => Math.max(0, slide - 1))}>← Previous</button>
            <div>{Array.from({ length: callQuestions.length + 1 }, (_, index) => <i className={index === meetingSlide ? "active" : ""} key={index} />)}</div>
            <button disabled={meetingSlide === callQuestions.length} onClick={() => setMeetingSlide((slide) => Math.min(callQuestions.length, slide + 1))}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Guidance() {
  const assessment = [
    ["Technical innovation", "Explain the advancement sought, the technical uncertainties, the alternatives tested, and why the outcome cannot be known in advance.", "Strong starting point", "Use the adaptive-engine baseline and WP1-WP4 evidence plan."],
    ["Management capacity", "Show that the team has the experience, roles, decision authority, and time required to execute and commercialize the project.", "Needs completion", "Add management and technical profiles, organization chart, and committed project time."],
    ["Financial capacity", "Demonstrate that the company can sustain operations and pay project costs while reimbursements are processed.", "Needs verified figures", "Complete statements, proof of funds, projections, budget, and cash-flow forecast."],
    ["Likelihood of results", "Use realistic milestones, measurable acceptance criteria, risk controls, and evidence-based stage gates.", "Drafted", "Confirm dates, owners, baselines, thresholds, and data availability."],
    ["Commercialization and market", "Establish a credible buyer, market need, competitive position, path to revenue, and evidence of customer interest.", "Needs primary evidence", "Complete buyer interviews, pricing tests, partner commitments, and cited market sizing."],
    ["Benefits to Canada", "Quantify Canadian employment, innovation capacity, IP, revenue, exports, and wider economic benefits.", "Needs verified targets", "Add defensible three-year Canadian jobs, payroll, revenue, export, and IP figures."],
  ];
  return (
    <>
      <SectionHeader eyebrow="Official programme guidance" title="What NRC IRAP evaluates—and how Opyjo should respond." description="A working interpretation of current NRC guidance for technology-innovation financial support. Official programme language is separated from Opyjo preparation actions so the application remains accurate." />
      <PageNav items={[["guidance-source","Source"],["eligibility","Eligibility"],["assessment","Assessment"],["process","Process"],["standards","Standards"]]} />
      <section className="guidance-source" id="guidance-source">
        <div><span>Official source</span><h2>NRC IRAP financial support for technology innovation</h2><p>Current NRC guidance says minimum eligibility starts the relationship but does not guarantee support. Funding decisions are merit-based, consultative, and subject to available funds.</p></div>
        <a href="https://nrc.canada.ca/en/support-technology-innovation/financial-support-technology-innovation" target="_blank" rel="noreferrer">Open NRC guidance ↗</a>
      </section>

      <div className="guidance-label" id="eligibility"><span>01</span><div><h2>Minimum company eligibility</h2><p>All conditions should be supported by corporate source records.</p></div></div>
      <section className="eligibility-grid">
        {[
          ["Incorporated", "A for-profit corporation operating in Canada."],
          ["Company size", "Up to 500 full-time-equivalent employees."],
          ["Technology mandate", "Developing and commercializing an innovative, technology-driven product or service."],
          ["Canadian benefit", "Ready to create benefits such as Canadian jobs or increased innovation capacity."],
        ].map(([title, body]) => <article key={title}><i>✓</i><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <div className="guidance-callout"><strong>Not eligible under this guidance:</strong> sole proprietorships, partnerships, cooperatives, unlimited liability corporations, and limited liability corporations. Confirm Opyjo’s exact legal status from incorporation records.</div>

      <div className="guidance-label"><span>02</span><div><h2>Information NRC says you need to provide</h2><p>These are explicit items on the official programme page.</p></div></div>
      <section className="required-info">
        {[
          ["CRA business number", "Business Number and relevant programme-account confirmations."],
          ["Business plan", "Company, product, management, market, commercialization, finances, and Canadian growth case."],
          ["Recent financial statements", "Current, internally consistent statements supported by company accounting records."],
          ["Ownership structure", "Shareholders, percentages, control, and parent or subsidiary relationships."],
          ["Management and technical profiles", "Relevant experience, achievements, responsibilities, location, and project commitment."],
        ].map(([title, body], index) => <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{title}</strong><small>{body}</small></p></div>)}
      </section>

      <div className="guidance-label" id="assessment"><span>03</span><div><h2>How a funding project is assessed</h2><p>The application should make each assessment area easy to verify.</p></div></div>
      <section className="assessment-table">
        <div className="assessment-head"><span>Assessment area</span><span>What the case must establish</span><span>Opyjo readiness</span><span>Next evidence</span></div>
        {assessment.map(([area, meaning, status, action]) => <div key={area}><strong>{area}</strong><p>{meaning}</p><Badge tone={status.startsWith("Strong") || status === "Drafted" ? "green" : "gold"}>{status}</Badge><small>{action}</small></div>)}
      </section>

      <section className="content-grid equal guidance-split">
        <article className="surface"><div className="surface-heading"><div><span>Potentially supportable focus</span><h3>R&D and innovation work</h3></div></div><ul className="detail-list"><li>Research and development of innovative technology</li><li>Technical activities that build innovation capacity</li><li>Work that accelerates a technology-driven product toward market</li><li>Canadian project resources and costs accepted in the contribution agreement</li><li>Activities with credible commercialization and Canadian benefit</li></ul><p className="guidance-caution">Exact eligible costs and contribution rates are project-specific. Use only the signed contribution agreement and written advisor guidance as authority.</p></article>
        <article className="surface"><div className="surface-heading"><div><span>Official exclusions</span><h3>What NRC says it does not fund</h3></div></div><ul className="detail-list exclusion-list"><li>Day-to-day operating costs</li><li>Non-technical or purely commercial activities</li><li>Work performed outside Canada</li><li>Research with limited commercialization potential</li></ul><p className="guidance-caution danger">Keep routine hosting, ordinary maintenance, sales, marketing, corporate administration, and unrelated Brightwick work outside the R&D claim unless the agreement explicitly permits a specific cost.</p></article>
      </section>

      <div className="guidance-label" id="process"><span>04</span><div><h2>Relationship and funding process</h2><p>IRAP generally develops the project with the company rather than accepting a cold, fixed grant application.</p></div></div>
      <section className="guidance-timeline">
        {[
          ["1", "Initial contact", "A senior executive contacts NRC IRAP. The contact centre gathers business information and assesses readiness for an advisory conversation."],
          ["2", "Client engagement advisor", "The CEA learns about the business and goals, provides direction, and may refer the company to an industrial technology advisor."],
          ["3", "Industrial technology advisor", "The ITA examines the company, technology, team, innovation potential, project need, and fit for advice, connections, or funding."],
          ["4", "Project development", "If there is a fit, the company and advisor develop the scope, milestones, budget, eligible costs, risks, commercialization case, and proposal evidence."],
          ["5", "Formal assessment", "A complete proposal and requested documentation are assessed. Invitation to propose does not guarantee approval."],
          ["6", "Contribution agreement and claims", "Only approved work and cost treatment should be claimed. Retain payroll, time, invoice, payment, progress, and milestone evidence."],
        ].map(([number, title, body]) => <article key={number}><i>{number}</i><div><h3>{title}</h3><p>{body}</p></div></article>)}
      </section>

      <section className="service-standard" id="standards">
        <div><span>Published service standards</span><h2>Plan liquidity conservatively.</h2><p>After NRC receives a complete proposal and requested documentation, its published funding-decision target varies by contribution size. For payments, NRC states a target of issuing payment within 35 business days after receiving all required documents and a correctly completed claim.</p></div>
        <a href="https://nrc.canada.ca/en/support-technology-innovation/nrc-irap-service-standards" target="_blank" rel="noreferrer">Read service standards ↗</a>
      </section>
      <div className="guidance-disclaimer">This tab is a preparation aid based on public NRC information reviewed July 12, 2026. It is not legal advice, an eligibility decision, or a substitute for instructions from Opyjo’s CEA, ITA, Innovation Portal, or signed contribution agreement.</div>
    </>
  );
}

async function downloadDocument(document: IrapDocument) {
  if (!document.sections) return;
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const height = pdf.internal.pageSize.getHeight();
  let y = 62;
  const addFooter = () => {
    const page = pdf.getNumberOfPages();
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(110, 116, 128);
    pdf.text("Opyjo Inc. | IRAP working document", margin, height - 28);
    pdf.text(String(page), pdf.internal.pageSize.getWidth() - margin, height - 28, { align: "right" });
  };
  const newPage = () => { addFooter(); pdf.addPage(); y = 58; };
  pdf.setFillColor(18, 31, 53); pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 148, "F");
  pdf.setTextColor(218, 159, 57); pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.text(document.category.toUpperCase(), margin, 49);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(23); pdf.text(pdf.splitTextToSize(document.title, width), margin, 82);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(190, 199, 213); pdf.text(`Prepared for NRC IRAP discussion | ${new Date().toLocaleDateString("en-CA")}`, margin, 130);
  y = 185;
  for (const section of document.sections) {
    const body = pdf.splitTextToSize(section.body, width) as string[];
    if (y + 55 > height - 55) newPage();
    pdf.setTextColor(33, 43, 59); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.text(section.heading, margin, y);
    y += 22; pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(76, 85, 99);
    for (const line of body) {
      if (y > height - 55) { newPage(); pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(76, 85, 99); }
      pdf.text(line, margin, y); y += 14.5;
    }
    y += 19;
  }
  addFooter();
  pdf.save(`Opyjo-${document.id}.pdf`);
}

function DocumentVault() {
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<IrapDocument | null>(null);
  const generated = irapDocuments.filter((document) => document.generated);
  const sourceDocuments = irapDocuments.filter((document) => !document.generated);
  async function download(document: IrapDocument) {
    setBusy(document.id);
    try { await downloadDocument(document); } finally { setBusy(null); }
  }
  async function downloadAll() {
    setBusy("all");
    try { for (const document of generated) await downloadDocument(document); } finally { setBusy(null); }
  }
  return (
    <>
      <SectionHeader eyebrow="Document workspace" title="Your IRAP documents, ready to review." description="Read every prepared document in the hub, then download a polished PDF when it is ready. Source records remain clearly separated below." />
      <section className="document-hero">
        <div><span className="document-count">{generated.length}</span><div><h2>Prepared working documents</h2><p>Financial, R&D, and business-context drafts based on the current Opyjo project case.</p></div></div>
        <button className="primary-button" disabled={busy !== null} onClick={downloadAll}>{busy === "all" ? "Preparing PDFs…" : "Download document pack"}</button>
      </section>
      <div className="vault-note"><strong>Before submission:</strong> replace planning language with verified figures, dates, names, source attachments, and advisor-confirmed eligibility. These are working drafts, not official NRC forms.</div>
      <div className="vault-section-title"><div><span>Prepared documents</span><h2>Read and download</h2></div><p>{generated.length} documents</p></div>
      <section className="prepared-grid">
        {generated.map((document) => { const inputs = document.sections?.reduce((total, section) => total + (section.body.match(/\[INPUT\]/g)?.length ?? 0), 0) ?? 0; return <article className="document-card" key={document.id}>
          <div className="document-card-top"><span>{document.category}</span><i>DOC</i></div>
          <h3>{document.title}</h3><p>{document.description}</p>
          <div className="document-status"><span><i className={inputs ? "draft" : "ready"}/>{inputs ? "Needs input" : "Ready to review"}</span><small>{inputs ? `${inputs} fields remaining` : "Draft complete"}</small></div>
          <div className="document-card-actions"><button className="read-button" onClick={() => setPreview(document)}>Read document</button><button className="download-button" disabled={busy !== null} onClick={() => download(document)} aria-label={`Download ${document.title}`}>↓</button></div>
        </article>})}
      </section>
      <div className="vault-section-title source-title"><div><span>Required source records</span><h2>Collect and retain</h2></div><p>{sourceDocuments.length} items</p></div>
      <section className="vault-groups">
        {documentCategories.filter((category) => sourceDocuments.some((document) => document.category === category)).map((category) => {
          const documents = sourceDocuments.filter((document) => document.category === category);
          return <article className="vault-group" key={category}>
            <div className="vault-heading"><div><span>{String(documentCategories.indexOf(category) + 1).padStart(2, "0")}</span><h2>{category}</h2></div><Badge tone="neutral">Source evidence</Badge></div>
            <div className="vault-list">{documents.map((document) => <div key={document.id}>
              <i>FILE</i><div><strong>{document.title}</strong><p>{document.description}</p></div><span className="source-only">Collect original</span>
            </div>)}</div>
          </article>;
        })}
      </section>
      {preview && <div className="reader-overlay" role="dialog" aria-modal="true" aria-label={preview.title} onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
        <article className="document-reader">
          <header><div><span>{preview.category}</span><h2>{preview.title}</h2><p>Opyjo Inc. · IRAP working document</p></div><button onClick={() => setPreview(null)} aria-label="Close document">×</button></header>
          <main>{preview.sections?.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}</main>
          <footer><span>Review the content before using it externally.</span><button disabled={busy !== null} onClick={() => download(preview)}>{busy === preview.id ? "Preparing…" : "Download PDF"}</button></footer>
        </article>
      </div>}
    </>
  );
}

function Overview({ readiness, completed, navigate, countdown, statuses, cycleTask }: {
  readiness: number;
  completed: number;
  navigate: (id: ViewId) => void;
  countdown: { days: number; label: string };
  statuses: Record<string, TaskStatus>;
  cycleTask: (id: string) => void;
}) {
  const nextTask = prepTasks.find((task) => statuses[task.id] !== "done") ?? prepTasks[0]!;
  const readinessAreas = [
    ["Corporate", statuses["corporate-standing"] === "done" ? 100 : 55, "business"],
    ["Financial", 42, "estimates"], ["Technical", 82, "engine"], ["Commercial", 48, "business"],
    ["Evidence", Math.max(35, readiness), "documents"], ["Meeting", Math.min(100, readiness + 12), "call"],
  ] as const;
  return (
    <>
      <SectionHeader eyebrow="Executive command centre" title="Walk into the meeting with one precise story." description="The product case, technical truth, R&D uncertainty and commercial path—organized as a working preparation system rather than a static document." />
      <section className="hero-grid">
        <div className="hero-panel">
          <div className="hero-copy">
            <Badge tone="gold">Meeting brief · July 16</Badge>
            <h2>Adaptive learning infrastructure, built in Canada.</h2>
            <p>Opyjo is productizing a reusable decision engine that helps learning platforms choose the right next item for every learner—without taking custody of question content, answer keys or direct identifiers.</p>
            <div className="hero-actions">
              <button className="light-button" onClick={() => navigate("call")}>Open speaking notes</button>
              <button className="text-button" onClick={() => navigate("engine")}>Explore the product <span>→</span></button>
            </div>
          </div>
          <div className="readiness-dial" style={{ "--progress": `${readiness * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{readiness}%</strong><span>meeting ready</span></div>
          </div>
        </div>
        <div className="meeting-panel">
          <div className="panel-label">Next milestone</div>
          <strong className="countdown-number">{countdown.days}</strong>
          <span className="countdown-label">days to the advisor meeting</span>
          <div className="meeting-details">
            <span>Thu, July 16</span><span>12:00–1:00 PM EDT</span><span>Microsoft Teams</span>
          </div>
        </div>
      </section>

      <section className="next-action">
        <div><span>Next best action</span><h2>{nextTask.title}</h2><p>{nextTask.detail}</p></div>
        <div><small>{nextTask.owner} · {nextTask.due}</small><button onClick={() => navigate("actions")}>Open action centre <span>→</span></button></div>
      </section>

      <section className="readiness-areas">
        <div className="readiness-heading"><div><span>Readiness by area</span><h2>See what is holding the application back.</h2></div><strong>{readiness}% overall</strong></div>
        <div>{readinessAreas.map(([label, value, destination]) => <button key={label} onClick={() => navigate(destination as ViewId)}><span><strong>{label}</strong><small>{value}%</small></span><i><b style={{ width: `${value}%` }} /></i></button>)}</div>
      </section>

      <section className="metrics-grid">
        <Metric value="Built" label="Standalone service code" tone="dark" />
        <Metric value="19" label="Automated tests passing" />
        <Metric value="8" label="Versioned API paths" />
        <Metric value="$35K" label="Initial project envelope to refine" tone="gold" />
      </section>

      <section className="content-grid two-one">
        <article className="surface">
          <div className="surface-heading"><div><span>Truth table</span><h3>What we can say today</h3></div><Badge tone="blue">Updated Jul 12</Badge></div>
          <div className="truth-list">
            <div><i className="truth-built">01</i><div><strong>Built and validated locally</strong><p>Standalone TypeScript service, adaptive policy, database migration, security boundary, API contract, Docker setup and test suites.</p></div></div>
            <div><i className="truth-next">02</i><div><strong>Next operational milestone</strong><p>Provision a managed staging database, deploy the service, synchronize Brightwick metadata and begin shadow-mode comparison.</p></div></div>
            <div><i className="truth-rd">03</i><div><strong>Fundable uncertainty ahead</strong><p>Sparse-data mastery, empirical difficulty, durable learning outcomes and cross-tenant generalization.</p></div></div>
          </div>
        </article>
        <article className="surface focus-surface">
          <div className="surface-heading"><div><span>Readiness</span><h3>{completed}/{prepTasks.length} actions complete</h3></div></div>
          <div className="progress-track"><span style={{ width: `${readiness}%` }} /></div>
          <div className="compact-tasks">
            {prepTasks.slice(0, 4).map((task) => (
              <button key={task.id} onClick={() => cycleTask(task.id)}>
                <i className={`status-dot ${statuses[task.id]}`} />
                <span><strong>{task.title}</strong><small>{task.due}</small></span>
              </button>
            ))}
          </div>
          <button className="full-link" onClick={() => navigate("actions")}>Manage all actions <span>→</span></button>
        </article>
      </section>

      <article className="narrative-strip">
        <span>The one-line story</span>
        <blockquote>“We have built and locally validated the adaptive-service foundation. Brightwick is the first integration. The R&D ahead is proving that the learner model and selection policy create reliable, measurable learning gains across customers.”</blockquote>
      </article>
    </>
  );
}

function BusinessCase() {
  return (
    <>
      <SectionHeader eyebrow="Business model" title="A decision layer for learning products." description="The engine is sold to organizations that already own content and learner relationships but lack the research team, infrastructure and evidence needed to build adaptivity themselves." />
      <section className="business-thesis">
        <div><span>Problem</span><h2>Most practice software gives every learner the same sequence.</h2><p>Building a credible adaptive system requires learner modelling, item calibration, experimentation, privacy engineering and years of outcome data. That is expensive and outside the core competency of most education operators.</p></div>
        <div><span>Product</span><h2>One API answers: “What should this learner practise next?”</h2><p>The customer keeps identity, content and grading. Opyjo receives opaque IDs and outcomes, maintains a skill model and returns an auditable item recommendation.</p></div>
      </section>

      <div className="section-label">Initial customer segments</div>
      <section className="segment-grid">
        {[
          ["01", "EdTech applications", "Fastest wedge", "Existing question bank and traffic; needs personalization without hiring a psychometrics team.", "Usage-based API"],
          ["02", "Tutoring operators", "High pain", "Needs between-session practice and a useful view of learner gaps for instructors.", "Per active learner"],
          ["03", "Schools and boards", "Trust-led", "Needs curriculum mapping, privacy review, evidence and an auditable recommendation trail.", "Annual pilot / licence"],
          ["04", "Professional training", "Expansion", "Certification and compliance programmes with measurable mastery and time-to-competence.", "Enterprise licence"],
        ].map(([number, title, tag, body, model]) => (
          <article className="segment-card" key={number}><span>{number}</span><Badge tone="neutral">{tag}</Badge><h3>{title}</h3><p>{body}</p><strong>{model}</strong></article>
        ))}
      </section>

      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>Value proposition</span><h3>Why a customer chooses Opyjo</h3></div></div>
          <div className="value-list">
            <div><b>01</b><p><strong>Ship personalization faster</strong><span>Integrate an API instead of assembling a new research and platform team.</span></p></div>
            <div><b>02</b><p><strong>Keep content and identity</strong><span>Question text, answer keys and direct learner identity remain with the customer.</span></p></div>
            <div><b>03</b><p><strong>Explain every decision</strong><span>Versioned selection events record the reason and algorithm behind each recommendation.</span></p></div>
            <div><b>04</b><p><strong>Measure actual outcomes</strong><span>Experiment tooling separates learning improvement from engagement theatre.</span></p></div>
          </div>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Commercial model</span><h3>Land with a pilot, expand with evidence</h3></div></div>
          <div className="pricing-ladder">
            <div><span>Design partner</span><strong>Fixed onboarding</strong><small>Catalog mapping, sandbox key, technical support, experiment plan</small></div>
            <div><span>Growth</span><strong>Usage based</strong><small>Recommendations + learning events, with mastery analytics</small></div>
            <div><span>Enterprise</span><strong>Annual contract</strong><small>Service levels, controls, data residency, reporting and support</small></div>
          </div>
          <div className="assumption-box"><strong>Pricing is a hypothesis.</strong><p>Validate willingness to pay through 5–10 design-partner interviews before committing to public tiers.</p></div>
        </article>
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>Commercialization</span><h3>Evidence-driven go-to-market</h3></div><Badge tone="green">Brightwick = tenant 01</Badge></div>
        <div className="roadmap">
          {[
            ["Now", "Internal proof", "Deploy and shadow Brightwick; demonstrate reliability and measurement."],
            ["Next", "Design partners", "Recruit 3–5 EdTech or tutoring operators around a narrowly scoped pilot."],
            ["Then", "Outcome case study", "Publish retention, time-to-mastery and integration evidence."],
            ["Scale", "Repeatable sales", "Standardize onboarding, security review, pricing and customer success."],
          ].map(([time, title, body], index) => <div key={time}><i>{index + 1}</i><span>{time}</span><strong>{title}</strong><p>{body}</p></div>)}
        </div>
      </section>

      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Defensibility</span><h3>The moat compounds with use</h3></div></div><ul className="detail-list"><li>Longitudinal, privacy-preserving behavioural evidence</li><li>Calibrated item and learner-model parameters</li><li>Reproducible learning-outcome experiments</li><li>Integration trust, reliability and explainability</li><li>Curriculum and content-mapping knowledge</li></ul></article>
        <article className="surface"><div className="surface-heading"><div><span>Business KPIs</span><h3>What management should measure</h3></div></div><div className="kpi-table"><div><span>Activation</span><strong>Days to first recommendation</strong></div><div><span>Product</span><strong>Eligible-bank coverage</strong></div><div><span>Outcome</span><strong>Retention / time-to-mastery lift</strong></div><div><span>Commercial</span><strong>Paid conversion + net retention</strong></div><div><span>Operations</span><strong>p95 latency + event success</strong></div></div></article>
      </section>
    </>
  );
}

function Engine() {
  return (
    <>
      <SectionHeader eyebrow="Product mechanics" title="The next answer changes the next decision." description="The engine runs a closed learning loop. Every graded outcome updates one learner’s state, and the very next recommendation responds to that evidence." />
      <section className="loop-diagram">
        {[
          ["01", "Request", "The tenant backend sends an opaque learner ID and eligible scope."],
          ["02", "Select", "The policy chooses a skill, matches difficulty and avoids recent items."],
          ["03", "Teach", "The customer displays and grades its own content."],
          ["04", "Learn", "A correct/incorrect event updates mastery exactly once."],
        ].map(([number, title, body], index) => <div className="loop-step" key={number}><i>{number}</i><strong>{title}</strong><p>{body}</p>{index < 3 && <b>→</b>}</div>)}
      </section>

      <section className="content-grid equal">
        <article className="surface formula-card">
          <div className="surface-heading"><div><span>Learner model · adaptive-v1</span><h3>Difficulty-weighted EWMA</h3></div><Badge tone="blue">Baseline model</Badge></div>
          <code>mastery′ = clamp01(mastery + 0.15 × weight × (outcome − mastery))</code>
          <div className="formula-rules"><p><i>↑</i><span><strong>Hard correct answer</strong> moves mastery upward more.</span></p><p><i>↓</i><span><strong>Easy incorrect answer</strong> moves mastery downward more.</span></p><p><i>0.5</i><span><strong>Cold start</strong> begins neutral until evidence arrives.</span></p></div>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Selection hierarchy</span><h3>How the next skill is chosen</h3></div></div>
          <div className="decision-list">
            <div className="decision-critical"><i>1</i><p><strong>Scaffold after repeated errors</strong><span>Stay on the same skill and prefer a lower-difficulty item, even if recency must be relaxed.</span></p></div>
            <div><i>2</i><p><strong>Target the weakest eligible skill</strong><span>Choose the lowest mastery below the 0.80 working threshold.</span></p></div>
            <div><i>3</i><p><strong>Spiral mastered skills</strong><span>If all eligible skills are strong, review the least recently practised.</span></p></div>
          </div>
        </article>
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>Worked example</span><h3>What happens after Andy misses two division items</h3></div></div>
        <div className="example-timeline">
          <div><span>Before</span><strong>Division mastery · 0.50</strong><p>Neutral starting estimate</p></div><b>→</b><div><span>Miss 01</span><strong>Mastery · 0.41</strong><p>Easy miss carries stronger negative weight</p></div><b>→</b><div><span>Miss 02</span><strong>Mastery · 0.34</strong><p>Consecutive-wrong counter reaches two</p></div><b>→</b><div className="example-highlight"><span>Next decision</span><strong>Easier division item</strong><p>Reason recorded as “scaffold”</p></div>
        </div>
      </section>

      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>What the service receives</span><h3>Minimal learning metadata</h3></div></div><div className="data-chips"><span>tenant key</span><span>opaque learner ID</span><span>item ID</span><span>skill key</span><span>difficulty 1–5</span><span>correct / incorrect</span><span>idempotency key</span></div></article>
        <article className="surface no-data"><div className="surface-heading"><div><span>What stays with the customer</span><h3>Content and identity boundary</h3></div></div><div className="data-chips"><span>learner name</span><span>email</span><span>birthdate</span><span>question text</span><span>choices</span><span>answer key</span><span>media</span></div></article>
      </section>
    </>
  );
}

function Architecture() {
  return (
    <>
      <SectionHeader eyebrow="Technical architecture" title="A small API with a strict trust boundary." description="The product separates customer-owned learning experiences from Opyjo’s reusable learner model. The browser never holds the engine API key and never calls the service directly." />
      <section className="architecture-map">
        <div className="arch-column"><span>Customer environment</span><div className="arch-node client"><small>Browser / learner app</small><strong>Render content<br />Capture answer</strong></div><i>↕</i><div className="arch-node server"><small>Tenant backend</small><strong>Authenticate learner<br />Grade answer<br />Call Opyjo API</strong></div></div>
        <div className="arch-connection"><span>HTTPS</span><b>⇄</b><small>Bearer API key<br />server-side only</small></div>
        <div className="arch-column"><span>Opyjo adaptive platform</span><div className="arch-node api"><small>Fastify API</small><strong>Validate · authorize<br />rate-limit · route</strong></div><i>↓</i><div className="arch-node core"><small>Pure adaptive core</small><strong>Mastery update<br />Selection policy</strong></div><i>↓</i><div className="arch-node db"><small>PostgreSQL</small><strong>Tenant state<br />Append-only events</strong></div></div>
      </section>

      <section className="content-grid equal">
        <article className="surface">
          <div className="surface-heading"><div><span>Request lifecycle</span><h3>One recommendation, end to end</h3></div></div>
          <ol className="numbered-list"><li><b>1</b><p><strong>Authenticate</strong><span>Parse key prefix, load active key, compare SHA-256 hash safely and verify scope.</span></p></li><li><b>2</b><p><strong>Build candidate bank</strong><span>Tenant, active status, optional grade band and caller-supplied skill scope.</span></p></li><li><b>3</b><p><strong>Load evidence</strong><span>Skill state plus recent answer history for this tenant and opaque learner.</span></p></li><li><b>4</b><p><strong>Select deterministically</strong><span>Apply policy and a stable state fingerprint for reproducible tie-breaking.</span></p></li><li><b>5</b><p><strong>Audit and return</strong><span>Write decision ID, item, reason, model version and request context; return safe fields.</span></p></li></ol>
        </article>
        <article className="surface">
          <div className="surface-heading"><div><span>Data model</span><h3>Six operational records</h3></div></div>
          <div className="schema-list"><div><code>tenants</code><span>Customer identity and status</span></div><div><code>api_keys</code><span>Hashed credentials and scopes</span></div><div><code>items</code><span>Metadata—not content</span></div><div><code>learner_skill_state</code><span>Current per-skill estimate</span></div><div><code>answer_events</code><span>Idempotent append-only outcomes</span></div><div><code>selection_events</code><span>Versioned recommendation audit</span></div></div>
        </article>
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>Security and reliability</span><h3>Controls already built—and controls still required</h3></div></div>
        <div className="control-grid">
          <div><Badge tone="green">Implemented</Badge><ul><li>Composite tenant keys and tenant-filtered queries</li><li>Hashed, scoped, revocable bearer keys</li><li>Constant-time API-key hash comparison</li><li>Transactionally idempotent answer events</li><li>Request validation, secure headers and rate limiting</li><li>No browser CORS integration and no answer keys</li></ul></div>
          <div><Badge tone="gold">Production hardening</Badge><ul><li>Managed database, backups and restore drill</li><li>Database least-privilege roles and network restrictions</li><li>Deployment monitoring, latency/error alerts and tracing</li><li>Key rotation workflow and tenant control plane</li><li>Retention, export and deletion procedures</li><li>Independent security and load testing</li></ul></div>
        </div>
        <p className="accuracy-note"><strong>Accuracy correction:</strong> the current database enforces tenant boundaries through composite keys and application queries. PostgreSQL row-level security is a recommended defence-in-depth addition, not a control that should be claimed as already deployed.</p>
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>Integration contract</span><h3>Five server-to-server operations</h3></div><Badge tone="blue">OpenAPI 3.1</Badge></div>
        <div className="endpoint-list"><div><b>POST</b><code>/v1/items/bulk</code><span>Synchronize item metadata</span></div><div><b>GET</b><code>/v1/learners/:id/next-item</code><span>Request a recommendation</span></div><div><b>POST</b><code>/v1/learners/:id/events</code><span>Record a graded outcome</span></div><div><b>GET</b><code>/v1/learners/:id/mastery</code><span>Read the skill profile</span></div><div><b>GET</b><code>/v1/tenants/self/skills/summary</code><span>Read aggregate skill signals</span></div></div>
      </section>
    </>
  );
}

function Research() {
  return (
    <>
      <SectionHeader eyebrow="R&D programme" title="Frame the unknowns, not the software backlog." description="IRAP’s strongest fit is a systematic investigation into learner modelling, calibration and outcomes. Routine hosting, dashboards and API plumbing support the product but are not the central research claim." />
      <section className="research-principles">
        <div><span>Technical uncertainty</span><strong>Reliable inference from sparse, noisy learner evidence</strong></div><div><span>Advancement sought</span><strong>Data-efficient, content-agnostic adaptation with confidence</strong></div><div><span>Systematic investigation</span><strong>Versioned models, controls, experiments and measurable criteria</strong></div>
      </section>
      <section className="work-package-list">
        {workPackages.map((workPackage) => (
          <article key={workPackage.id}>
            <div className="wp-id"><span>{workPackage.id}</span><small>{workPackage.months}</small></div>
            <div className="wp-body"><h3>{workPackage.title}</h3><div className="wp-grid"><p><span>Unknown</span>{workPackage.uncertainty}</p><p><span>Method</span>{workPackage.method}</p><p><span>Evidence</span>{workPackage.evidence}</p><p><span>Deliverable</span>{workPackage.outcome}</p></div></div>
          </article>
        ))}
      </section>
      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Experiment design</span><h3>Adaptive vs. baseline</h3></div></div><ol className="numbered-list"><li><b>1</b><p><strong>Stable assignment</strong><span>Hash tenant experiment and learner ID so groups do not drift.</span></p></li><li><b>2</b><p><strong>Primary outcomes</strong><span>Delayed retention and time-to-mastery, with confidence intervals.</span></p></li><li><b>3</b><p><strong>Guardrails</strong><span>Error streak, completion, latency, bank coverage and support incidents.</span></p></li><li><b>4</b><p><strong>Versioned decision</strong><span>Promote, revise or roll back based on pre-defined evidence.</span></p></li></ol></article>
        <article className="surface"><div className="surface-heading"><div><span>Research evidence</span><h3>What to retain</h3></div></div><ul className="detail-list"><li>Dated hypotheses and technical alternatives</li><li>Algorithm and parameter versions</li><li>Experiment protocols and cohort rules</li><li>Raw pseudonymous outcomes and derived measures</li><li>Unexpected results, failures and design changes</li><li>Engineering time by work package</li><li>Final technical interpretation and decision</li></ul></article>
      </section>
    </>
  );
}

function Funding() {
  return (
    <>
      <SectionHeader eyebrow="Funding case" title="Tie every dollar to a technical milestone." description="NRC IRAP evaluates technical innovation alongside management capacity, commercialization, market potential and Canadian benefit. Minimum eligibility opens the conversation; it does not guarantee funding." />
      <section className="official-banner"><div><Badge tone="green">Official guidance checked · Jul 12, 2026</Badge><h2>Base programme fit is credible, but project eligibility and cost treatment must be confirmed with the advisor.</h2><p>Current NRC guidance says companies must be incorporated, for-profit, operating in Canada, have up to 500 FTEs, develop and commercialize innovative technology, and be ready to create Canadian economic benefits.</p></div><a href={officialSources[0]!.href} target="_blank" rel="noreferrer">Read NRC guidance ↗</a></section>

      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Eligibility evidence</span><h3>What to substantiate</h3></div></div><div className="evidence-list"><div><i className="good">✓</i><p><strong>Canadian incorporated, for-profit SME</strong><span>Corporate profile and active-standing evidence.</span></p></div><div><i className="good">✓</i><p><strong>Technology-driven commercialization</strong><span>Service repository, product brief, customers and go-to-market plan.</span></p></div><div><i className="warn">!</i><p><strong>Management and financial capacity</strong><span>Financial statements, cash plan, staff capacity and delivery history.</span></p></div><div><i className="warn">!</i><p><strong>Canadian benefit</strong><span>Technical jobs, retained IP, export potential and Canadian R&D capability.</span></p></div></div></article>
        <article className="surface"><div className="surface-heading"><div><span>Advisor confirmation</span><h3>Do not present assumptions as rules</h3></div></div><ul className="detail-list"><li>Confirm whether current payroll and employee evidence is sufficient.</li><li>Confirm which proposed salaries, contractor costs and technical tools are eligible.</li><li>Ask about project start timing; avoid incurring costs on the assumption they will be reimbursed.</li><li>Ask whether Youth Employment support fits and how it interacts with other support.</li><li>Confirm reporting, claims and stacking requirements for this specific project.</li></ul></article>
      </section>

      <section className="surface budget-reframe">
        <div className="surface-heading"><div><span>Budget correction</span><h3>Reframe the original $35,000 envelope</h3></div><Badge tone="gold">Draft for advisor review</Badge></div>
        <div className="budget-grid">
          <div><span>Original category</span><strong>Marketing and brand launch</strong><small>$10,000</small><Badge tone="red">Usually commercial—not the R&D core</Badge></div>
          <div><span>Technical project alternative</span><strong>Learner-model and experiment labour</strong><small>Allocate by eligible Canadian technical hours</small><Badge tone="green">Stronger project fit</Badge></div>
          <div><span>Original category</span><strong>Working capital / general operations</strong><small>$2,000</small><Badge tone="red">Routine operating cost</Badge></div>
          <div><span>Technical project alternative</span><strong>Calibration, evaluation and project-specific infrastructure</strong><small>Only as confirmed eligible</small><Badge tone="gold">Confirm treatment</Badge></div>
        </div>
        <p className="accuracy-note">Current official guidance explicitly says NRC IRAP does not fund day-to-day operating costs, non-technical or purely commercial activities, work outside Canada, or research with limited commercialization potential.</p>
      </section>

      <section className="surface">
        <div className="surface-heading"><div><span>Milestone budget logic</span><h3>A stronger way to present the ask</h3></div></div>
        <div className="milestone-table"><div className="table-head"><span>Milestone</span><span>Technical evidence</span><span>Gate</span></div><div><strong>M1 · Model benchmark</strong><span>EWMA vs. confidence-aware candidates on replay data</span><Badge tone="blue">Model selected</Badge></div><div><strong>M2 · Difficulty calibration</strong><span>Prior-vs-observed error and stable recalibration rules</span><Badge tone="blue">Calibration accepted</Badge></div><div><strong>M3 · Live experiment</strong><span>Adaptive-vs-baseline retention and guardrails</span><Badge tone="blue">Outcome decision</Badge></div><div><strong>M4 · External validation</strong><span>Tenant onboarding, isolation, latency and coverage evidence</span><Badge tone="blue">Commercial pilot ready</Badge></div></div>
      </section>

      <div className="source-row">{officialSources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
    </>
  );
}

function Estimates({ scenario, setScenario, estimates, setEstimates }: { scenario: ScenarioId; setScenario: (value: ScenarioId) => void; estimates: Record<ScenarioId, EstimateInputs>; setEstimates: React.Dispatch<React.SetStateAction<Record<ScenarioId, EstimateInputs>>> }) {
  const input = estimates[scenario]; const result = calculate(input);
  const update = (key: keyof EstimateInputs, value: string) => setEstimates((all) => ({ ...all, [scenario]: normalize({ ...all[scenario], [key]: Number(value) }) }));
  const fields: Array<[keyof EstimateInputs, string, string]> = [
    ["leadHours", "Technical lead hours", "hours"], ["developerHours", "R&D developer hours", "hours"], ["specialistHours", "Data/learning specialist hours", "hours"], ["contractorHours", "Specialist contractor hours", "hours"],
    ["contributionRate", "Illustrative contribution", "%"], ["claimDelayMonths", "Claim delay", "months"], ["monthlyBurn", "Non-project monthly burn", "CAD"], ["operatingReserve", "Operating reserve", "CAD"],
    ["annualContract", "Annual contract value", "CAD"], ["year1Tenants", "Year 1 tenants", "tenants"], ["year2Tenants", "Year 2 tenants", "tenants"], ["year3Tenants", "Year 3 tenants", "tenants"], ["exportShare", "Export revenue share", "%"], ["hires", "Incremental Canadian jobs", "jobs"],
  ];
  const groups = [
    ["Labour plan", fields.slice(0,4)], ["Funding and liquidity", fields.slice(4,8)], ["Revenue and benefits", fields.slice(8)],
  ] as const;
  const comparison = (["lean","base","expanded"] as ScenarioId[]).map((id) => ({ id, result: calculate(estimates[id]) }));
  async function exportPdf() {
    await downloadDocument({ id: `estimate-${scenario}`, title: `${scenario[0]!.toUpperCase()+scenario.slice(1)} IRAP planning estimate`, category: "Financial", generated: true, description: "", sections: [
      { heading: "Important status", body: "Planning estimates in Canadian dollars. Potential eligibility and the contribution percentage are illustrative only and require written NRC IRAP confirmation." },
      { heading: "Project cost", body: `Total ${cad(result.total)}; Canadian wages ${cad(result.wages)}; employer cash-cost allowance ${cad(result.payroll)}; contractor ${cad(result.contractor)}; infrastructure and security ${cad(input.infrastructure+input.security)}.` },
      { heading: "Contribution and liquidity", body: `Potentially eligible cost ${cad(result.potentiallyEligible)}; illustrative request at ${input.contributionRate}% ${cad(result.request)}; company share ${cad(result.companyShare)}; estimated minimum working capital ${cad(result.workingCapital)}.` },
      { heading: "Commercial planning", body: `Year 1 ${cad(result.revenue[0]!)}; Year 2 ${cad(result.revenue[1]!)}; Year 3 ${cad(result.revenue[2]!)}; three-year revenue ${cad(result.threeYearRevenue)}; export revenue ${cad(result.exportRevenue)}; incremental Canadian jobs ${input.hires}.` },
    ] });
  }
  return <>
    <SectionHeader eyebrow="Integrated estimate model" title="Model the project, liquidity, and Canadian benefit." description="Editable planning estimates in CAD. Nothing in this model confirms cost eligibility or an NRC IRAP contribution rate." />
    <PageNav items={[["estimate-summary","Summary"],["estimate-assumptions","Assumptions"],["estimate-comparison","Compare"],["estimate-revenue","Revenue"]]} />
    <div className="estimate-toolbar"><div>{(["lean","base","expanded"] as ScenarioId[]).map((id) => <button className={scenario===id?"active":""} key={id} onClick={()=>setScenario(id)}>{id}</button>)}</div><button className="secondary-button" onClick={()=>setEstimates(defaults)}>Reset to planning defaults</button><button className="primary-button" onClick={exportPdf}>Export estimate PDF</button></div>
    <div className="estimate-warning"><strong>Advisor confirmation required.</strong> The model treats all entered project costs as potentially eligible for planning. Replace this treatment with the signed contribution agreement.</div>
    <section className="estimate-metrics" id="estimate-summary"><Metric value={cad(result.total)} label="Total project cost" tone="dark"/><Metric value={cad(result.request)} label={`Illustrative request · ${input.contributionRate}%`} tone="gold"/><Metric value={cad(result.companyShare)} label="Company contribution"/><Metric value={cad(result.workingCapital)} label="Minimum working capital"/></section>
    <section className="estimate-layout" id="estimate-assumptions"><article className="surface"><div className="surface-heading"><div><span>Editable assumptions</span><h3>{scenario[0]!.toUpperCase()+scenario.slice(1)} scenario</h3></div></div><div className="estimate-groups">{groups.map(([title,group], index)=><details key={title} open={index===0}><summary>{title}<span>{group.length} inputs</span></summary><div className="estimate-fields">{group.map(([key,label,suffix])=><label key={key}><span>{label}<small>{suffix}</small></span><input aria-label={label} type="number" min="0" value={input[key]} onChange={(e)=>update(key,e.target.value)}/></label>)}</div></details>)}</div></article>
    <article className="surface sticky-results"><div className="surface-heading"><div><span>Calculated outputs</span><h3>Cost and cash requirement</h3></div></div><div className="estimate-breakdown">{[["Canadian R&D wages",result.wages],["Employer cash-cost allowance",result.payroll],["Specialist contractor",result.contractor],["Infrastructure and security",input.infrastructure+input.security],["Pre-reimbursement exposure",result.preReimbursement]].map(([label,value])=><div key={String(label)}><span>{label}</span><strong>{cad(Number(value))}</strong></div>)}</div><div className="estimate-chart" id="estimate-revenue"><h3>Three-year SaaS revenue</h3>{result.revenue.map((value,index)=><div key={index}><span>Year {index+1}</span><i style={{width:`${Math.max(4,value/Math.max(...result.revenue)*100)}%`}}/><strong>{cad(value)}</strong></div>)}<p>{cad(result.exportRevenue)} projected export revenue · {input.hires} incremental Canadian jobs</p></div></article></section>
    <section className="scenario-comparison surface" id="estimate-comparison"><div className="surface-heading"><div><span>Scenario comparison</span><h3>Understand the trade-offs before choosing.</h3></div></div><div className="comparison-table"><div><span>Metric</span>{comparison.map(({id})=><strong key={id}>{id}</strong>)}</div>{[["Project cost","total"],["Illustrative request","request"],["Working capital","workingCapital"],["Three-year revenue","threeYearRevenue"]].map(([label,key])=><div key={label}><span>{label}</span>{comparison.map(({id,result:row})=><button className={scenario===id?"selected":""} key={id} onClick={()=>setScenario(id)}>{cad(row[key as keyof typeof row] as number)}</button>)}</div>)}</div></section>
    <p className="estimate-source">Wage defaults are Toronto planning benchmarks from Government of Canada Job Bank references recorded in the model plan. Actual payroll, historical revenue, cash, ownership, and customer evidence remain source-record inputs.</p>
  </>;
}

function CallRoom({ notes, setNotes, startMeeting }: { notes: string; setNotes: (value: string) => void; startMeeting: () => void }) {
  return (
    <>
      <SectionHeader eyebrow="Advisor meeting room" title="Answer precisely. Stop before overclaiming." description="Use the short answer first, then let the advisor pull for detail. The strongest story separates what is built, what is operationally next, and what remains genuinely uncertain." />
      <section className="opener">
        <div><span>Recommended opener · ~45 seconds</span><blockquote>“I’m Johnson, founder of Opyjo Consulting in Ontario. We operate learning products and have built the foundation of a standalone adaptive-learning API. The service is code-complete and locally validated; production deployment and Brightwick shadow testing are next. The research challenge is making the learner model reliable from sparse data and proving that adaptation improves retained learning. I’d like to understand whether that R&D programme fits IRAP and how to shape the technical project and evidence.”</blockquote></div>
        <button onClick={startMeeting}>Present conversation guide</button>
      </section>
      <section className="qa-list">
        {callQuestions.map((item, index) => <details key={item.question} open={index < 2}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i>＋</i></summary><p>{item.answer}</p></details>)}
      </section>
      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Questions for the advisor</span><h3>Use the meeting to reduce uncertainty</h3></div></div><ol className="question-list"><li>Does this learner-model and outcome-measurement programme fit the technical project criteria?</li><li>Which labour and project-specific costs should be included or excluded?</li><li>What evidence of management, payroll and financial capacity should we prepare?</li><li>When could an eligible project begin, and what costs must wait for an agreement?</li><li>What milestones would make the project compelling for the current planning cycle?</li><li>Could Youth Employment support apply to a qualifying technical hire?</li></ol></article>
        <article className="surface notes-card"><div className="surface-heading"><div><span>Private notes</span><h3>Capture advice and follow-ups</h3></div><Badge tone="neutral">Saved on this device</Badge></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record terminology Deepak uses, requested documents, eligibility guidance, next steps and promised follow-ups…" /><p>Device-local only. Avoid entering sensitive credentials or learner information.</p></article>
      </section>
    </>
  );
}

function ActionCentre({ statuses, cycleTask, notes, setNotes }: { statuses: Record<string, TaskStatus>; cycleTask: (id: string) => void; notes: string; setNotes: (value: string) => void }) {
  const done = prepTasks.filter((task) => statuses[task.id] === "done").length;
  return (
    <>
      <SectionHeader eyebrow="Execution" title="Turn preparation into evidence." description="Click a status control to move an action from to-do to in progress to complete. Progress and meeting notes are stored privately in this browser." />
      <section className="action-summary"><Metric value={`${done}/${prepTasks.length}`} label="Actions complete" tone="dark" /><Metric value={String(prepTasks.filter((task) => task.priority === "critical" && statuses[task.id] !== "done").length)} label="Critical actions open" tone="gold" /><Metric value="Jul 16" label="Advisor meeting" /><Metric value="Local" label="Private progress storage" /></section>
      <section className="task-board">
        {prepTasks.map((task) => {
          const status = statuses[task.id] ?? "todo";
          return <article key={task.id} className={`task-card priority-${task.priority}`}><button className={`task-status status-${status}`} onClick={() => cycleTask(task.id)} aria-label={`Change status for ${task.title}`}><i />{status === "todo" ? "To do" : status === "progress" ? "In progress" : "Complete"}</button><div className="task-main"><h3>{task.title}</h3><p>{task.detail}</p><div><span>Owner · {task.owner}</span><span>Due · {task.due}</span><Badge tone={task.priority === "critical" ? "red" : task.priority === "high" ? "gold" : "neutral"}>{task.priority}</Badge></div></div></article>;
        })}
      </section>
      <section className="content-grid equal">
        <article className="surface"><div className="surface-heading"><div><span>Document room</span><h3>Evidence pack checklist</h3></div></div><div className="document-list">{[
          ["Corporate profile and active-standing evidence", "Critical"],
          ["One-page R&D project brief", "Draft"],
          ["Adaptive engine architecture and OpenAPI contract", "Ready"],
          ["Automated test and validation summary", "Ready"],
          ["Employment, payroll and role documentation", "In progress"],
          ["Financial capacity and project cash-flow plan", "Prepare"],
          ["Commercialization and customer-discovery plan", "Prepare"],
          ["IP ownership and contractor assignment records", "Review"],
        ].map(([name, state]) => <div key={name}><span>▤</span><p><strong>{name}</strong><small>{state}</small></p></div>)}</div></article>
        <article className="surface notes-card"><div className="surface-heading"><div><span>Working notes</span><h3>One notebook for the call</h3></div><Badge tone="neutral">Auto-saved</Badge></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Meeting notes, questions, document locations, decisions…" /><button className="secondary-button" onClick={() => setNotes("")}>Clear notes</button></article>
      </section>
    </>
  );
}
