import type { ResultsData } from '../stores/useJourneyStore';
import { getVerdict } from './verdict';

/**
 * Report serialisation for the two things a user expects from "Export"
 * and "Share": a portable file they keep, and a paste-able summary they
 * can send to someone else.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function list(items?: string[]): string {
  if (!items?.length) return '<p class="empty">No data returned for this section.</p>';
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

export function getVerdictLabel(score: number): string {
  return getVerdict(score);
}

/** A self-contained HTML file — no external CSS, fonts, or scripts. */
export function buildReportHtml(
  results: ResultsData,
  meta: { idea: string; industry: string; generatedAt: Date }
): string {
  const { scores, realityCheck } = results;
  const s = scores;

  const stat = (label: string, value: string | number) =>
    `<div class="stat"><span class="stat-l">${escapeHtml(label)}</span><span class="stat-v">${escapeHtml(
      String(value)
    )}</span></div>`;

  const competitors = results.competitors?.length
    ? results.competitors
        .map(
          (c) => `<div class="card">
            <h3>${escapeHtml(c.name)}</h3>
            <p><b>Weakness:</b> ${escapeHtml(c.weakness)}</p>
            <p><b>Your edge:</b> ${escapeHtml(c.yourEdge)}</p>
          </div>`
        )
        .join('')
    : '<p class="empty">No competitors identified.</p>';

  const incubators = results.incubatorRecommendations?.length
    ? results.incubatorRecommendations
        .map(
          (i) => `<div class="card">
            <h3>${escapeHtml(i.name)} — ${escapeHtml(String(i.matchPercent))}% match</h3>
            <p>${escapeHtml(i.description)}</p>
            <p><b>Funding:</b> ${escapeHtml(i.funding ?? 'Not stated')}</p>
            ${i.equity ? `<p><b>Equity:</b> ${escapeHtml(i.equity)}</p>` : ''}
            <p class="muted"><b>Why:</b> ${escapeHtml(i.matchReason)}</p>
          </div>`
        )
        .join('')
    : '<p class="empty">No incubator matches.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IdeaBridge Report — ${escapeHtml(meta.idea.slice(0, 60))}</title>
<style>
  :root { --ink:#111827; --muted:#4b5563; --line:#d1d5db; --accent:#0e7490; }
  * { box-sizing: border-box; }
  body { margin:0; padding:40px 24px; background:#fff; color:var(--ink);
         font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
         line-height:1.6; }
  .wrap { max-width: 820px; margin: 0 auto; }
  header { border-bottom:2px solid var(--ink); padding-bottom:16px; margin-bottom:28px; }
  .brand { font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--accent); font-weight:700; }
  h1 { font-size:30px; margin:8px 0 4px; line-height:1.2; }
  .sub { color:var(--muted); font-size:14px; margin:0; }
  h2 { font-size:15px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent);
       border-bottom:1px solid var(--line); padding-bottom:6px; margin:32px 0 14px; }
  h3 { font-size:15px; margin:0 0 6px; }
  p { margin:0 0 10px; }
  ul { margin:0; padding-left:20px; }
  li { margin-bottom:7px; }
  .score { display:flex; align-items:center; gap:20px; padding:20px; border:1px solid var(--line);
           border-radius:12px; margin-bottom:18px; }
  .big { font-size:44px; font-weight:700; line-height:1; }
  .verdict { font-size:22px; font-weight:700; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
  .stat { border:1px solid var(--line); border-radius:10px; padding:10px 12px; }
  .stat-l { display:block; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
  .stat-v { display:block; font-size:18px; font-weight:600; margin-top:2px; }
  .card { border:1px solid var(--line); border-radius:10px; padding:14px; margin-bottom:10px; }
  .muted { color:var(--muted); }
  .empty { color:var(--muted); font-style:italic; }
  footer { margin-top:40px; padding-top:14px; border-top:1px solid var(--line);
           color:var(--muted); font-size:12px; }
  @media print { body { padding:0; } .wrap { max-width:none; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">IdeaBridge AI Report</div>
    <h1>${escapeHtml(meta.idea)}</h1>
    <p class="sub">
      ${escapeHtml(meta.industry || 'Startup')} &middot;
      Generated ${escapeHtml(
        meta.generatedAt.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      )}
    </p>
  </header>

  <div class="score">
    <div>
      <div class="big">${escapeHtml(String(s.overall))}</div>
      <div class="sub">out of 100</div>
    </div>
    <div>
      <div class="verdict">${escapeHtml(getVerdictLabel(s.overall))}</div>
      <p class="sub" style="margin:4px 0 0">${escapeHtml(s.rationale)}</p>
    </div>
  </div>

  <div class="stats">
    ${stat('Market potential', s.marketPotential)}
    ${stat('Innovation', s.innovation)}
    ${stat('Feasibility', s.feasibility)}
    ${stat('Scalability', s.scalability)}
    ${stat('Monetization', s.monetization)}
  </div>

  <h2>Executive summary</h2>
  ${list(results.summary)}

  <h2>Reality check</h2>
  <div class="card">
    <p><b>Biggest assumption:</b> ${escapeHtml(realityCheck.biggestAssumption)}</p>
    <p><b>Biggest risk:</b> ${escapeHtml(realityCheck.biggestRisk)}</p>
    <p><b>Why it could fail:</b> ${escapeHtml(realityCheck.whyItCouldFail)}</p>
    <p><b>Hardest challenge:</b> ${escapeHtml(realityCheck.hardestExecutionChallenge)}</p>
  </div>

  <h2>Market validation</h2>
  ${list(results.validation)}

  <h2>Customer discovery</h2>
  ${list(results.customers)}

  <h2>Competitive landscape</h2>
  ${competitors}

  <h2>Risk mitigation</h2>
  ${list(results.risks)}

  <h2>Recommended actions</h2>
  ${list(results.actions)}

  <h2>Next 7 days</h2>
  ${list(results.nextSevenDays)}

  <h2>Roadmap</h2>
  ${list(results.roadmap)}

  <h2>Revenue</h2>
  ${list(results.revenue)}

  <h2>Funding</h2>
  ${list(results.funding)}

  <h2>Recommended incubators</h2>
  ${incubators}

  <footer>
    Generated by IdeaBridge on ${escapeHtml(
      meta.generatedAt.toLocaleDateString(undefined, { dateStyle: 'long' })
    )}.
    AI-generated analysis — verify figures before making decisions.
  </footer>
</div>
</body>
</html>`;
}

/** Plain-text summary, sized for pasting into a message or a doc. */
export function buildReportSummary(results: ResultsData, idea: string): string {
  const { scores } = results;
  const line = '─'.repeat(46);

  const parts = [
    'IDEABRIDGE — STARTUP ANALYSIS',
    line,
    idea,
    '',
    `Score: ${scores.overall}/100 — ${getVerdictLabel(scores.overall)}`,
    scores.rationale,
    '',
    `Market ${scores.marketPotential} · Innovation ${scores.innovation} · Feasibility ${scores.feasibility} · Scale ${scores.scalability} · Monetization ${scores.monetization}`,
    '',
    'REALITY CHECK',
    line,
    `Assumption: ${results.realityCheck.biggestAssumption}`,
    `Risk: ${results.realityCheck.biggestRisk}`,
    `Could fail: ${results.realityCheck.whyItCouldFail}`,
    '',
    'TOP ACTIONS',
    line,
    ...(results.actions ?? []).slice(0, 5).map((a, i) => `${i + 1}. ${a}`),
  ];

  if (results.incubatorRecommendations?.length) {
    parts.push('', 'INCUBATORS', line);
    results.incubatorRecommendations.slice(0, 5).forEach((inc) => {
      parts.push(`• ${inc.name} (${inc.matchPercent}%) — ${inc.funding ?? 'funding not stated'}`);
    });
  }

  parts.push('', line, 'Generated by IdeaBridge. AI-generated — verify before acting.');
  return parts.join('\n');
}

export function downloadTextFile(filename: string, contents: string, mime: string): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Filesystem-safe slug derived from the idea text. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'startup'
  );
}