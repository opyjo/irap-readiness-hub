export type ViewId =
  | "overview"
  | "business"
  | "founder-research"
  | "pitch-toolkit"
  | "field-guide"
  | "engine"
  | "explainer"
  | "integration"
  | "runbook"
  | "architecture"
  | "architecture-atlas"
  | "research"
  | "funding"
  | "estimates"
  | "assumptions"
  | "guidance"
  | "documents"
  | "call"
  | "actions";

export const navGroups: Array<{
  label: string;
  items: Array<{ id: ViewId; label: string; index: string }>;
}> = [
  {
    label: "Briefing",
    items: [
      { id: "overview", label: "Command centre", index: "00" },
      { id: "business", label: "Business case", index: "01" },
      { id: "founder-research", label: "Founder research", index: "02" },
      { id: "pitch-toolkit", label: "Founder pitch toolkit", index: "03" },
      { id: "field-guide", label: "Going all in", index: "04" },
    ],
  },
  {
    label: "The product",
    items: [
      { id: "engine", label: "How it works", index: "05" },
      { id: "explainer", label: "Adaptive engine explained", index: "06" },
      { id: "integration", label: "Connect your app", index: "07" },
      { id: "runbook", label: "Owner runbook", index: "08" },
      { id: "architecture", label: "Technical system", index: "09" },
      { id: "architecture-atlas", label: "Architecture atlas", index: "10" },
      { id: "research", label: "R&D programme", index: "11" },
    ],
  },
  {
    label: "IRAP readiness",
    items: [
      { id: "funding", label: "Funding case", index: "12" },
      { id: "estimates", label: "Estimates", index: "13" },
      { id: "assumptions", label: "Assumptions register", index: "14" },
      { id: "guidance", label: "NRC IRAP guidance", index: "15" },
      { id: "documents", label: "Document vault", index: "16" },
      { id: "call", label: "Meeting room", index: "17" },
      { id: "actions", label: "Action centre", index: "18" },
    ],
  },
];

export type TaskStatus = "todo" | "progress" | "done";

export interface PrepTask {
  id: string;
  title: string;
  detail: string;
  owner: string;
  due: string;
  priority: "critical" | "high" | "normal";
  initialStatus: TaskStatus;
}

export const prepTasks: PrepTask[] = [
  {
    id: "corporate-standing",
    title: "Confirm corporation is in active standing",
    detail: "File any overdue annual returns and save the official confirmation.",
    owner: "Johnson",
    due: "Before Jul 16",
    priority: "critical",
    initialStatus: "progress",
  },
  {
    id: "payroll",
    title: "Complete employee and payroll evidence",
    detail: "CRA payroll account, signed agreement, TD1 forms, role description and first payroll evidence where available.",
    owner: "Johnson",
    due: "Before meeting",
    priority: "high",
    initialStatus: "progress",
  },
  {
    id: "database",
    title: "Provision adaptive-engine staging database",
    detail: "Create a separate managed PostgreSQL project, run migrations and provision the Brightwick staging tenant.",
    owner: "Engineering",
    due: "Next technical milestone",
    priority: "high",
    initialStatus: "todo",
  },
  {
    id: "one-pager",
    title: "Freeze the one-page project brief",
    detail: "Problem, technical uncertainty, work packages, team, milestones, budget and Canadian economic benefit.",
    owner: "Johnson",
    due: "Jul 15",
    priority: "high",
    initialStatus: "todo",
  },
  {
    id: "demo",
    title: "Prepare a two-minute product demonstration",
    detail: "Show a learner event, mastery change, next-item decision and the audit record—without exposing learner PII.",
    owner: "Engineering",
    due: "Jul 15",
    priority: "normal",
    initialStatus: "todo",
  },
  {
    id: "teams",
    title: "Test Teams, microphone and screen share",
    detail: "Join five minutes early with this hub, the one-pager and demo already open.",
    owner: "Johnson",
    due: "Jul 16 · 11:30",
    priority: "normal",
    initialStatus: "todo",
  },
];

export const workPackages = [
  {
    id: "WP1",
    title: "Learner model under sparse data",
    uncertainty: "Can confidence-aware mastery estimates distinguish a new skill from a genuinely weak skill with very few observations?",
    method: "Compare EWMA v1 against Elo/IRT and confidence-weighted variants using replay simulations and pre-registered error metrics.",
    evidence: "Calibration error, prediction log-loss, cold-start accuracy and minimum observations to stable ranking.",
    outcome: "Versioned learner-model parameters and a documented model-selection decision.",
    months: "Months 1–3",
  },
  {
    id: "WP2",
    title: "Empirical item difficulty",
    uncertainty: "Are initial 1–5 difficulty priors sufficiently calibrated, and how quickly can behavioural data correct them?",
    method: "Estimate observed p(correct) conditional on learner state, monitor drift, and compare tenant priors with empirical estimates.",
    evidence: "Prior-vs-observed error, sample-size confidence intervals, drift alerts and recalibration stability.",
    outcome: "A repeatable calibration job with human-review thresholds and versioned outputs.",
    months: "Months 2–5",
  },
  {
    id: "WP3",
    title: "Adaptive outcome experiment",
    uncertainty: "Does the policy improve durable learning rather than simply changing item order or short-term engagement?",
    method: "Stable learner assignment, adaptive-vs-baseline comparison, delayed review items and outcome analysis by skill and cohort.",
    evidence: "Retention lift, time-to-mastery, completion, error recovery and confidence intervals—not vanity engagement alone.",
    outcome: "An experimental report supporting an algorithm change, rollback or further investigation.",
    months: "Months 4–8",
  },
  {
    id: "WP4",
    title: "External-tenant validation",
    uncertainty: "Can the engine remain useful and operationally safe across different curricula, content banks and traffic patterns?",
    method: "Onboard design partners through metadata-only integration; test isolation, fallback behaviour, latency and mapping quality.",
    evidence: "Integration time, recommendation coverage, tenant-isolation tests, latency percentiles and partner feedback.",
    outcome: "A hardened onboarding playbook and evidence for commercial product-market fit.",
    months: "Months 6–10",
  },
];

export const callQuestions = [
  {
    category: "Company & product",
    question: "What exactly are you building?",
    answer: "A standalone adaptive-learning API that helps any learning application decide what an individual learner should practise next. Customer applications keep their users, content and grading; our engine receives pseudonymous item outcomes, updates skill mastery and returns an auditable item recommendation.",
    proof: ["B2B infrastructure, not another course app", "Pseudonymous learning events in; recommendation and rationale out", "Brightwick is the first live integration path"],
    caution: "Do not describe the engine as production-proven yet.",
  },
  {
    category: "Current stage",
    question: "What exists today?",
    answer: "The TypeScript service, adaptive-v1 policy, PostgreSQL schema, tenant isolation, API-key security, idempotent event recording, OpenAPI contract, Docker configuration and automated tests are code-complete and locally validated. Production database provisioning, deployment and Brightwick shadow-mode integration are the next milestones.",
    proof: ["Code-complete service and data model", "Automated tests and local validation", "Next: production deployment, shadow mode, then measured pilot"],
    caution: "Say locally validated—not commercially deployed or scientifically validated.",
  },
  {
    category: "R&D core",
    question: "What is technically uncertain?",
    answer: "The uncertain work is not ordinary API construction. It is whether accurate learner state can be inferred from sparse response data, whether item-difficulty priors can be corrected safely from behaviour, and whether an adaptive policy creates measurable retained learning gains over a fixed baseline.",
    proof: ["Sparse-data learner-state estimation", "Empirical item-difficulty calibration", "Causal evidence of retained learning lift"],
    caution: "Keep routine deployment and feature work outside the R&D claim.",
  },
  {
    category: "R&D core",
    question: "Why can’t you solve this with standard engineering practice?",
    answer: "Standard engineering can build the service, but it cannot tell us which learner model is reliable with limited observations or whether adaptation improves durable learning. Those answers require competing hypotheses, controlled experiments, measurable error criteria and evidence gathered from real learner behaviour.",
    proof: ["No known parameter set transfers safely to our learner and content mix", "Offline replay narrows candidates but cannot prove learning impact", "A controlled baseline is required"],
    caution: "Avoid claiming that the algorithms themselves are entirely new.",
  },
  {
    category: "R&D core",
    question: "What hypotheses will you test?",
    answer: "First, confidence-aware learner models should outperform the current EWMA policy at cold start. Second, behavioural evidence should correct item-difficulty priors without unstable swings. Third, the selected adaptive policy should improve delayed retention or time-to-mastery against a fixed baseline.",
    proof: ["H1: lower calibration error and log-loss", "H2: stable prior-to-observed recalibration", "H3: measurable retention or mastery improvement"],
    caution: "Frame these as hypotheses, not promised outcomes.",
  },
  {
    category: "R&D core",
    question: "How will you conduct the R&D?",
    answer: "We will instrument the engine, replay historical sequences, compare EWMA with Elo, IRT and confidence-weighted variants, calibrate item difficulty with uncertainty bounds, then run a stable adaptive-versus-baseline experiment with delayed review items. Every model and decision rule will be versioned and auditable.",
    proof: ["WP1: learner-model comparison", "WP2: difficulty calibration", "WP3: outcome experiment", "WP4: external-tenant validation"],
    caution: "Do not imply access to data that has not yet been collected.",
  },
  {
    category: "R&D core",
    question: "What evidence will tell you the R&D succeeded?",
    answer: "We will use pre-defined technical measures: calibration error, prediction log-loss, cold-start accuracy, stability of difficulty estimates, recommendation coverage, delayed retention, time-to-mastery and confidence intervals. Success is a documented model-selection decision—not forcing a positive result.",
    proof: ["Quantitative gates before each stage", "Baseline and versioned comparison", "Negative findings still create technical knowledge"],
    caution: "Do not use engagement or clicks as the primary R&D outcome.",
  },
  {
    category: "R&D core",
    question: "What are the main technical risks and mitigations?",
    answer: "The main risks are too little data, biased cohorts, unstable model updates, weak experimental power and privacy exposure. We mitigate them with confidence thresholds, conservative fallbacks, stable cohort assignment, delayed-review measures, tenant isolation, pseudonymous identifiers and explicit go-or-no-go gates.",
    proof: ["Fallback to safe non-adaptive sequencing", "Shadow mode before learner-facing decisions", "Privacy-minimizing event contract"],
    caution: "Acknowledge residual risk; mitigation does not mean elimination.",
  },
  {
    category: "R&D core",
    question: "What will the R&D project produce?",
    answer: "It will produce a validated learner-model choice, a repeatable item-calibration pipeline, an adaptive-versus-baseline experimental report, versioned decision policies, and a hardened multi-tenant onboarding playbook. Together these turn a working software foundation into evidence-backed learning infrastructure.",
    proof: ["Model-selection report", "Calibration and monitoring pipeline", "Outcome evidence and onboarding playbook"],
    caution: "Separate project outputs from hoped-for commercial outcomes.",
  },
  {
    category: "Team & capacity",
    question: "Who will perform the R&D in Canada?",
    answer: "The work is planned to be led and controlled in Canada by Opyjo’s technical team, with clearly defined roles across engineering, data analysis and experimental design. We will confirm the named people, T4 status, time allocation and any specialist gaps before a project proposal is finalized.",
    proof: ["Canadian-controlled work and records", "Named technical ownership", "Time and payroll evidence will match the project plan"],
    caution: "Replace this answer with exact names, roles and T4 facts before the call.",
  },
  {
    category: "Eligibility",
    question: "How many employees receive a T4, excluding founders and executives?",
    answer: "Answer this with the exact current payroll fact. IRAP’s note makes at least one non-founder, non-executive full-time T4 employee a base relationship criterion, so we should be direct about the current status, start date and evidence available.",
    proof: ["Exact headcount", "Role and full-time status", "Payroll/start-date evidence"],
    caution: "This is a hard fact—do not estimate, round up or blur contractor status.",
  },
  {
    category: "Company",
    question: "How is the company incorporated and who owns it?",
    answer: "State the legal corporation name, jurisdiction, incorporation date, ownership percentages, and whether there is any parent, subsidiary or related company. Explain where the adaptive-engine IP and commercial activity sit today.",
    proof: ["Canadian for-profit corporation", "Clear ownership and related-party disclosure", "IP held or assigned to the operating company"],
    caution: "Use the corporate records; do not answer from memory if uncertain.",
  },
  {
    category: "IP",
    question: "What is your intellectual-property strategy?",
    answer: "Our near-term strategy is clean ownership, trade-secret protection for model parameters and calibration methods, copyright in the software and documentation, controlled access, and signed IP assignments from employees and contractors. We will assess patents only where a specific novel method and business case justify the cost.",
    proof: ["Assignment chain and repository controls", "Trade-secret treatment for calibration know-how", "Trademark and patent review at evidence-backed milestones"],
    caution: "Do not claim patent protection unless an application actually exists.",
  },
  {
    category: "Market",
    question: "Who will buy it?",
    answer: "Initial buyers are education applications and tutoring operators with existing content and learner traffic but no adaptive-learning team. Brightwick is the first integration and evidence source. External design partners come next, followed by school and training-platform pilots once outcome and privacy evidence are mature.",
    proof: ["Learning products with content and traffic but no adaptive team", "Brightwick as first evidence source", "Design partners before broader institutional sales"],
    caution: "Distinguish current users, design partners and future target customers.",
  },
  {
    category: "Commercialization",
    question: "How will the company make money?",
    answer: "A B2B SaaS model: an onboarding tier for pilots, usage-based pricing for recommendations and learning events, and higher tiers for mastery analytics, experiment tooling, service guarantees and enterprise controls. Consumer-product revenue remains separate and validates the technology in use.",
    proof: ["Pilot onboarding fee", "Usage-based events and recommendations", "Enterprise analytics, experiments and service controls"],
    caution: "Label pricing and revenue as planning assumptions until contracted.",
  },
  {
    category: "Traction",
    question: "What major objectives have you overcome in the last 24 months?",
    answer: "We moved from operating learning products to extracting the adaptive capability into a standalone multi-tenant service. We completed the API contract, learner-event model, recommendation policy, tenant isolation, security controls, idempotent processing, test coverage and a deployment-ready containerized foundation.",
    proof: ["Standalone architecture separated from the consumer app", "Auditable event-to-recommendation loop", "Foundation ready for production and experimental work"],
    caution: "Use dates and verifiable milestones; remove anything not actually completed.",
  },
  {
    category: "Defensibility",
    question: "Why is this defensible?",
    answer: "The moat compounds through a privacy-preserving behavioural dataset, calibrated item and learner models, reproducible outcome evidence, integration tooling and trust. The API shell can be copied; longitudinal calibration quality and credible learning evidence are harder to reproduce.",
    proof: ["Longitudinal calibration data", "Versioned learning-outcome evidence", "Privacy, integration and operational trust"],
    caution: "Do not say data alone is a moat; emphasize accumulated evidence and execution.",
  },
  {
    category: "Funding capacity",
    question: "How will you fund growth if IRAP does not contribute?",
    answer: "IRAP would accelerate a defined technical programme, but it is not our primary funder. The company’s plan must combine operating revenue, founder or investor capital where applicable, staged hiring and milestone-based spending. We will show sufficient working capital to pay Canadian R&D labour before reimbursement.",
    proof: ["Company-funded base plan", "Cash available ahead of reimbursement", "Stage spending against technical and commercial gates"],
    caution: "Insert verified cash, revenue and investor figures—never speculative numbers.",
  },
  {
    category: "IRAP fit",
    question: "What would IRAP accelerate?",
    answer: "Canadian technical labour for the learner-model experiments, difficulty calibration, evaluation infrastructure and external-tenant validation. Commercial marketing and routine operations should remain outside the technical project budget unless an advisor confirms eligibility.",
    proof: ["Canadian R&D labour", "Evaluation and calibration work", "Faster external validation and Canadian technical hiring"],
    caution: "Do not position IRAP as funding sales, routine operations or work already completed.",
  },
  {
    category: "Economic benefit",
    question: "What is the benefit to Canada?",
    answer: "The project builds Canadian capability in privacy-conscious learning technology, creates skilled technical work, and supports an exportable B2B software product. If the evidence is positive, Opyjo can serve learning platforms beyond Canada while keeping core R&D, IP and high-value employment here.",
    proof: ["Canadian technical roles", "Canadian-owned IP and know-how", "Exportable recurring-revenue product"],
    caution: "Use conservative job and revenue numbers tied to the documented plan.",
  },
  {
    category: "Milestones",
    question: "What happens next, and when?",
    answer: "The sequence is production provisioning and shadow integration first, then learner-model comparison, item calibration, a controlled outcome experiment and external-tenant validation. Each phase has an evidence gate so we can continue, revise or stop based on results rather than a predetermined conclusion.",
    proof: ["Months 1–3: sparse-data model", "Months 2–5: difficulty calibration", "Months 4–10: experiment and external validation"],
    caution: "Confirm dates against any proposed project start; pre-agreement costs may be ineligible.",
  },
];

export const officialSources = [
  {
    label: "NRC IRAP financial support for technology innovation",
    href: "https://nrc.canada.ca/en/support-technology-innovation/financial-support-technology-innovation",
  },
  {
    label: "NRC IRAP Youth Employment Program",
    href: "https://nrc.canada.ca/en/support-technology-innovation/nrc-irap-funding-hire-young-graduates",
  },
];
