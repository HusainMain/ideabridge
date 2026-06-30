import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import type { Mentor } from '../../data/mentors';

interface MentorRecommendationsProps {
  mentors: Mentor[];
}

export function MentorRecommendations({
  mentors,
}: MentorRecommendationsProps): React.ReactElement | null {
  if (!mentors || mentors.length === 0) return null;

  const featuredMentors = mentors.filter((m) => m.featured);
  const otherMentors = mentors.filter((m) => !m.featured);

  const categories = [
    'Product Strategy',
    'Technology & AI',
    'Growth & Marketing',
    'Funding & Business Development',
    'Entrepreneurship & Operations',
    'Industry Experts',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full space-y-8"
    >
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>🤝</span> Recommended Mentors
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Based on your startup domain, business stage, and current challenges, IdeaBridge AI recommends connecting with the following mentors.
        </p>
      </div>

      {/* Featured Mentors / AI Best Matches */}
      {featuredMentors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              ⭐ AI Best Matches
            </h3>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor, idx) => (
              <motion.article
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="relative overflow-hidden rounded-xl border border-amber-500/20 flex flex-col backdrop-blur-sm transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(12,20,38,0.95) 0%, rgba(20,15,35,0.85) 100%)',
                  boxShadow: '0 0 32px rgba(245, 158, 11, 0.06)',
                }}
              >
                <div className="h-px w-full bg-gradient-to-r from-amber-500/50 via-purple-500/30 to-transparent" />

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-500/30 border border-amber-500/25 flex items-center justify-center text-amber-200 font-bold text-base shrink-0">
                        {mentor.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white truncate">{mentor.name}</h4>
                        <div className="text-xs text-amber-400/90 mt-0.5 font-medium">{mentor.expertise}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[0.88rem] text-slate-200 leading-relaxed font-normal">{mentor.recommendation}</p>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-[0.65rem] text-slate-500 uppercase tracking-wider">
                      {mentor.category}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.58rem] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase tracking-widest">
                      ⭐ AI Best Match
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Other Recommended Mentors */}
      <div className="space-y-6 pt-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">
          Other Recommended Mentors
        </h3>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryMentors = otherMentors.filter((m) => m.category === category);
            if (categoryMentors.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h4 className="text-xs font-semibold text-cyan-400/90 uppercase tracking-widest font-mono">
                  {category}
                </h4>

                <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryMentors.map((mentor, idx) => (
                    <motion.article
                      key={mentor.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="relative overflow-hidden rounded-xl border border-white/10 flex flex-col backdrop-blur-sm transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(7,13,27,0.92) 0%, rgba(12,24,48,0.78) 100%)',
                        boxShadow: '0 0 24px rgba(0, 240, 255, 0.04)',
                      }}
                    >
                      <div className="h-px w-full bg-gradient-to-r from-cyan-500/40 via-purple-500/20 to-transparent" />

                      <div className="p-5 flex flex-col gap-4 flex-1">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center text-cyan-200 font-bold text-sm shrink-0">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-base font-semibold text-white truncate">{mentor.name}</h5>
                            <div className="text-xs text-slate-400 mt-0.5">{mentor.expertise}</div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed">{mentor.recommendation}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Muted Disclaimer */}
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-[0.7rem] text-slate-500 leading-relaxed max-w-3xl mx-auto">
          Mentor recommendations are generated by IdeaBridge AI based on your startup profile, business stage, and domain. These suggestions are intended to help founders discover relevant experts and networking opportunities.
        </p>
      </div>
    </motion.div>
  );
}
