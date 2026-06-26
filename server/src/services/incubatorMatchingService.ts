import fs from 'fs';
import path from 'path';
import { Incubator, IncubatorRecommendation } from '../types/incubator';
import { StartupAnalysisRequest, StartupAnalysisResponse } from '../types/types';

const SCORE_INDUSTRY = 40;
const SCORE_STAGE = 25;
const SCORE_COUNTRY = 15;
const SCORE_REMOTE = 10;
const SCORE_TECH = 10;
const MAX_SCORE = SCORE_INDUSTRY + SCORE_STAGE + SCORE_COUNTRY + SCORE_REMOTE + SCORE_TECH;

const INDUSTRY_ALIASES: Record<string, string[]> = {
  healthcare: ['health', 'healthcare', 'medical', 'hospital', 'clinical', 'biotech', 'pharma', 'telemedicine', 'diagnostics', 'wellness'],
  fintech: ['fintech', 'finance', 'banking', 'payment', 'payments', 'insurance', 'lending', 'wealth', 'crypto', 'blockchain'],
  edtech: ['edtech', 'education', 'learning', 'school', 'student', 'training', 'course', 'university', 'skill'],
  food: ['food', 'delivery', 'restaurant', 'grocery', 'meal', 'logistics', 'supply chain', 'agritech', 'agriculture'],
  deeptech: ['deeptech', 'deep tech', 'ai', 'artificial intelligence', 'machine learning', 'robotics', 'hardware', 'semiconductor', 'quantum', 'automation'],
  saas: ['saas', 'software', 'platform', 'b2b', 'enterprise', 'cloud', 'devtools', 'productivity'],
  cleantech: ['climate', 'clean', 'energy', 'solar', 'sustainability', 'carbon', 'renewable', 'cleantech', 'green'],
  consumer: ['consumer', 'marketplace', 'retail', 'e-commerce', 'ecommerce', 'd2c', 'mobile app', 'social'],
  proptech: ['proptech', 'real estate', 'property', 'housing', 'construction'],
  mobility: ['mobility', 'transport', 'automotive', 'ev', 'electric vehicle', 'logistics'],
};

const TECH_TAGS = ['ai', 'ml', 'blockchain', 'hardware', 'biotech', 'saas', 'mobile', 'iot', 'cloud', 'data'];

let cachedIncubators: Incubator[] | null = null;

function loadIncubators(): Incubator[] {
  if (cachedIncubators) return cachedIncubators;

  const candidates = [
    path.join(__dirname, '../data/incubators.json'),
    path.join(process.cwd(), 'dist/server/src/data/incubators.json'),
    path.join(process.cwd(), 'src/data/incubators.json'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      cachedIncubators = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Incubator[];
      return cachedIncubators;
    }
  }

  throw new Error('incubators.json not found');
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
}

function detectIndustryCategories(text: string): Set<string> {
  const normalized = normalize(text);
  const found = new Set<string>();

  for (const [category, keywords] of Object.entries(INDUSTRY_ALIASES)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      found.add(category);
    }
  }

  return found;
}

function inferStartupStages(request: StartupAnalysisRequest): Set<string> {
  const stages = new Set<string>(['idea']);
  const team = normalize(request.teamSize);
  const budget = normalize(request.budget);

  if (team.includes('solo')) {
    stages.add('pre-seed');
    stages.add('early');
  }
  if (team.includes('small')) {
    stages.add('early');
    stages.add('seed');
  }
  if (team.includes('growing')) {
    stages.add('growth');
    stages.add('scale');
  }

  if (budget.includes('bootstrap') || budget.includes('low')) {
    stages.add('pre-seed');
    stages.add('idea');
  }
  if (budget.includes('seed') || budget.includes('medium')) {
    stages.add('seed');
    stages.add('early');
  }
  if (budget.includes('venture') || budget.includes('high')) {
    stages.add('growth');
    stages.add('scale');
  }

  return stages;
}

function extractTechTags(text: string): Set<string> {
  const tokens = tokenize(text);
  const tags = new Set<string>();
  for (const tag of TECH_TAGS) {
    if (tokens.includes(tag) || text.includes(tag)) {
      tags.add(tag);
    }
  }
  if (text.includes('artificial intelligence')) tags.add('ai');
  if (text.includes('machine learning')) tags.add('ml');
  return tags;
}

function normalizeCountry(country: string): string {
  const c = normalize(country);
  if (c.includes('india')) return 'india';
  if (c.includes('united states') || c === 'usa' || c === 'us') return 'united states';
  if (c.includes('united kingdom') || c === 'uk') return 'united kingdom';
  if (c.includes('singapore')) return 'singapore';
  if (c.includes('canada')) return 'canada';
  if (c.includes('germany')) return 'germany';
  if (c.includes('israel')) return 'israel';
  if (c.includes('uae') || c.includes('emirates')) return 'uae';
  return c;
}

function regionMatches(userCountry: string, incubator: Incubator): boolean {
  const user = normalizeCountry(userCountry);
  const incCountry = normalizeCountry(incubator.country);

  if (user === incCountry) return true;

  if (user === 'india' && incubator.region.toLowerCase().includes('south asia')) return true;
  if (user === 'united states' && incubator.region.toLowerCase().includes('north america')) return true;
  if (user === 'united kingdom' && incubator.region.toLowerCase().includes('europe')) return true;

  return incubator.acceptsInternational;
}

function isGeneralIndustry(industry: string): boolean {
  const n = normalize(industry);
  return n === 'general' || n === 'multi-sector' || n === 'multi sector';
}

function getIndustryScore(
  userCategories: Set<string>,
  incubator: Incubator
): { points: number; reason: string | null } {
  const incIndustries = incubator.industries.map((i) => normalize(i));

  for (const category of userCategories) {
    if (incIndustries.includes(category)) {
      const nonGeneralCount = incIndustries.filter((i) => !isGeneralIndustry(i)).length;
      const points = nonGeneralCount <= 2 ? SCORE_INDUSTRY : 28;
      return { points, reason: `Strong ${category} alignment` };
    }

    const aliases = INDUSTRY_ALIASES[category] ?? [];
    for (const ind of incIndustries) {
      if (isGeneralIndustry(ind)) continue;
      if (aliases.some((alias) => ind.includes(alias) || ind === alias)) {
        const nonGeneralCount = incIndustries.filter((i) => !isGeneralIndustry(i)).length;
        const points = nonGeneralCount <= 2 ? SCORE_INDUSTRY : 28;
        return { points, reason: `Strong ${category} alignment` };
      }
    }
  }

  if (incIndustries.some((i) => isGeneralIndustry(i)) && userCategories.size > 0) {
    return { points: 15, reason: 'General startup program' };
  }

  return { points: 0, reason: null };
}

function stageMatches(userStages: Set<string>, incubator: Incubator): boolean {
  const incStages = incubator.startupStages.map((s) => normalize(s));
  for (const stage of userStages) {
    if (incStages.some((s) => s.includes(stage) || stage.includes(s))) {
      return true;
    }
  }
  return false;
}

function techMatches(
  userTags: Set<string>,
  incubator: Incubator,
  userCategories: Set<string>
): boolean {
  if (userTags.size === 0) return false;

  const techFocused =
    userCategories.has('deeptech') ||
    userCategories.has('saas') ||
    incubator.industries.some((i) => {
      const n = normalize(i);
      return n === 'deeptech' || n === 'saas' || n === 'hardware';
    });

  if (!techFocused) return false;

  const incTags = incubator.tags.map((t) => normalize(t));
  for (const tag of userTags) {
    if (incTags.some((t) => t.includes(tag) || tag.includes(t))) return true;
  }
  return false;
}

function getPrimaryCategory(request: StartupAnalysisRequest): string | null {
  const raw = normalize(request.industry);
  if (!raw) return null;

  for (const [category, keywords] of Object.entries(INDUSTRY_ALIASES)) {
    if (raw.includes(category) || keywords.some((kw) => raw.includes(kw))) {
      return category;
    }
  }
  return null;
}

function buildMatchReason(parts: string[]): string {
  return parts.join(' · ');
}

function scoreIncubator(
  incubator: Incubator,
  request: StartupAnalysisRequest,
  analysis: StartupAnalysisResponse,
  userCategories: Set<string>,
  userStages: Set<string>,
  userTags: Set<string>,
  primaryCategory: string | null
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const userCountryNorm = normalizeCountry(request.country);
  const incCountryNorm = normalizeCountry(incubator.country);

  const industryResult = getIndustryScore(userCategories, incubator);
  if (industryResult.points > 0) {
    score += industryResult.points;
    if (industryResult.reason) reasons.push(industryResult.reason);
  }

  if (stageMatches(userStages, incubator)) {
    score += SCORE_STAGE;
    reasons.push('Accepts your current startup stage');
  }

  if (regionMatches(request.country, incubator)) {
    score += SCORE_COUNTRY;
    reasons.push(
      userCountryNorm === incCountryNorm
        ? `Based in ${incubator.country}`
        : 'Accepts international founders in your region'
    );
  }

  if (incubator.remote && userCountryNorm !== incCountryNorm) {
    score += SCORE_REMOTE;
    reasons.push('Offers remote or hybrid program access');
  }

  if (techMatches(userTags, incubator, userCategories)) {
    score += SCORE_TECH;
    reasons.push('Specializes in your technology focus');
  }

  if (
    primaryCategory &&
    incubator.industries.map((i) => normalize(i)).includes(primaryCategory)
  ) {
    score += 8;
    reasons.unshift(`Programs tailored for ${primaryCategory} startups`);
  }

  // Tie-breaker: boost if analysis mentions similar themes
  const analysisText = normalize(
    [analysis.summary.join(' '), analysis.scores.rationale, request.idea].join(' ')
  );
  if (incubator.tags.some((tag) => analysisText.includes(normalize(tag)))) {
    score += 2;
  }

  return { score, reasons };
}

export function matchIncubators(
  request: StartupAnalysisRequest,
  analysis: StartupAnalysisResponse,
  limit = 5
): IncubatorRecommendation[] {
  const incubators = loadIncubators();
  const contextText = [
    request.idea,
    request.industry,
    request.problem,
    request.audience,
    analysis.summary.join(' '),
    analysis.customers.join(' '),
  ].join(' ');

  const primaryCategory = getPrimaryCategory(request);
  const userCategories = detectIndustryCategories(contextText);
  if (request.industry.trim()) {
    detectIndustryCategories(request.industry).forEach((c) => userCategories.add(c));
    const rawIndustry = normalize(request.industry);
    for (const [category, keywords] of Object.entries(INDUSTRY_ALIASES)) {
      if (
        rawIndustry.includes(category) ||
        keywords.some((kw) => rawIndustry.includes(kw))
      ) {
        userCategories.add(category);
      }
    }
  }

  if (primaryCategory && ['healthcare', 'fintech', 'edtech', 'food'].includes(primaryCategory)) {
    userCategories.delete('deeptech');
    userCategories.delete('saas');
  }
  if (primaryCategory) {
    userCategories.add(primaryCategory);
  }

  const userStages = inferStartupStages(request);
  const userTags = extractTechTags(contextText);
  const userCountry = normalizeCountry(request.country);

  const ranked = incubators
    .map((incubator) => {
      const { score, reasons } = scoreIncubator(
        incubator,
        request,
        analysis,
        userCategories,
        userStages,
        userTags,
        primaryCategory
      );

      const matchPercent = Math.min(100, Math.round((score / MAX_SCORE) * 100));

      return {
        id: incubator.id,
        name: incubator.name,
        matchPercent,
        description: incubator.description,
        funding: incubator.funding,
        equity: incubator.equity,
        startupStages: incubator.startupStages,
        industries: incubator.industries,
        country: incubator.country,
        acceptsInternational: incubator.acceptsInternational,
        remote: incubator.remote,
        website: incubator.website,
        matchReason: buildMatchReason(
          reasons.length > 0
            ? reasons
            : ['General startup support program']
        ),
        _score: score,
      };
    })
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score || b.matchPercent - a.matchPercent)
    .slice(0, limit);

  // Ensure India-based founders see at least one India program when scores are close
  if (userCountry === 'india' && ranked.length > 0) {
    const hasIndian = ranked.some((r) => normalizeCountry(r.country) === 'india');
    if (!hasIndian) {
      const bestIndian = incubators
        .filter((i) => normalizeCountry(i.country) === 'india')
        .map((incubator) => {
          const { score, reasons } = scoreIncubator(
            incubator,
            request,
            analysis,
            userCategories,
            userStages,
            userTags,
            primaryCategory
          );
          return {
            id: incubator.id,
            name: incubator.name,
            matchPercent: Math.min(100, Math.round((score / MAX_SCORE) * 100)),
            description: incubator.description,
            funding: incubator.funding,
            equity: incubator.equity,
            startupStages: incubator.startupStages,
            industries: incubator.industries,
            country: incubator.country,
            acceptsInternational: incubator.acceptsInternational,
            remote: incubator.remote,
            website: incubator.website,
            matchReason: buildMatchReason(reasons.length ? reasons : ['India-focused startup ecosystem']),
            _score: score,
          };
        })
        .filter((i) => i._score > 0)
        .sort((a, b) => b._score - a._score)[0];

      if (bestIndian) {
        ranked.pop();
        ranked.push(bestIndian);
        ranked.sort((a, b) => b._score - a._score);
      }
    }
  }

  return ranked.map(({ _score, ...rest }) => rest);
}
