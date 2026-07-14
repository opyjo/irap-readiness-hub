"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Explainer } from "./Explainer";
import { IntegrationGuide } from "./IntegrationGuide";
import { OwnerRunbook } from "./OwnerRunbook";
import { FounderResearch } from "./FounderResearch";
import { PitchToolkit } from "./PitchToolkit";
import { cad, calculate, defaults, normalize, type EstimateInputs, type ScenarioId } from "./estimates";
import { defaultAssumptions, type Assumption, type AssumptionStatus } from "./assumptions";

const MEETING_AT = new Date("2026-07-16T12:00:00-04:00");
const STATUS_ORDER: TaskStatus[] = ["todo", "progress", "done"];
type Theme = "light" | "dark";
type DocumentStage = "planning" | "review" | "verified" | "ready";
type CustomAction = { id: string; title: string; detail: string; owner: string; due: string; status: TaskStatus };

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

function DocumentBody({ body }: { body: string }) {
  const lines = body.split("\n").filter((line) => line.trim());
  const tableLines = lines.filter((line) => line.includes("|"));
  if (tableLines.length >= 2) {
    const firstTable = lines.findIndex((line) => line.includes("|"));
    const lastTable = lines.reduce((last, line, index) => line.includes("|") ? index : last, firstTable);
    const rows = lines.slice(firstTable, lastTable + 1).map((line) => line.split("|").map((cell) => cell.trim().replace(/\.$/, "")));
    return <div className="document-content">{firstTable > 0 && <p>{lines.slice(0, firstTable).join(" ")}</p>}<div className="document-table-wrap"><table><caption>Structured planning schedule</caption><thead><tr>{rows[0]!.map((cell, index) => <th scope="col" key={index}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>{lastTable < lines.length - 1 && <p>{lines.slice(lastTable + 1).join(" ")}</p>}</div>;
  }
  return <div className="document-content">{body.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function assumptionValue(assumptions: Assumption[], id: string) { return assumptions.find((item) => item.id === id)?.value ?? "0"; }
function documentsWithAssumptions(assumptions: Assumption[]) {
  const format = (id: string) => Number(assumptionValue(assumptions, id)).toLocaleString("en-CA");
  const replacements: Array<[RegExp,string]> = [
    [/158,000 planning estimate/g, `${format("project-cost")} planning estimate`], [/79,000 illustrative estimate/g, `${format("irap-request")} illustrative estimate`], [/79,000 planning estimate/g, `${format("company-share")} planning estimate`],
    [/1,220,500 base-case estimate/g, `${format("revenue-3y")} base-case estimate`], [/427,175 base-case estimate/g, `${format("export-revenue")} base-case estimate`], [/2 planned/g, `${format("canadian-jobs")} planned`], [/5 planned/g, `${format("design-partners")} planned`], [/95 planning threshold/g, `${format("coverage")} planning threshold`], [/250/g, format("latency")], [/30 planning threshold/g, `${format("conversion")} planning threshold`],
  ];
  return irapDocuments.map((document) => ({ ...document, sections: document.sections?.map((section) => ({ ...section, body: replacements.reduce((body,[pattern,value]) => body.replace(pattern,value), section.body) })) }));
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
  const [theme, setTheme] = useState<Theme>("light");
  const [commandOpen, setCommandOpen] = useState(false);
  const [assumptions, setAssumptions] = useState<Assumption[]>(defaultAssumptions);
  const [documentStages, setDocumentStages] = useState<Record<string, DocumentStage>>({});
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const countdown = useCountdown();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedStatuses = window.localStorage.getItem("irap-task-statuses");
      const storedNotes = window.localStorage.getItem("irap-meeting-notes");
      const hash = window.location.hash.replace("#", "") as ViewId;
      const storedEstimates = window.localStorage.getItem("irap-estimates");
      const storedWorkspace = window.localStorage.getItem("irap-workspace-v2");
      if (storedStatuses) {
        try { setStatuses((current) => ({ ...current, ...JSON.parse(storedStatuses) })); } catch { /* ignore invalid local data */ }
      }
      if (storedNotes) setNotes(storedNotes);
      if (storedEstimates) { try { const saved = JSON.parse(storedEstimates); setScenario(saved.scenario ?? "base"); setEstimates({ ...defaults, ...saved.estimates }); } catch { /* ignore */ } }
      if (storedWorkspace) { try { const saved = JSON.parse(storedWorkspace); setTheme(saved.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")); setAssumptions(saved.assumptions ?? defaultAssumptions); setDocumentStages(saved.documentStages ?? {}); setCustomActions(saved.customActions ?? []); } catch { /* ignore */ } } else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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
  useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem("irap-workspace-v2", JSON.stringify({ theme, assumptions, documentStages, customActions })); }, [theme, assumptions, documentStages, customActions]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen((open) => !open); } if (event.key === "Escape") setCommandOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

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
    const sections = navGroups.flatMap((group) => group.items).filter((item) => `${item.label} ${item.id}`.toLowerCase().includes(query)).map((item) => ({ id: item.id, label: item.label, kind: "Workspace" }));
    const documents = irapDocuments.filter((document) => `${document.title} ${document.description} ${document.sections?.map((section) => `${section.heading} ${section.body}`).join(" ")}`.toLowerCase().includes(query)).slice(0,5).map((document) => ({ id: "documents" as ViewId, label: document.title, kind: "Document" }));
    const tasks = [...prepTasks, ...customActions].filter((task) => `${task.title} ${task.detail}`.toLowerCase().includes(query)).slice(0,4).map((task) => ({ id: "actions" as ViewId, label: task.title, kind: "Action" }));
    return [...sections, ...documents, ...tasks].slice(0,10);
  }, [search, customActions]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-workspace">Skip to main content</a>
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
                  {searchResults.map((result, index) => <button key={`${result.id}-${index}`} onClick={() => navigate(result.id)}><span><small>{result.kind}</small>{result.label}</span><b>↗</b></button>)}
                </div>
              )}
            </div>
            <button className="icon-button" onClick={() => setCommandOpen(true)} aria-label="Open command palette">⌘K</button>
            <button className="icon-button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? "◐" : "☀"}</button>
            <button className="secondary-button" onClick={() => window.print()}>Print brief</button>
            <button className="primary-button" onClick={() => { setMeetingSlide(0); setMeetingMode(true); }}>Start meeting mode</button>
          </div>
        </header>

        <div className="workspace" id="main-workspace" data-view={view} key={view} tabIndex={-1}>
          {view === "overview" && <Overview readiness={readiness} completed={completed} navigate={navigate} countdown={countdown} statuses={statuses} cycleTask={cycleTask} />}
          {view === "business" && <BusinessCase />}
          {view === "founder-research" && <FounderResearch />}
          {view === "pitch-toolkit" && <PitchToolkit />}
          {view === "engine" && <Engine />}
          {view === "explainer" && <Explainer />}
          {view === "integration" && <IntegrationGuide />}
          {view === "runbook" && <OwnerRunbook />}
          {view === "architecture" && <Architecture />}
          {view === "research" && <Research />}
          {view === "funding" && <Funding />}
          {view === "estimates" && <Estimates scenario={scenario} setScenario={setScenario} estimates={estimates} setEstimates={setEstimates} />}
          {view === "assumptions" && <AssumptionsRegister assumptions={assumptions} setAssumptions={setAssumptions} />}
          {view === "guidance" && <Guidance />}
          {view === "documents" && <DocumentVault assumptions={assumptions} setAssumptions={setAssumptions} stages={documentStages} setStages={setDocumentStages} />}
          {view === "call" && <CallRoom notes={notes} setNotes={setNotes} startMeeting={() => setMeetingMode(true)} addAction={(action) => setCustomActions((current) => [...current, { ...action, id: crypto.randomUUID(), status: "todo" }])} />}
          {view === "actions" && <ActionCentre statuses={statuses} cycleTask={cycleTask} notes={notes} setNotes={setNotes} customActions={customActions} setCustomActions={setCustomActions} />}
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
      {commandOpen && <CommandPalette search={search} setSearch={setSearch} results={searchResults} navigate={(id) => { navigate(id); setCommandOpen(false); }} close={() => setCommandOpen(false)} theme={theme} setTheme={setTheme} assumptions={assumptions} setAssumptions={setAssumptions} estimates={estimates} setEstimates={setEstimates} scenario={scenario} setScenario={setScenario} statuses={statuses} setStatuses={setStatuses} notes={notes} setNotes={setNotes} documentStages={documentStages} setDocumentStages={setDocumentStages} customActions={customActions} setCustomActions={setCustomActions} />}
    </div>
  );
}

function CommandPalette(props: { search: string; setSearch: (value:string)=>void; results: Array<{id:ViewId;label:string;kind:string}>; navigate:(id:ViewId)=>void; close:()=>void; theme:Theme; setTheme:(theme:Theme)=>void; assumptions:Assumption[]; setAssumptions:React.Dispatch<React.SetStateAction<Assumption[]>>; estimates:Record<ScenarioId,EstimateInputs>; setEstimates:React.Dispatch<React.SetStateAction<Record<ScenarioId,EstimateInputs>>>; scenario:ScenarioId; setScenario:(value:ScenarioId)=>void; statuses:Record<string,TaskStatus>; setStatuses:React.Dispatch<React.SetStateAction<Record<string,TaskStatus>>>; notes:string; setNotes:(value:string)=>void; documentStages:Record<string,DocumentStage>; setDocumentStages:React.Dispatch<React.SetStateAction<Record<string,DocumentStage>>>; customActions:CustomAction[]; setCustomActions:React.Dispatch<React.SetStateAction<CustomAction[]>> }) {
  const paletteRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const onKey=(event:KeyboardEvent)=>{ if(event.key!=="Tab"||!paletteRef.current)return; const focusable=Array.from(paletteRef.current.querySelectorAll<HTMLElement>('button,input,[tabindex]:not([tabindex="-1"])')).filter((item)=>!item.hasAttribute("disabled")); if(!focusable.length)return; const first=focusable[0]!,last=focusable[focusable.length-1]!; if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();} }; window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey); },[]);
  const downloadText=(name:string,text:string,type="text/csv")=>{const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=name;anchor.click();URL.revokeObjectURL(url);};
  const exportData = () => { const blob = new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),theme:props.theme,assumptions:props.assumptions,estimates:props.estimates,scenario:props.scenario,statuses:props.statuses,notes:props.notes,documentStages:props.documentStages,customActions:props.customActions},null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download="opyjo-irap-workspace.json"; anchor.click(); URL.revokeObjectURL(url); };
  const importData = (file:File) => { const reader=new FileReader(); reader.onload=()=>{ try { const data=JSON.parse(String(reader.result)); if(data.assumptions) props.setAssumptions(data.assumptions); if(data.estimates) props.setEstimates(data.estimates); if(data.scenario) props.setScenario(data.scenario); if(data.statuses) props.setStatuses(data.statuses); if(typeof data.notes==="string") props.setNotes(data.notes); if(data.documentStages) props.setDocumentStages(data.documentStages); if(data.customActions) props.setCustomActions(data.customActions); if(data.theme) props.setTheme(data.theme); props.close(); } catch { window.alert("This backup file could not be read."); } }; reader.readAsText(file); };
  const clearData=()=>{if(!window.confirm("Clear all locally saved IRAP workspace data? Export a backup first if you may need it."))return; props.setAssumptions(defaultAssumptions);props.setEstimates(defaults);props.setScenario("base");props.setStatuses(Object.fromEntries(prepTasks.map((task)=>[task.id,task.initialStatus])));props.setNotes("");props.setDocumentStages({});props.setCustomActions([]);props.close();};
  const assumptionsCsv=["Label,Category,Value,Unit,Status,Source,Source date,Owner,Notes",...props.assumptions.map((item)=>[item.label,item.category,item.value,item.unit,item.status,item.source,item.sourceDate,item.owner,item.notes].map((value)=>`"${String(value).replaceAll('"','""')}"`).join(","))].join("\n");
  const actionsCsv=[["Title","Detail","Owner","Due","Status"],...prepTasks.map((item)=>[item.title,item.detail,item.owner,item.due,props.statuses[item.id]??item.initialStatus]),...props.customActions.map((item)=>[item.title,item.detail,item.owner,item.due,item.status])].map((row)=>row.map((value)=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
  return <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event)=>{if(event.target===event.currentTarget)props.close();}}><div className="command-palette" ref={paletteRef}><header><span>⌕</span><input autoFocus value={props.search} onChange={(event)=>props.setSearch(event.target.value)} placeholder="Search workspaces, documents, actions…"/><kbd>esc</kbd></header><main>{props.search ? props.results.map((result,index)=><button key={`${result.id}-${index}`} onClick={()=>props.navigate(result.id)}><span><small>{result.kind}</small><strong>{result.label}</strong></span><b>↗</b></button>) : <><p>Quick actions</p><button onClick={()=>props.navigate("assumptions")}><span><small>Workspace</small><strong>Open assumptions register</strong></span><b>→</b></button><button onClick={()=>props.setTheme(props.theme==="light"?"dark":"light")}><span><small>Appearance</small><strong>Switch to {props.theme==="light"?"dark":"light"} mode</strong></span><b>◐</b></button><button onClick={exportData}><span><small>Data portability</small><strong>Export workspace backup</strong></span><b>↓</b></button><button onClick={()=>downloadText("opyjo-assumptions.csv",assumptionsCsv)}><span><small>Spreadsheet export</small><strong>Export assumptions CSV</strong></span><b>↓</b></button><button onClick={()=>downloadText("opyjo-actions.csv",actionsCsv)}><span><small>Spreadsheet export</small><strong>Export action list CSV</strong></span><b>↓</b></button><label className="command-import"><span><small>Data portability</small><strong>Import workspace backup</strong></span><b>↑</b><input type="file" accept="application/json" onChange={(event)=>event.target.files?.[0]&&importData(event.target.files[0])}/></label><button className="danger-command" onClick={clearData}><span><small>Local data</small><strong>Clear saved workspace data</strong></span><b>×</b></button></>}</main><footer><span>Navigate</span><span>⌘K open</span><span>Esc close</span></footer></div></div>;
}

function AssumptionsRegister({ assumptions, setAssumptions }: { assumptions:Assumption[]; setAssumptions:React.Dispatch<React.SetStateAction<Assumption[]>> }) {
  const [category,setCategory]=useState("All"); const [query,setQuery]=useState("");
  const categories=["All",...Array.from(new Set(assumptions.map((item)=>item.category)))]; const shown=assumptions.filter((item)=>(category==="All"||item.category===category)&&`${item.label} ${item.source} ${item.notes}`.toLowerCase().includes(query.toLowerCase()));
  const update=(id:string,key:keyof Assumption,value:string)=>setAssumptions((current)=>current.map((item)=>item.id===id?{...item,[key]:value}:item));
  return <><SectionHeader eyebrow="Single source of truth" title="Turn assumptions into verified evidence." description="Every planning figure has an owner, source, confidence state, and downstream impact. Update a value here and related working documents use the same figure."/><section className="assumption-summary">{(["planning","review","verified"] as AssumptionStatus[]).map((status)=><article key={status}><strong>{assumptions.filter((item)=>item.status===status).length}</strong><span>{status}</span></article>)}</section><section className="register-controls"><label>⌕<input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search assumptions…"/></label><div>{categories.map((item)=><button className={category===item?"active":""} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div></section><section className="assumption-list">{shown.map((item)=><article key={item.id}><header><div><span>{item.category}</span><h3>{item.label}</h3></div><select value={item.status} onChange={(event)=>update(item.id,"status",event.target.value)} aria-label={`Status for ${item.label}`}><option value="planning">Planning</option><option value="review">Needs review</option><option value="verified">Source verified</option></select></header><div className="assumption-value"><input value={item.value} onChange={(event)=>update(item.id,"value",event.target.value)} aria-label={`Value for ${item.label}`}/><span>{item.unit}</span></div><div className="assumption-meta"><label>Source<input value={item.source} onChange={(event)=>update(item.id,"source",event.target.value)}/></label><label>Source date<input type="date" value={item.sourceDate} onChange={(event)=>update(item.id,"sourceDate",event.target.value)}/></label><label>Owner<input value={item.owner} onChange={(event)=>update(item.id,"owner",event.target.value)}/></label></div><label className="assumption-notes">Notes<textarea value={item.notes} onChange={(event)=>update(item.id,"notes",event.target.value)}/></label></article>)}</section></>;
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

function DocumentVault({ assumptions, setAssumptions, stages, setStages }: { assumptions: Assumption[]; setAssumptions:React.Dispatch<React.SetStateAction<Assumption[]>>; stages: Record<string, DocumentStage>; setStages: React.Dispatch<React.SetStateAction<Record<string, DocumentStage>>> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<IrapDocument | null>(null);
  const [query, setQuery] = useState(""); const [stageFilter, setStageFilter] = useState<DocumentStage | "all">("all");
  const currentDocuments = useMemo(() => documentsWithAssumptions(assumptions), [assumptions]);
  const generated = currentDocuments.filter((document) => document.generated).filter((document) => stageFilter === "all" || (stages[document.id] ?? "planning") === stageFilter).filter((document) => !query || `${document.title} ${document.description} ${document.sections?.map((section)=>`${section.heading} ${section.body}`).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const sourceDocuments = currentDocuments.filter((document) => !document.generated);
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
      <section className="vault-controls"><label><span>⌕</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search titles, sections, and document content…" aria-label="Search document vault"/></label><div>{(["all","planning","review","verified","ready"] as const).map((stage)=><button className={stageFilter===stage?"active":""} key={stage} onClick={()=>setStageFilter(stage)}>{stage}</button>)}</div></section>
      <details className="vault-assumption-editor"><summary><span><strong>Edit document assumptions</strong><small>Changes propagate into related working documents</small></span><b>{assumptions.filter((item)=>item.status!=="verified").length} unverified</b></summary><div>{assumptions.map((item)=><label key={item.id}><span>{item.label}<small>{item.status}</small></span><input value={item.value} onChange={(event)=>setAssumptions((current)=>current.map((entry)=>entry.id===item.id?{...entry,value:event.target.value}:entry))}/><i>{item.unit}</i></label>)}</div></details>
      <div className="vault-note"><strong>Before submission:</strong> replace planning language with verified figures, dates, names, source attachments, and advisor-confirmed eligibility. These are working drafts, not official NRC forms.</div>
      <div className="vault-section-title"><div><span>Prepared documents</span><h2>Read and download</h2></div><p>{generated.length} documents</p></div>
      <section className="prepared-grid">
        {generated.map((document) => { const estimates = document.sections?.reduce((total, section) => total + (section.body.match(/planning estimate|planning assumption|planning amount|planning threshold/gi)?.length ?? 0), 0) ?? 0; const stage = stages[document.id] ?? "planning"; return <article className="document-card" key={document.id}>
          <div className="document-card-top"><span>{document.category}</span><i>DOC</i></div>
          <h3>{document.title}</h3><p>{document.description}</p>
          <div className="document-status"><span><i className={estimates ? "draft" : "ready"}/>{estimates ? "Planning draft" : "Ready to review"}</span><small>{estimates ? `${estimates} estimates to verify` : "Draft complete"}</small></div>
          <label className="document-stage"><span>Workflow</span><select value={stage} onChange={(event)=>setStages((current)=>({...current,[document.id]:event.target.value as DocumentStage}))}><option value="planning">Planning draft</option><option value="review">Internal review</option><option value="verified">Source verified</option><option value="ready">Advisor ready</option></select></label>
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
          <main>{preview.sections?.map((section) => <section key={section.heading}><h3>{section.heading}</h3><DocumentBody body={section.body} /></section>)}</main>
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
  const [copied,setCopied]=useState(false);
  const mermaid=`flowchart LR
  A[Learner answers in customer app] --> B[Customer grades answer]
  B --> C[Send anonymous result to Opyjo]
  C --> D[Update learner skill estimate]
  D --> E{Choose next learning need}
  E -->|Repeated errors| F[Easier scaffold item]
  E -->|Weak skill| G[Target weakest skill]
  E -->|Skills strong| H[Spaced review]
  F --> I[Return item ID and reason]
  G --> I
  H --> I
  I --> J[Customer displays its own content]
  J --> A
  D --> K[Versioned audit and outcome evidence]`;
  return (
    <>
      <SectionHeader eyebrow="Product mechanics" title="The next answer changes the next decision." description="The engine runs a closed learning loop. Every graded outcome updates one learner’s state, and the very next recommendation responds to that evidence." />
      <PageNav items={[["plain-language","Plain-language tour"],["simple-flow","Simple flow"],["investor-flow","Investor view"],["engine-flow-title","Technical detail"],["mermaid-source","Mermaid"]]} />
      <section className="plain-explainer" id="plain-language">
        <div><Badge tone="green">Start here · no technical background needed</Badge><h2>Think of it as a GPS for learning.</h2><p>A normal learning app often gives everyone the same route. Opyjo watches only whether an anonymous learner gets an item right or wrong, estimates where that learner needs help, and recommends the next useful item. The customer still owns the learner relationship, questions, answers, and teaching experience.</p></div>
        <aside><span>The simple promise</span><strong>Right learner.<br/>Right skill.<br/>Right next step.</strong><small>Every recommendation includes a recorded reason.</small></aside>
      </section>
      <section className="simple-engine-flow surface" id="simple-flow">
        <div className="surface-heading"><div><span>One interaction in plain English</span><h3>Five things happen after a learner answers.</h3></div><Badge tone="blue">Usually in milliseconds</Badge></div>
        <div className="simple-flow-row">{[
          ["1","Answer","The learner answers inside the customer’s app.","The question and identity stay there."],
          ["2","Signal","The customer sends an anonymous right-or-wrong result.","No question text or answer key."],
          ["3","Learn","Opyjo updates its estimate of that learner’s skill.","Hard successes count more; easy misses matter."],
          ["4","Choose","The engine finds the most useful next skill and difficulty.","It can scaffold, target a weakness, or review."],
          ["5","Explain","It returns an item ID and a reason.","The customer displays its own question."],
        ].map(([number,title,body,note],index)=><div className="simple-flow-step" key={number}><i>{number}</i><strong>{title}</strong><p>{body}</p><small>{note}</small>{index<4&&<b>→</b>}</div>)}</div>
        <div className="simple-loop-note"><span>↺</span><p><strong>Then it repeats.</strong> Each new answer gives the engine more evidence, so its future choices can become better informed.</p></div>
      </section>

      <section className="investor-flow surface" id="investor-flow">
        <div className="surface-heading"><div><span>End-to-end investor view</span><h3>How product activity can become defensible enterprise value.</h3></div></div>
        <div className="investor-map">
          <article className="investor-customer"><span>01 · Customer asset</span><strong>Learning product</strong><p>Existing learners, content, grading, and distribution.</p><small>Customer retains custody</small></article><b>→</b>
          <article className="investor-platform"><span>02 · Opyjo layer</span><strong>Adaptive API</strong><p>Anonymous outcomes become learner-state updates and auditable recommendations.</p><small>Fast integration</small></article><b>→</b>
          <article className="investor-evidence"><span>03 · Compounding asset</span><strong>Outcome evidence</strong><p>Calibration, model decisions, cross-tenant learning, and reproducible experiments.</p><small>Potential moat</small></article><b>→</b>
          <article className="investor-value"><span>04 · Business result</span><strong>Recurring SaaS</strong><p>Onboarding, usage, annual contracts, and enterprise controls.</p><small>Canadian IP and revenue</small></article>
        </div>
        <div className="investor-two-sided"><div><span>Why customers buy</span><ul><li>Add personalization without building a research team</li><li>Keep content and direct learner identity</li><li>Receive explainable recommendations</li><li>Measure whether learning actually improves</li></ul></div><div><span>What R&D must prove</span><ul><li>Reliable decisions with sparse learner data</li><li>Stable empirical item calibration</li><li>Improved retention or time-to-mastery</li><li>Generalization across different customers</li></ul></div></div>
        <p className="investor-truth"><strong>Important:</strong> the API foundation exists. The compounding evidence and defensibility are the intended outcomes of the proposed R&D—not claims that have already been proven.</p>
      </section>
      <section className="loop-diagram">
        {[
          ["01", "Request", "The tenant backend sends an opaque learner ID and eligible scope."],
          ["02", "Select", "The policy chooses a skill, matches difficulty and avoids recent items."],
          ["03", "Teach", "The customer displays and grades its own content."],
          ["04", "Learn", "A correct/incorrect event updates mastery exactly once."],
        ].map(([number, title, body], index) => <div className="loop-step" key={number}><i>{number}</i><strong>{title}</strong><p>{body}</p>{index < 3 && <b>→</b>}</div>)}
      </section>

      <section className="engine-flow surface" aria-labelledby="engine-flow-title">
        <div className="surface-heading"><div><span>Detailed system flow</span><h3 id="engine-flow-title">From learner answer to the next auditable decision</h3></div><Badge tone="blue">Closed feedback loop</Badge></div>
        <div className="flow-legend"><span><i className="flow-tenant"/>Customer system</span><span><i className="flow-api"/>Secure API boundary</span><span><i className="flow-core"/>Adaptive decision core</span><span><i className="flow-data"/>Tenant-scoped evidence</span></div>
        <div className="flow-canvas">
          <div className="flow-lane flow-lane-customer"><header><span>01</span><div><strong>Customer learning experience</strong><small>Content, learner identity, rendering, and grading remain here</small></div></header><div className="flow-row">
            <article><i>LEARN</i><strong>Learner answers an item</strong><p>The application displays its own question and records the selected response.</p></article><b className="flow-arrow">→</b>
            <article><i>GRADE</i><strong>Tenant grades locally</strong><p>The backend converts the result to correct/incorrect. No answer key leaves the customer.</p></article><b className="flow-arrow">→</b>
            <article><i>EVENT</i><strong>Create minimal outcome</strong><p>Opaque learner ID, item ID, outcome, timestamp, and an idempotency key.</p></article>
          </div></div>
          <div className="flow-down"><span>HTTPS · server-side bearer key · scoped permission</span><b>↓</b></div>
          <div className="flow-lane flow-lane-api"><header><span>02</span><div><strong>Trust and validation boundary</strong><small>Every request is authenticated, constrained, and safe to retry</small></div></header><div className="flow-row">
            <article><i>AUTH</i><strong>Authenticate tenant</strong><p>Resolve key prefix, compare its hash, confirm status, expiry, scope, and rate limit.</p></article><b className="flow-arrow">→</b>
            <article><i>CHECK</i><strong>Validate contract</strong><p>Reject unknown fields or invalid IDs and enforce the metadata-only boundary.</p></article><b className="flow-arrow">→</b>
            <article className="flow-decision"><i>RETRY?</i><strong>Idempotency gate</strong><p>Existing identical event returns its original result. A conflicting replay is rejected.</p><small>Conflict → shaped 409 response</small></article>
          </div></div>
          <div className="flow-down"><span>Valid, new outcome event</span><b>↓</b></div>
          <div className="flow-lane flow-lane-core"><header><span>03</span><div><strong>Adaptive learner model</strong><small>Update evidence first, then use the new state for the next choice</small></div></header><div className="flow-row">
            <article><i>LOAD</i><strong>Load learner-skill state</strong><p>Retrieve current mastery, attempts, recent history, and consecutive errors for this tenant.</p></article><b className="flow-arrow">→</b>
            <article><i>UPDATE</i><strong>Update mastery</strong><p>Apply difficulty-weighted EWMA, clamp to 0–1, and update attempt and error counters.</p></article><b className="flow-arrow">→</b>
            <article><i>AUDIT</i><strong>Append answer event</strong><p>Record before/after mastery, model version, timestamps, outcome, and idempotency key.</p></article>
          </div></div>
          <div className="flow-down"><span>Tenant asks for the next item within an eligible scope</span><b>↓</b></div>
          <div className="flow-lane flow-lane-policy"><header><span>04</span><div><strong>Next-item selection policy</strong><small>A deterministic hierarchy chooses the most useful eligible item</small></div></header><div className="flow-policy-grid">
            <article><span>1</span><strong>Build candidate bank</strong><p>Active tenant items filtered by grade, caller skill scope, and available metadata.</p></article>
            <article className="priority"><span>2A</span><strong>Repeated errors?</strong><p>After two misses, stay on the skill and prefer an easier scaffold item.</p></article>
            <article><span>2B</span><strong>Weak skill?</strong><p>Otherwise target the lowest mastery below the 0.80 working threshold.</p></article>
            <article><span>2C</span><strong>Skills strong?</strong><p>Spiral the least recently practised skill to maintain retention.</p></article>
            <article><span>3</span><strong>Match difficulty</strong><p>Translate mastery into a target difficulty band and rank suitable items.</p></article>
            <article><span>4</span><strong>Apply recency controls</strong><p>Avoid the last 30 items or 14 days, then relax constraints in a recorded order.</p></article>
          </div></div>
          <div className="flow-down"><span>Selected item ID + reason + model version</span><b>↓</b></div>
          <div className="flow-lane flow-lane-data"><header><span>05</span><div><strong>Audit, response, and continuous evidence</strong><small>Every choice is explainable and becomes research evidence</small></div></header><div className="flow-row">
            <article><i>LOG</i><strong>Write selection event</strong><p>Decision ID, item, skill, reason, candidate count, request filters, and algorithm version.</p></article><b className="flow-arrow">→</b>
            <article><i>RETURN</i><strong>Return safe fields</strong><p>The API sends an item ID and rationale. The customer retrieves and renders its content.</p></article><b className="flow-arrow">→</b>
            <article><i>MEASURE</i><strong>Evaluate outcomes</strong><p>Pseudonymous events support calibration, experiments, drift checks, and model decisions.</p></article>
          </div></div>
          <div className="flow-feedback"><b>↺</b><div><strong>The loop repeats with stronger evidence</strong><p>The next graded answer updates the learner again. Versioned models and audit events make every change reproducible and reversible.</p></div><span>Timeout / 5xx → customer uses its local fallback<br/>429 → back off and retry safely</span></div>
        </div>
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
      <section className="mermaid-panel surface" id="mermaid-source"><div className="surface-heading"><div><span>Portable diagram source</span><h3>Simplified Mermaid flowchart</h3></div><button className="secondary-button" onClick={async()=>{await navigator.clipboard.writeText(mermaid);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}}>{copied?"Copied":"Copy Mermaid"}</button></div><p>Paste this into Mermaid Live, GitHub, Notion, or a compatible presentation workflow.</p><pre><code>{mermaid}</code></pre></section>
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
  const sensitivities = [-10,0,10].map((change)=>({change,project:result.total*(1+change/100),revenue:result.threeYearRevenue*(1+change/100),capital:result.workingCapital*(1+change/100)}));
  const cashMonths = Array.from({length:10},(_,index)=>{ const spend=result.monthlyProject+input.monthlyBurn; const reimbursement=index>=input.claimDelayMonths?result.monthlyProject*input.contributionRate/100:0; return {month:index+1,spend,reimbursement,net:reimbursement-spend}; });
  let running=input.operatingReserve+result.preReimbursement; const cashSeries=cashMonths.map((month)=>({...month,closing:(running+=month.net)})); const maxCash=Math.max(...cashSeries.map((month)=>Math.abs(month.closing)),input.operatingReserve,1);
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
    <section className="estimate-insights"><article className="surface"><div className="surface-heading"><div><span>Sensitivity analysis</span><h3>How a 10% change affects the plan</h3></div></div><div className="sensitivity-table"><div><span>Change</span><span>Project cost</span><span>Working capital</span><span>3-year revenue</span></div>{sensitivities.map((row)=><div className={row.change===0?"base":""} key={row.change}><strong>{row.change>0?"+":""}{row.change}%</strong><span>{cad(row.project)}</span><span>{cad(row.capital)}</span><span>{cad(row.revenue)}</span></div>)}</div></article><article className="surface cash-chart"><div className="surface-heading"><div><span>10-month cash-flow</span><h3>Spend, reimbursement, and reserve</h3></div></div><div className="cash-legend"><span><i/>Closing cash</span><span><i/>Minimum reserve</span></div><div className="cash-bars">{cashSeries.map((month)=><div key={month.month}><span>M{month.month}</span><div><i className={month.closing<input.operatingReserve?"risk":""} style={{height:`${Math.max(3,Math.abs(month.closing)/maxCash*100)}%`}}/><b style={{bottom:`${Math.min(96,input.operatingReserve/maxCash*100)}%`}}/></div><small>{cad(month.closing)}</small></div>)}</div><p>Assumes equal monthly project spending and reimbursement after a {input.claimDelayMonths}-month planning delay. Red bars fall below the operating reserve.</p></article></section>
    <p className="estimate-source">Wage defaults are Toronto planning benchmarks from Government of Canada Job Bank references recorded in the model plan. Actual payroll, historical revenue, cash, ownership, and customer evidence remain source-record inputs.</p>
  </>;
}

function CallRoom({ notes, setNotes, startMeeting, addAction }: { notes: string; setNotes: (value: string) => void; startMeeting: () => void; addAction:(action:Omit<CustomAction,"id"|"status">)=>void }) {
  const [followup,setFollowup]=useState({title:"",detail:"",owner:"Johnson",due:"Next follow-up"}); const [added,setAdded]=useState(false);
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
      <section className="surface followup-builder"><div className="surface-heading"><div><span>Meeting follow-up</span><h3>Turn advisor guidance into an owned action.</h3></div><Badge tone={added?"green":"neutral"}>{added?"Added to Action Centre":"Structured capture"}</Badge></div><div><label>Action title<input value={followup.title} onChange={(event)=>{setAdded(false);setFollowup({...followup,title:event.target.value});}} placeholder="e.g. Confirm contractor cost treatment"/></label><label>Owner<input value={followup.owner} onChange={(event)=>setFollowup({...followup,owner:event.target.value})}/></label><label>Due date<input value={followup.due} onChange={(event)=>setFollowup({...followup,due:event.target.value})}/></label><label className="followup-detail">Advisor guidance / evidence requested<textarea value={followup.detail} onChange={(event)=>setFollowup({...followup,detail:event.target.value})} placeholder="What was confirmed, what evidence is needed, and what remains open?"/></label></div><button className="primary-button" disabled={!followup.title.trim()} onClick={()=>{addAction(followup);setAdded(true);setFollowup({...followup,title:"",detail:""});}}>Add follow-up action</button></section>
    </>
  );
}

function ActionCentre({ statuses, cycleTask, notes, setNotes, customActions, setCustomActions }: { statuses: Record<string, TaskStatus>; cycleTask: (id: string) => void; notes: string; setNotes: (value: string) => void; customActions:CustomAction[]; setCustomActions:React.Dispatch<React.SetStateAction<CustomAction[]>> }) {
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
      {customActions.length>0&&<><div className="section-label">Advisor follow-up actions</div><section className="task-board">{customActions.map((task)=><article className="task-card priority-normal" key={task.id}><button className={`task-status status-${task.status}`} onClick={()=>setCustomActions((current)=>current.map((item)=>item.id===task.id?{...item,status:STATUS_ORDER[(STATUS_ORDER.indexOf(item.status)+1)%STATUS_ORDER.length]!}:item))}><i/>{task.status==="todo"?"To do":task.status==="progress"?"In progress":"Complete"}</button><div className="task-main"><h3>{task.title}</h3><p>{task.detail||"No additional detail recorded."}</p><div><span>Owner · {task.owner}</span><span>Due · {task.due}</span><button className="remove-action" onClick={()=>setCustomActions((current)=>current.filter((item)=>item.id!==task.id))}>Remove</button></div></div></article>)}</section></>}
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
