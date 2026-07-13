export type ScenarioId = "lean" | "base" | "expanded";

export type EstimateInputs = {
  contributionRate: number; claimDelayMonths: number; monthlyBurn: number; operatingReserve: number;
  leadHours: number; developerHours: number; specialistHours: number; contractorHours: number;
  leadRate: number; developerRate: number; specialistRate: number; contractorRate: number; payrollBurden: number;
  infrastructure: number; security: number; designPartnerFee: number; pilotFee: number; annualContract: number;
  year1Tenants: number; year2Tenants: number; year3Tenants: number; exportShare: number; hires: number;
};

export const defaults: Record<ScenarioId, EstimateInputs> = {
  lean: { contributionRate: 50, claimDelayMonths: 2, monthlyBurn: 3000, operatingReserve: 15000, leadHours: 240, developerHours: 600, specialistHours: 160, contractorHours: 40, leadRate: 56.49, developerRate: 48.08, specialistRate: 46.33, contractorRate: 150, payrollBurden: 12, infrastructure: 3500, security: 2500, designPartnerFee: 2500, pilotFee: 7500, annualContract: 18000, year1Tenants: 2, year2Tenants: 5, year3Tenants: 9, exportShare: 25, hires: 1 },
  base: { contributionRate: 50, claimDelayMonths: 2, monthlyBurn: 5000, operatingReserve: 25000, leadHours: 480, developerHours: 1200, specialistHours: 640, contractorHours: 80, leadRate: 56.49, developerRate: 48.08, specialistRate: 46.33, contractorRate: 150, payrollBurden: 12, infrastructure: 7000, security: 6000, designPartnerFee: 3500, pilotFee: 12000, annualContract: 30000, year1Tenants: 3, year2Tenants: 8, year3Tenants: 16, exportShare: 35, hires: 2 },
  expanded: { contributionRate: 50, claimDelayMonths: 2, monthlyBurn: 8000, operatingReserve: 40000, leadHours: 720, developerHours: 1600, specialistHours: 1200, contractorHours: 160, leadRate: 56.49, developerRate: 48.08, specialistRate: 46.33, contractorRate: 150, payrollBurden: 12, infrastructure: 12000, security: 10000, designPartnerFee: 5000, pilotFee: 18000, annualContract: 45000, year1Tenants: 5, year2Tenants: 14, year3Tenants: 28, exportShare: 45, hires: 4 },
};

export function normalize(input: EstimateInputs): EstimateInputs {
  const result = { ...input };
  for (const key of Object.keys(result) as Array<keyof EstimateInputs>) result[key] = Number.isFinite(Number(result[key])) ? Math.max(0, Number(result[key])) : 0;
  result.contributionRate = Math.min(100, result.contributionRate); result.payrollBurden = Math.min(100, result.payrollBurden); result.exportShare = Math.min(100, result.exportShare);
  return result;
}

export function calculate(raw: EstimateInputs) {
  const i = normalize(raw); const wages = i.leadHours*i.leadRate + i.developerHours*i.developerRate + i.specialistHours*i.specialistRate;
  const payroll = wages * i.payrollBurden/100; const contractor = i.contractorHours*i.contractorRate;
  const total = wages + payroll + contractor + i.infrastructure + i.security;
  const potentiallyEligible = total; const request = potentiallyEligible*i.contributionRate/100; const companyShare = total-request;
  const monthlyProject = total/10; const preReimbursement = monthlyProject*Math.max(1, i.claimDelayMonths); const workingCapital = preReimbursement+i.monthlyBurn*Math.max(1,i.claimDelayMonths)+i.operatingReserve;
  const revenue = [i.year1Tenants, i.year2Tenants, i.year3Tenants].map((tenants, year) => tenants*i.annualContract + (year === 0 ? tenants*(i.designPartnerFee+i.pilotFee) : 0));
  return { i, wages, payroll, contractor, total, potentiallyEligible, request, companyShare, nonEligible: 0, monthlyProject, preReimbursement, workingCapital, revenue, threeYearRevenue: revenue.reduce((a,b)=>a+b,0), exportRevenue: revenue.reduce((a,b)=>a+b,0)*i.exportShare/100 };
}

export const cad = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
