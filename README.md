# Opyjo Adaptive Engine Console

An Ontario-first, Canadian B2B adaptive-learning engine console for education
platforms and publishers. The previous IRAP preparation material remains in the
repository as internal planning documentation.

## What it includes

- versioned Ontario Grades 1–8 mathematics curriculum graph;
- multi-concept content mapping and empirical item calibration;
- diagnostic, practice, remediation and review sessions;
- probabilistic learner mastery, confidence and retention risk;
- explainable, versioned recommendations with educator overrides;
- content-quality, curriculum-coverage and privacy-safe cohort analytics;
- Canadian-region, bilingual and accountable model-governance controls;
- native API integration surface with an additive v2 contract.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
npm audit --omit=dev
```

Task progress and notes use browser local storage. Do not enter credentials,
learner information or other sensitive personal data.
