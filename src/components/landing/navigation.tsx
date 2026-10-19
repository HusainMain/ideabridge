import { useEffect, useRef, useState } from 'react';
import { NAV_SECTIONS } from './constants';

export function StickyNav({ navigate }: { navigate: (path: string) => void }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav${hidden ? ' landing-nav--hidden' : ''}`} aria-label="Site navigation">
      <a href="#section-hero" className="landing-nav__logo">
        Idea<span>Bridge</span>
      </a>
      <button className="landing-nav__cta" onClick={() => navigate('/input')}>
        Analyze My Idea
      </button>
    </nav>
  );
}

export function DotNav({ activeId }: { activeId: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dot-nav" role="navigation" aria-label="Page sections">
      {NAV_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          className={`dot-nav__item${activeId === id ? ' dot-nav__item--active' : ''}`}
          onClick={() => scrollTo(id)}
          aria-label={label}
          aria-current={activeId === id ? 'true' : undefined}
        >
          <span className="dot-nav__tooltip">{label}</span>
        </button>
      ))}
    </div>
  );
}
