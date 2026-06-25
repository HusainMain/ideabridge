import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Users,
  CreditCard,
  Target,
  Milestone,
  Coins,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
} from 'lucide-react';

import { useJourneyStore } from '../stores/useJourneyStore';

import { ReportHeader }        from '../components/results/ReportHeader';
import { ScoreDashboard }      from '../components/results/ScoreDashboard';
import { ExecutiveSummary }    from '../components/results/ExecutiveSummary';
import { AnalysisSectionCard } from '../components/results/AnalysisSectionCard';
import { PriorityActions }     from '../components/results/PriorityActions';
import { RoadmapVisualizer }   from '../components/results/RoadmapVisualizer';
import { FloatingActionBar }   from '../components/results/FloatingActionBar';
import { RealityCheckCard }    from '../components/results/RealityCheckCard';
import { CompetitorCards }     from '../components/results/CompetitorCards';
import { SevenDayPlan }        from '../components/results/SevenDayPlan';

/* ─── helpers ────────────────────────────────────────────── */

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ─── accent palette ─────────────────────────────────────── */

const CYAN   = '#00f0ff';
const PURPLE = '#a986ff';
const AMBER  = '#ffae42';
const GREEN  = '#4ade80';
const RED    = '#f87171';

/* ─── page ───────────────────────────────────────────────── */

export function ResultsWorkspace() {
  const navigate = useNavigate();
  const { results, inputs, resetJourney } = useJourneyStore();

  const generatedAt = useMemo(() => formatDate(new Date()), []);

  /* ── empty guard ── */
  if (!results) {
    return (
      <div className="act-results-empty">
        <p>No analysis results found.</p>
        <button onClick={() => navigate('/')} className="act-cta-btn">Go to Home</button>
      </div>
    );
  }

  const handleExport       = () => window.print();
  const handleAnalyzeAgain = () => { resetJourney(); navigate('/input'); };

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block mb-6 text-white font-semibold text-sm">
        IdeaBridge Analysis Report — {inputs.idea}
      </div>

      <div
        className="min-h-screen"
        style={{
          background:
            'radial-gradient(ellipse at 65% 0%, rgba(0,240,255,0.04) 0%, transparent 50%), var(--act-bg)',
          paddingBottom: '7rem',
        }}
      >
        {/* ══════════════════════════════════════
            STICKY TOP NAV
        ══════════════════════════════════════ */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between gap-4 flex-wrap print:hidden"
          style={{
            padding: '0.85rem clamp(1.25rem, 5vw, 3rem)',
            background: 'rgba(5,5,5,0.88)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="act-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>
              Execution Workspace
            </span>
            <p
              className="text-sm"
              style={{
                color: 'var(--act-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '34ch',
                margin: 0,
              }}
            >
              {inputs.idea}
            </p>
          </div>
          <button
            onClick={() => navigate('/input')}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{
              color: 'var(--act-muted)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--act-muted)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Edit inputs
          </button>
        </header>

        {/* ══════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════ */}
        <main
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 5vw, 3rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          {/* ── A: Report Header ── */}
          <ReportHeader inputs={inputs} generatedAt={generatedAt} />

          {/* ── B: AI Score + Executive Summary (2-col on large screens) ── */}
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}
          >
            <ScoreDashboard scores={results.scores} />
            <ExecutiveSummary results={results} />
          </div>

          {/* ══════ REALITY CHECK ══════ */}
          <SectionDivider label="Reality Check" />

          <AnalysisSectionCard
            title="Hard Truths"
            icon={ShieldAlert}
            description="Unfiltered assessment of the riskiest assumptions and failure modes for this idea."
            bullets={[
              results.realityCheck.biggestAssumption,
              results.realityCheck.biggestRisk,
              results.realityCheck.whyItCouldFail,
              results.realityCheck.hardestExecutionChallenge,
            ]}
            accentColor={RED}
            delay={0}
          >
            <RealityCheckCard realityCheck={results.realityCheck} />
          </AnalysisSectionCard>

          {/* ══════ FULL ANALYSIS ══════ */}
          <SectionDivider label="Full Analysis" />

          {/* 2-col responsive grid for the six analysis sections */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))' }}
          >
            <AnalysisSectionCard
              title="Problem Validation"
              icon={CheckSquare}
              description="Specific experiments to validate the core problem in the next two weeks."
              bullets={results.validation}
              accentColor={CYAN}
              delay={0}
            />

            <AnalysisSectionCard
              title="Target Customers"
              icon={Users}
              description="Named customer segments with the most acute pain and highest willingness to pay."
              bullets={results.customers}
              accentColor={PURPLE}
              delay={0.05}
            />

            <AnalysisSectionCard
              title="Revenue Model"
              icon={CreditCard}
              description="Specific pricing mechanics, revenue streams, and unit economics."
              bullets={results.revenue}
              accentColor={GREEN}
              delay={0.1}
            />

            <AnalysisSectionCard
              title="Funding Options"
              icon={Coins}
              description="Funding sources matched to this budget level, stage, and sector."
              bullets={results.funding}
              accentColor={AMBER}
              delay={0.15}
            />

            <AnalysisSectionCard
              title="Risk Assessment"
              icon={AlertTriangle}
              description="Specific market, technical, and execution risks with mitigation approaches."
              bullets={results.risks}
              accentColor={RED}
              delay={0.2}
            />

            {/* Competitor section spans full width — structured cards need room */}
            <div style={{ gridColumn: '1 / -1' }}>
              <AnalysisSectionCard
                title="Competitive Landscape"
                icon={Target}
                description="Named competitors with their specific weaknesses and your concrete edge over each."
                bullets={results.competitors.map(c => `${c.name}: ${c.weakness} — Your edge: ${c.yourEdge}`)}
                accentColor="#f472b6"
                delay={0.25}
              >
                <CompetitorCards competitors={results.competitors} />
              </AnalysisSectionCard>
            </div>
          </div>

          {/* ══════ EXECUTION PLAN ══════ */}
          <SectionDivider label="Execution Plan" />

          {/* Roadmap */}
          <AnalysisSectionCard
            title="MVP Roadmap"
            icon={Milestone}
            description="Milestone-based phases with time estimates from validation to launch."
            bullets={results.roadmap}
            accentColor={CYAN}
            delay={0}
          >
            <RoadmapVisualizer steps={results.roadmap} />
          </AnalysisSectionCard>

          {/* Next 7 Days */}
          <AnalysisSectionCard
            title="Next 7 Days"
            icon={CalendarDays}
            description="Specific daily actions you can execute immediately, without any budget."
            bullets={results.nextSevenDays}
            accentColor={GREEN}
            delay={0.05}
          >
            <SevenDayPlan days={results.nextSevenDays} />
          </AnalysisSectionCard>

          {/* Priority Actions */}
          <AnalysisSectionCard
            title="Strategic Next Actions"
            icon={ArrowRight}
            description="Longer-horizon actions beyond this week, prioritised by urgency and impact."
            bullets={results.actions}
            accentColor={PURPLE}
            delay={0.1}
          >
            <PriorityActions actions={results.actions} />
          </AnalysisSectionCard>

          {/* ══════ FOOTER ══════ */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4 pt-6"
            style={{ borderTop: '1px solid var(--act-border)', marginTop: '1rem' }}
          >
            <p style={{ color: 'var(--act-muted)', fontSize: '0.9rem', margin: 0 }}>
              Ready to refine your analysis?
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate('/input')}
                className="act-cta-btn"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}
              >
                Refine Inputs
              </button>
              <button
                onClick={handleAnalyzeAgain}
                className="act-cta-btn"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}
              >
                New Analysis
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
              IdeaBridge AI · Generated {generatedAt}
            </p>
          </motion.div>
        </main>
      </div>

      {/* Floating action bar */}
      <FloatingActionBar onExport={handleExport} onAnalyzeAgain={handleAnalyzeAgain} />
    </>
  );
}

/* ── section divider ─────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4"
      style={{ marginTop: '0.5rem' }}
    >
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <span
        className="text-xs font-semibold uppercase tracking-widest flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.28)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
    </motion.div>
  );
}
