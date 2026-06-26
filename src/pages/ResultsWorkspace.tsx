import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';

import { useJourneyStore } from '../stores/useJourneyStore';
import { ReportHeader } from '../components/results/ReportHeader';
import { ScoreDashboard } from '../components/results/ScoreDashboard';
import { ExecutiveSummary } from '../components/results/ExecutiveSummary';
import AnalysisSectionCard from '../components/results/AnalysisSectionCard';
import { PriorityActions } from '../components/results/PriorityActions';
import { RoadmapVisualizer } from '../components/results/RoadmapVisualizer';
import { FloatingActionBar } from '../components/results/FloatingActionBar';
import { RealityCheckCard } from '../components/results/RealityCheckCard';
import { CompetitorCards } from '../components/results/CompetitorCards';
import { SevenDayPlan } from '../components/results/SevenDayPlan';

// Constants for animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

// Main Results Page Component
export default function ResultsWorkspace(): React.ReactElement {
  // Hook init
  const {
    results,
    validationMeta,
    setAnalysisStatus
  } = useJourneyStore();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [weakWarningDismissed, setWeakWarningDismissed] = useState(false);

  // Handlers
  const handleRestart = () => {
    setAnalysisStatus('idle');
    navigate('/');
  };
  
  const handleExport = () => {
    window.print();
  };

  // Effect to handle navigation back if there are no results
  useEffect(() => {
    if (!results) {
      navigate('/');
    } else {
      setIsLoading(false);
    }
  }, [results, navigate]);

  // Loading state
  if (isLoading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-slate-400 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden relative"
    >
      {/* Ambient background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Subtle grid — same DNA as landing page */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,240,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%)',
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 pb-20"
        >
          {/* Sticky Header/Navigation */}
          <header
            className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
               <button
                onClick={handleRestart}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>IDEA BRIDGE AI REPORT</span>
              </div>
              <div className="w-16"></div>
            </div>
          </header>

          {/* Main content wrapper */}
          <main
            className="max-w-7xl mx-auto w-full px-4 py-5 pb-28 md:pb-6"
          >
            {validationMeta?.quality === 'weak' && !weakWarningDismissed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-sm"
              >
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-100/90 leading-relaxed">
                    {validationMeta.warning ||
                      'Your idea was analyzable, but the description was quite limited. Expanding it may improve analysis accuracy.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWeakWarningDismissed(true)}
                  className="text-amber-400/70 hover:text-amber-200 transition shrink-0"
                  aria-label="Dismiss warning"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Section 1: Report Header */}
            <ReportHeader />

            {/* Section 2: Score Dashboard — viability at a glance, first thing users read */}
            <motion.section className="w-full mb-4">
              <ScoreDashboard scores={results.scores} />
            </motion.section>

            {/* Section 3: Executive Summary — narrative context below the score */}
            <motion.section
              className="w-full mb-4"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              <ExecutiveSummary results={results} />
            </motion.section>

            {/* Section Divider & Title */}
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[0.68rem] font-mono tracking-[0.18em] text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-400/70 inline-block" />
                REALITY CHECK
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 4: Reality Check */}
            <motion.section className="mb-4">
               <RealityCheckCard realityCheck={results.realityCheck} />
            </motion.section>

            {/* Section Divider & Title */}
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[0.68rem] font-mono tracking-[0.18em] text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400/70 inline-block" />
                DEEP ANALYSIS
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 5: Deep Analysis */}
            <div
              className="grid w-full mb-4"
              style={{
                gap: '0.875rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))'
              }}
            >
              <AnalysisSectionCard
                title="Market Validation"
                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                color="emerald"
                points={results.validation}
              />
              <AnalysisSectionCard
                title="Customer Discovery"
                icon={<Users className="w-4 h-4 text-blue-400" />}
                color="blue"
                points={results.customers}
              />
              <AnalysisSectionCard
                title="Revenue Strategy"
                icon={<DollarSign className="w-4 h-4 text-yellow-400" />}
                color="yellow"
                points={results.revenue}
              />
              <AnalysisSectionCard
                title="Funding Path"
                icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
                color="cyan"
                points={results.funding}
              />
              <AnalysisSectionCard
                title="Risk Mitigation"
                icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
                color="rose"
                points={results.risks}
              />
            </div>

            {/* Competitive Landscape */}
            <motion.section className="mb-4">
              <CompetitorCards />
            </motion.section>

            {/* Section Divider & Title */}
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[0.68rem] font-mono tracking-[0.18em] text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-400/70 inline-block" />
                EXECUTION PLAN
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 6: Execution Plan */}
            <motion.section className="space-y-3">
              <RoadmapVisualizer />
              <SevenDayPlan />
              <AnalysisSectionCard
                title="Priority Actions"
                icon={<Sparkles className="w-4 h-4 text-purple-400" />}
                color="purple"
                points={[]}
              >
                <PriorityActions actions={results.actions} />
              </AnalysisSectionCard>
            </motion.section>

            {/* Footer */}
            <footer className="text-center text-slate-600 text-[0.68rem] py-6 mt-4 border-t border-white/5">
              <p className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Powered by IdeaBridge AI
              </p>
            </footer>
          </main>
        </motion.div>
      </AnimatePresence>

      {/* Floating Actions */}
      <FloatingActionBar onExport={handleExport} onAnalyzeAgain={handleRestart} />
    </div>
  );
}
