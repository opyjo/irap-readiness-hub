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
      { id: "call", label: "Meeting teleprompter", index: "12" },
      { id: "funding", label: "Funding case", index: "13" },
      { id: "estimates", label: "Estimates", index: "14" },
      { id: "assumptions", label: "Assumptions register", index: "15" },
      { id: "guidance", label: "NRC IRAP guidance", index: "16" },
      { id: "documents", label: "Document vault", index: "17" },
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
    answer: "We are building a smart learning assistant for education companies. It looks at how a learner is doing and suggests the best thing for that person to practise next. The education company keeps its own app, content and customers; our product works quietly behind it.",
    proof: ["We sell to education businesses, not directly to learners", "The customer sends a learning result; we return the next best activity", "Brightwick will be the first place we use and test it"],
    caution: "Say it is built and tested internally. Do not say it is already proven in the market.",
  },
  {
    category: "Current stage",
    question: "What exists today?",
    answer: "The working foundation is built. It can receive a learner’s result, update what we know about that learner and recommend what should come next. We have tested it internally. The next step is to put it into a real working environment, watch it carefully without affecting learners, and then run a measured pilot.",
    proof: ["The main product flow works", "Security and record-keeping are built in", "Next comes a safe trial, followed by a measured pilot"],
    caution: "Say internally tested—not commercially or scientifically proven.",
  },
  {
    category: "R&D core",
    question: "What important questions are still unanswered?",
    answer: "The big unknown is whether we can make a good decision when we know very little about a new learner. We also need to learn how hard each activity truly is and prove that our recommendations help people remember more—not simply click more.",
    proof: ["Can we help a learner after only a few answers?", "Can we learn the true difficulty of each activity?", "Do our choices improve real learning over time?"],
    caution: "The R&D is about answering these unknowns, not routine software work.",
  },
  {
    category: "R&D core",
    question: "Why is this research and not normal product work?",
    answer: "Normal software work can build the product, but it cannot tell us which approach will make the best learning decisions. We have to compare several approaches, test them with real behaviour and measure whether learners actually improve. We do not know the answer in advance.",
    proof: ["There is no ready-made setting that is guaranteed to work for our learners", "Past data can help us narrow the choices", "A fair comparison is needed to prove improvement"],
    caution: "Do not claim every method is brand new. The new knowledge comes from finding what works here.",
  },
  {
    category: "R&D core",
    question: "What ideas will you test?",
    answer: "We will test three ideas. First, a better approach should understand new learners sooner. Second, the system should learn the true difficulty of an activity without changing its mind too quickly. Third, personalized recommendations should help learners remember more or master a topic faster than a fixed lesson order.",
    proof: ["Understand new learners sooner", "Learn difficulty without unstable changes", "Improve memory or speed to mastery"],
    caution: "These are ideas we will test, not results we can promise.",
  },
  {
    category: "R&D core",
    question: "How will you carry out the research?",
    answer: "We will compare several ways of judging what a learner knows. We will use past learning activity where available, then run a fair test: one group receives personalized recommendations and another follows a normal fixed order. Later, we will check what each group still remembers.",
    proof: ["Compare different decision methods", "Learn the real difficulty of activities", "Compare personalized learning with a normal fixed order", "Repeat the test with another education business"],
    caution: "Be clear about which information already exists and which still needs to be collected.",
  },
  {
    category: "R&D core",
    question: "What evidence will tell you the R&D succeeded?",
    answer: "Success means we can show, with numbers, that the system makes better decisions and helps people learn. We will measure how quickly it understands a new learner, how often its suggestions are useful, what learners remember later and how long mastery takes. A negative result is still useful because it tells us what not to build.",
    proof: ["Measures are chosen before the test starts", "Results are compared with a normal learning path", "A negative result still gives us valuable knowledge"],
    caution: "Clicks and time in the app are not enough; the main measure is learning.",
  },
  {
    category: "R&D core",
    question: "What could go wrong, and how will you reduce the risk?",
    answer: "The main risks are not having enough information, comparing groups that are not truly similar, changing recommendations too quickly, and collecting more personal information than needed. We will start cautiously, keep a safe standard lesson order as a backup, test quietly first and use anonymous learner codes.",
    proof: ["Use a normal lesson order when confidence is low", "Watch recommendations before showing them to learners", "Collect only the minimum learning information needed"],
    caution: "Explain that we reduce risk; we cannot remove every risk.",
  },
  {
    category: "R&D core",
    question: "What will the R&D project produce?",
    answer: "At the end, we expect to know which decision method works best, how to keep activity difficulty accurate, whether personalized learning beats a normal lesson order, and how to set up a new business customer safely. This turns working software into a product supported by real evidence.",
    proof: ["A clear decision on the best approach", "A reliable way to keep difficulty ratings current", "A learning-results report and customer setup guide"],
    caution: "These are project outputs. Sales and revenue are separate future outcomes.",
  },
  {
    category: "Team & capacity",
    question: "Who will perform the R&D in Canada?",
    answer: "Opyjo will lead and manage the work in Canada. Each person will have a clear job, such as building the product, reviewing the results or designing the learning test. Before submitting a project, we will confirm each person’s name, employment status and time on the work.",
    proof: ["The work and records stay under Canadian control", "Every major task has a named owner", "Payroll and time records will support the plan"],
    caution: "Replace this answer with exact names, roles and T4 facts before the call.",
  },
  {
    category: "Eligibility",
    question: "How many employees receive a T4, excluding founders and executives?",
    answer: "Give the exact number from payroll. Deepak’s note says the company needs at least one full-time employee who is not a founder or executive and receives a T4. State the person’s role, start date and whether payroll records are available.",
    proof: ["Exact headcount", "Role and full-time status", "Payroll/start-date evidence"],
    caution: "Do not guess or count a contractor as an employee.",
  },
  {
    category: "Company",
    question: "How is the company incorporated and who owns it?",
    answer: "Give the company’s exact legal name, where and when it was incorporated, who owns what percentage, and whether it is connected to any other company. Then explain which company owns the product and receives the business income.",
    proof: ["Canadian for-profit company", "Clear list of owners and related companies", "The product belongs to the company doing the business"],
    caution: "Use the corporate records; do not answer from memory if uncertain.",
  },
  {
    category: "IP",
    question: "What is your intellectual-property strategy?",
    answer: "Our first priority is making sure Opyjo clearly owns the work. Employees and contractors must sign agreements that transfer their work to the company. We will protect the software and important know-how by limiting access and keeping clear records. We will consider a patent only if the idea is truly new and worth the cost.",
    proof: ["Signed ownership agreements", "Limited access to important business know-how", "Review trademarks or patents only when the business case is clear"],
    caution: "Do not claim patent protection unless an application actually exists.",
  },
  {
    category: "Market",
    question: "Who will buy it?",
    answer: "Our first customers are education and tutoring businesses that already have lessons and learners but do not have a team to build personalized learning. Brightwick is our first place to test the product. After that, we will work with a few partner businesses before selling more broadly.",
    proof: ["Learning products with content and traffic but no adaptive team", "Brightwick as first evidence source", "Design partners before broader institutional sales"],
    caution: "Distinguish current users, design partners and future target customers.",
  },
  {
    category: "Commercialization",
    question: "How will the company make money?",
    answer: "Education businesses will pay to connect their product to ours. They can start with a paid pilot, then pay based on how much they use the service. Larger customers can pay more for reporting, stronger support and business-level controls.",
    proof: ["A setup fee for a pilot", "Ongoing charges based on usage", "Higher-priced plans for larger organizations"],
    caution: "Label pricing and revenue as planning assumptions until contracted.",
  },
  {
    category: "Traction",
    question: "What major objectives have you overcome in the last 24 months?",
    answer: "We took the personalized-learning feature out of one learning product and turned it into a separate product that other education businesses can use. The main flow, security, customer separation, record-keeping and internal tests are complete. The foundation is ready for a careful real-world trial.",
    proof: ["The product now works separately from our consumer app", "Every result and recommendation can be traced", "The foundation is ready for a controlled trial"],
    caution: "Use dates and verifiable milestones; remove anything not actually completed.",
  },
  {
    category: "Defensibility",
    question: "Why is this defensible?",
    answer: "Another company could copy the basic software. What is harder to copy is years of learning evidence, a proven way to make good recommendations, an easy customer setup process and trust that the product is safe. Our advantage grows as we learn what works across more customers and learners.",
    proof: ["Learning evidence collected over time", "A proven record of better learning results", "Customer trust, privacy and easy setup"],
    caution: "Do not say data alone is a moat; emphasize accumulated evidence and execution.",
  },
  {
    category: "Funding capacity",
    question: "How will you fund growth if IRAP does not contribute?",
    answer: "IRAP would help us move faster, but the business cannot depend on IRAP to survive. We will use company income, founder or investor money where available, hire in stages and spend only when milestones are reached. We also need enough cash to pay the team before any IRAP reimbursement arrives.",
    proof: ["A basic plan the company can fund", "Cash available before reimbursement", "Hiring and spending happen in stages"],
    caution: "Insert verified cash, revenue and investor figures—never speculative numbers.",
  },
  {
    category: "IRAP fit",
    question: "What would IRAP accelerate?",
    answer: "IRAP could help pay Canadian staff to test which learning approach works, learn the true difficulty of activities, measure learning results and test the product with another business. It would let us complete the research sooner and hire Canadian talent earlier.",
    proof: ["Canadian staff doing the research", "Careful testing and measurement", "Earlier testing with outside business customers"],
    caution: "Do not position IRAP as funding sales, routine operations or work already completed.",
  },
  {
    category: "Economic benefit",
    question: "What is the benefit to Canada?",
    answer: "The project creates skilled jobs in Canada and builds a Canadian-owned education product that can be sold internationally. If the research is successful, the main knowledge, product ownership and high-value work will remain in Canada while we earn income from customers in other countries.",
    proof: ["Skilled Canadian jobs", "Canadian-owned product and know-how", "Ongoing income from customers outside Canada"],
    caution: "Use conservative job and revenue numbers tied to the documented plan.",
  },
  {
    category: "Milestones",
    question: "What happens next, and when?",
    answer: "First, we will put the product into a safe working environment and watch its recommendations without affecting learners. Next, we will compare different decision methods and improve the activity difficulty ratings. Then we will run a fair learning test and repeat the process with another education business. We will review the evidence before moving to each stage.",
    proof: ["Months 1–3: understand new learners", "Months 2–5: improve difficulty ratings", "Months 4–10: measure learning and test with another business"],
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
