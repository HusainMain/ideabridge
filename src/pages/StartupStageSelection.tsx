import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useJourneyStore } from '../stores/useJourneyStore';

const STAGE_OPTIONS = [
  {
    value: 'idea',
    icon: '💡',
    title: 'Idea Stage',
    description: 'I have an idea but haven\'t started building yet.',
  },
  {
    value: 'mvp',
    icon: '🛠️',
    title: 'MVP Built',
    description: 'I have built a prototype or working MVP.',
  },
  {
    value: 'traction',
    icon: '👥',
    title: 'Early Traction',
    description: 'I have users testing my product.',
  },
  {
    value: 'revenue',
    icon: '💰',
    title: 'Revenue Stage',
    description: 'I have paying customers.',
  },
  {
    value: 'scaling',
    icon: '🚀',
    title: 'Scaling',
    description: 'I\'m growing and looking to expand.',
  },
];

export function StartupStageSelection() {
  const navigate = useNavigate();
  const { startupStage, setStartupStage } = useJourneyStore();

  const handleSelect = (stage: typeof STAGE_OPTIONS[0]) => {
    setStartupStage(stage.value as any);
  };

  const handleContinue = () => {
    if (startupStage) {
      navigate('/analysis');
    }
  };

  return (
    <div className="act-input-shell">
      <header className="act-input-header">
        <button onClick={() => navigate(-1)} className="act-input-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>
        <div className="act-input-progress">
          <div className={`act-input-progress__dot act-input-progress__dot--done`} />
          <div className={`act-input-progress__dot act-input-progress__dot--active`} />
        </div>
      </header>

      <main className="act-input-main">
        <div className="act-question">
          <span className="act-label">One Last Question</span>
          <h1 className="act-question__heading">Which best describes your startup today?</h1>
          <p className="act-question__sub">Help us personalize your AI recommendations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mt-8">
          {STAGE_OPTIONS.map((stage) => {
            const isSelected = startupStage === stage.value;
            return (
              <motion.button
                key={stage.value}
                onClick={() => handleSelect(stage)}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  borderColor: 'rgba(0, 240, 255, 0.45)',
                  boxShadow: '0 0 24px rgba(0, 240, 255, 0.15)',
                }}
                whileTap={{ scale: 0.98 }}
                animate={isSelected ? {
                  scale: 1.05,
                  y: -2,
                } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`glass-panel relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-6 text-left flex flex-col gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <div className="text-3xl mb-2">{stage.icon}</div>
                <h3 className={`text-lg font-semibold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                  {stage.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{stage.description}</p>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center"
                  >
                    <Check size={14} className="text-slate-950" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="act-input-actions mt-12">
          <button
            onClick={handleContinue}
            disabled={!startupStage}
            className="act-input-next"
          >
            Continue <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </main>
    </div>
  );
}