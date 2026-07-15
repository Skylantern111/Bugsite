import { Database, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../lib/api';

// Shown when a DB-dependent page can't reach the API. Unlike the Catalog (which
// falls back to bundled data), these features require Express + Firebase to be
// running, so we surface a clear, actionable message instead of a blank page.
export default function BackendRequired({ error, onRetry }) {
    return (
        <div className="bs-card rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Database className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Database connection required</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-1">
                This feature reads and writes live data, so the backend must be running.
            </p>
            <p className="text-xs text-slate-400 mb-5">
                Start it with <code className="bg-slate-100 px-1.5 py-0.5 rounded">cd server &amp;&amp; npm run dev</code>
                {' '}· expected at <code className="bg-slate-100 px-1.5 py-0.5 rounded">{API_BASE}</code>
                {error ? <><br /><span className="text-rose-400">{String(error)}</span></> : null}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Retry connection
                </button>
            )}
        </div>
    );
}
