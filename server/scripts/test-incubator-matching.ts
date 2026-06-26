/**
 * Deterministic incubator matching smoke tests (no Gemini).
 * Run: node dist/server/scripts/test-incubator-matching.js
 */
import { matchIncubators } from '../src/services/incubatorMatchingService';
import type { StartupAnalysisRequest, StartupAnalysisResponse } from '../src/types/types';

function mockAnalysis(summary: string[]): StartupAnalysisResponse {
  return {
    scores: {
      overall: 65,
      marketPotential: 70,
      innovation: 60,
      feasibility: 65,
      scalability: 68,
      monetization: 62,
      rationale: 'Mock analysis for incubator matching tests.',
    },
    realityCheck: {
      biggestAssumption: 'Market demand exists.',
      biggestRisk: 'Competition.',
      whyItCouldFail: 'Execution risk.',
      hardestExecutionChallenge: 'Customer acquisition.',
    },
    summary,
    validation: ['Validate with customers'],
    customers: ['Target users'],
    revenue: ['Subscription model'],
    competitors: [{ name: 'Incumbent', weakness: 'Slow', yourEdge: 'Speed' }],
    roadmap: ['Phase 1 MVP'],
    funding: ['Seed round'],
    risks: ['Market risk'],
    actions: ['Build MVP'],
    nextSevenDays: ['Day 1: Research'],
  };
}

const scenarios: Array<{ name: string; request: StartupAnalysisRequest; summary: string[] }> = [
  {
    name: 'AI healthcare startup',
    request: {
      idea: 'AI platform for hospitals to automate patient scheduling and reduce admin workload',
      industry: 'Healthcare',
      problem: 'Doctors lose hours on manual scheduling',
      audience: 'Hospital administrators',
      country: 'United States',
      budget: 'Seed / Medium ($5k - $50k)',
      teamSize: 'Small Team (2-5 people)',
    },
    summary: ['AI healthcare scheduling platform for hospitals and clinics'],
  },
  {
    name: 'Generic food delivery startup',
    request: {
      idea: 'Food delivery app',
      industry: 'Food',
      problem: 'People want food delivered fast',
      audience: 'Urban consumers',
      country: 'United States',
      budget: 'Bootstrap / Low (<$5k)',
      teamSize: 'Solo Founder',
    },
    summary: ['On-demand food delivery marketplace for urban consumers'],
  },
  {
    name: 'FinTech startup',
    request: {
      idea: 'Digital lending platform for small businesses with instant credit scoring',
      industry: 'FinTech',
      problem: 'SMBs cannot access fast working capital',
      audience: 'Small business owners',
      country: 'India',
      budget: 'Seed / Medium ($5k - $50k)',
      teamSize: 'Small Team (2-5 people)',
    },
    summary: ['FinTech lending platform using AI credit scoring for Indian SMBs'],
  },
  {
    name: 'EdTech startup',
    request: {
      idea: 'Online learning platform for coding bootcamps with live mentorship',
      industry: 'EdTech',
      problem: 'Students need affordable tech skills training',
      audience: 'College graduates and career switchers',
      country: 'India',
      budget: 'Bootstrap / Low (<$5k)',
      teamSize: 'Solo Founder',
    },
    summary: ['EdTech platform delivering live coding bootcamps and mentorship'],
  },
  {
    name: 'DeepTech startup',
    request: {
      idea: 'Robotics system for warehouse automation using computer vision',
      industry: 'DeepTech',
      problem: 'Warehouses need autonomous picking at scale',
      audience: 'Logistics operators',
      country: 'United States',
      budget: 'Venture / High (>$50k)',
      teamSize: 'Growing Startup (6+ people)',
    },
    summary: ['DeepTech robotics and AI computer vision for warehouse automation'],
  },
];

let passed = 0;

for (const scenario of scenarios) {
  const analysis = mockAnalysis(scenario.summary);
  const matches = matchIncubators(scenario.request, analysis);

  console.log(`\n=== ${scenario.name} ===`);
  if (matches.length === 0) {
    console.log('FAIL — no matches returned');
    continue;
  }

  matches.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name} (${m.matchPercent}%) — ${m.matchReason}`);
  });

  const topIndustries = matches.flatMap((m) => m.industries).join(' ').toLowerCase();
  const sensible =
    (scenario.name.includes('healthcare') && topIndustries.includes('health')) ||
    (scenario.name.includes('food') && (topIndustries.includes('food') || topIndustries.includes('consumer'))) ||
    (scenario.name.includes('FinTech') && topIndustries.includes('fintech')) ||
    (scenario.name.includes('EdTech') && topIndustries.includes('edtech')) ||
    (scenario.name.includes('DeepTech') && (topIndustries.includes('deeptech') || topIndustries.includes('hardware')));

  if (matches.length >= 3 && sensible) {
    console.log('RESULT: PASS');
    passed++;
  } else {
    console.log('RESULT: FAIL — recommendations may not align with scenario');
  }
}

console.log(`\n${passed}/${scenarios.length} scenarios passed`);
process.exit(passed === scenarios.length ? 0 : 1);
