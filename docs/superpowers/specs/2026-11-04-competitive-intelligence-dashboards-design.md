# Competitive Intelligence Dashboards

## Intent

Turn the local.ai-inspired hardware comparison into a Databricks competitive-intelligence product. The navigation becomes a set of distinct dashboards rather than links to unrelated pages.

## Direction

- Preserve the approved flat white canvas, compact controls, blue primary accent, fine borders, and dense analytical layout.
- Rename the first view to **Competitor products** and compare Databricks with Snowflake.
- Lead with total mentions and share of voice, then show mention trend, source mix, sentiment, and product-level performance.
- Provide distinct **Market pulse**, **Audience**, **Campaigns**, and **Reports** dashboards through the same tabbed shell.
- Keep the data clearly demo-grade and deterministic; no external API or invented real-time claims.
- Support desktop and mobile without page-level horizontal overflow.

## Reference lock

Primary reference: the approved local.ai hardware page implementation and the user's live-page screenshots. Preserve the slim sticky navigation, 60px desktop gutters, restrained blue/neutral palette, compact pills, full-width chart frame, and information-dense table. Borrow only the red/blue comparison language for Databricks and Snowflake. Reject generic card grids, gradients, oversized KPIs, and decorative dashboard chrome.

## Approach

Use a workspace-owned React dashboard and data module. This replaces the external Downloads import while leaving the supplied files untouched. A pure data module supplies deterministic datasets and tab metadata; the React layer handles tabs, filters, chart rendering, and responsive presentation.

