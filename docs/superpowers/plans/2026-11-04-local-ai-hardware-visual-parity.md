# local.ai Hardware Visual Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing local Hardware preview closely match the authenticated desktop layout at `https://local.ai/hardware` without changing the current demo interactions or data.

**Architecture:** Keep the supplied `Downloads/App.tsx` and `Downloads/App.css` as the functional source. Add a workspace-owned CSS parity layer imported after the supplied stylesheet so the visual target can be reached without mutating files outside the writable workspace.

**Tech Stack:** React 19, TypeScript, Vite 8, CSS, Codex in-app browser visual QA.

**Spec:** Live reference `https://local.ai/hardware` and `/var/folders/vq/cx8p_w9x78vby2_7ywds82700000gn/T/TemporaryItems/NSIRD_screencaptureui_LShBDe/Screenshot 2026-11-04 at 18.52.52.png`.

## Global Constraints

- Preserve all existing interactions, demo data, responsive behavior, and dark-mode toggle.
- Match the live desktop page at approximately 1512×708 CSS pixels: 53px sticky header, 40–60px gutters, flat sections, compact pills, red/blue chart series, and wider data regions.
- Use Inter/system sans typography, blue only for primary UI emphasis, green only for selected states, and red/blue only for chart series.
- Do not add dependencies or mutate the original files in Downloads.

## Review Focus

- Desktop width around 1512px must not retain the old centered 1230px card layout.
- Mobile widths must remain usable without horizontal page overflow.
- Inline chart colors must be overridden consistently in chips, legend, lines, and points.
- Popovers and expanded rows must remain legible after the density changes.
- Keyboard focus states must remain visible.

---

### Task 1: Add the visual parity layer

**Files:**
- Create: `src/parity.css`
- Modify: `src/main.tsx`
- Test: visual comparison in the local browser plus `npm run build`

**Interfaces:**
- Consumes: existing class names emitted by `Downloads/App.tsx`.
- Produces: a post-source stylesheet that restyles those classes without changing component behavior.

- [ ] **Step 1: Capture the failing visual state**

Compare the current localhost screenshot with the live page at 1512×708. Confirm the current 69px header, centered 1230px content width, bordered comparison card, oversized stacked machine chips, dark chart palette, and narrow table differ from the live target.

- [ ] **Step 2: Import `src/parity.css` after the supplied app module**

Add `import './parity.css';` in `src/main.tsx` after the App import so the new rules win the cascade.

- [ ] **Step 3: Implement the parity tokens and desktop layout**

Create `src/parity.css` with reference-locked typography, neutral/blue tokens, header sizing, full-width main layout, flat comparison sections, compact pills, aligned budget/summary rows, chart framing, and table density.

- [ ] **Step 4: Implement responsive fallbacks**

Add 1100px, 820px, and 600px rules that stack the comparison/budget controls, retain accessible controls, and prevent horizontal page overflow.

- [ ] **Step 5: Verify build and visual parity**

Run `npm run build`; expected: exit 0. Reload localhost, capture desktop and narrow screenshots, and compare typography, spacing, color, section boundaries, chart/table width, and interaction states against the source truth.

