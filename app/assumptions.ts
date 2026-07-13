export type AssumptionStatus = "planning" | "review" | "verified";
export type Assumption = { id: string; label: string; category: string; value: string; unit: string; status: AssumptionStatus; source: string; sourceDate: string; owner: string; notes: string };

export const defaultAssumptions: Assumption[] = [
  { id: "project-cost", label: "Total project cost", category: "Financial", value: "158000", unit: "CAD", status: "planning", source: "Base estimate scenario", sourceDate: "2026-07-13", owner: "Project lead", notes: "Replace with approved project budget." },
  { id: "irap-request", label: "Illustrative IRAP request", category: "Financial", value: "79000", unit: "CAD", status: "planning", source: "50% planning illustration", sourceDate: "2026-07-13", owner: "Finance", notes: "Not an official contribution rate." },
  { id: "company-share", label: "Company contribution", category: "Financial", value: "79000", unit: "CAD", status: "planning", source: "Base estimate scenario", sourceDate: "2026-07-13", owner: "Finance", notes: "Verify liquidity and cost eligibility." },
  { id: "working-capital", label: "Minimum working capital", category: "Financial", value: "66600", unit: "CAD", status: "planning", source: "Cash-flow model", sourceDate: "2026-07-13", owner: "Finance", notes: "Includes reserve and reimbursement exposure." },
  { id: "revenue-3y", label: "Three-year adaptive-engine revenue", category: "Commercial", value: "1220500", unit: "CAD", status: "planning", source: "Base SaaS scenario", sourceDate: "2026-07-13", owner: "Commercial lead", notes: "Requires pipeline and pricing validation." },
  { id: "export-revenue", label: "Three-year export revenue", category: "Canadian benefit", value: "427175", unit: "CAD", status: "planning", source: "35% export-share assumption", sourceDate: "2026-07-13", owner: "Commercial lead", notes: "Base-case estimate." },
  { id: "canadian-jobs", label: "Incremental Canadian jobs", category: "Canadian benefit", value: "2", unit: "jobs", status: "planning", source: "Base staffing scenario", sourceDate: "2026-07-13", owner: "Project lead", notes: "Confirm timing and employment status." },
  { id: "design-partners", label: "Design partners", category: "Commercial", value: "5", unit: "partners", status: "planning", source: "Commercialization plan", sourceDate: "2026-07-13", owner: "Commercial lead", notes: "Target, not signed commitments." },
  { id: "coverage", label: "Eligible-bank coverage", category: "Technical", value: "95", unit: "%", status: "review", source: "Proposed acceptance threshold", sourceDate: "2026-07-13", owner: "Technical lead", notes: "Measure during shadow testing." },
  { id: "latency", label: "p95 response latency", category: "Technical", value: "250", unit: "ms", status: "review", source: "Proposed service threshold", sourceDate: "2026-07-13", owner: "Technical lead", notes: "Validate under representative load." },
  { id: "conversion", label: "Pilot-to-paid conversion", category: "Commercial", value: "30", unit: "%", status: "planning", source: "Base commercial scenario", sourceDate: "2026-07-13", owner: "Commercial lead", notes: "Validate through design partners." },
];
