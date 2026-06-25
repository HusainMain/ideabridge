import {
  StartupAnalysisResponse,
  ScoreBreakdown,
  CompetitorCard,
  RealityCheck,
} from '../types/types';

// ─── primitive helpers ────────────────────────────────────────────

export function truncateWords(text: string, maxWords = 40): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : trimmed;
}

/** Coerce any value to a clamped integer, returning `fallback` on failure. */
function clampInt(v: unknown, fallback: number, lo = 0, hi = 100): number {
  const n = Number(v);
  return isNaN(n) ? fallback : Math.min(hi, Math.max(lo, Math.round(n)));
}

/** Coerce any value to a trimmed string, returning `fallback` if empty. */
function safeStr(v: unknown, fallback: string, maxWords = 40): string {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? truncateWords(s, maxWords) : fallback;
}

// ─── section normalizers ─────────────────────────────────────────

export function normalizeSection(items: unknown): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(items)) {
    arr = items;
  } else if (typeof items === 'string') {
    arr = items.includes('\n') ? items.split('\n') : [items];
  } else {
    return ['Information unavailable.'];
  }

  const cleaned = arr
    .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)).trim())
    .filter(Boolean)
    .map((item) => truncateWords(item, 40))
    .filter(Boolean)
    .slice(0, 5);

  return cleaned.length ? cleaned : ['Information unavailable.'];
}

function normalizeScores(raw: unknown): ScoreBreakdown {
  const r = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    overall:         clampInt(r.overall,         68),
    marketPotential: clampInt(r.marketPotential ?? r.market_potential, 65),
    innovation:      clampInt(r.innovation,      62),
    feasibility:     clampInt(r.feasibility,     70),
    scalability:     clampInt(r.scalability,     63),
    monetization:    clampInt(r.monetization,    66),
    rationale: safeStr(
      r.rationale,
      'Score reflects market opportunity weighed against execution complexity.',
      30
    ),
  };
}

function normalizeCompetitors(raw: unknown): CompetitorCard[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        name: 'Established Players',
        weakness: 'Large incumbents are slow to ship and often overpriced.',
        yourEdge: 'Speed, focus, and a narrower target segment they ignore.',
      },
    ];
  }

  return raw
    .slice(0, 5)
    .map((item): CompetitorCard => {
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        return {
          name:     safeStr(o.name,     'Unnamed Competitor', 8),
          weakness: safeStr(o.weakness, 'Lacks product focus in this niche.', 20),
          yourEdge: safeStr(o.yourEdge ?? o.your_edge, 'More focused offering at a lower price point.', 20),
        };
      }
      // Legacy string fallback — parse "CompetitorName: description" format
      const text = String(item).trim();
      const [head, ...rest] = text.split(':');
      return {
        name:     truncateWords(head?.trim() || 'Competitor', 6),
        weakness: truncateWords(rest.join(':').trim() || text, 20),
        yourEdge: 'Faster, cheaper, or more focused than this player.',
      };
    })
    .filter((c) => c.name.length > 0);
}

function normalizeRealityCheck(raw: unknown): RealityCheck {
  const r = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    biggestAssumption: safeStr(
      r.biggestAssumption ?? r.biggest_assumption,
      'Customers will pay the proposed price without significant sales friction.',
      30
    ),
    biggestRisk: safeStr(
      r.biggestRisk ?? r.biggest_risk,
      'Market adoption is slower than projected, exhausting runway before break-even.',
      30
    ),
    whyItCouldFail: safeStr(
      r.whyItCouldFail ?? r.why_it_could_fail,
      'Undifferentiated product in a crowded market with no defensible moat.',
      30
    ),
    hardestExecutionChallenge: safeStr(
      r.hardestExecutionChallenge ?? r.hardest_execution_challenge,
      'Building the initial customer base without significant marketing capital.',
      30
    ),
  };
}

function normalizeNextSevenDays(raw: unknown): string[] {
  const fallback = [
    'Day 1: Write down the 3 customer problems you are solving and rank them by severity.',
    'Day 2: Find 10 potential customers online and send personalised cold outreach messages.',
    'Day 3: Run 3 customer discovery calls focused on pain, not your solution.',
    'Day 4: Research the top 5 competitors — sign up, test, and document their weaknesses.',
    'Day 5: Sketch the simplest possible version of your product that solves problem #1.',
    'Day 6: Identify one person who can build the MVP and present the opportunity to them.',
    'Day 7: Set a 30-day milestone with a single measurable success metric.',
  ];

  if (!Array.isArray(raw) || raw.length === 0) return fallback;

  const cleaned = raw
    .slice(0, 7)
    .map((item) => truncateWords(String(item).trim(), 30))
    .filter(Boolean);

  return cleaned.length >= 3 ? cleaned : fallback;
}

// ─── root normalizer ─────────────────────────────────────────────

export function normalizeResponse(rawOutput: string): StartupAnalysisResponse {
  let parsed: Record<string, unknown> = {};

  const cleaned = rawOutput
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace  = cleaned.lastIndexOf('}');
  const jsonOnly   = firstBrace !== -1 && lastBrace !== -1
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  try {
    parsed = JSON.parse(jsonOnly) as Record<string, unknown>;
  } catch (error) {
    console.error('JSON PARSE FAILED');
    console.error(error);
    console.error('RAW RESPONSE:', rawOutput);
  }

  // Unwrap single-key envelope: { "analysis": { ... } }
  const keys = Object.keys(parsed);
  if (
    keys.length === 1 &&
    parsed[keys[0]] &&
    typeof parsed[keys[0]] === 'object' &&
    !Array.isArray(parsed[keys[0]])
  ) {
    const inner = parsed[keys[0]] as Record<string, unknown>;
    if ('summary' in inner || 'scores' in inner) {
      parsed = inner;
    }
  }

  return {
    scores:         normalizeScores(parsed.scores),
    realityCheck:   normalizeRealityCheck(parsed.realityCheck ?? parsed.reality_check),
    summary:        normalizeSection(parsed.summary),
    validation:     normalizeSection(parsed.validation),
    customers:      normalizeSection(parsed.customers),
    revenue:        normalizeSection(parsed.revenue),
    competitors:    normalizeCompetitors(parsed.competitors),
    roadmap:        normalizeSection(parsed.roadmap),
    funding:        normalizeSection(parsed.funding),
    risks:          normalizeSection(parsed.risks),
    actions:        normalizeSection(parsed.actions),
    nextSevenDays:  normalizeNextSevenDays(parsed.nextSevenDays ?? parsed.next_seven_days),
  };
}
