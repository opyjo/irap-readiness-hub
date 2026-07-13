# Integrated IRAP Estimate Model

## Summary

Add an **Estimates** tab that produces editable lean, base, and expanded scenarios for the 10-month adaptive-engine R&D project. The model will cover project costs, a planning contribution request, reimbursement liquidity, three-year SaaS revenue, staffing, and Canadian benefits. The **Base** scenario will be selected by default and synchronized into the relevant generated documents.

All figures will be labelled **planning estimates in CAD**, not confirmed IRAP eligibility or contribution rates.

## Key changes

- Add an editable scenario model using these default labour benchmarks:
  - Technical lead: **$56.49/hour**
  - R&D software developer: **$48.08/hour**
  - Data/learning specialist: **$46.33/hour**
  - Employer cash-cost allowance: **12%**
  - Specialist contractor: **$150/hour**
  - Wage defaults will cite current Government of Canada Job Bank Toronto benchmarks.
- Seed three 10-month project scenarios:
  - **Lean:** 240 lead hours, 600 developer hours, 160 specialist hours, and 40 contractor hours; estimated total approximately **$72,000**; illustrative 50% contribution approximately **$36,000**.
  - **Base:** 480 lead hours, 1,200 developer hours, 640 specialist hours, and 80 contractor hours; estimated total approximately **$158,000**; illustrative 50% contribution approximately **$79,000**.
  - **Expanded:** 720 lead hours, 1,600 developer hours, 1,200 specialist hours, and 160 contractor hours; estimated total approximately **$248,000**; illustrative 50% contribution approximately **$124,000**.
  - Exact totals will be calculated live from labour, payroll burden, infrastructure, security/testing, and contractor inputs rather than hard-coded display values.
- Make contribution percentage, eligible-cost toggles, claim delay, non-project burn, operating reserve, pricing, customer counts, conversion, churn, and hiring editable.
- Clearly distinguish:
  - total project cost;
  - potentially eligible cost;
  - illustrative IRAP request;
  - company contribution;
  - non-eligible cost; and
  - minimum working-capital requirement.
- Add monthly cash-flow calculations using a default **35-business-day reimbursement planning window**, adjustable by the user. Show maximum pre-reimbursement exposure, lowest cash requirement, reserve requirement, and funding gap.
- Add bottom-up three-year SaaS projections using editable design-partner fees, pilot fees, production tenants, annual contract value and usage revenue, conversion, churn, gross margin, hiring, and operating costs.
- Seed conservative lean, base, and expanded revenue paths rather than presenting them as commitments.
- Calculate Canadian benefits from the selected scenario:
  - incremental Canadian jobs;
  - Canadian R&D payroll;
  - technical capability added;
  - three-year Canadian revenue;
  - export revenue; and
  - Canadian-controlled IP and partner indicators.
- Synchronize the selected scenario into the project brief, project budget, cash-flow forecast, three-year projections, labour schedule, commercialization plan, business plan, and Canadian-benefit document.
- Preserve `[INPUT]` markers for actual cash, historical revenue, ownership, payroll, and partner evidence.
- Persist assumptions and the selected scenario in local storage.
- Provide **Reset to planning defaults** and **Export estimate PDF** actions.

## Interfaces and data flow

- Introduce typed estimate structures for scenario assumptions, labour roles, non-labour costs, contribution assumptions, revenue drivers, and calculated outputs.
- Keep calculation functions pure and centralized so the dashboard and generated documents use identical totals.
- Treat the 50% contribution as an editable illustration only; no interface or PDF may describe it as an official NRC IRAP rate.
- Include founder labour in total project cost but mark its eligibility as pending until payroll status and advisor treatment are confirmed.
- Preserve the existing document reader and multipage PDF-generation behaviour.

## Test plan

- Verify labour, payroll burden, non-labour, potentially eligible cost, illustrative contribution, and company-share arithmetic for every scenario.
- Verify cash-flow timing and maximum funding-gap calculations when contribution rate, claim delay, or monthly operating burn changes.
- Verify three-year revenue calculations for tenant growth, pricing, conversion, churn, and gross margin.
- Verify synchronized document values match the scenario selected in the Estimates tab.
- Verify local-storage restoration and reset behaviour.
- Reject or safely normalize invalid numbers, negative hours, percentages outside their valid range, and non-finite calculations.
- Ensure no interface or document presents an illustrative contribution rate or potentially eligible cost as confirmed NRC guidance.
- Run the production build, TypeScript checks, ESLint, document-structure checks, and a PDF render inspection of the integrated estimate pack.
- Review desktop, tablet, and mobile layouts.

## Assumptions

- Currency: Canadian dollars.
- Project duration: 10 months.
- Default selected scenario: Base.
- Expanded team composition: technical lead, primary R&D developer, and data/learning specialist, with limited external specialist support.
- Compensation defaults are market-planning benchmarks, not actual payroll.
- Default employer cash-cost allowance is 12%; its eligibility remains advisor-dependent.
- Default illustrative contribution is 50% of potentially eligible costs and must be replaced when NRC provides project-specific guidance.
- Current cash, historical financial statements, actual salaries, tax balances, and signed customer evidence remain blank until supported by source records.

## Source references

- [NRC IRAP financial support for technology innovation](https://nrc.canada.ca/en/support-technology-innovation/financial-support-technology-innovation)
- [NRC IRAP service standards](https://nrc.canada.ca/en/support-technology-innovation/nrc-irap-service-standards)
- [Government of Canada Job Bank — Software Developer wages in Toronto](https://www.jobbank.gc.ca/marketreport/wages-occupation/22548/geo9219)
- [Government of Canada Job Bank — Data Scientist wages in Toronto](https://www.jobbank.gc.ca/marketreport/wages-occupation/227147/geo9219)
- [Government of Canada Job Bank — Software Engineer wages in Toronto](https://www.jobbank.gc.ca/marketreport/summary-occupation/5485/geo9219)
