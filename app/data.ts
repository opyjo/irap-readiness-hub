export type ViewId =
  | "overview"
  | "business"
  | "engine"
  | "architecture"
  | "research"
  | "funding"
  | "estimates"
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
    ],
  },
  {
    label: "The product",
    items: [
      { id: "engine", label: "How it works", index: "02" },
      { id: "architecture", label: "Technical system", index: "03" },
      { id: "research", label: "R&D programme", index: "04" },
    ],
  },
  {
    label: "IRAP readiness",
    items: [
      { id: "funding", label: "Funding case", index: "05" },
      { id: "estimates", label: "Estimates", index: "06" },
      { id: "guidance", label: "NRC IRAP guidance", index: "07" },
      { id: "documents", label: "Document vault", index: "08" },
      { id: "call", label: "Meeting room", index: "09" },
      { id: "actions", label: "Action centre", index: "10" },
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
    question: "What exactly are you building?",
    answer: "A standalone adaptive-learning API that helps any learning application decide what an individual learner should practise next. Customer applications keep their users, content and grading; our engine receives pseudonymous item outcomes, updates skill mastery and returns an auditable item recommendation.",
  },
  {
    question: "What exists today?",
    answer: "The TypeScript service, adaptive-v1 policy, PostgreSQL schema, tenant isolation, API-key security, idempotent event recording, OpenAPI contract, Docker configuration and automated tests are code-complete and locally validated. Production database provisioning, deployment and Brightwick shadow-mode integration are the next milestones.",
  },
  {
    question: "What is technically uncertain?",
    answer: "The uncertain work is not ordinary API construction. It is whether accurate learner state can be inferred from sparse response data, whether item-difficulty priors can be corrected safely from behaviour, and whether an adaptive policy creates measurable retained learning gains over a fixed baseline.",
  },
  {
    question: "Who will buy it?",
    answer: "Initial buyers are education applications and tutoring operators with existing content and learner traffic but no adaptive-learning team. Brightwick is the first integration and evidence source. External design partners come next, followed by school and training-platform pilots once outcome and privacy evidence are mature.",
  },
  {
    question: "How will the company make money?",
    answer: "A B2B SaaS model: an onboarding tier for pilots, usage-based pricing for recommendations and learning events, and higher tiers for mastery analytics, experiment tooling, service guarantees and enterprise controls. Consumer-product revenue remains separate and validates the technology in use.",
  },
  {
    question: "Why is this defensible?",
    answer: "The moat compounds through a privacy-preserving behavioural dataset, calibrated item and learner models, reproducible outcome evidence, integration tooling and trust. The API shell can be copied; longitudinal calibration quality and credible learning evidence are harder to reproduce.",
  },
  {
    question: "What would IRAP accelerate?",
    answer: "Canadian technical labour for the learner-model experiments, difficulty calibration, evaluation infrastructure and external-tenant validation. Commercial marketing and routine operations should remain outside the technical project budget unless an advisor confirms eligibility.",
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
