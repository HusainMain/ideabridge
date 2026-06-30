import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import type { Mentor } from '../../data/mentors';
import type { ResultsData } from '../../stores/useJourneyStore';

interface MentorRecommendationsProps {
  mentors: Mentor[];
  results: ResultsData;
}

// ─── Deterministic Scoring Function ──────────────────────────────────
function scoreMentor(results: ResultsData, mentor: Mentor): number {
  let score = 0;
  const scores = results.scores;

  if (mentor.category === 'Product Strategy') {
    // Boost if feasibility is low or overall is low (needs validation/strategy)
    if (scores.overall < 70) score += 35;
    if (scores.feasibility < 70) score += 20;
    score += (100 - scores.overall) * 0.3;
  }

  if (mentor.category === 'Technology & AI') {
    // Boost if innovation is high or feasibility is low (needs tech guidance)
    if (scores.innovation >= 75) score += 40;
    if (scores.feasibility < 65) score += 20;
    score += scores.innovation * 0.35;
  }

  if (mentor.category === 'Growth & Marketing') {
    // Boost if marketPotential is weak/moderate or overall is low
    if (scores.marketPotential < 75) score += 30;
    if (scores.monetization < 70) score += 15;
    score += (100 - scores.marketPotential) * 0.25;
  }

  if (mentor.category === 'Funding & Business Development') {
    // Boost if monetization is weak or overall is excellent (fundraising stage)
    if (scores.monetization < 65) score += 35;
    if (scores.overall >= 80) score += 25;
    score += (100 - scores.monetization) * 0.2;
  }

  if (mentor.category === 'Entrepreneurship & Operations') {
    // Boost if feasibility is low (execution risk) or overall is low
    if (scores.feasibility < 70) score += 30;
    if (scores.overall < 65) score += 15;
    score += (100 - scores.feasibility) * 0.25;
  }

  if (mentor.category === 'Industry Experts') {
    score += 15; // baseline depth score
  }

  // Adjust for startup stage focus: high score = focus on scale, low score = focus on validation
  if (scores.overall >= 80) {
    if (mentor.category === 'Growth & Marketing' || mentor.category === 'Funding & Business Development') {
      score += 20;
    }
  } else {
    if (mentor.category === 'Product Strategy' || mentor.category === 'Entrepreneurship & Operations') {
      score += 20;
    }
  }

  return score;
}

// ─── Dynamic Recommendation Generator ───────────────────────────────
function getAIRecommendationText(results: ResultsData, mentor: Mentor): string {
  const scores = results.scores;

  if (mentor.category === 'Product Strategy') {
    if (scores.overall < 70) {
      return `Recommended to help refine your business model and validate your core product-market fit.`;
    }
    if (scores.feasibility < 70) {
      return `Recommended to scope your MVP roadmap and resolve early execution constraints.`;
    }
    return `Recommended to assist in enterprise feature prioritization and long-term product lifecycle planning.`;
  }

  if (mentor.category === 'Technology & AI') {
    if (scores.innovation >= 75) {
      return `Recommended because your report indicates high innovation potential that requires a robust, scalable AI infrastructure.`;
    }
    if (scores.feasibility < 65) {
      return `Recommended to validate your software architecture and mitigate early tech execution risks.`;
    }
    return `Recommended to advise on machine learning architecture, technical standards, and cloud cost management.`;
  }

  if (mentor.category === 'Growth & Marketing') {
    if (scores.marketPotential < 75) {
      return `Recommended to clarify user segments, refine brand positioning, and improve customer acquisition strategies.`;
    }
    if (scores.monetization < 70) {
      return `Recommended to design high-converting sales pipelines and scale organic inbound lead-generation.`;
    }
    return `Recommended to help build traction, organic search visibility, and digital PR campaigns.`;
  }

  if (mentor.category === 'Funding & Business Development') {
    if (scores.monetization < 65) {
      return `Recommended to structure scalable pricing models and analyze monetization channels for capital efficiency.`;
    }
    if (scores.overall >= 80) {
      return `Recommended to prepare your startup for VC pitch strategy and secure seed-stage angel funding.`;
    }
    return `Recommended to build B2B commercial pipelines and negotiate strategic corporate partnerships.`;
  }

  if (mentor.category === 'Entrepreneurship & Operations') {
    if (scores.feasibility < 70) {
      return `Recommended to optimize execution planning, automate operational workflows, and coordinate legal structures.`;
    }
    return `Recommended to guide recruitment frameworks, intellectual property security, and regulatory compliance.`;
  }

  // Industry Experts
  if (scores.overall < 70) {
    return `Recommended to challenge and validate industry-specific assumptions with seasoned domain knowledge.`;
  }
  return `Recommended to help navigate complex logistics networks, corporate compliance, and hardware manufacturing.`;
}

export function MentorRecommendations({
  mentors,
  results,
}: MentorRecommendationsProps): React.ReactElement | null {
  if (!mentors || mentors.length === 0 || !results) return null;

  // Filter featured vs. non-featured
  const featuredMentors = mentors.filter((m) => m.featured);
  const otherMentors = mentors.filter((m) => !m.featured);

  // Sort featured mentors by score
  const sortedFeatured = [...featuredMentors].sort(
    (a, b) => scoreMentor(results, b) - scoreMentor(results, a)
  );

  const categories = [
    'Product Strategy',
    'Technology & AI',
    'Growth & Marketing',
    'Funding & Business Development',
    'Entrepreneurship & Operations',
    'Industry Experts',
  ];

  // Calculate average category scores based on their non-featured mentors
  const categoryScores = categories.map((category) => {
    const categoryMentors = otherMentors.filter((m) => m.category === category);
    const avgScore =
      categoryMentors.length > 0
        ? categoryMentors.reduce((sum, m) => sum + scoreMentor(results, m), 0) / categoryMentors.length
        : 0;
    return { category, score: avgScore };
  });

  // Sort categories by relevance score descending
  const sortedCategories = [...categoryScores]
    .sort((a, b) => b.score - a.score)
    .map((c) => c.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full space-y-8"
    >
      {/* Title & Dynamic AI Insight Intro Box */}
      <div className="flex flex-col gap-3 p-5 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>🤝</span> Recommended Mentors
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Based on your startup's strengths, weaknesses, business stage, and market analysis, IdeaBridge AI recommends speaking with the following mentors to maximize your chances of success.
        </p>
      </div>

      {/* Featured Mentors / AI Best Matches */}
      {sortedFeatured.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              ⭐ AI Best Matches
            </h3>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6">
            {sortedFeatured.map((mentor, idx) => (
              <motion.article
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{
                  y: -4,
                  scale: 1.03,
                  borderColor: 'rgba(245, 158, 11, 0.45)',
                }}
                className="relative overflow-hidden rounded-xl border-2 border-amber-500/30 flex flex-col backdrop-blur-sm transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(12,20,38,0.95) 0%, rgba(20,15,35,0.85) 100%)',
                  boxShadow: '0 0 32px rgba(245, 158, 11, 0.12), 0 0 8px rgba(245, 158, 11, 0.08)',
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

                  <p className="text-[0.88rem] text-slate-200 leading-relaxed font-normal">
                    {getAIRecommendationText(results, mentor)}
                  </p>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-[0.65rem] text-slate-500 uppercase tracking-wider">
                      {mentor.category}
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.62rem] font-bold border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 uppercase tracking-widest shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>AI Best Match</span>
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
          {sortedCategories.map((category) => {
            const categoryMentors = otherMentors.filter((m) => m.category === category);
            if (categoryMentors.length === 0) return null;

            // Sort mentors inside this category by score
            const sortedCategoryMentors = [...categoryMentors].sort(
              (a, b) => scoreMentor(results, b) - scoreMentor(results, a)
            );

            return (
              <div key={category} className="space-y-3">
                <h4 className="text-xs font-semibold text-cyan-400/90 uppercase tracking-widest font-mono">
                  {category}
                </h4>

                <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedCategoryMentors.map((mentor, idx) => (
                    <motion.article
                      key={mentor.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{
                        y: -2,
                        scale: 1.01,
                        borderColor: 'rgba(0, 240, 255, 0.35)',
                      }}
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

                        <p className="text-sm text-slate-300 leading-relaxed">
                          {getAIRecommendationText(results, mentor)}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improved Muted Disclaimer */}
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-[0.7rem] text-slate-500 leading-relaxed max-w-3xl mx-auto">
          Recommendations are generated by IdeaBridge AI using your startup's domain, business stage, market analysis, innovation score, and execution readiness.
        </p>
      </div>
    </motion.div>
  );
}
