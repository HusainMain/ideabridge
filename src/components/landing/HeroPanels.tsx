import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { startupExamples } from './constants';

export function ChatPreview() {
  const navigate = useNavigate();
  const setInputs = useJourneyStore((s) => s.setInputs);
  const resetJourney = useJourneyStore((s) => s.resetJourney);

  // This used to run a decorative typing loop that looked like a live input
  // but could not be clicked, competing with the two real CTAs. It is now the
  // same ideas as working shortcuts, so the loop is gone.
  return (
    <div className="glass-panel--elevated chat-preview-container" style={{ padding: '1rem' }}>
      <div className="chat-preview-label">Try an example</div>
      <div className="chat-example-chips">
        {startupExamples.map((idea) => (
          <button
            key={idea}
            type="button"
            className="chat-example-chip"
            onClick={() => {
              // An example starts a brand-new journey. Without the reset the
              // example idea merged into a previous draft's industry, budget
              // and stage answers — producing a mix of two different ideas.
              resetJourney();
              setInputs({ idea });
              navigate('/input', { state: { fromExample: true } });
            }}
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrbAnchor({ id, stage, className = '' }: { id: string; stage: number; className?: string }) {
  return (
    <div
      className={`orb-anchor ${className}`}
      data-stage={stage}
      data-section-id={id}
      aria-hidden="true"
    />
  );
}
