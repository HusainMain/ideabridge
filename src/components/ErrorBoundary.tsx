import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time crashes anywhere below it so a runtime error shows a
 * recoverable panel instead of a blank white page. State is untouched — the
 * journey lives in localStorage and survives a reload.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Intentionally kept: a crash that leaves no trace is worse than a console line.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="glass-panel max-w-md w-full rounded-xl border border-white/10 p-8 text-center">
          <div className="text-3xl mb-3" aria-hidden="true">⚠️</div>
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-400 mb-6">
            An unexpected error interrupted this page. Your saved journey is still on this device.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Reload page
            </button>
            <a
              href="/"
              className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/30"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
