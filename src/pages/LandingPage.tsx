import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BridgeSection } from '../components/BridgeSection';
import { OrbController } from '../components/OrbController';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { StartupStats } from '../components/StartupStats';
import { DeveloperCredit } from '../components/footer/DeveloperCredit';
import { NAV_SECTIONS, fundingCards, mentors } from '../components/landing/constants';
import { StickyNav, DotNav } from '../components/landing/navigation';
import { ChatPreview, OrbAnchor } from '../components/landing/HeroPanels';
import {
  HowItWorksSection,
  ReadinessSection,
  EcosystemMap,
  AIAnalysisSection,
} from '../components/landing/sections';
import { LaunchPad } from '../components/landing/LaunchPad';

export function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('section-hero');
  const scanVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55 } }),
  }), []);

  useEffect(() => {
    // Scroll-midpoint strategy: whichever section's visible area is closest
    // to the viewport centre wins — works correctly for pinned sections too.
    const update = () => {
      const mid = window.innerHeight / 2;
      let bestId = NAV_SECTIONS[0].id;
      let bestDist = Infinity;
      for (const { id } of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        // For elements taller than viewport (pinned containers) clamp to visible slice
        const visTop = Math.max(r.top, 0);
        const visBot = Math.min(r.bottom, window.innerHeight);
        if (visBot < visTop) continue;
        const visMid = (visTop + visBot) / 2;
        const dist = Math.abs(visMid - mid);
        if (dist < bestDist) { bestDist = dist; bestId = id; }
      }
      setActiveSection(bestId);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <StickyNav navigate={navigate} />
      <DotNav activeId={activeSection} />
      <main id="main-content" tabIndex={-1} className="actualize-landing">
      <OrbController />

      <section id="section-hero" className="landing-hero">
        <div className="landing-grid-bg" />
        <div className="ambient-particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="landing-hero__inner"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div>
            <motion.span
              className="act-label"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              IdeaBridge
            </motion.span>
            <h1 className="text-gradient-purple-cyan text-glow-header">
              Bridge your <span className="story-accent">Idea</span> into a startup plan.
            </h1>
            <p>
              Enter a startup idea. IdeaBridge analyzes it, finds mentors and funding
              sources, recommends incubators, and gives you a report you can edit,
              save, share, or export.
            </p>
            <motion.button
              onClick={() => navigate('/input')}
              className="act-cta-btn"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.4 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Start analysis <ArrowRight size={18} strokeWidth={1.6} />
            </motion.button>
          </div>

          <motion.div
            className="hero-orb-panel"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <OrbAnchor id="section-hero" stage={1} className="hero-orb-anchor" />
            <ChatPreview />
          </motion.div>
        </motion.div>
      </section>

      <HowItWorksSection />

      <BridgeSection id="bridge-idea-ai" label="Idea to AI Analysis" stage={2} accent="cyan" rhythm="smooth" />

      <AIAnalysisSection scanVariants={scanVariants} />

      <ReadinessSection />

      <section id="section-mentorship" className="mentorship-section">
        <div className="section-shell mentorship-shell">
          <svg className="connector-svg" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
            <path className="connector-line" d="M500 260 C260 120 190 90 90 90 M500 260 C740 120 810 90 910 90 M500 260 C260 400 190 430 90 430 M500 260 C740 400 810 430 910 430" fill="none" stroke="rgba(168,134,255,0.28)" strokeWidth="2" />
          </svg>
          <div className="section-heading">
            <span className="act-label">Mentorship</span>
            <h2 className="text-gradient-blue-purple text-glow-header">
              <span className="story-accent">Mentorship</span> that fits the problem.
            </h2>
            <p>IdeaBridge shows mentor matches and why each one fits your idea.</p>
          </div>
          <OrbAnchor id="section-mentorship" stage={4} className="mentor-orb-anchor" />
          <div className="mentor-grid">
            {mentors.map(([initials, name, role, reason]) => (
              <div key={name} className="glass-panel mentor-card mentor-card--hover">
                <div className="mentor-card__avatar">{initials}</div>
                <h3>{name}</h3>
                <span>{role}</span>
                <div className="mentor-card__reason">
                  <p>{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BridgeSection id="bridge-mentorship-ecosystem" label="Mentors to Results Workspace" stage={5} accent="purple" rhythm="pulse" />

      <EcosystemMap />

      <section id="section-funding" className="funding-section">
        <div className="section-shell">
          <div className="section-heading">
            <span className="act-label">Funding Hub</span>
            <h2 className="text-gradient-cyan-blue text-glow-header">
              <span className="story-accent">Funding</span> and incubators shown with fit.
            </h2>
            <p>Funding sources and incubators appear with eligibility, fit score, deadlines, stage, location, and benefits.</p>
          </div>
          <OrbAnchor id="section-funding" stage={6} className="funding-orb-anchor" />
          <div className="funding-grid">
            {fundingCards.map(([title, metric, body], i) => (
              <motion.div
                key={title}
                className="glass-panel funding-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span>{metric}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BridgeSection id="bridge-funding-roadmap" label="Workspace to Export Report" stage={6} accent="blue" rhythm="calm" />

      <StartupStats />
      <RoadmapTimeline />
      <LaunchPad />

      <footer className="act-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Idea<span style={{ color: 'var(--neon-cyan)' }}>Bridge</span></span>
          <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Bridging Ideas to Successful Startups</small>
        </div>
        <div className="act-footer__links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#section-hero">Back to Top ↑</a>
        </div>
        <DeveloperCredit />
      </footer>
    </main>
    </>
  );
}
