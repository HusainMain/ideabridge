import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Globe2,
  MapPin,
  ExternalLink,
  Sparkles,
  Wifi,
  Users,
  DollarSign,
  Percent,
} from 'lucide-react';
import type { IncubatorRecommendation } from '../../stores/useJourneyStore';

interface IncubatorRecommendationsProps {
  recommendations: IncubatorRecommendation[];
}

export function IncubatorRecommendations({
  recommendations,
}: IncubatorRecommendationsProps): React.ReactElement | null {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-cyan-400" />
        <h2 className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">
          Recommended Incubators
        </h2>
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((incubator, idx) => (
          <motion.article
            key={incubator.id}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className="relative overflow-hidden rounded-xl border border-white/10 flex flex-col backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(7,13,27,0.92) 0%, rgba(12,24,48,0.78) 100%)',
              boxShadow: '0 0 24px rgba(0, 240, 255, 0.04)',
            }}
          >
            <div className="h-px w-full bg-gradient-to-r from-cyan-500/40 via-purple-500/20 to-transparent" />

            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center text-cyan-200 font-bold text-sm shrink-0">
                    {incubator.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{incubator.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{incubator.country}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-cyan-400">{incubator.matchPercent}%</div>
                  <div className="text-[0.62rem] uppercase tracking-widest text-slate-500">Match</div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{incubator.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 uppercase tracking-widest mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Funding
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{incubator.funding}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 uppercase tracking-widest mb-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-400" />
                    Equity
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {incubator.equity ?? 'No equity required'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {incubator.industries.slice(0, 4).map((industry) => (
                  <span
                    key={industry}
                    className="px-2 py-0.5 rounded-full text-[0.68rem] border border-cyan-500/20 bg-cyan-500/5 text-cyan-200/90"
                  >
                    {industry}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {incubator.startupStages.join(', ')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" />
                  {incubator.acceptsInternational ? 'International founders' : 'Local focus'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  {incubator.remote ? 'Remote / hybrid' : 'In-person'}
                </span>
              </div>

              <div className="rounded-lg border border-purple-500/15 bg-purple-500/[0.04] p-3">
                <div className="flex items-center gap-1.5 text-[0.65rem] text-purple-300 uppercase tracking-widest mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why this matches your startup
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{incubator.matchReason}</p>
              </div>

              <a
                href={incubator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 mt-auto px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-colors"
              >
                Visit official website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
