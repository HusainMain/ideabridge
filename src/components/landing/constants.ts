// Landing-page data constants, extracted verbatim from LandingPage.tsx.
import { mentors as mentorData } from '../../data/mentors';

export const startupExamples = [
  'AI Farming Assistant',
  'Solar-Powered Coffee Roaster',
  'Smart Waste Management Platform',
];

export const howItWorks = [
  ['Enter Your Idea', 'Describe the startup you want to build in plain language.'],
  ['Get AI Analysis', 'IdeaBridge analyzes the idea, funding fit, mentor fit, and incubator fit.'],
  ['Review Results Workspace', 'See a top recommendation, dos and don’ts, mentors, funding, and incubators.'],
  ['Save Or Export', 'Edit inputs, save or share the workspace, and export the report.'],
];

export const scanCards = [
  ['Idea Fit', 'Parses the idea, audience, and current stage from the guided input flow.'],
  ['Funding Fit', 'Checks which funding sources are most relevant and why they match.'],
  ['Mentor Fit', 'Finds mentor matches and explains the reason for each match.'],
  ['Incubator Fit', 'Identifies incubators by stage, location, and benefits.'],
  ['Workspace Ready', 'Prepares the top recommendation, actions, dos and don’ts, and report output.'],
];

export const readinessReasons = [
  { icon: '01', heading: 'Idea is clearly defined', body: 'Your concept describes a specific audience and a concrete problem, which gives the analysis a useful starting point.' },
  { icon: '02', heading: 'Stage fits the platform', body: 'IdeaBridge is calibrated for early-stage founders. Results are matched to where you actually are, not where a pitch deck says you should be.' },
  { icon: '03', heading: 'Mentor matches are grounded', body: 'Matches are based on sector overlap and founder background. Each match shows the exact reason it was made.' },
  { icon: '04', heading: 'Funding sources are realistic', body: 'Funding and incubator suggestions are framed with eligibility, stage, location, and deadline context.' },
];

export const mentors = mentorData
  .filter((m) => m.featured)
  .map((m) => {
    const initials = m.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
    return [initials, m.name, m.expertise, m.bio];
  });

export const ecosystemNodes = [
  ['Top Recommendation', 'Best next step', 'Reasoning + 3 actions'],
  ['Dos & Don’ts', 'Personalized analysis', 'What to focus on and avoid'],
  ['Mentor Matches', 'Why matched', 'Reach-out context'],
  ['Funding Sources', 'Eligibility + fit', 'Deadlines and match score'],
  ['Incubators', 'Stage + location', 'Benefits and fit'],
  ['Save / Share', 'Export report', 'PDF and shareable workspace'],
];

export const fundingCards = [
  ['Micro-Grant Initiative', '92% fit', 'Pre-seed grant match with eligibility and deadline context.'],
  ['Seed Angel Syndicate', '75% fit', 'Equity funding source shown with stage fit and rolling deadline.'],
  ['LaunchPad Tech', 'Idea stage', 'Incubator match with stipend, credits, and weekly mentorship benefits.'],
];

export const CARD_THRESHOLDS = [0.08, 0.24, 0.40, 0.56, 0.72];
export const CARD_TOP_POS = ['8%', '26%', '44%', '62%', '80%'];
// Orb dwells at 80% after last card then exits — avoids dead space
export const SCAN_ORB_PROGRESS = [0, 0.06, ...CARD_THRESHOLDS, 0.88, 1];
export const SCAN_ORB_TOPS     = ['0%', '8%', ...CARD_TOP_POS, '85%', '95%'];


export const NAV_SECTIONS = [
  { id: 'section-hero', label: 'Home' },
  { id: 'section-how-it-works', label: 'How It Works' },
  { id: 'section-ai', label: 'AI Analysis' },
  { id: 'section-readiness', label: 'Readiness' },
  { id: 'section-mentorship', label: 'Mentorship' },
  { id: 'section-ecosystem', label: 'Ecosystem' },
  { id: 'section-funding', label: 'Funding' },
  { id: 'section-stats', label: 'Stats' },
  { id: 'section-roadmap', label: 'Roadmap' },
  { id: 'section-launch', label: 'Launch' },
];
