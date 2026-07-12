export type DocumentCategory = "Corporate & legal standing" | "Employment & payroll" | "Financial" | "R&D project" | "Reimbursement substantiation" | "Business context";

export type IrapDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  generated?: boolean;
  sections?: Array<{ heading: string; body: string }>;
};

const company = "Opyjo Inc.";
const project = "Adaptive Learning Decision Engine R&D Project";

export const irapDocuments: IrapDocument[] = [
  { id: "articles", title: "Articles and Certificate of Incorporation", category: "Corporate & legal standing", description: "Official incorporation records." },
  { id: "standing", title: "Annual filings / proof of good standing", category: "Corporate & legal standing", description: "Current official status after overdue filings are resolved." },
  { id: "cra-accounts", title: "Business Number and CRA account confirmations", category: "Corporate & legal standing", description: "BN and active CRA program accounts." },
  { id: "ownership", title: "Shareholder register / ownership structure", category: "Corporate & legal standing", description: "Ownership and confirmation of parent or subsidiary relationships." },
  { id: "ip", title: "Trademark and IP registration filings", category: "Corporate & legal standing", description: "Filed or registered intellectual-property evidence, when available." },
  { id: "rp", title: "CRA payroll (RP) registration", category: "Employment & payroll", description: "Payroll program account confirmation." },
  { id: "employment", title: "Signed employment agreement and job description", category: "Employment & payroll", description: "Oluwamayomikun's executed employment and role documents." },
  { id: "td1", title: "Federal and Ontario TD1 forms", category: "Employment & payroll", description: "Completed employee tax-credit forms." },
  { id: "pay-records", title: "Payroll records and pay stubs", category: "Employment & payroll", description: "Evidence of active T4 employment." },
  { id: "t4", title: "T4 slips", category: "Employment & payroll", description: "Annual slips once issued." },
  { id: "hours", title: "Records of hours and wages", category: "Employment & payroll", description: "Labour evidence supporting eligible salary costs." },
  {
    id: "financial-statements", title: "Financial statements", category: "Financial", generated: true, description: "Founder-prepared income statement and balance sheet framework.",
    sections: [
      { heading: "Purpose and basis", body: `Management-prepared financial statements for ${company}. Figures must be updated from the accounting ledger before submission and reviewed for consistency with bank and CRA records.` },
      { heading: "Income statement", body: "Report revenue by product or service, cost of sales, payroll, contractor costs, hosting and software, professional fees, marketing, office and administration, depreciation, interest, taxes, and net income for the current year-to-date and prior fiscal year." },
      { heading: "Balance sheet", body: "Report cash, receivables, prepaid expenses, equipment and intangible assets; accounts payable, payroll and tax liabilities, loans and deferred revenue; share capital, retained earnings, and current-period earnings." },
      { heading: "Management notes", body: "Identify accounting period, reporting currency (CAD), cash or accrual basis, related-party transactions, outstanding tax balances, commitments, contingent liabilities, and material events after period end." },
    ],
  },
  {
    id: "proof-of-funds", title: "Proof of funds summary", category: "Financial", generated: true, description: "Operating-capacity summary to accompany bank evidence.",
    sections: [
      { heading: "Funding capacity", body: `${company} will demonstrate that it can meet payroll and operating obligations while reimbursement claims are processed. Attach recent business bank statements or an official bank letter; redact full account numbers while retaining the account holder, date, and balance.` },
      { heading: "Sources of project cash", body: "List unrestricted cash, forecast operating receipts, founder or shareholder funding formally committed, approved credit facilities, and other confirmed non-IRAP financing. Do not describe uncommitted sales or financing as available funds." },
      { heading: "Coverage test", body: "Compare available liquidity with the maximum cumulative project cash deficit, including eligible costs paid before reimbursement and all non-eligible operating costs. Explain the contingency if receipts or reimbursements are delayed." },
    ],
  },
  {
    id: "projections", title: "Three-year financial projections", category: "Financial", generated: true, description: "Base-case planning assumptions and forecast structure.",
    sections: [
      { heading: "Forecast scope", body: "Prepare monthly forecasts for Year 1 and annual forecasts for Years 2 and 3. Show revenue, gross margin, operating expenses, EBITDA, cash movement, ending cash, headcount, and financing requirements." },
      { heading: "Commercial assumptions", body: "Model design-partner onboarding fees, usage-based API revenue, active tenants, average learning events per tenant, conversion timing, churn, and enterprise-contract timing. Separate Brightwick internal validation from external revenue." },
      { heading: "Cost assumptions", body: "Model Canadian technical payroll, employer costs, cloud hosting, security and compliance, customer onboarding, sales, professional services, and non-cash expenses. State salary and hiring dates by role." },
      { heading: "Scenarios", body: "Include downside, base, and upside cases. Stress-test slower customer acquisition, lower usage, delayed funding, higher cloud cost, and one additional technical hire. Identify the month of lowest cash in each case." },
    ],
  },
  {
    id: "project-budget", title: "Detailed R&D project budget", category: "Financial", generated: true, description: "Cost structure tied to work packages and milestones.",
    sections: [
      { heading: "Budget basis", body: `Budget for ${project}. Use the advisor-confirmed project dates and eligible-cost rules. Record all amounts in CAD and exclude costs incurred outside the approved period.` },
      { heading: "Canadian labour", body: "For each employee list role, work package, annual salary, productive hours, project hours, calculated hourly rate, gross eligible labour, and employer costs only where the contribution agreement permits them." },
      { heading: "Other project costs", body: "Separately list eligible contractors, testing, specialized technical services, materials, and travel only if pre-approved. Identify supplier, purpose, work package, timing, tax treatment, and supporting quotation." },
      { heading: "Funding reconciliation", body: "Show total project cost, eligible cost, requested IRAP contribution, company contribution, other government assistance, and non-eligible cost. Confirm no cost is funded twice." },
    ],
  },
  {
    id: "cash-flow", title: "Project cash-flow forecast", category: "Financial", generated: true, description: "Monthly project liquidity and reimbursement timing.",
    sections: [
      { heading: "Monthly schedule", body: "For every project month show opening cash, operating receipts, financing, payroll, employer remittances, contractors, hosting and other costs, IRAP claims submitted, expected reimbursement receipts, and ending cash." },
      { heading: "Timing assumptions", body: "Use conservative reimbursement timing and place payroll and CRA remittance dates in the month cash leaves the account. Flag the maximum funding gap and minimum cash balance." },
      { heading: "Management response", body: "Document the actions available if cash falls below the operating buffer: defer non-project spend, use committed shareholder funding or approved credit, slow discretionary hiring, or revise project sequencing with IRAP approval." },
    ],
  },
  {
    id: "proposal", title: "Formal R&D project proposal / statement of work", category: "R&D project", generated: true, description: "Objectives, uncertainties, milestones, deliverables, and timeline.",
    sections: [
      { heading: "Project objective", body: `${company} will determine whether a privacy-preserving, content-agnostic adaptive engine can infer reliable learner state from sparse outcomes and select practice that improves durable learning across tenants.` },
      { heading: "Technical uncertainties", body: "The project will test sparse-data mastery estimation, correction of item-difficulty priors from behaviour, durable outcome improvement over a fixed baseline, and safe generalization across different curricula and traffic patterns." },
      { heading: "Systematic work", body: "WP1 compares EWMA, Elo/IRT and confidence-weighted learner models. WP2 develops empirical item calibration and drift controls. WP3 conducts a stable adaptive-versus-baseline outcome experiment. WP4 validates isolation, latency, coverage and mapping with external tenants." },
      { heading: "Milestones and deliverables", body: "M1 model-selection report and versioned parameters (Month 3); M2 calibration pipeline and review thresholds (Month 5); M3 controlled outcome report (Month 8); M4 external-tenant validation and onboarding playbook (Month 10)." },
      { heading: "Success measures", body: "Calibration error, log-loss, cold-start accuracy, prior-versus-observed difficulty error, delayed retention, time-to-mastery, recommendation coverage, p95 latency, tenant-isolation tests, and reproducible model decisions." },
    ],
  },
  {
    id: "technical-docs", title: "Technical engine documentation", category: "R&D project", generated: true, description: "System design, boundaries, model, and integration summary.",
    sections: [
      { heading: "System overview", body: "A standalone TypeScript API receives pseudonymous item outcomes, maintains tenant-scoped learner-skill state, and returns an auditable next-item decision. Customer systems retain identity, content, answer keys, and grading." },
      { heading: "Current baseline", body: "The adaptive-v1 policy uses a difficulty-weighted EWMA mastery estimate, selects the weakest eligible skill, scaffolds repeated errors, and spirals mastered skills. Selection events retain reason, model version, and request context." },
      { heading: "Architecture and controls", body: "Server-to-server bearer-key access, hashed scoped credentials, request validation, rate limiting, composite tenant keys, tenant-filtered queries, idempotent answer events, PostgreSQL persistence, and versioned OpenAPI operations." },
      { heading: "R&D boundary", body: "Routine deployment and API construction establish the experimental platform. The advancement sought is evidence that learner inference and selection remain calibrated, useful, and safe under sparse data and cross-tenant variation." },
    ],
  },
  {
    id: "labour-breakdown", title: "Eligible Canadian R&D labour breakdown", category: "R&D project", generated: true, description: "Role-and-hours planning schedule.",
    sections: [
      { heading: "Required schedule", body: "For each Canadian T4 employee include legal name, role, province, work package, task description, project start and end date, forecast hours by month, gross salary basis, and calculated project labour cost." },
      { heading: "Role allocation", body: "Technical lead: experimental architecture, model implementation, review, and technical decisions. R&D software developer: data pipelines, experiment implementation, tests, and evidence capture. Data or research support, if approved: analysis, calibration, and reporting." },
      { heading: "Cost method", body: "Use payroll-supported salary and the contribution-agreement method for productive hours and eligible employer costs. Reconcile forecasts to contemporaneous timesheets and payroll each claim period; exclude sales, administration, routine maintenance, and unrelated product work." },
    ],
  },
  {
    id: "risk-plan", title: "R&D risk assessment and mitigation plan", category: "R&D project", generated: true, description: "Technical, delivery, evidence, privacy, and commercial risks.",
    sections: [
      { heading: "Technical risks", body: "Sparse data may not support stable estimates; behavioural difficulty may be biased; adaptive selection may show no durable lift; cross-tenant content mappings may be inconsistent. Mitigate with confidence estimates, baselines, pre-defined thresholds, delayed outcomes, and reversible model versions." },
      { heading: "Data and privacy risks", body: "Low event volume, incomplete metadata, accidental identifiers, or tenant leakage could invalidate work. Use metadata-only contracts, opaque learner IDs, schema validation, composite tenant constraints, isolation tests, minimization, retention rules, and incident procedures." },
      { heading: "Delivery and financial risks", body: "Hiring delays, key-person dependency, reimbursement lag, or scope growth may disrupt milestones. Maintain documented experiments, code review, cross-training, monthly cash forecasts, a liquidity buffer, and formal change control." },
      { heading: "Decision gates", body: "At each milestone review evidence, variance, residual risk, and cash. Promote, revise, pause, or roll back the model using documented criteria; seek written IRAP approval before material scope or budget changes." },
    ],
  },
  {
    id: "commercialization", title: "R&D commercialization plan", category: "R&D project", generated: true, description: "How project evidence becomes revenue.",
    sections: [
      { heading: "Commercial outcome", body: "Convert the validated engine into a B2B SaaS decision layer for education applications and tutoring operators that have content and learner traffic but lack an adaptive-learning research team." },
      { heading: "Path to market", body: "Deploy Brightwick in shadow mode; recruit 3-5 design partners; run narrowly scoped pilots; publish credible outcome and integration evidence; standardize onboarding, security review, pricing, and customer success; then expand to schools and professional training." },
      { heading: "Revenue model", body: "Fixed-fee design-partner onboarding, usage-based recommendations and learning events, and annual enterprise contracts for service levels, controls, analytics, experiment tooling, and support." },
      { heading: "Commercial proof points", body: "Days to first recommendation, eligible-bank coverage, retained-learning lift, time-to-mastery, pilot-to-paid conversion, usage growth, gross margin, renewal, p95 latency, and support burden." },
    ],
  },
  { id: "timesheets", title: "R&D activity timesheets", category: "Reimbursement substantiation", description: "Contemporaneous hours tied to approved work packages." },
  { id: "claim-payroll", title: "Payroll evidence for claimed labour", category: "Reimbursement substantiation", description: "Payroll register, pay evidence, and remittance support." },
  { id: "invoices", title: "Eligible cost invoices and receipts", category: "Reimbursement substantiation", description: "Supplier evidence for approved non-labour costs." },
  { id: "progress", title: "Milestone progress reports", category: "Reimbursement substantiation", description: "Progress and variances against the contribution agreement." },
  {
    id: "business-plan", title: "Current business plan", category: "Business context", generated: true, description: "Company, product, market, operations, and growth plan.",
    sections: [
      { heading: "Executive summary", body: `${company} is productizing a Canadian adaptive-learning decision engine. The API helps learning platforms choose the next practice item while customers retain learner identity, content, and grading. Brightwick is the first integration and evidence environment.` },
      { heading: "Problem and solution", body: "Most practice products deliver fixed sequences. Credible adaptivity requires learner modelling, calibration, experimentation, privacy engineering, and outcome data. Opyjo offers these capabilities as an auditable server-to-server API." },
      { heading: "Customers and business model", body: "Initial customers are EdTech applications and tutoring operators, followed by schools and professional training. Revenue combines onboarding, usage-based API charges, and enterprise annual contracts." },
      { heading: "Operations and team", body: "The company will maintain Canadian R&D capability, secure cloud operations, disciplined experiment records, customer onboarding, and financial controls. Hiring and external specialists will follow validated technical and commercial needs." },
      { heading: "Objectives", body: "Complete the 10-month R&D programme; validate durable learning outcomes; onboard 3-5 design partners; convert successful pilots to paid usage; and establish repeatable onboarding, evidence, security, and support practices." },
    ],
  },
  {
    id: "market-analysis", title: "Market and competitive analysis", category: "Business context", generated: true, description: "Segments, alternatives, differentiation, and validation plan.",
    sections: [
      { heading: "Target segments", body: "Prioritize Canadian and North American EdTech applications and tutoring operators with existing digital content, sufficient learner events, an identified personalization problem, and no internal psychometrics or adaptive-platform team." },
      { heading: "Customer alternatives", body: "Fixed sequencing and hand-authored rules; building an internal model and experimentation stack; broad learning-management platforms; assessment and analytics vendors; or delaying personalization. Validate named competitors and current pricing before external submission." },
      { heading: "Differentiation", body: "Metadata-only integration, customer custody of content and identity, auditable decisions, tenant isolation, versioned models, measurable learning outcomes, and a narrow API that complements rather than replaces the customer product." },
      { heading: "Validation programme", body: "Conduct 5-10 structured discovery interviews, secure 3-5 design partners, document current workflow and willingness to pay, measure integration time and outcome value, and record loss reasons. Update market sizing from cited current sources." },
    ],
  },
  {
    id: "product-roadmap", title: "Product and commercialization roadmap", category: "Business context", generated: true, description: "Phased technical and market execution plan.",
    sections: [
      { heading: "Phase 1 - Foundation", body: "Provision managed staging, deploy the service, synchronize Brightwick metadata, validate monitoring and backups, and begin shadow-mode comparison. Exit when decisions are reliable, auditable, and operationally safe." },
      { heading: "Phase 2 - R&D evidence", body: "Complete sparse-data model comparison and empirical difficulty calibration. Exit with versioned model decisions, calibrated thresholds, reproducible analysis, and documented limitations." },
      { heading: "Phase 3 - Outcome validation", body: "Run adaptive-versus-baseline testing with delayed review outcomes and guardrails. Exit with a defensible promote, revise, or rollback decision." },
      { heading: "Phase 4 - Design partners", body: "Onboard 3-5 external tenants, validate mapping, isolation, latency, coverage, and support needs, and convert successful pilots into paid usage." },
      { heading: "Phase 5 - Scale", body: "Standardize self-serve onboarding, security materials, service levels, analytics, pricing, and customer success; expand into schools and professional training when privacy and outcome evidence support the move." },
    ],
  },
];

export const documentCategories: DocumentCategory[] = ["Corporate & legal standing", "Employment & payroll", "Financial", "R&D project", "Reimbursement substantiation", "Business context"];
