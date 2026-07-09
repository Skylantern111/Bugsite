import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Search, ArrowRight, Bug as BugIcon } from 'lucide-react';
import { BUG_CATALOG, BUG_GROUPS, GROUP_TONE } from '../data/bugs';

// Testing dashboard: a single index of every intentional bug, its location,
// and how to trigger it. Makes BugSite a complete environment for bug/error
// testing and AI-agent evaluation. This page itself is bug-free.
export default function BugIndex() {
    const [query, setQuery] = useState('');
    const [group, setGroup] = useState('All');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return BUG_CATALOG.filter((b) => {
            const matchesGroup = group === 'All' || b.group === group;
            const matchesQuery = !q ||
                b.title.toLowerCase().includes(q) ||
                b.where.toLowerCase().includes(q) ||
                b.trigger.toLowerCase().includes(q) ||
                String(b.id) === q;
            return matchesGroup && matchesQuery;
        });
    }, [query, group]);

    const countByGroup = (g) => BUG_CATALOG.filter((b) => b.group === g).length;

    return (
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-8">
            {/* Hero */}
            <header className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bs-gradient-bg opacity-20" />
                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                        <FlaskConical className="w-3.5 h-3.5" /> Testing Lab
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Bug Index</h1>
                    <p className="text-slate-300 max-w-xl">
                        Every one of BugSite's <strong className="text-white">{BUG_CATALOG.length} intentional bugs</strong>, where it lives,
                        and exactly how to trigger it. Built for security training and AI-agent evaluation.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-2xl font-extrabold">{BUG_CATALOG.length}</p>
                            <p className="text-xs text-slate-300">total bugs</p>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-2xl font-extrabold">{BUG_GROUPS.length}</p>
                            <p className="text-xs text-slate-300">categories</p>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-2xl font-extrabold">10</p>
                            <p className="text-xs text-slate-300">pages covered</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search bugs by name, feature, or trigger…"
                        className="w-full pl-9 pr-3 py-3 bs-card rounded-xl text-sm focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {['All', ...BUG_GROUPS].map((g) => (
                    <button
                        key={g}
                        onClick={() => setGroup(g)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${group === g ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        {g} {g !== 'All' && <span className="opacity-60">· {countByGroup(g)}</span>}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div className="bs-card rounded-2xl p-10 text-center text-slate-400 text-sm">No bugs match your search.</div>
                )}
                {filtered.map((b) => (
                    <div key={b.id} className="bs-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 sm:w-64 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                                {b.id}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 leading-tight">{b.title}</p>
                                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${GROUP_TONE[b.group]}`}>
                                    {b.group}
                                </span>
                            </div>
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-xs font-semibold text-slate-500">{b.where}</p>
                            <p className="text-sm text-slate-600">{b.trigger}</p>
                        </div>
                        <Link
                            to={b.route}
                            className="shrink-0 inline-flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            <BugIcon className="w-3.5 h-3.5" /> Go trigger <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ))}
            </div>

            <p className="text-xs text-slate-400 text-center">
                Reference: <code className="bg-slate-100 px-1.5 py-0.5 rounded">BUGSITE_ARCHITECTURE_PLAN.md</code> · Bugs are intentional — do not "fix" them.
            </p>
        </div>
    );
}
