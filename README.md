# Clal POC — Vue

Vue 3 + TypeScript port of the [Clal POC](https://github.com/Walkmaze/ClalPOC), targeting integration with the
**Flowmaze frontend** (Vue 3 + TS + Vite + Pinia + PrimeVue + vue-i18n + Vue Flow + Chart.js).

The POC simulates an insurance back-office automation flow: scenario generation, AI-driven validation engine
(Claude API), human-in-the-loop reviews, audit trail, executions dashboard, and a regulations knowledge base
built from uploaded documents.

## Tech stack

- **Vue 3.5** with `<script setup lang="ts">` Composition API
- **TypeScript 5.5** (strict)
- **Vite 5**
- **Pinia 2** — options syntax stores, manual `localStorage` persistence
- **vue-router 4** — feature-based route files
- **vue-i18n 9** (legacy: false), JSON locale files
- **PrimeVue 4 (Aura)** — Toast / ConfirmDialog only; rest of the UI is raw Tailwind to match the React POC look
- **Tailwind 4** + `tailwindcss-primeui`, custom theme tokens for the dark teal palette
- **Chart.js 4** — dashboard charts
- **Anthropic Claude API** — validation generation + regulation extraction (browser-direct fetch)
- **pdfjs-dist** + **mammoth** — lazy-loaded PDF/DOCX parsing for regulation imports

## Project structure

The folder layout mirrors Flowmaze's domain-driven conventions so the `domain/ClalPOC` module can be
transplanted into the Flowmaze monorepo when the time comes:

```
src/
├── App.vue, main.ts, routes.ts, i18n.ts, app.css
├── assets/locales/             # en.json (Hebrew TBD)
├── shared/
│   ├── components/             # BaseChart.vue
│   ├── layout/AppLayout.vue
│   ├── stores/settings.store.ts
│   └── utils/formatters.ts
└── domain/ClalPOC/
    ├── application/            # composables (placeholder)
    ├── domain/
    │   ├── models/             # TS types: Member, Contract, Regulation, Validation, Execution, Outcome, Audit
    │   └── services/           # pure logic: dataGenerators, validationEngine, bulkGenerator, flowDiagramBuilder, executionHelpers
    ├── infrastructure/
    │   ├── services/           # claudeApi (with PII redaction), regulationImport (file parsing + LLM extraction)
    │   └── stores/             # regulations.store, scenario.store, executions.store
    └── presentation/
        ├── components/         # FlowExecution, ValidationCard, OutcomeCard, HitlPanel, AuditTrail, DataTabs, etc.
        ├── routes/             # clalPoc.routes.ts
        └── views/              # Dashboard, Executions, ExecutionDetail, ScenarioBuilder, Regulations, Settings
```

## Running locally

```bash
npm install
npm run dev      # Vite dev server (HMR)
npm run build    # vue-tsc --noEmit + vite build
npm run lint
npm run format
```

Then open the dev URL Vite prints.

To use the AI features you need a Claude API key — paste it in **Settings**. It's stored in `localStorage`
and used for: generating validations per scenario, and extracting structured regulations from uploaded files.

## Features

- **Dashboard** — 4 metric cards + 7 charts (status donut, success/SLA/avg time per fund, priority distribution
  stacked, executions over time, HITL resolution time).
- **Scenario Builder** — fund type / use case selector, random scenario generator, full editable forms for
  member data / contract clauses with conditions / regulations, Launch button + Bulk Launch (5–50 mock scenarios).
- **Executions list** — table with filters (status, priority, fund type) + search, KPI tiles, SLA warning indicators.
- **Execution detail** — flow execution cards with per-validation status / category / source / rule / result,
  outcome panel rich per use case (tax breakdown, track allocation for study fund, mock POST endpoints,
  Hebrew RTL SMS templates), HITL multi-step review panel, Audit Trail, Claude conversation log, DriverU
  payload tab.
- **Regulations Management** — upload TXT/MD/PDF/DOCX (200 KB max), per-file extraction status, click
  "Generate Knowledge Base" to re-extract everything via Claude. KB entries (file-derived + manual) feed
  into scenario generation. Persisted in `localStorage`.
- **Settings** — API key + language toggle (English / Hebrew, RTL ready).

## Status

| Area                     | Status                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- |
| Pure-logic port          | ✅ all React POC `lib/` ported to TS with domain models                          |
| Pinia stores             | ✅ settings, regulations, scenario, executions (engine with HITL promise wait)   |
| Routing + layout         | ✅ vue-router with lazy views                                                    |
| Settings view            | ✅ matches React POC                                                             |
| Regulations Management   | ✅ upload, KB editor, generate, manual entries, per-file traceability            |
| Scenario Builder         | ✅ random scenario + editable forms (input / contract / regulations)             |
| Executions list & detail | ✅ filters, validation cards, outcomes, HITL, audit, claude log, DriverU payload |
| Dashboard                | ✅ Chart.js charts                                                               |
| Hebrew translations      | ⏳ `he.json` not yet populated (toggle changes `dir=rtl` only)                   |
| Flow diagram             | ❌ explicitly out of scope                                                       |

## Source POC

This Vue project ports the React POC at [Walkmaze/ClalPOC](https://github.com/Walkmaze/ClalPOC). Functional
parity is the goal; UI adopts the same dark teal palette and layout patterns.
