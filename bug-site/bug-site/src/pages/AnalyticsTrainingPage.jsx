import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Clock3, Download, TrendingUp } from 'lucide-react';

const demoData = [
    { label: 'Mon', revenue: 1200, cost: 700 },
    { label: 'Tue', revenue: 1800, cost: 900 },
    { label: 'Wed', revenue: 1500, cost: 800 },
    { label: 'Thu', revenue: 2200, cost: 1100 },
    { label: 'Fri', revenue: 2600, cost: 1300 },
];

export default function AnalyticsTrainingPage() {
    const [timezone, setTimezone] = useState('UTC');
    const [showFake, setShowFake] = useState(false);
    const [exported, setExported] = useState('');
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    const visibleData = useMemo(() => {
        if (!showFake) return demoData;
        return demoData.map((row) => ({ ...row, revenue: row.revenue + 400, cost: row.cost + 250 }));
    }, [showFake]);

    useEffect(() => {
        const timestamp = new Date().toISOString();
        setExported(timestamp);
    }, [timezone]);

    const summary = visibleData.reduce(
        (acc, row) => ({
            revenue: acc.revenue + row.revenue,
            cost: acc.cost + row.cost,
        }),
        { revenue: 0, cost: 0 }
    );

    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-violet-600">
                    <Activity className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">Training Lab</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">Analytics Training Page</h1>
                <p className="text-sm text-slate-500">This page bundles the same chart and export issues from the Phase 1 plan into a single, navigable route.</p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Revenue Overview</h2>
                            <p className="text-sm text-slate-500">Toggle the data source to see the fake values appear.</p>
                        </div>
                        <button onClick={() => setShowFake((v) => !v)} className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
                            {showFake ? 'Show real data' : 'Show fake data'}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {['revenue', 'cost'].map((metric) => (
                            <button
                                key={metric}
                                onClick={() => setSelectedMetric(metric)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${selectedMetric === metric ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                {metric === 'revenue' ? 'Revenue' : 'Cost'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-end gap-2 h-36 rounded-xl bg-slate-50 p-4">
                        {visibleData.map((row) => (
                            <div key={row.label} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className={`w-full rounded-t-lg ${selectedMetric === 'revenue' ? 'bg-violet-600' : 'bg-emerald-600'}`}
                                    style={{ height: `${Math.max(24, (selectedMetric === 'revenue' ? row.revenue : row.cost) / 30)}px` }}
                                />
                                <span className="text-[11px] font-medium text-slate-500">{row.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-slate-500">Revenue total</p>
                            <p className="font-semibold text-slate-900">${summary.revenue.toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-slate-500">Cost total</p>
                            <p className="font-semibold text-slate-900">${summary.cost.toLocaleString()}</p>
                        </div>
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock3 className="w-4 h-4 text-amber-600" />
                            <h3 className="font-semibold text-slate-800">Timezone selector</h3>
                        </div>
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                            <option value="UTC">UTC</option>
                            <option value="EST">EST</option>
                            <option value="PST">PST</option>
                        </select>
                        <p className="mt-3 text-xs text-slate-500">The current export timestamp stays in UTC: {exported}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Download className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-semibold text-slate-800">Export preview</h3>
                        </div>
                        <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Export CSV</button>
                        <p className="mt-2 text-xs text-slate-500">Long addresses and quoted values can break the export format.</p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold">Known training issues</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                            <li>Chart values can switch to fake data</li>
                            <li>Timezone selector doesn’t affect the timestamp</li>
                            <li>Export formatting can corrupt with commas or quotes</li>
                        </ul>
                    </div>
                </aside>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Legend sync check</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600" /> Revenue</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Cost</span>
                </div>
            </section>
        </div>
    );
}
