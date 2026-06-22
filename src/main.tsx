import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';

console.log('main.tsx executing');

const root = document.getElementById('root');
if (!root) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(root).render(<App />);
