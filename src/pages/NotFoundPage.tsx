import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="glass-panel max-w-md w-full rounded-xl border border-white/10 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300/80 mb-3">Error 404</p>
        <h1 className="text-xl font-semibold mb-2">This page does not exist</h1>
        <p className="text-sm text-slate-400 mb-6">
          The link may be out of date, or the address may have a typo.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
