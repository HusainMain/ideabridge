import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, AlertTriangle } from 'lucide-react';
import type { ValidationMeta } from '../../shared/validation/types';

interface ImproveYourIdeaScreenProps {
  validation: ValidationMeta;
  onBackToEdit: () => void;
}

export function ImproveYourIdeaScreen({ validation, onBackToEdit }: ImproveYourIdeaScreenProps) {
  const { reason, missing, suggestions } = validation;

  return (
    <div className="act-input-shell">
      <header className="act-input-header">
        <button onClick={onBackToEdit} className="act-input-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Edit Idea
        </button>
      </header>

      <main className="act-input-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="act-question__step">Input validation</p>
          </div>

          <h1 className="act-question__heading" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
            We couldn&apos;t generate a reliable startup analysis
          </h1>
          <p className="act-question__sub" style={{ marginBottom: '1.5rem' }}>
            Your submission didn&apos;t contain enough meaningful information for IdeaBridge to analyze.
            This isn&apos;t a score — we simply couldn&apos;t understand what to evaluate.
          </p>

          {reason && (
            <div
              className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
            >
              <p className="text-sm font-medium text-slate-200 mb-1">What went wrong</p>
              <p className="text-sm text-slate-400 leading-relaxed">{reason}</p>
            </div>
          )}

          {missing.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-200 mb-3">We couldn&apos;t identify</p>
              <ul className="space-y-2">
                {missing.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-400"
                  >
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="mb-8 p-4 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04]">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <p className="text-sm font-medium text-slate-200">Suggestions</p>
              </div>
              <ul className="space-y-2">
                {suggestions.map((tip) => (
                  <li key={tip} className="text-sm text-slate-400 leading-relaxed flex gap-2">
                    <span className="text-cyan-400/70 shrink-0">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onBackToEdit}
            className="act-input-next"
            type="button"
          >
            Improve My Idea
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
