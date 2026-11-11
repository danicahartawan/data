import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  competitors,
  dashboardTabs,
  getMentionTotal,
  getShareOfVoice,
  buildCodexPrompt,
  mentionSeries,
  productRows,
} from '../src/dashboardData.js';

test('defines five distinct dashboard destinations', () => {
  assert.deepEqual(dashboardTabs.map((tab) => tab.id), [
    'products', 'market', 'audience', 'campaigns', 'reports',
  ]);
});

test('Codex handoff prompt is scoped to the editable dashboard files', () => {
  const prompt = buildCodexPrompt('Make the mentions chart monthly.');
  assert.match(prompt, /Make the mentions chart monthly\./);
  assert.match(prompt, /src\/DashboardApp\.tsx/);
  assert.match(prompt, /src\/dashboard\.css/);
  assert.match(prompt, /preserve the Databricks visual shell/i);
});

test('share of voice respects the currently selected companies', () => {
  assert.equal(getShareOfVoice('databricks', ['databricks']), 100);
  assert.equal(getShareOfVoice('snowflake', ['snowflake']), 100);
  assert.equal(getShareOfVoice('databricks', ['databricks', 'snowflake']), 52);
});

test('mention totals equal the sum of each company series', () => {
  for (const company of competitors) {
    const expected = mentionSeries.reduce((sum, point) => sum + point[company.id], 0);
    assert.equal(getMentionTotal(company.id), expected);
  }
});

test('products are ordered by total mentions descending', () => {
  const totals = productRows.map((row) => row.databricks + row.snowflake);
  assert.deepEqual(totals, [...totals].sort((a, b) => b - a));
});

test('the approved shell uses Databricks branding without local.ai or page eyebrows', async () => {
  const source = await readFile(new URL('../src/DashboardApp.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /local\.ai|signal<span>|className="eyebrow"/);
  assert.match(source, />databricks</);
  assert.match(source, /className="workspace-tabs"/);
  assert.match(source, /className="new-tab"/);
});

test('Codex is a direct Agent command without a modal workflow', async () => {
  const source = await readFile(new URL('../src/DashboardApp.tsx', import.meta.url), 'utf8');
  assert.match(source, /className="agent-command"/);
  assert.doesNotMatch(source, /className="codex-modal"|codexOpen/);
});

test('dashboard panels support a context-click inline comment composer', async () => {
  const source = await readFile(new URL('../src/DashboardApp.tsx', import.meta.url), 'utf8');
  assert.match(source, /onContextMenu/);
  assert.match(source, /className="comment-composer"/);
  assert.match(source, /Add a comment/);
});

test('voice comments automatically become an email draft', async () => {
  const source = await readFile(new URL('../src/DashboardApp.tsx', import.meta.url), 'utf8');
  assert.match(source, /startVoiceEmail/);
  assert.match(source, /voice-capture/);
  assert.match(source, /email-draft/);
  assert.match(source, /Generating email/);
  assert.match(source, /comment-voice-workspace/);
  assert.match(source, /commentTarget\.x/);
  assert.match(source, /amie-email-panel/);
  assert.match(source, />From</);
});
