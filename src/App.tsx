import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { IdeaInputFlow } from './pages/IdeaInputFlow';
import { StartupStageSelection } from './pages/StartupStageSelection';
import { AnalysisScreen } from './pages/AnalysisScreen';
import ResultsWorkspace from './pages/ResultsWorkspace';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        {/* "user" = framer-motion drops transform/layout animations and keeps
            opacity/color when the OS asks for reduced motion. */}
        <MotionConfig reducedMotion="user">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/input" element={<IdeaInputFlow />} />
            <Route path="/stage" element={<StartupStageSelection />} />
            <Route path="/analysis" element={<AnalysisScreen />} />
            <Route path="/results" element={<ResultsWorkspace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MotionConfig>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
