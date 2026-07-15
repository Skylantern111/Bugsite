import { useEffect, useState } from 'react';
import { BarChart3, Loader2, Package, Boxes, DollarSign, Star, AlertTriangle, MessagesSquare } from 'lucide-react';
import { fetchStats } from '../lib/api';
import BackendRequired from '../components/ui/BackendRequired';

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// Store Stats — rendered entirely from live Firestore data (/api/stats).
// There is no client-side computation and no static fallback: without the
// database this page has nothing to show. Read-only; touches no bug logic.
export default function AdminInventory() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            setStats(await fetchStats());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    const t = stats?.totals || {};
    const maxCatValue = Math.max(1, ...(stats?.byCategory || []).map((c) => c.value));

    const cards = [
        { label: 'Products', value: t.totalProducts ?? '—', icon: Package, tone: 'text-violet-600 bg-violet-50' },
        { label: 'Units in stock', value: (t.totalStock ?? 0).toLocaleString(), icon: Boxes, tone: 'text-sky-600 bg-sky-50' },
        { label: 'Inventory value', value: money(t.inventoryValue), icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50' },
        { label: 'Avg. rating', value: t.avgRating ? t.avgRating.toFixed(2) : '—', icon: Star, tone: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header>
                <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <BarChart3 className="w-3.5 h-3.5" /> Admin · Live aggregation from Firebase
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900">Store Stats</h1>
                <p className="text-sm text-slate-500">Computed server-side from live Firestore data.</p>
            </header>

            {loading ? (
                <div className="bs-card rounded-2xl p-10 flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Crunching the numbers…
                </div>
            ) : error ? (
                <BackendRequired error={error} onRetry={load} />
            ) : (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {cards.map((c) => (
                            <div key={c.label} className="bs-card rounded-2xl p-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.tone}`}>
                                    <c.icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
                                <p className="text-xs text-slate-500">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Inventory value by category */}
                        <section className="bs-card rounded-2xl p-5">
                            <h2 className="font-bold text-slate-800 mb-4">Inventory value by category</h2>
                            <div className="space-y-3">
                                {(stats.byCategory || []).map((c) => (
                                    <div key={c.category}>
                                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                            <span>{c.category} <span className="text-slate-400">· {c.count} SKUs · {c.stock} units</span></span>
                                            <span className="font-bold">{money(c.value)}</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full bs-gradient-bg rounded-full" style={{ width: `${(c.value / maxCatValue) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Low stock */}
                        <section className="bs-card rounded-2xl p-5">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low stock (&lt; 20 units)
                            </h2>
                            {(stats.lowStock || []).length === 0 ? (
                                <p className="text-sm text-slate-400">Everything is well stocked.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {stats.lowStock.map((p) => (
                                        <li key={p.slug} className="flex items-center justify-between py-2.5">
                                            <span className="flex items-center gap-2 text-sm text-slate-700">
                                                <span className="text-lg">{p.emoji}</span> {p.name}
                                                <span className="text-[11px] text-slate-400">{p.category}</span>
                                            </span>
                                            <span className={`text-sm font-bold ${p.stock < 10 ? 'text-rose-500' : 'text-amber-500'}`}>{p.stock} left</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    <div className="bs-card rounded-2xl p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                            <MessagesSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-slate-900">{stats.reviewCount ?? 0}</p>
                            <p className="text-xs text-slate-500">reviews stored in the database</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
