import { useEffect, useMemo, useState } from 'react';
import {
  audienceSegments, campaigns, channelRows, competitors, dashboardTabs,
  buildCodexPrompt, buildMessageDraft, genieRewrite, getMentionTotal, getShareOfVoice, marketTopics, mentionSeries, productRows,
} from './dashboardData.js';

type CompanyId = 'databricks' | 'snowflake';
type TabId = 'products' | 'market' | 'audience' | 'campaigns' | 'reports';
type CommentTarget = { panel: 'mentions'; x: number; y: number; anchorX: number; anchorY: number; panelW: number };
type DashboardComment = { id: number; text: string; anchorX: number; anchorY: number; point: number };

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    products: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4V2m8 2V2M3 9h18"/></>,
    market: <><path d="M4 18V9m6 9V5m6 13v-7m5 7H2"/></>,
    audience: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0m2-14a4 4 0 0 1 0 8m2 6a6 6 0 0 0-3-5.2"/></>,
    campaigns: <><path d="m3 11 18-7v16L3 13z"/><path d="M8 15v5H5l-1-7"/></>,
    reports: <><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 13h8m-8 4h6"/></>,
    slack: <><path d="M5 9h14M5 15h14M10 4 8 20m8-16-2 16"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></>,
    check: <><path d="m5 12 5 5 9-10"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4m-2-2h4"/></>,
    send: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    refresh: <><path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/></>,
    codex: <><path d="M8 3 4 7l4 4M16 3l4 4-4 4M14 14l-4 7"/><path d="M5 15h3m8 0h3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function TrendChart({ active }: { active: CompanyId[] }) {
  const width = 1000, height = 330, left = 56, right = 972, top = 30, bottom = 278;
  const max = 1500;
  const x = (i: number) => left + i * ((right - left) / (mentionSeries.length - 1));
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  return <div className="chart-wrap">
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weekly Databricks and Snowflake mention trend">
      {[0, 500, 1000, 1500].map(v => <g key={v}><line x1={left} x2={right} y1={y(v)} y2={y(v)} className="grid-line"/><text x={left - 12} y={y(v) + 4} textAnchor="end">{v === 0 ? '0' : `${v / 1000}k`}</text></g>)}
      {mentionSeries.map((point, i) => <text key={point.label} x={x(i)} y={bottom + 28} textAnchor="middle">{point.label}</text>)}
      {competitors.filter(c => active.includes(c.id as CompanyId)).map(company => {
        const path = mentionSeries.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p[company.id])}`).join(' ');
        return <g key={company.id} aria-label={company.name}>
          <path d={path} fill="none" stroke={company.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {mentionSeries.map((p, i) => <circle key={i} cx={x(i)} cy={y(p[company.id])} r="3.5" fill="#fff" stroke={company.color} strokeWidth="1.5"/>)}
        </g>;
      })}
    </svg>
  </div>;
}

function MiniChart({ point }: { point: number | null }) {
  const w = 200, h = 80, pad = 8, min = 500, max = 1500;
  const x = (i: number) => pad + i * ((w - 2 * pad) / (mentionSeries.length - 1));
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - 2 * pad);
  const hi = point ?? mentionSeries.length - 1;
  return <svg className="mini-chart" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
    {competitors.map(c => <g key={c.id}>
      <path d={mentionSeries.map((q, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(q[c.id])}`).join(' ')} fill="none" stroke={c.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={x(hi)} cy={y(mentionSeries[hi][c.id])} r="3" fill="#fff" stroke={c.color} strokeWidth="1.5"/>
    </g>)}
  </svg>;
}

const Delta = ({ value }: { value: number }) => <span className={value >= 0 ? 'delta up' : 'delta down'}>{value >= 0 ? '↗' : '↘'} {Math.abs(value)}%</span>;

function ProductsDashboard({ active, toggle, commentTarget, comments, onComment }: { active: CompanyId[]; toggle: (id: CompanyId) => void; commentTarget: CommentTarget | null; comments: DashboardComment[]; onComment: (event: React.MouseEvent<HTMLElement>) => void }) {
  const totals = useMemo(() => Object.fromEntries(competitors.map(c => [c.id, getMentionTotal(c.id)])), []);
  const grand = active.reduce((sum, id) => sum + totals[id], 0);
  return <>
    <section className="hero-row">
      <div><h1>Competitor products</h1><p className="subcopy">Product and brand conversation across tracked channels</p></div>
      <div className="toolbar"><button className="date-control">Sep 1 – Oct 20 <span>⌄</span></button><button className="export"><Icon name="download" size={15}/> Export</button></div>
    </section>
    <section className="compare-strip">
      <div><span className="control-label">Comparing {active.length} companies</span><div className="company-pills">{competitors.map(c => <button key={c.id} aria-pressed={active.includes(c.id as CompanyId)} onClick={() => toggle(c.id as CompanyId)}><i style={{ background: c.color }}/>{c.name}<span>{active.includes(c.id as CompanyId) ? '×' : '+'}</span></button>)}</div></div>
      <div className="scope"><span>Scope</span><strong>Global · English</strong><small>Demo dataset</small></div>
    </section>
    <section className="metric-row">
      <div><span>Total mentions</span><strong>{grand.toLocaleString()}</strong><Delta value={18}/><small>vs. previous period</small></div>
      <div><span>Databricks share of voice</span><strong>{getShareOfVoice('databricks', active)}%</strong><Delta value={4}/><small>across tracked sources</small></div>
      <div><span>Positive sentiment</span><strong>76%</strong><Delta value={7}/><small>weighted by engagement</small></div>
      <div><span>Fastest-growing topic</span><strong className="topic-metric">Agentic AI</strong><Delta value={28}/><small>week over week</small></div>
    </section>
    <section className={`section-block commentable-panel ${commentTarget?.panel==='mentions'?'comment-selected':''}`} onContextMenu={onComment}>
      <div className="section-head"><div><h2>Mentions over time</h2><p>Weekly product and brand mentions across tracked channels</p></div><div className="legend">{competitors.map(c => <span key={c.id}><i style={{background:c.color}}/>{c.name}</span>)}</div></div>
      <TrendChart active={active}/>
      {comments.map(comment=><button className="comment-pin" data-point={comment.point} key={comment.id} style={{left:comment.anchorX,top:comment.anchorY}} title={comment.text} aria-label={`Comment: ${comment.text}`}>{comment.id}</button>)}
    </section>
    <section className="split-grid">
      <div className="section-block compact"><div className="section-head"><div><h2>Conversation by channel</h2><p>Where each competitor is being discussed</p></div></div>{channelRows.map(row => { const max = Math.max(...channelRows.flatMap(r => [r.databricks, r.snowflake])); return <div className="channel-row" key={row.name}><strong>{row.name}</strong><div><span className="bar red" style={{width:`${row.databricks/max*100}%`}}/><small>{row.databricks.toLocaleString()}</small></div><div><span className="bar blue" style={{width:`${row.snowflake/max*100}%`}}/><small>{row.snowflake.toLocaleString()}</small></div></div>})}</div>
      <div className="section-block compact sentiment-panel"><div className="section-head"><div><h2>Sentiment split</h2><p>Share of categorized mentions</p></div></div><div className="donut" aria-label="76 percent positive sentiment"><div><strong>76%</strong><span>positive</span></div></div><div className="sentiment-key"><span><i className="positive"/>Positive <b>76%</b></span><span><i className="neutral"/>Neutral <b>18%</b></span><span><i className="negative"/>Negative <b>6%</b></span></div></div>
    </section>
    <section className="section-block table-block"><div className="section-head"><div><h2>Product leaderboard</h2><p>Products ranked by tracked mentions</p></div><button className="text-button">View all products →</button></div><div className="data-table"><div className="table-row table-header"><span>Product</span><span>Company</span><span>Mentions</span><span>Growth</span><span>Sentiment</span><span>Leading theme</span></div>{productRows.map((row, i) => <div className="table-row" key={row.name}><span><b className="rank">{i+1}</b><strong>{row.name}</strong></span><span><i className={row.company === 'Databricks' ? 'brand-dot red-dot' : 'brand-dot blue-dot'}/>{row.company}</span><span><strong>{(row.databricks || row.snowflake).toLocaleString()}</strong></span><span><Delta value={row.growth}/></span><span>{row.sentiment}%</span><span><em>{row.theme}</em></span></div>)}</div></section>
  </>;
}

function MarketDashboard() { return <Secondary title="Market pulse" subtitle="Emerging themes across the data and AI market"><section className="secondary-grid"><div className="section-block topic-list"><div className="section-head"><div><h2>Topics gaining momentum</h2><p>Ranked by mention velocity and engagement</p></div></div>{marketTopics.map(([name, score, delta], i) => <div className="topic-row" key={String(name)}><b>{i+1}</b><strong>{name}</strong><div><span style={{width:`${score}%`}}/></div><em>{score}</em><Delta value={Number(delta)}/></div>)}</div><InsightPanel title="What changed" lines={['Agentic AI moved into the top conversation spot.', 'Open table formats gained traction in technical communities.', 'Data sharing cooled slightly after six weeks of growth.']}/></section></Secondary> }

function AudienceDashboard() { return <Secondary title="Audience" subtitle="Who is shaping the conversation and what they care about"><section className="secondary-grid"><div className="section-block"><div className="section-head"><div><h2>Audience composition</h2><p>Share of engaged authors by role</p></div></div><div className="audience-stack">{audienceSegments.map(([name, share, lead]) => <div key={String(name)}><div><strong>{name}</strong><span>{share}% · leans {lead}</span></div><div><i style={{width:`${share}%`}}/></div></div>)}</div></div><InsightPanel title="High-value audience" lines={['ML engineers engage 2.1× more with product launches.', 'Analytics leaders favor governance and cost stories.', 'Developers respond most to benchmarks and tutorials.']}/></section></Secondary> }

function CampaignsDashboard() { return <Secondary title="Campaigns" subtitle="Compare message reach and resonance across active initiatives"><section className="section-block table-block"><div className="section-head"><div><h2>Campaign performance</h2><p>Earned mentions and audience response</p></div><button className="export">+ New comparison</button></div><div className="data-table campaign-table"><div className="table-row table-header"><span>Campaign</span><span>Company</span><span>Reach</span><span>Positive sentiment</span><span>Momentum</span></div>{campaigns.map(row => <div className="table-row" key={row[0]}>{row.map((cell, i) => <span key={String(cell)}>{i===0?<strong>{cell}</strong>:i===1?<><i className={cell==='Databricks'?'brand-dot red-dot':'brand-dot blue-dot'}/>{cell}</>:i===4?<em>{cell}</em>:cell}</span>)}</div>)}</div></section></Secondary> }

function ReportsDashboard() { return <Secondary title="Reports" subtitle="Saved competitive briefings ready for your team"><section className="report-grid">{['Weekly competitive pulse','Product launch tracker','Executive share of voice','AI narrative analysis'].map((name, i) => <article key={name}><span>REPORT 0{i+1}</span><h2>{name}</h2><p>{i%2 ? 'A focused comparison of audience response and message pull-through.' : 'A concise summary of market movement, product mentions, and emerging themes.'}</p><div><small>Updated {i+1}d ago</small><button>Open report →</button></div></article>)}</section></Secondary> }

function Secondary({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) { return <><section className="hero-row secondary-hero"><div><h1>{title}</h1>{subtitle&&<p className="subcopy">{subtitle}</p>}</div><div className="toolbar"><button className="date-control">Last 8 weeks <span>⌄</span></button><button className="export"><Icon name="download" size={15}/> Export</button></div></section>{children}</> }
function InsightPanel({ title, lines }: { title: string; lines: string[] }) { return <aside className="section-block insight-panel"><span className="insight-kicker">ANALYST NOTES</span><h2>{title}</h2>{lines.map((line, i) => <div key={line}><b>0{i+1}</b><p>{line}</p></div>)}</aside> }

export default function DashboardApp() {
  const [tab, setTab] = useState<TabId>('products');
  const [active, setActive] = useState<CompanyId[]>(['databricks','snowflake']);
  const [commentTarget, setCommentTarget] = useState<CommentTarget|null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<DashboardComment[]>([]);
  const [agentToast, setAgentToast] = useState(false);
  const [voiceStage, setVoiceStage] = useState<'idle'|'recording'|'generating'|'email'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [msg, setMsg] = useState<{ stage: 'generating' | 'ready'; point: number | null } | null>(null);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgCopied, setMsgCopied] = useState(false);
  const [genieBusy, setGenieBusy] = useState(false);
  const [genieText, setGenieText] = useState('');
  const toggle = (id: CompanyId) => setActive(current => current.includes(id) ? (current.length === 1 ? current : current.filter(item => item !== id)) : [...current, id]);
  const openMessage = (point: number | null) => {
    window.getSelection()?.removeAllRanges();
    const draft = buildMessageDraft(active, point);
    setMsgSubject(draft.subject);
    setMsgBody(draft.body);
    setMsgCopied(false);
    setGenieText('');
    setMsg({ stage: 'generating', point });
    window.setTimeout(() => setMsg(current => current && { ...current, stage: 'ready' }), 1100);
  };
  const onDoubleClickMain = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const pin = target.closest('.comment-pin') as HTMLElement | null;
    if (pin) { openMessage(Number(pin.dataset.point)); return; }
    if (target.closest('button,input,a')) return;
    openMessage(null);
  };
  const askGenie = (action: 'shorter' | 'next' | 'friendly' | 'custom', text = '') => {
    if (genieBusy || (action === 'custom' && !text.trim())) return;
    setGenieBusy(true);
    window.setTimeout(() => { setMsgBody(body => genieRewrite(body, action, text)); setGenieBusy(false); setGenieText(''); }, 700);
  };
  const copyMessage = async () => {
    await navigator.clipboard.writeText(`*${msgSubject}*\n\n${msgBody}`);
    setMsgCopied(true);
    window.setTimeout(() => setMsgCopied(false), 1800);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMsg(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const runAgentCommand = async () => {
    await navigator.clipboard.writeText(buildCodexPrompt('Review this dashboard and ask what I want to change.'));
    setAgentToast(true);
    window.setTimeout(()=>setAgentToast(false),1800);
  };
  const openComment = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const rect=event.currentTarget.getBoundingClientRect();
    setCommentTarget({panel:'mentions',x:Math.max(20,Math.min(window.innerWidth-610,event.clientX-290)),y:Math.max(60,Math.min(window.innerHeight-90,event.clientY+24)),anchorX:event.clientX-rect.left,anchorY:event.clientY-rect.top,panelW:rect.width});
    setCommentText('');
  };
  const addComment = () => {
    if(!commentTarget||!commentText.trim()) return;
    setComments(current=>[...current,{id:current.length+1,text:commentText.trim(),anchorX:commentTarget.anchorX,anchorY:commentTarget.anchorY,point:Math.max(0,Math.min(mentionSeries.length-1,Math.round(((commentTarget.anchorX/commentTarget.panelW)*1000-56)/((972-56)/(mentionSeries.length-1)))))}]);
    setCommentTarget(null);setCommentText('');
  };
  const startVoiceEmail = () => {
    setVoiceTranscript('');
    setVoiceStage('recording');
    const SpeechRecognition = (window as typeof window & {webkitSpeechRecognition?: new()=>any; SpeechRecognition?: new()=>any}).SpeechRecognition
      || (window as typeof window & {webkitSpeechRecognition?: new()=>any}).webkitSpeechRecognition;
    let recognition: any;
    if(SpeechRecognition){
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event:any) => setVoiceTranscript(Array.from(event.results).map((r:any)=>r[0].transcript).join(' '));
      try { recognition.start(); } catch { /* browser already listening */ }
    }
    window.setTimeout(()=>{
      try { recognition?.stop(); } catch { /* recording already stopped */ }
      setVoiceStage('generating');
      window.setTimeout(()=>setVoiceStage('email'),1400);
    },3200);
  };
  const views: Record<TabId, React.ReactNode> = { products:<ProductsDashboard active={active} toggle={toggle} commentTarget={commentTarget} comments={comments} onComment={openComment}/>, market:<MarketDashboard/>, audience:<AudienceDashboard/>, campaigns:<CampaignsDashboard/>, reports:<ReportsDashboard/> };
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-zone"><button className="sidebar-toggle" aria-label="Toggle sidebar"><span/><span/></button><a className="brand" href="#" onClick={e=>e.preventDefault()}><svg className="db-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 7.5v9L12 21 4 16.5v-9z"/></svg><strong>databricks</strong></a></div>
      <nav className="workspace-tabs">{dashboardTabs.map(item => <button className={tab===item.id?'active':''} key={item.id} onClick={()=>setTab(item.id as TabId)}><Icon name={item.id}/><span>{item.label}</span>{tab===item.id&&<i aria-hidden="true">×</i>}</button>)}<button className="new-tab" aria-label="Add dashboard">+</button></nav>
      <div className="header-actions"><button aria-label="Search"><Icon name="search"/></button><button className="agent-command" onClick={runAgentCommand}><Icon name="codex" size={15}/> Agent <kbd>⌘/</kbd></button><button className="invite">Share dashboard</button><div className="avatar">DH</div></div>
    </header>
    <main onDoubleClick={onDoubleClickMain}>{views[tab]}</main><footer>Demo data · Double-click a comment pin (or anywhere) to draft a message</footer>
    {commentTarget&&voiceStage==='idle'&&<div className="comment-composer" style={{left:commentTarget.x,top:commentTarget.y}}><span className="comment-sliders">☷</span><input autoFocus value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addComment();if(e.key==='Escape')setCommentTarget(null)}} placeholder="Add a comment..." aria-label="Add a comment"/><button className="comment-mic" aria-label="Voice comment" onClick={startVoiceEmail}>⌾</button><button className="comment-submit" aria-label="Save comment" onClick={addComment}>✓</button></div>}
    {voiceStage!=='idle'&&commentTarget&&<div className={`voice-workspace comment-voice-workspace ${voiceStage==='email'?'email-side-workspace':''}`} style={{left:commentTarget.x,top:commentTarget.y}} role="dialog" aria-label="Voice to email">
      {(voiceStage==='recording'||voiceStage==='generating')&&<div className={`voice-capture ${voiceStage}`}>
        <div className="voice-orb"><i/><i/><i/><i/><i/></div>
        <span className="voice-kicker">{voiceStage==='recording'?'LISTENING':'AI ASSISTANT'}</span>
        <h2>{voiceStage==='recording'?'Talk naturally':'Generating email...'}</h2>
        <p>{voiceStage==='recording'?(voiceTranscript||'Tell me what the email should say. I’ll structure it for you.'):'Turning your voice note into a clear, ready-to-send draft.'}</p>
        <div className="recording-time"><b/>{voiceStage==='recording'?'Recording · 00:03':'Writing subject and message'}</div>
      </div>}
      {voiceStage==='email'&&<article className="email-draft amie-email-panel">
        <header><div className="mail-icon">✉</div><h2>Email</h2><button onClick={()=>{setVoiceStage('idle');setCommentTarget(null)}} aria-label="Close email draft">×</button></header>
        <div className="email-field"><span>From</span><strong contentEditable suppressContentEditableWarning>Danica Hartawan</strong></div>
        <div className="email-field"><span>Subject</span><strong contentEditable suppressContentEditableWarning>Competitor momentum — next steps</strong></div>
        <div className="email-body" contentEditable suppressContentEditableWarning>
          <p>{voiceTranscript||'I noticed a meaningful increase in competitor mentions this week and wanted to share the trend with you.'}</p><p>The strongest movement is around agentic AI. Let’s review the chart and align on the story we want to lead with in our next campaign.</p><p><strong>This gives us a clear opportunity to sharpen the message and move quickly:</strong></p><p>1. Review the mention spike and its leading sources<br/>2. Turn the strongest audience insight into the next campaign brief</p>
        </div>
      </article>}
    </div>}
    {msg&&<aside className="slack-panel msg-panel" role="dialog" aria-label="New message">
      <div className="slack-head"><div className="slack-badge"><Icon name="slack" size={16}/></div><div><h2>New message</h2><p>{msg.stage==='ready'?(msg.point===null?'Drafted from this dashboard':`Drafted from the ${mentionSeries[msg.point].label} point`):'Reading the dashboard…'}</p></div><button aria-label="Close message" onClick={()=>setMsg(null)}><Icon name="close" size={16}/></button></div>
      {msg.stage==='generating'?<div className="slack-skeleton"><span/><span/><span/><span/></div>:<>
        <div className="msg-subject"><label htmlFor="msg-subject">Subject</label><input id="msg-subject" value={msgSubject} onChange={e=>setMsgSubject(e.target.value)}/></div>
        <div className="msg-grid">
          <div className="msg-main">
            <div className="msg-attach"><MiniChart point={msg.point}/><div><strong>Mentions over time</strong><span>{msg.point===null?'Sep 1 – Oct 20':`Pinned at ${mentionSeries[msg.point].label}`} · chart attached</span></div></div>
            <textarea className="msg-body" value={msgBody} onChange={e=>setMsgBody(e.target.value)} aria-label="Message body" spellCheck={false}/>
          </div>
          <div className="genie">
            <div className="genie-head"><Icon name="sparkle" size={15}/> Genie</div>
            <p>{genieBusy?'Writing into your message…':'Ask me to reshape the message.'}</p>
            <div className="genie-chips">
              <button onClick={()=>askGenie('shorter')}>Make it shorter</button>
              <button onClick={()=>askGenie('friendly')}>Friendlier tone</button>
              <button onClick={()=>askGenie('next')}>Add next steps</button>
            </div>
            <div className="genie-input"><input value={genieText} placeholder="Tell Genie what to add…" onChange={e=>setGenieText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')askGenie('custom',genieText)}} aria-label="Ask Genie"/><button aria-label="Send to Genie" onClick={()=>askGenie('custom',genieText)}><Icon name="send" size={14}/></button></div>
          </div>
        </div>
        <div className="slack-actions"><button className="ghost" onClick={()=>openMessage(msg.point)}><Icon name="refresh" size={14}/> Regenerate</button><button className="primary" onClick={copyMessage}><Icon name={msgCopied?'check':'copy'} size={14}/> {msgCopied?'Copied':'Copy message'}</button></div>
      </>}
    </aside>}
    {agentToast&&<div className="agent-toast" role="status">Codex command copied</div>}
  </div>;
}
