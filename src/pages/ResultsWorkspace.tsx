import { useNavigate } from 'react-router-dom';
import { Download, Edit3, Share2 } from 'lucide-react';
import { useJourneyStore } from '../stores/useJourneyStore';

export function ResultsWorkspace() {
  const navigate = useNavigate();
  const { results, inputs } = useJourneyStore();

  if (!results) {
    return (
      <div className="act-results-empty">
        <p>No results found.</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className="act-results-shell">

      {/* Sticky Header */}
      <header className="act-results-header">
        <div className="act-results-header__left">
          <span className="act-label" style={{ marginBottom: 0 }}>Execution Workspace</span>
          <p className="act-results-header__idea">{inputs.idea}</p>
        </div>
        <div className="act-results-header__actions">
          <button onClick={() => navigate('/input')} className="act-results-action-btn">
            <Edit3 size={14} strokeWidth={1.5} /> Edit inputs
          </button>
          <button className="act-results-action-btn">
            <Share2 size={14} strokeWidth={1.5} /> Share
          </button>
          <button onClick={() => window.print()} className="act-results-action-btn act-results-action-btn--accent">
            <Download size={14} strokeWidth={1.5} /> Export PDF
          </button>
        </div>
      </header>

      <main className="act-results-main">

        {/* ── Hero Score ── */}
        <section className="act-score-hero">
          <div className="act-score-hero__inner">
            <div className="act-reason-panel">
              <span className="act-reason-panel__eyebrow">Why this path</span>
              <strong>Recommendation based on your idea, audience, and stage.</strong>
              <p>
                The workspace prioritizes actions that can be done before heavy
                spending: validate demand, shape the prototype, and approach
                stage-fit support.
              </p>
            </div>
            <div className="act-score-hero__copy">
              <span className="act-label">Top Recommendation</span>
              <h1 className="act-score-hero__heading">{results.topRecommendation.nextStep}</h1>
              <ul className="act-actions-list">
                {results.topRecommendation.actions.map((action, i) => (
                  <li key={i} className="act-actions-list__item">
                    <span className="act-actions-list__num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="act-results-divider" />

        {/* ── Dos & Don'ts ── */}
        <section className="act-results-section">
          <div className="act-results-section__header">
            <span className="act-label">Personalized Analysis</span>
            <h2 className="act-results-section__title">What to focus on.<br />What to avoid.</h2>
          </div>
          <div className="act-dnd-grid">
            <div className="act-dnd-col">
              <span className="act-dnd-col__marker act-dnd-col__marker--do">Do</span>
              {results.dosAndDonts.dos.map((item, i) => (
                <div key={i} className="act-dnd-item act-dnd-item--do">{item}</div>
              ))}
            </div>
            <div className="act-dnd-col">
              <span className="act-dnd-col__marker act-dnd-col__marker--dont">Don't</span>
              {results.dosAndDonts.donts.map((item, i) => (
                <div key={i} className="act-dnd-item act-dnd-item--dont">{item}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="act-results-divider" />

        {/* ── Mentors ── */}
        <section className="act-results-section">
          <div className="act-results-section__header">
            <span className="act-label">Mentor Matches</span>
            <h2 className="act-results-section__title">People who've been<br />where you're going.</h2>
          </div>
          <div className="act-mentor-grid">
            {results.mentors.map((mentor) => (
              <div key={mentor.id} className="act-mentor-card">
                <div className="act-mentor-card__avatar">
                  {mentor.name.charAt(0)}
                </div>
                <div className="act-mentor-card__body">
                  <p className="act-mentor-card__name">{mentor.name}</p>
                  <p className="act-mentor-card__role">{mentor.role}</p>
                  <p className="act-mentor-card__reason">{mentor.whyMatched}</p>
                  <button className="act-mentor-card__cta">Reach out →</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="act-results-divider" />

        {/* ── Funding + Incubators side by side ── */}
        <section className="act-results-section act-results-section--split">

          <div className="act-split-col">
            <span className="act-label">Funding Sources</span>
            <h2 className="act-results-section__title">Money aligned<br />to your stage.</h2>
            {results.funding.map((source) => (
              <div key={source.id} className="act-funding-card">
                <div className="act-funding-card__top">
                  <span className="act-funding-card__name">{source.name}</span>
                  <span className="act-funding-card__type">{source.type}</span>
                </div>
                <p className="act-funding-card__eligibility">{source.eligibility}</p>
                <div className="act-funding-card__bottom">
                  <div className="act-funding-card__score-bar-wrap">
                    <div className="act-funding-card__score-bar" style={{ width: `${source.fitScore}%` }} />
                  </div>
                  <span className="act-funding-card__fit">{source.fitScore}% fit</span>
                  <span className="act-funding-card__deadline">Deadline: {source.deadline}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="act-split-col">
            <span className="act-label">Incubators</span>
            <h2 className="act-results-section__title">Environments built<br />to accelerate you.</h2>
            {results.incubators.map((inc) => (
              <div key={inc.id} className="act-incubator-card">
                <div className="act-incubator-card__top">
                  <span className="act-incubator-card__name">{inc.name}</span>
                  <span className="act-incubator-card__meta">{inc.stage} · {inc.location}</span>
                </div>
                <div className="act-incubator-card__tags">
                  {inc.benefits.map((b, i) => (
                    <span key={i} className="act-incubator-card__tag">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <div className="act-results-footer">
          <p>Ready to refine your plan?</p>
          <button onClick={() => navigate('/input')} className="act-cta-btn">
            Edit your inputs →
          </button>
        </div>

      </main>
    </div>
  );
}
