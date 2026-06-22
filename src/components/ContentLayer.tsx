import { HERO_MOMENTS, getActiveMoment, getMomentPresence } from '../utils/heroTimeline';
import { useScrollStore } from '../stores/useScrollStore';

export function ContentLayer() {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const activeMoment = getActiveMoment(scrollProgress);

  return (
    <div className="content-layer">
      <div className="hero-topbar">
        <span className="brand-mark">Actualize</span>
        <span className="hero-mode">Founder pathfinder</span>
      </div>

      <div className="hero-moment-stage">
        {HERO_MOMENTS.map((moment) => {
          const presence = getMomentPresence(scrollProgress, moment);
          const isActive = activeMoment?.id === moment.id;

          return (
            <article
              key={moment.id}
              className={`hero-copy hero-copy-${moment.align} accent-${moment.accent}`}
              aria-hidden={!isActive}
              style={{
                opacity: presence.opacity,
                transform: `translate3d(${moment.align === 'center' ? '-50%' : '0'}, ${presence.y}px, 0) scale(${presence.scale})`,
                filter: `blur(${presence.blur}px)`,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <p className="eyebrow">{moment.label}</p>
              <p className="moment-kicker">{moment.kicker}</p>
              <h1>{moment.heading}</h1>
              <p className="hero-subheading">{moment.subheading}</p>
              {moment.cta && <span className="hero-cta">{moment.cta}</span>}
            </article>
          );
        })}
      </div>

      <div className="hero-progress" aria-label="Hero scroll progress">
        <div className="progress-track">
          <span style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
