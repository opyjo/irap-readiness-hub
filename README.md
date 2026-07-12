# IRAP Readiness Hub

A private executive preparation application for Opyjo Consulting's Adaptive
Engine business case, technical architecture, R&D programme and NRC IRAP
advisor meeting.

## What it includes

- executive readiness dashboard and live meeting countdown;
- detailed business model, customer segments, commercialization and KPIs;
- adaptive-engine learner model, selection policy and worked example;
- technical architecture, request lifecycle, data model and security boundary;
- four research work packages with uncertainty, method, evidence and outcomes;
- current official NRC IRAP guidance and a corrected technical-project budget;
- advisor Q&A, presentation mode and questions to ask;
- persistent device-local action tracker and meeting notes;
- responsive, reduced-motion and printable layouts.

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
