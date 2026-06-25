import { motion } from 'framer-motion';
import { Calendar, Building2, Layers } from 'lucide-react';
import { IdeaInputs } from '../../stores/useJourneyStore';

interface ReportHeaderProps {
  inputs: IdeaInputs;
  generatedAt: string;
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)' }}
      >
        <Icon size={13} style={{ color: 'var(--act-cyan)' }} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--act-muted)' }}>
          {label}
        </div>
        <div className="text-sm font-medium text-white">{value}</div>
      </div>
    </div>
  );
}

export function ReportHeader({ inputs, generatedAt }: ReportHeaderProps) {
  const stageMap: Record<string, string> = {
    'Bootstrap / Low (<$5k)': 'Pre-seed',
    'Seed / Medium ($5k - $50k)': 'Seed Stage',
    'Venture / High (>$50k)': 'Venture Stage',
  };
  const stage = stageMap[inputs.budget] ?? inputs.budget;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background:
          'linear-gradient(135deg, rgba(0,240,255,0.04) 0%, rgba(169,134,255,0.03) 50%, #0d0d0d 100%)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, #00f0ff, #a986ff, transparent)' }}
      />

      <div className="px-6 md:px-10 py-7 md:py-9">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4">
          <span className="act-label" style={{ margin: 0 }}>IdeaBridge Analysis Report</span>
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(0,240,255,0.1)',
              color: 'var(--act-cyan)',
              border: '1px solid rgba(0,240,255,0.2)',
            }}
          >
            AI-Generated
          </div>
        </div>

        {/* Idea title */}
        <h1
          className="font-serif font-bold text-white leading-tight mb-6"
          style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', maxWidth: '26ch' }}
        >
          {inputs.idea}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Meta icon={Building2} label="Industry" value={inputs.industry || 'Not specified'} />
          <Meta icon={Layers}    label="Stage"    value={stage} />
          <Meta icon={Calendar}  label="Generated" value={generatedAt} />
        </div>
      </div>
    </motion.div>
  );
}
