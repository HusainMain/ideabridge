import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AppFooter } from '../components/footer/AppFooter';

const BUDGET_OPTIONS = [
  { value: 'Bootstrap / Low (<$5k)', label: 'Bootstrap / Low', sub: 'Budget is under $5k' },
  { value: 'Seed / Medium ($5k - $50k)', label: 'Seed / Medium', sub: 'Budget between $5k and $50k' },
  { value: 'Venture / High (>$50k)', label: 'Venture / High', sub: 'Budget is over $50k' },
];

const TEAM_SIZE_OPTIONS = [
  { value: 'Solo Founder', label: 'Solo Founder', sub: '1 person working on it' },
  { value: 'Small Team (2-5 people)', label: 'Small Team', sub: '2-5 builders/operators' },
  { value: 'Growing Startup (6+ people)', label: 'Growing Startup', sub: '6+ active members' },
];

export function IdeaInputFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { inputs, setInputs, resetJourney } = useJourneyStore();

  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState(inputs.idea || '');
  const [industry, setIndustry] = useState(inputs.industry || '');
  const [problem, setProblem] = useState(inputs.problem || '');
  const [audience, setAudience] = useState(inputs.audience || '');
  const [country, setCountry] = useState(inputs.country || '');
  const [budget, setBudget] = useState(inputs.budget || '');
  const [teamSize, setTeamSize] = useState(inputs.teamSize || '');
  // Auto-save is useful, but restored answers from an older idea are only safe
  // if the user can see where they came from and clear them in one action.
  // A chip-started example is delivered via navigation state, not restored
  // from storage, so it must not show the "restored" banner.
  const [showRestored, setShowRestored] = useState(() =>
    !(location.state as { fromExample?: boolean } | null)?.fromExample &&
    Boolean(
      inputs.idea ||
        inputs.industry ||
        inputs.problem ||
        inputs.audience ||
        inputs.country ||
        inputs.budget ||
        inputs.teamSize
    )
  );

  const totalSteps = 7;

  // Autosave: keep the latest values in a ref so both the debounce timer and
  // the unmount flush can write without re-creating closures on every keystroke.
  const fieldsRef = useRef({ idea, industry, problem, audience, country, budget, teamSize });
  fieldsRef.current = { idea, industry, problem, audience, country, budget, teamSize };

  // Debounced autosave (500 ms of quiet). Submitting still writes immediately;
  // this only covers drafts abandoned mid-step (refresh, close, back).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInputs(fieldsRef.current);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [idea, industry, problem, audience, country, budget, teamSize, setInputs]);

  // Flush the final keystrokes if the wizard unmounts before the debounce fires.
  useEffect(() => {
    return () => {
      setInputs(fieldsRef.current);
    };
  }, [setInputs]);

  // The chip flag is one-shot: drop it from history after the first mount so a
  // later refresh of this page treats the answers as restored (which they are
  // by then) and shows the banner with its "Start fresh" escape.
  useEffect(() => {
    if ((location.state as { fromExample?: boolean } | null)?.fromExample) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartOver = () => {
    resetJourney();
    setIdea('');
    setIndustry('');
    setProblem('');
    setAudience('');
    setCountry('');
    setBudget('');
    setTeamSize('');
    setShowRestored(false);
    setStep(1);
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const handleSubmit = () => {
    setInputs({ idea, industry, problem, audience, country, budget, teamSize });
    navigate('/stage');
  };

  const canAdvance = () => {
    const trimmedIdea = idea.trim();
    if (step === 1) return trimmedIdea.length >= 10 && trimmedIdea.length <= 500;
    if (step === 2) return industry.trim().length > 0 && industry.trim().length <= 100;
    if (step === 3) return problem.trim().length > 0 && problem.trim().length <= 300;
    if (step === 4) return audience.trim().length > 0 && audience.trim().length <= 200;
    if (step === 5) return country.trim().length > 0 && country.trim().length <= 100;
    if (step === 6) return budget.trim().length > 0 && budget.trim().length <= 100;
    if (step === 7) return teamSize.trim().length > 0 && teamSize.trim().length <= 100;
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const el = e.target as HTMLElement;
    const isTextarea = el.tagName === 'TEXTAREA';

    if (e.key !== 'Enter') return;

    // In the multi-line idea field Enter must insert a newline, so advancing
    // is moved to Cmd/Ctrl+Enter. Single-line inputs keep plain Enter.
    if (isTextarea && !(e.metaKey || e.ctrlKey)) return;

    if (!canAdvance()) return;
    e.preventDefault();
    handleNext();
  };

  return (
    <div className="act-input-shell">

      {/* Top bar */}
      <header className="act-input-header">
        <button onClick={handleBack} className="act-input-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          {step === 1 ? 'Home' : 'Back'}
        </button>
        <div
          className="act-input-progress"
          role="progressbar"
          aria-label={`Step ${step} of ${totalSteps}`}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={step}
        >
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

        {step === 1 && showRestored && (
          <div className="act-input-restored">
            <span>We restored your last answers. Working on a new idea? Start fresh.</span>
            <button type="button" onClick={handleStartOver} className="act-input-restored__action">
              Start fresh
            </button>
          </div>
        )}

        {/* Step 1: Idea */}
        {step === 1 && (
          <div className="act-question" key="q1">
            <span className="act-question__step">01 / 07</span>
            <h1 className="act-question__heading">What is your startup idea?</h1>
            <p className="act-question__sub">Describe the startup you want to build. (Between 10 and 500 characters)</p>
            {/* A textarea, not an input: this field accepts 500 characters and
                a single-line control hid everything past the viewport width,
                leaving the user unable to check what they had typed. */}
            <label htmlFor="idea-input" className="sr-only">Startup idea</label>
            <textarea
              id="idea-input"
              autoFocus
              rows={4}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. A marketplace for local artisanal coffee roasters"
              maxLength={500}
              className="act-question__input act-question__textarea"
            />
            <span className="act-input-hint" style={{ marginTop: '1rem' }}>
              {idea.length} / 500 characters
              {idea.trim().length > 0 && idea.trim().length < 10 && ` — ${10 - idea.trim().length} more needed`}
            </span>
          </div>
        )}

        {/* Step 2: Industry */}
        {step === 2 && (
          <div className="act-question" key="q2">
            <span className="act-question__step">02 / 07</span>
            <h1 className="act-question__heading">What is the industry?</h1>
            <p className="act-question__sub">E.g. EdTech, FinTech, E-commerce, CleanTech, Food & Beverage (Max 100 characters)</p>
            <label htmlFor="industry-input" className="sr-only">Industry</label>
            <input
              id="industry-input"
              autoFocus
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Food & Beverage"
              maxLength={100}
              className="act-question__input"
            />
            <span className="act-input-hint" style={{ marginTop: '1rem' }}>
              {industry.length} / 100 characters
            </span>
          </div>
        )}

        {/* Step 3: Problem */}
        {step === 3 && (
          <div className="act-question" key="q3">
            <span className="act-question__step">03 / 07</span>
            <h1 className="act-question__heading">What problem are you solving?</h1>
            <p className="act-question__sub">Describe the customer pain point in detail. (Max 300 characters)</p>
            <label htmlFor="problem-input" className="sr-only">Problem being solved</label>
            <input
              id="problem-input"
              autoFocus
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Local roasters struggle to reach urban customers, and coffee lovers can't find fresh local beans."
              maxLength={300}
              className="act-question__input"
            />
            <span className="act-input-hint" style={{ marginTop: '1rem' }}>
              {problem.length} / 300 characters
            </span>
          </div>
        )}

        {/* Step 4: Audience */}
        {step === 4 && (
          <div className="act-question" key="q4">
            <span className="act-question__step">04 / 07</span>
            <h1 className="act-question__heading">Who is your target audience?</h1>
            <p className="act-question__sub">Describe the specific group of people experiencing this problem. (Max 200 characters)</p>
            <label htmlFor="audience-input" className="sr-only">Target audience</label>
            <input
              id="audience-input"
              autoFocus
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Urban coffee enthusiasts who care about supporting local businesses"
              maxLength={200}
              className="act-question__input"
            />
            <span className="act-input-hint" style={{ marginTop: '1rem' }}>
              {audience.length} / 200 characters
            </span>
          </div>
        )}

        {/* Step 5: Country */}
        {step === 5 && (
          <div className="act-question" key="q5">
            <span className="act-question__step">05 / 07</span>
            <h1 className="act-question__heading">Which country are you launching in?</h1>
            <p className="act-question__sub">Where is your primary target market located? (Max 100 characters)</p>
            <label htmlFor="country-input" className="sr-only">Launch country</label>
            <input
              id="country-input"
              autoFocus
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. United States"
              maxLength={100}
              className="act-question__input"
            />
            <span className="act-input-hint" style={{ marginTop: '1rem' }}>
              {country.length} / 100 characters
            </span>
          </div>
        )}

        {/* Step 6: Budget */}
        {step === 6 && (
          <div className="act-question" key="q6">
            <span className="act-question__step">06 / 07</span>
            <h1 className="act-question__heading">What is your budget level?</h1>
            <p className="act-question__sub">Estimate the startup capital you have access to right now.</p>
            <div className="act-stage-grid" role="group" aria-label="Budget level">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudget(opt.value)}
                  aria-pressed={budget === opt.value}
                  aria-label={`${opt.label}. ${opt.sub}`}
                  className={`act-stage-card ${budget === opt.value ? 'act-stage-card--active' : ''}`}
                >
                  <span className="act-stage-card__label">{opt.label}</span>
                  <span className="act-stage-card__sub">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Team Size */}
        {step === 7 && (
          <div className="act-question" key="q7">
            <span className="act-question__step">07 / 07</span>
            <h1 className="act-question__heading">What is your team size?</h1>
            <p className="act-question__sub">How many core team members are building this startup?</p>
            <div className="act-stage-grid" role="group" aria-label="Team size">
              {TEAM_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTeamSize(opt.value)}
                  aria-pressed={teamSize === opt.value}
                  aria-label={`${opt.label}. ${opt.sub}`}
                  className={`act-stage-card ${teamSize === opt.value ? 'act-stage-card--active' : ''}`}
                >
                  <span className="act-stage-card__label">{opt.label}</span>
                  <span className="act-stage-card__sub">{opt.sub}</span>
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
              <>Analyze my startup <ArrowRight size={16} strokeWidth={1.5} /></>
            )}
          </button>
          {step < totalSteps && (
            /* Step 1 is a multi-line field where Enter inserts a newline. */
            <span className="act-input-hint">
              or press <kbd>{step === 1 ? 'Ctrl/⌘ + Enter ↵' : 'Enter ↵'}</kbd>
            </span>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

