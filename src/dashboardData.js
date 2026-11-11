export const dashboardTabs = [
  { id: 'products', label: 'Competitor products' },
  { id: 'market', label: 'Market pulse' },
  { id: 'audience', label: 'Audience' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'reports', label: 'Reports' },
];

export const competitors = [
  { id: 'databricks', name: 'Databricks', color: '#ff5f46' },
  { id: 'snowflake', name: 'Snowflake', color: '#3267ff' },
];

export const mentionSeries = [
  { label: 'Sep 1', databricks: 820, snowflake: 740 },
  { label: 'Sep 8', databricks: 910, snowflake: 810 },
  { label: 'Sep 15', databricks: 870, snowflake: 860 },
  { label: 'Sep 22', databricks: 1030, snowflake: 930 },
  { label: 'Sep 29', databricks: 1120, snowflake: 1010 },
  { label: 'Oct 6', databricks: 1080, snowflake: 1090 },
  { label: 'Oct 13', databricks: 1260, snowflake: 1130 },
  { label: 'Oct 20', databricks: 1370, snowflake: 1190 },
];

export const productRows = [
  { name: 'Lakehouse Platform', company: 'Databricks', databricks: 3140, snowflake: 0, growth: 18, sentiment: 74, theme: 'AI + data' },
  { name: 'Snowflake AI Data Cloud', company: 'Snowflake', databricks: 0, snowflake: 2830, growth: 12, sentiment: 71, theme: 'Cloud data' },
  { name: 'Mosaic AI', company: 'Databricks', databricks: 2260, snowflake: 0, growth: 31, sentiment: 79, theme: 'GenAI' },
  { name: 'Snowflake Cortex AI', company: 'Snowflake', databricks: 0, snowflake: 2010, growth: 26, sentiment: 76, theme: 'GenAI' },
  { name: 'Unity Catalog', company: 'Databricks', databricks: 1480, snowflake: 0, growth: 15, sentiment: 82, theme: 'Governance' },
  { name: 'Snowpark', company: 'Snowflake', databricks: 0, snowflake: 1190, growth: 8, sentiment: 67, theme: 'Developers' },
];

export const channelRows = [
  { name: 'News & publications', databricks: 2480, snowflake: 2290 },
  { name: 'LinkedIn', databricks: 2110, snowflake: 1970 },
  { name: 'Reddit & communities', databricks: 1830, snowflake: 1510 },
  { name: 'YouTube & podcasts', databricks: 1290, snowflake: 1210 },
];

export const getMentionTotal = (companyId) =>
  mentionSeries.reduce((sum, point) => sum + point[companyId], 0);

export const getShareOfVoice = (companyId, activeCompanyIds) => {
  const activeTotal = activeCompanyIds.reduce((sum, id) => sum + getMentionTotal(id), 0);
  return activeCompanyIds.includes(companyId) && activeTotal
    ? Math.round((getMentionTotal(companyId) / activeTotal) * 100)
    : 0;
};

export const buildCodexPrompt = (request) => `Update the competitive intelligence dashboards in this local project.

Requested change: ${request.trim() || 'Ask me what dashboard change to make.'}

Primary files:
- src/DashboardApp.tsx
- src/dashboard.css
- src/dashboardData.js

Preserve the Databricks visual shell, keep every dashboard tab functional, verify the mobile layout, and run the existing tests plus npm run build before finishing.`;

export const marketTopics = [
  ['Agentic AI', 84, 28], ['Open table formats', 71, 19], ['Governance', 64, 14],
  ['Data sharing', 58, -3], ['Vector search', 52, 22],
];

export const audienceSegments = [
  ['Data engineers', 38, 'Databricks'], ['Analytics leaders', 24, 'Snowflake'],
  ['ML engineers', 21, 'Databricks'], ['Developers', 11, 'Databricks'], ['Executives', 6, 'Snowflake'],
];

export const campaigns = [
  ['Data + AI Summit recap', 'Databricks', '14.2k', '82%', 'High'],
  ['Build with Cortex', 'Snowflake', '11.8k', '76%', 'High'],
  ['Open lakehouse stories', 'Databricks', '8.6k', '71%', 'Medium'],
  ['AI Data Cloud launch', 'Snowflake', '7.9k', '68%', 'Medium'],
];

export const buildSlackMessage = (activeCompanyIds) => {
  const total = activeCompanyIds.reduce((sum, id) => sum + getMentionTotal(id), 0);
  const names = competitors.filter(c => activeCompanyIds.includes(c.id)).map(c => c.name).join(' vs ');
  const mentions = (row) => row.databricks || row.snowflake;
  const topProduct = [...productRows].sort((a, b) => mentions(b) - mentions(a))[0];
  const topMover = [...productRows].sort((a, b) => b.growth - a.growth)[0];
  const [topic, , topicGrowth] = marketTopics[0];
  return {
    title: `Competitor pulse · ${names} · Sep 1 – Oct 20`,
    intro: 'Quick read on how the conversation is moving:',
    lines: [
      { label: 'Total mentions', value: total.toLocaleString(), note: '↑ 18% vs. previous period' },
      { label: 'Databricks share of voice', value: `${getShareOfVoice('databricks', activeCompanyIds)}%`, note: '↑ 4% across tracked sources' },
      { label: 'Positive sentiment', value: '76%', note: '↑ 7%, weighted by engagement' },
      { label: 'Fastest-growing topic', value: topic, note: `↑ ${topicGrowth}% week over week` },
      { label: 'Top product', value: topProduct.name, note: `${mentions(topProduct).toLocaleString()} mentions` },
      { label: 'Biggest mover', value: topMover.name, note: `↑ ${topMover.growth}% growth` },
    ],
    cta: 'Next step: review the Agentic AI spike and turn it into the next campaign brief.',
  };
};

export const slackMessageToMrkdwn = (message) => [
  `*${message.title}*`,
  message.intro,
  ...message.lines.map(line => `• *${line.label}:* ${line.value} (${line.note})`),
  '',
  message.cta,
].join('\n');
