import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { IdeaInputFlow } from './pages/IdeaInputFlow';
import { AnalysisScreen } from './pages/AnalysisScreen';
import { ResultsWorkspace } from './pages/ResultsWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/input" element={<IdeaInputFlow />} />
        <Route path="/analysis" element={<AnalysisScreen />} />
        <Route path="/results" element={<ResultsWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}
