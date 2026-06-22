import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useJourneyStore } from '../stores/useJourneyStore';

const QUESTIONS = [
  {
    id: 'idea',
    step: 1,
    label: 'What is your idea?',
    sublabel: 'One clear sentence. The simpler, the better.',
    placeholder: 'e.g. A marketplace for local artisanal coffee roasters',
    type: 'text',
  },
  {
    id: 'audience',
    step: 2,
    label: 'Who are you building this for?',
    sublabel: 'Describe the person who has this problem right now.',
    placeholder: 'e.g. Coffee lovers in cities who want to support local roasters',
    type: 'text',
  },
];

const STAGES = [
  { value: 'Just an idea', label: 'Just an idea', sub: 'I haven\'t built anything yet' },
  { value: 'Building a prototype', label: 'Prototype', sub: 'Something exists I can show people' },
  { value: 'Launched', label: 'Launched', sub: 'Real users, real feedback' },
];

export function IdeaInputFlow() {
  const navigate = useNavigate();
  const { inputs, setInputs } = useJourneyStore();

  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState(inputs.idea);
  const [audience, setAudience] = useState(inputs.audience);
  const [stage, setStage] = useState(inputs.stage || 'Just an idea');

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const handleSubmit = () => {
    setInputs({ idea, audience, stage });
    navigate('/analysis');
  };

  const canAdvance = () => {
    if (step === 1) return idea.trim().length > 0;
    if (step === 2) return audience.trim().length > 0;
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAdvance()) handleNext();
  };

  return (
    <div className="act-input-shell">

      {/* Top bar */}
      <header className="act-input-header">
        <button onClick={handleBack} className="act-input-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          {step === 1 ? 'Home' : 'Back'}
        </button>
        <div className="act-input-progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`act-input-progress__dot ${i < step ? 'act-input-progress__dot--done' : i === step - 1 ? 'act-input-progress__dot--active' : ''}`}
            />
          ))}
        </div>
      </header>

      {/* Question area */}
      <main className="act-input-main">

        {/* Step 1: Idea */}
        {step === 1 && (
          <div className="act-question" key="q1">
            <span className="act-question__step">01 / 03</span>
            <h1 className="act-question__heading">{QUESTIONS[0].label}</h1>
            <p className="act-question__sub">{QUESTIONS[0].sublabel}</p>
            <input
              id="idea-input"
              autoFocus
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={QUESTIONS[0].placeholder}
              className="act-question__input"
            />
          </div>
        )}

        {/* Step 2: Audience */}
        {step === 2 && (
          <div className="act-question" key="q2">
            <span className="act-question__step">02 / 03</span>
            <h1 className="act-question__heading">{QUESTIONS[1].label}</h1>
            <p className="act-question__sub">{QUESTIONS[1].sublabel}</p>
            <input
              id="audience-input"
              autoFocus
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={QUESTIONS[1].placeholder}
              className="act-question__input"
            />
          </div>
        )}

        {/* Step 3: Stage */}
        {step === 3 && (
          <div className="act-question" key="q3">
            <span className="act-question__step">03 / 03</span>
            <h1 className="act-question__heading">Where are you right now?</h1>
            <p className="act-question__sub">Be honest. There's no wrong answer.</p>
            <div className="act-stage-grid">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStage(s.value)}
                  className={`act-stage-card ${stage === s.value ? 'act-stage-card--active' : ''}`}
                >
                  <span className="act-stage-card__label">{s.label}</span>
                  <span className="act-stage-card__sub">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="act-input-actions">
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="act-input-next"
          >
            {step < totalSteps ? (
              <>Continue <ArrowRight size={16} strokeWidth={1.5} /></>
            ) : (
              <>Analyze my idea <ArrowRight size={16} strokeWidth={1.5} /></>
            )}
          </button>
          {step < totalSteps && (
            <span className="act-input-hint">or press <kbd>Enter ↵</kbd></span>
          )}
        </div>
      </main>
    </div>
  );
}
