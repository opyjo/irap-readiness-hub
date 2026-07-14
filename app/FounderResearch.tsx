"use client";

import { useState } from "react";

type Workstream={id:number;group:string;title:string;question:string;deliverable:string};
const workstreams:Workstream[]=[
  {id:1,group:"Strategy",title:"Founder thesis and boundaries",question:"Which customer, user, painful job, use case and 12-month proof milestone define the company—and what will we explicitly not build?",deliverable:"One-page founder thesis and change conditions"},
  {id:2,group:"Market",title:"Market segmentation",question:"Which Canadian segments have reachable buyers, viable budgets, integration readiness and acceptable procurement friction?",deliverable:"Bottom-up low, base and high market model"},
  {id:3,group:"Market",title:"Customer discovery",question:"What do 40–60 independent buyers, engineers, educators, reviewers, specialists and affected users reveal through behaviour?",deliverable:"Interview evidence and changed assumptions"},
  {id:4,group:"Market",title:"Workflow observation",question:"Where do real tagging, teaching, integration, privacy, accessibility and support workflows lose time or create errors?",deliverable:"Sanitized workflow maps and cost of friction"},
  {id:5,group:"Market",title:"Competition and alternatives",question:"How do engines, assessment APIs, LMS tools, publishers, open source, spreadsheets and internal rules solve the job today?",deliverable:"Evidence-based competitor and alternative matrix"},
  {id:6,group:"Education",title:"Canadian curriculum",question:"How does each province structure, license, version, translate and govern curricula without assuming national equivalence?",deliverable:"Source, rights, versioning and validation registers"},
  {id:7,group:"Education",title:"Learning science and algorithms",question:"Does the model produce effective, fair and durable learning—not merely different item ordering?",deliverable:"Literature review, model audit and validation plan"},
  {id:8,group:"Trust",title:"Privacy and legal",question:"Which roles, laws, authority, rights, residency, consent, assessments and secondary-use limits apply in each jurisdiction?",deliverable:"Legal matrix, DPA, PIA and governance policies"},
  {id:9,group:"Trust",title:"Security and Canadian residency",question:"Where does every data category flow, and can isolation, recovery, incident and residency claims be evidenced?",deliverable:"Threat model, control matrix and evidence package"},
  {id:10,group:"Trust",title:"Accessibility and inclusion",question:"What must meet legal baselines and the forward WCAG 2.2 AA target across future interfaces and documentation?",deliverable:"Requirements, test and conformance plan"},
  {id:11,group:"Trust",title:"English, French and language",question:"What requires localization, qualified review, bilingual support and community governance rather than machine translation?",deliverable:"Terminology, fallback and review strategy"},
  {id:12,group:"Product",title:"Standards and integrations",question:"Which buyers truly require LTI, QTI, OneRoster, xAPI, Caliper, identity or LMS-specific APIs?",deliverable:"Standards matrix, sandbox and lifecycle plan"},
  {id:13,group:"Product",title:"Technical architecture",question:"What scale and boundaries are demonstrated before adding microservices, MongoDB, Redis, queues or new identity systems?",deliverable:"Load tests, API study and evidence-backed ADRs"},
  {id:14,group:"Product",title:"Usability and explainability",question:"Can engineers, educators, support teams, learners and guardians understand estimates, reasons, limitations and overrides?",deliverable:"Audience-specific usability evidence"},
  {id:15,group:"Commercial",title:"Procurement",question:"What real privacy, security, insurance, accessibility, residency, SLA and contracting gates shape the sales cycle?",deliverable:"Procurement model and evidence checklist"},
  {id:16,group:"Commercial",title:"Pricing and unit economics",question:"Which pricing unit is predictable and fair while covering onboarding, review, support, infrastructure and slow sales?",deliverable:"Willingness-to-pay tests and unit economics"},
  {id:17,group:"Commercial",title:"Go-to-market",question:"Which channels and messages create qualified follow-ups, reviews, pilots and paid conversion—not compliments?",deliverable:"Channel and messaging experiment record"},
  {id:18,group:"Evidence",title:"Design partners and pilots",question:"Which partners can supply the problem, data, authority, capacity and payment path for a pre-registered staged pilot?",deliverable:"Pilot agreement, stages and success criteria"},
  {id:19,group:"Evidence",title:"Ethics, fairness and children",question:"Could sparse data, bias, surveillance, high-stakes reuse or over-trust harm learners or reduce agency?",deliverable:"Prohibited-use and human-oversight policies"},
  {id:20,group:"Company",title:"Company and founder readiness",question:"Are roles, IP, incorporation, insurance, tax, licences, contracts, hiring, security ownership and runway ready?",deliverable:"Company-readiness risk and action register"},
];
const schedule=[
  {weeks:"1–2",title:"Frame and prepare",items:["Write founder thesis and assumption register","Choose three candidate segments","Build interview and consent process","Begin legal, curriculum, standards and competitor research"]},
  {weeks:"3–4",title:"Problem discovery",items:["Conduct 12–15 interviews","Observe three real workflows","Collect procurement and security artefacts","Update assumptions every five interviews"]},
  {weeks:"5–6",title:"Narrow the beachhead",items:["Interview top two segments","Complete bottom-up market model","Review privacy and curriculum feasibility","Select using pre-weighted scorecard"]},
  {weeks:"7–8",title:"Solution and integration",items:["External API usability sessions","Integrate a synthetic reference app","Load and security tests","Draft pilot evidence package"]},
  {weeks:"9–10",title:"Design-partner conversion",items:["Present narrow pilot proposal","Secure catalogue and engineering commitments","Agree metrics, privacy, time and price","Select primary and backup partner"]},
  {weeks:"11–12",title:"Decision and publication",items:["Synthesize supported and rejected assumptions","Finalize thesis and roadmap","Write evidence and risk reports","Proceed, narrow, pivot, partner, or stop"]},
];
const gates=[
  {id:"01",title:"Problem validation",checks:["Independent customers describe the same costly problem","Alternatives fail for specific reasons","A buyer and budget path exist","Three organizations commit to follow-up"]},
  {id:"02",title:"Solution validation",checks:["Clients understand and integrate the API","Metadata mapping is economically viable","Recommendations are plausible and explainable","Reviewers see a viable approval path"]},
  {id:"03",title:"Pilot readiness",checks:["Signed scope and data agreement","Synthetic end-to-end testing passes","Privacy, accessibility, security and fallback addressed","Success and stop criteria pre-defined"]},
  {id:"04",title:"Commercial readiness",checks:["Pilot produces credible value evidence","Buyer confirms price and procurement route","Support costs preserve margin","A customer will sign a paid agreement"]},
];

export function FounderResearch(){const [group,setGroup]=useState("All");const groups=["All",...Array.from(new Set(workstreams.map(w=>w.group)))];const shown=workstreams.filter(w=>group==="All"||w.group===group);return <>
  <header className="section-header"><div className="eyebrow"><span/>Evidence before commitment</div><h1>Founder research and investigation playbook.</h1><p>A practical programme for reducing the uncertainties that matter before major product, hiring, fundraising, or go-to-market commitments.</p></header>
  <section className="founder-hypothesis"><span>Current product hypothesis</span><blockquote>Canadian EdTech companies and educational publishers need an explainable, privacy-conscious, province-aware adaptive-learning service that integrates faster and more safely than they can build and validate one themselves.</blockquote><small>This is a hypothesis. Every important part must be tested.</small></section>
  <section className="research-principles founder-principles">{[["FACT ≠ ASSUMPTION","Label facts, customer evidence, assumptions, inferences and decisions separately."],["BEHAVIOUR > ENTHUSIASM","Engineering time, catalogues, reviews, agreements and payment are stronger than compliments."],["PROVINCES ARE MARKETS","Research jurisdictions separately instead of inventing a national education buyer."],["SEEK DISSENT","Include rejectors, reviewers, accessibility experts, French educators and failed integrations."],["PROTECT PARTICIPANTS","Minimize data, use synthetic evidence, obtain consent and define deletion dates."]].map(([a,b])=><article key={a}><i>{a}</i><p>{b}</p></article>)}</section>
  <section className="research-formula"><span>Research priority</span><code>impact if wrong × uncertainty × urgency</code><p>Maintain one accountable owner, evidence requirement, deadline, status, source link and resulting decision for every important question.</p></section>

  <div className="guidance-label"><span>20</span><div><h2>Investigation workstreams</h2><p>Filter the research programme by strategic domain.</p></div></div>
  <nav className="runbook-filters">{groups.map(x=><button className={group===x?"active":""} key={x} onClick={()=>setGroup(x)}>{x}</button>)}</nav>
  <section className="founder-workstreams">{shown.map(w=><article key={w.id}><header><i>{String(w.id).padStart(2,"0")}</i><span>{w.group}</span></header><h3>{w.title}</h3><p>{w.question}</p><footer><span>Required evidence</span><strong>{w.deliverable}</strong></footer></article>)}</section>

  <div className="guidance-label"><span>G</span><div><h2>Evidence gates</h2><p>Do not advance because the work feels promising. Advance when the evidence meets the gate.</p></div></div>
  <section className="evidence-gates">{gates.map(g=><article key={g.id}><header><i>{g.id}</i><h3>{g.title}</h3></header>{g.checks.map(x=><label key={x}><input type="checkbox"/><i/><span>{x}</span></label>)}</article>)}</section>

  <div className="guidance-label"><span>12</span><div><h2>Twelve-week founder schedule</h2><p>A focused sequence from framing to a proceed, narrow, pivot, partner, or stop decision.</p></div></div>
  <section className="founder-schedule">{schedule.map((s,i)=><article key={s.weeks}><div><i>{i+1}</i><span>Weeks {s.weeks}</span><h3>{s.title}</h3></div><ul>{s.items.map(x=><li key={x}>{x}</li>)}</ul></article>)}</section>

  <div className="guidance-label"><span>↯</span><div><h2>Beachhead decision scorecard</h2><p>Pre-weight each dimension from 1–5 before assessing a favoured segment.</p></div></div>
  <section className="scorecard-grid">{[["Pain","Frequent and consequential?"],["Urgency","Must the buyer solve it now?"],["Budget","Named budget and owner?"],["Reachability","Efficient access to decisions?"],["Integration","Can customers connect in weeks?"],["Data","Authorized sufficient events?"],["Differentiation","Canadian advantage meaningful?"],["Procurement","Can a startup pass?"],["Compliance","Sustainable cost?"],["Expansion","Opens adjacent value?"]].map(([x,q])=><article key={x}><span>{x}</span><p>{q}</p><div>{[1,2,3,4,5].map(n=><button key={n}>{n}</button>)}</div></article>)}</section>

  <section className="stop-criteria"><div><span>Stop or pivot when evidence says</span><h2>Discipline is part of the strategy.</h2></div><ul>{["Buyers see adaptation as a feature, not a product","Required PII destroys the privacy advantage","Customers cannot supply enough valid events","Sales cycle and contract value cannot support runway","Curriculum becomes unscalable services work","Independent evaluation finds no meaningful advantage","Security, residency or accessibility is infeasible at the price"].map(x=><li key={x}>{x}</li>)}</ul></section>
  <section className="next-actions"><header><span>Start here</span><h2>Immediate founder actions</h2></header>{["Create the assumption and research register","Choose three customer segments—not three features","Recruit 15 interviews across buyers, users, engineers and reviewers","Obtain three Canadian procurement and security packages","Commission Canadian privacy and residency review","Recruit curriculum, French-language and accessibility experts","Run an independent architecture and threat-model review","Test onboarding with an external developer","Convert one qualified prospect into a scoped paid pilot"].map((x,i)=><label key={x}><input type="checkbox"/><i>{i+1}</i><span>{x}</span></label>)}</section>
  <section className="narrative-strip"><span>Research outcome</span><blockquote>Do not begin with a large team, a full assessment platform, or every Canadian curriculum. First prove the customer, problem, approval path, integration, educational value, and willingness to pay.</blockquote></section>
  </>}
