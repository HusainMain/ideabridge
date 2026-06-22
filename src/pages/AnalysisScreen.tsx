import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../stores/useJourneyStore';

const ANALYSIS_STEPS = [
  "Parsing your idea...",
  "Evaluating market readiness...",
  "Matching with industry mentors...",
  "Scanning for eligible funding...",
  "Identifying ideal incubators...",
  "Finalizing your workspace..."
];

export function AnalysisScreen() {
  const navigate = useNavigate();
  const { setResults, inputs } = useJourneyStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Guard: redirect if no inputs are present
  useEffect(() => {
    if (!inputs.idea) {
      navigate('/input');
    }
  }, [inputs.idea, navigate]);

  useEffect(() => {
    // Simulate API calls and progression
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // After all steps, generate mock data and transition
    const totalTime = (ANALYSIS_STEPS.length * 1500) + 1000;
    const timeout = setTimeout(() => {
      setResults({
        readinessScore: 78,
        topRecommendation: {
          nextStep: "Validate with target audience",
          actions: ["Build a simple landing page", "Run targeted ads for 3 days", "Collect 50 email signups"]
        },
        dosAndDonts: {
          dos: ["Focus on finding a technical co-founder", "Keep your initial feature set minimal"],
          donts: ["Don't spend money on marketing yet", "Don't build mobile apps natively right away"]
        },
        mentors: [
          { id: '1', name: "Sarah Jenkins", role: "Product Manager at TechFlow", whyMatched: "Experience in your exact industry sector." },
          { id: '2', name: "David Chen", role: "2x Exit Founder", whyMatched: "Previously built and sold a similar marketplace." }
        ],
        funding: [
          { id: '1', name: "Micro-Grant Initiative", type: "Grant", eligibility: "Pre-seed, solo founders", fitScore: 92, deadline: "Oct 15" },
          { id: '2', name: "Seed Angel Syndicate", type: "Equity", eligibility: "Working prototype", fitScore: 75, deadline: "Rolling" }
        ],
        incubators: [
          { id: '1', name: "LaunchPad Tech", stage: "Idea Stage", location: "Remote", benefits: ["$10k stipend", "AWS credits", "Weekly mentorship"] },
          { id: '2', name: "Urban Innovators", stage: "Prototype", location: "New York", benefits: ["Co-working space", "Legal assistance"] }
        ]
      });
      navigate('/results');
    }, totalTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, setResults]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-[#00f0ff] rounded-full border-t-transparent animate-spin"
          style={{ animationDuration: '2s' }}
        ></div>
        {/* Pulsing inner core */}
        <div className="absolute inset-4 bg-[#00f0ff] rounded-full blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="h-16 flex items-center justify-center overflow-hidden">
        <p key={currentStep} className="text-2xl font-light text-center animate-pulse">
          {ANALYSIS_STEPS[currentStep]}
        </p>
      </div>
      
      <div className="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
        <div 
          className="h-full bg-[#00f0ff] transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
