# Competitive Intelligence Dashboards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardware demo with a tabbed competitive-intelligence product led by a Snowflake-versus-Databricks product mentions dashboard.

**Architecture:** A pure JavaScript data module defines dashboard tabs and deterministic competitive datasets. A workspace React component renders the shared shell and separate dashboard views, while a dedicated stylesheet preserves the approved visual reference and responsive behavior.

**Tech Stack:** React 19, TypeScript, Vite 8, CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-04-competitive-intelligence-dashboards-design.md`

## Global Constraints

- Do not modify the files in Downloads.
- Keep the approved local.ai-inspired shell and density.
- Data must be deterministic and presented as demo data, not live external claims.
- No new runtime dependencies.
- No page-level horizontal overflow at 390px.

## Review Focus

- Every tab must reveal a distinct dashboard view.
- Company toggles must update competitor chart visibility and totals coherently.
- Product rows must remain scannable at desktop and usable at mobile.
- Charts must have accessible labels and non-color-only company identification.
- Empty or single-company selections must not break chart geometry.

---

### Task 1: Dashboard data contract

**Files:**
- Create: `src/dashboardData.js`
- Create: `tests/dashboardData.test.mjs`

**Interfaces:**
- Produces: `dashboardTabs`, `competitors`, `mentionSeries`, `productRows`, `channelRows`, and `getMentionTotal(companyId)`.

- [ ] Write tests for tab identities, company totals, and product ordering.
- [ ] Run `node --test tests/dashboardData.test.mjs` and verify the missing-module failure.
- [ ] Implement the deterministic data contract.
- [ ] Run the test and verify all assertions pass.

### Task 2: Shared shell and dashboard views

**Files:**
- Create: `src/DashboardApp.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: Task 1 exports.
- Produces: interactive tab navigation, company selection, timeframe control, SVG trend chart, and five dashboard views.

- [ ] Render the Competitor products dashboard and its interactions.
- [ ] Render four distinct secondary dashboard views.
- [ ] Replace the external Downloads app import in `src/main.tsx`.

### Task 3: Reference-locked styling and verification

**Files:**
- Create: `src/dashboard.css`
- Modify: `src/DashboardApp.tsx`

**Interfaces:**
- Consumes: Task 2 class names and state.
- Produces: desktop and responsive dashboard presentation.

- [ ] Implement the approved flat, compact visual system and responsive rules.
- [ ] Run `node --test tests/dashboardData.test.mjs` and `npm run build`.
- [ ] Verify desktop and 390px mobile layouts in the browser, including tab and filter interactions.
