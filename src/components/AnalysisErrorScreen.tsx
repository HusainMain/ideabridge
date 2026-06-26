import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  RotateCcw,
  WifiOff,
  Server,
  Ban,
} from 'lucide-react';
import type { ApiErrorCode } from '../../shared/errors/types';

interface AnalysisErrorScreenProps {
  code: ApiErrorCode;
  message: string;
  onRetry?: () => void;
  onEditIdea: () => void;
  retryDisabled?: boolean;
}

const CONFIG: Record<
  Exclude<ApiErrorCode, 'VALIDATION_FAILED'>,
  { title: string; icon: React.ReactNode; accent: string; showRetry: boolean; showEdit: boolean }
> = {
  QUOTA_EXCEEDED: {
    title: 'Daily AI limit reached',
    icon: <Ban className="w-8 h-8 text-amber-400" />,
    accent: 'border-amber-500/20',
    showRetry: false,
    showEdit: true,
  },
  RATE_LIMIT: {
    title: 'Too many requests',
    icon: <Clock className="w-8 h-8 text-yellow-400" />,
    accent: 'border-yellow-500/20',
    showRetry: true,
    showEdit: true,
  },
  AI_UNAVAILABLE: {
    title: 'AI service temporarily unavailable',
    icon: <AlertCircle className="w-8 h-8 text-orange-400" />,
    accent: 'border-orange-500/20',
    showRetry: true,
    showEdit: true,
  },
  NETWORK_ERROR: {
    title: 'No Internet Connection',
    icon: <WifiOff className="w-8 h-8 text-slate-300" />,
    accent: 'border-white/10',
    showRetry: true,
    showEdit: false,
  },
  SERVER_ERROR: {
    title: 'Something went wrong',
    icon: <Server className="w-8 h-8 text-red-400" />,
    accent: 'border-red-500/20',
    showRetry: true,
    showEdit: false,
  },
  UNKNOWN_ERROR: {
    title: 'Something went wrong',
    icon: <AlertCircle className="w-8 h-8 text-red-400" />,
    accent: 'border-red-500/20',
    showRetry: true,
    showEdit: true,
  },
};

const DEFAULT_BODY: Partial<Record<ApiErrorCode, string>> = {
  QUOTA_EXCEEDED:
    'IdeaBridge has reached today\'s AI request limit. Your idea has NOT been lost. Please try again after the quota resets or use another API key.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
  AI_UNAVAILABLE:
    "Google's AI service is temporarily unavailable. This is usually brief — please try again in a few minutes.",
  NETWORK_ERROR: 'Check your internet connection and try again.',
  SERVER_ERROR: 'Our servers encountered an unexpected error while processing your request.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export function AnalysisErrorScreen({
  code,
  message,
  onRetry,
  onEditIdea,
  retryDisabled = false,
}: AnalysisErrorScreenProps) {
  const config = CONFIG[code as Exclude<ApiErrorCode, 'VALIDATION_FAILED'>] ?? CONFIG.UNKNOWN_ERROR;
  const body = message || DEFAULT_BODY[code] || DEFAULT_BODY.UNKNOWN_ERROR;

  return (
    <div className="act-input-shell">
      <header className="act-input-header">
        <button onClick={onEditIdea} className="act-input-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Edit Idea
        </button>
      </header>

      <main className="act-input-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`max-w-lg w-full p-8 rounded-xl border ${config.accent} bg-slate-900/80 backdrop-blur-md`}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              {config.icon}
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">{config.title}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {config.showEdit && (
              <button
                onClick={onEditIdea}
                className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm"
                type="button"
              >
                <ArrowLeft size={16} />
                {code === 'QUOTA_EXCEEDED' ? 'Edit Idea' : 'Edit Idea'}
              </button>
            )}
            {code === 'QUOTA_EXCEEDED' && (
              <button
                onClick={onEditIdea}
                className="px-5 py-2.5 rounded-lg bg-cyan-400/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-400/20 transition text-sm"
                type="button"
              >
                Try Again Later
              </button>
            )}
            {config.showRetry && onRetry && (
              <button
                onClick={onRetry}
                disabled={retryDisabled}
                className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
                  retryDisabled
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-400 text-slate-950 hover:opacity-90'
                }`}
                type="button"
              >
                <RotateCcw size={16} /> Retry
              </button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
