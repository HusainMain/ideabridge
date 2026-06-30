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
  X,
  Brain,
  Target,
  Zap,
  Calendar,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { useJourneyStore } from '../stores/useJourneyStore';
import { PriorityActions } from '../components/results/PriorityActions';
import { SevenDayPlan } from '../components/results/SevenDayPlan';
import { IncubatorRecommendations } from '../components/results/IncubatorRecommendations';
import { CompetitorCards } from '../components/results/CompetitorCards';
import { FloatingActionBar } from '../components/results/FloatingActionBar';
import { MentorRecommendations } from '../components/results/MentorRecommendations';
import { mentors } from '../data/mentors';

// ─── AI Verdict Logic ───────────────────────────────────────────────

function getVerdict(score: number): string {
  if (score >= 85) return 'Exceptional Potential';
  if (score >= 75) return 'Strong Opportunity';
  if (score >= 65) return 'Viable with Refinement';
  if (score >= 50) return 'Needs Validation';
  return 'High Risk Concept';
}

function getVerdictDescription(score: number): string {
  if (score >= 80) {
    return "Your idea shows exceptional market viability and execution potential. The analysis indicates strong differentiation and clear path to market.";
  }
  if (score >= 65) {
    return "Your idea addresses a genuine market need with reasonable execution risk. Refinement in specific areas could significantly improve outcomes.";
  }
  return "Your idea has potential but faces notable challenges. Consider validating core assumptions before significant investment.";
}

// ─── Circular Score Component ─────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#00f0ff';
  if (score >= 68) return '#a986ff';
  if (score >= 55) return '#ffae42';
  return '#f87171';
}

function CircularScore({ score, size = 180 }: { score: number; size?: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{
        boxShadow: `0 0 28px ${color}22, 0 0 8px ${color}18`,
        borderRadius: '50%',
      }} />
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={`${color}18`} strokeWidth="9" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="5.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono tabular-nums text-4xl font-bold text-white leading-none tracking-tight">{score}</span>
        <span className="text-[0.6rem] uppercase tracking-widest mt-1" style={{ color: `${color}99` }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Premium Metric Chip ─────────────────────────────────────────────

function MetricChip({ icon: Icon, label, value, status }: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  status: 'positive' | 'neutral' | 'warning' | 'negative';
}) {
  const statusColors = {
    positive: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    neutral: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    negative: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:bg-white/[0.03] ${statusColors[status]}`}>
      <Icon className="w-4 h-4" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

// ─── AI Observation Section ───────────────────────────────────────────

function AIObservation({ insight }: { insight: string }) {
  return (
    <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-cyan-500/10 border-l-2 border-cyan-400">
      <Brain className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      <p className="text-xs text-cyan-200/90 italic leading-relaxed">{insight}</p>
    </div>
  );
}

// ─── Premium Report Section ───────────────────────────────────────────

interface ReportSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

function ReportSection({ title, icon: Icon, children, delay = 0 }: ReportSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-white/10 overflow-hidden mb-6"
      style={{ background: 'linear-gradient(135deg, rgba(7,13,27,0.95) 0%, rgba(10,15,30,0.9) 100%)' }}
    >
      <div className="h-px w-full bg-gradient-to-r from-cyan-500/60 via-purple-500/40 to-transparent" />
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">{title}</span>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

// ─── Analysis Section Card ───────────────────────────────────────────────

interface AnalysisSectionCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'rose';
  points: string[];
  children?: React.ReactNode;
}

function AnalysisSectionCard({ title, icon, color, points, children }: AnalysisSectionCardProps): React.ReactElement {
  const colorMap: Record<typeof color, { text: string; border: string; from: string; iconBg: string }> = {
    emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', from: 'from-emerald-500/20', iconBg: 'bg-emerald-500/10' },
    blue: { text: 'text-blue-400', border: 'border-blue-500/30', from: 'from-blue-500/20', iconBg: 'bg-blue-500/10' },
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500/30', from: 'from-cyan-500/20', iconBg: 'bg-cyan-500/10' },
    purple: { text: 'text-purple-400', border: 'border-purple-500/30', from: 'from-purple-500/20', iconBg: 'bg-purple-500/10' },
    yellow: { text: 'text-yellow-400', border: 'border-yellow-500/30', from: 'from-yellow-500/20', iconBg: 'bg-yellow-500/10' },
    rose: { text: 'text-rose-400', border: 'border-rose-500/30', from: 'from-rose-500/20', iconBg: 'bg-rose-500/10' },
  };

  const cfg = colorMap[color] ?? colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 mb-6"
      style={{ background: 'rgba(7,13,27,0.88)' }}
    >
      <div className={`h-px w-full bg-gradient-to-r ${cfg.from} to-transparent`} />
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-white/5`}>
        <div className={`p-1.5 rounded-md ${cfg.iconBg} border ${cfg.border}`}>{icon}</div>
        <h3 className="text-[0.95rem] font-semibold text-white">{title}</h3>
      </div>
      <div className="px-5 py-4">
        {children ? children : (
          <ul className="space-y-2.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 w-[15px] h-[15px] flex-shrink-0 ${cfg.text}`} />
                <span className="text-[0.82rem] leading-6 text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export default function ResultsWorkspace(): React.ReactElement {
  const navigate = useNavigate();
  const {
    results,
    validationMeta,
    setAnalysisStatus,
    inputs,
  } = useJourneyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [weakWarningDismissed, setWeakWarningDismissed] = useState(false);

  useEffect(() => {
    if (!results) navigate('/');
    else setIsLoading(false);
  }, [results, navigate]);

  const handleRestart = () => {
    setAnalysisStatus('idle');
    navigate('/');
  };

  const handleExport = () => window.print();

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

  const ideaTitle = inputs.idea.length > 40 ? `${inputs.idea.substring(0, 37)}...` : inputs.idea;
  const verdict = getVerdict(results.scores.overall);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,240,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%)',
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <AnimatePresence>
        <motion.div initial="hidden" animate="visible" className="relative z-10 pb-20">
          {/* Navigation Header */}
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
              <button onClick={handleRestart} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm">
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

          <main className="max-w-7xl mx-auto w-full px-4 py-6 pb-28 md:pb-6">
            {/* Weak warning banner */}
            {validationMeta?.quality === 'weak' && !weakWarningDismissed && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-sm">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-100/90 leading-relaxed">
                    {validationMeta.warning || 'Your idea was analyzable, but the description was quite limited. Expanding it may improve analysis accuracy.'}
                  </p>
                </div>
                <button onClick={() => setWeakWarningDismissed(true)} aria-label="Dismiss warning">
                  <X className="w-4 h-4 text-amber-400/70 hover:text-amber-200 transition" />
                </button>
              </motion.div>
            )}

            {/* Hero Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Analysis Complete</h1>
              <p className="text-xl md:text-2xl text-cyan-400 font-mono mb-4">{ideaTitle}</p>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                AI-powered strategic analysis delivering actionable insights for your startup concept.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6 text-slate-500 text-sm">
                <span>Generated today</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>Confidential Report</span>
              </div>
            </motion.div>

            {/* AI Verdict Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl border border-white/10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(7,13,27,0.95) 0%, rgba(10,15,30,0.9) 100%)', boxShadow: '0 4px 60px rgba(0,240,255,0.12)' }}>
              <div className="flex-shrink-0">
                <CircularScore score={results.scores.overall} size={200} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{verdict}</h2>
                <p className="text-slate-300/90 leading-relaxed text-lg">{getVerdictDescription(results.scores.overall)}</p>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <MetricChip icon={TrendingUp} label="Market Potential" value={results.scores.marketPotential >= 70 ? "High" : "Moderate"} status="positive" />
              <MetricChip icon={Brain} label="Innovation" value={results.scores.innovation >= 65 ? "Strong" : "Developing"} status={results.scores.innovation >= 70 ? "positive" : "neutral"} />
              <MetricChip icon={Zap} label="Feasibility" value={results.scores.feasibility >= 70 ? "Viable" : "Challenging"} status={results.scores.feasibility >= 65 ? "positive" : "warning"} />
              <MetricChip icon={Target} label="Competition" value="Analyzed" status="neutral" />
            </motion.div>

            {/* Executive Summary */}
            <ReportSection title="Executive Summary" icon={Lightbulb} delay={0.3}>
              <ul className="space-y-3 mb-4">
                {results.summary.map((point, i) => (
                  <li key={i} className="flex gap-3 text-slate-300 leading-6">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
              <AIObservation insight={`The analysis identifies ${results.validation?.length || 0} key validation points for your concept.`} />
            </ReportSection>

            {/* Reality Check */}
            <ReportSection title="Reality Check" icon={AlertCircle} delay={0.4}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Biggest Assumption</p>
                  <p className="text-sm text-slate-300">{results.realityCheck.biggestAssumption}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Biggest Risk</p>
                  <p className="text-sm text-slate-300">{results.realityCheck.biggestRisk}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Why It Could Fail</p>
                  <p className="text-sm text-slate-300">{results.realityCheck.whyItCouldFail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hardest Challenge</p>
                  <p className="text-sm text-slate-300">{results.realityCheck.hardestExecutionChallenge}</p>
                </div>
              </div>
            </ReportSection>

            {/* Opportunity Analysis */}
            <AnalysisSectionCard title="Market Validation" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} color="emerald" points={results.validation} />

            {/* Market Research */}
            <AnalysisSectionCard title="Customer Discovery" icon={<Users className="w-4 h-4 text-blue-400" />} color="blue" points={results.customers} />

            {/* Competitive Landscape */}
            <ReportSection title="Competitive Landscape" icon={BarChart3} delay={0.5}>
              <CompetitorCards />
            </ReportSection>

            {/* Risk Analysis */}
            <AnalysisSectionCard title="Risk Mitigation" icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} color="rose" points={results.risks} />
            <AIObservation insight="Primary concerns center around market differentiation and execution timing." />

            {/* AI Recommendations */}
            <ReportSection title="AI Recommendations" icon={Sparkles} delay={0.6}>
              <PriorityActions actions={results.actions} />
            </ReportSection>

            {/* Next Steps */}
            <ReportSection title="Next Steps" icon={Calendar} delay={0.7}>
              <SevenDayPlan />
            </ReportSection>

            {/* Incubator Recommendations */}
            {results.incubatorRecommendations && results.incubatorRecommendations.length > 0 && (
              <ReportSection title="Funding & Ecosystem" icon={DollarSign} delay={0.8}>
                <IncubatorRecommendations recommendations={results.incubatorRecommendations} />
              </ReportSection>
            )}

            {/* Mentor Recommendations */}
            <ReportSection title="Mentors & Guidance" icon={Users} delay={0.9}>
              <MentorRecommendations mentors={mentors} />
            </ReportSection>

            {/* Footer */}
            <footer className="text-center text-slate-600 text-[0.68rem] py-6 mt-8 border-t border-white/5">
              <p className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Powered by IdeaBridge AI
              </p>
            </footer>
          </main>

          {/* Floating Actions */}
          <FloatingActionBar onExport={handleExport} onAnalyzeAgain={handleRestart} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}