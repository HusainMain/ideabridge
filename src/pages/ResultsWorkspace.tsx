import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft
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
    setAnalysisStatus
  } = useJourneyStore();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Ambient background elements - subtle only */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl translate-y-1/2" />
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
            className="max-w-7xl mx-auto w-full px-4 py-4"
          >
            {/* Section 1: Report Header */}
            <ReportHeader />

            {/* Section 2: Executive Summary + Score (Unified) */}
            <motion.section
              className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {/* Score Dashboard: 66% width on lg screens */}
              <div className="lg:col-span-2">
                <ScoreDashboard scores={results.scores} />
              </div>
              {/* Executive Summary: 33% width on lg screens */}
              <div className="lg:col-span-1">
                <ExecutiveSummary results={results} />
              </div>
            </motion.section>

            {/* Section Divider & Title */}
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[0.6rem] font-mono tracking-[0.18em] text-slate-500 uppercase">REALITY CHECK</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 3: Reality Check (Tighter padding) */}
            <motion.section className="mb-4">
               <RealityCheckCard realityCheck={results.realityCheck} />
            </motion.section>

            {/* Section Divider & Title */}
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[0.6rem] font-mono tracking-[0.18em] text-slate-500 uppercase">DEEP ANALYSIS</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 4: Deep Analysis (Tighter, better grid) */}
            <div
              className="grid w-full mb-4"
              style={{
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))'
              }}
            >
              <AnalysisSectionCard
                title="Market Validation"
                icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
                color="emerald"
                points={results.validation}
              />
              <AnalysisSectionCard
                title="Customer Discovery"
                icon={<ArrowLeft className="w-4 h-4 text-blue-400" />}
                color="blue"
                points={results.customers}
              />
              <AnalysisSectionCard
                title="Revenue Strategy"
                icon={<Sparkles className="w-4 h-4 text-yellow-400" />}
                color="yellow"
                points={results.revenue}
              />
              <AnalysisSectionCard
                title="Funding Path"
                icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
                color="cyan"
                points={results.funding}
              />
              <AnalysisSectionCard
                title="Risk Mitigation"
                icon={<Sparkles className="w-4 h-4 text-rose-400" />}
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
              <span className="text-[0.6rem] font-mono tracking-[0.18em] text-slate-500 uppercase">EXECUTION PLAN</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Section 5: Execution Plan (Tighter spacing) */}
            <motion.section className="space-y-3">
              <RoadmapVisualizer />
              <SevenDayPlan />
              <AnalysisSectionCard
                title="Priority Actions"
                icon={<ArrowLeft className="w-4 h-4 text-purple-400" />}
                color="purple"
                points={[]}
              >
                <PriorityActions actions={results.actions} />
              </AnalysisSectionCard>
            </motion.section>

            {/* Footer */}
            <footer className="text-center text-slate-600 text-[0.65rem] py-8 mt-3 border-t border-white/5">
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
