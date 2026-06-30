import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { IdeaInputFlow } from './pages/IdeaInputFlow';
import { StartupStageSelection } from './pages/StartupStageSelection';
import { AnalysisScreen } from './pages/AnalysisScreen';
import ResultsWorkspace from './pages/ResultsWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/input" element={<IdeaInputFlow />} />
        <Route path="/stage" element={<StartupStageSelection />} />
        <Route path="/analysis" element={<AnalysisScreen />} />
        <Route path="/results" element={<ResultsWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}
