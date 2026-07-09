import { useEffect, useState } from 'react';
import { Activity, FileText, Clock, Database, RefreshCw } from 'lucide-react';
import { ORDERS } from '../data/orders';

const CATEGORY_TABS = ['Electronics', 'Peripherals', 'Desk Setup'];

export default function AdminAnalytics() {
    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Admin Analytics Dashboard</h1>
                <p className="text-sm text-slate-500">Internal reporting — visible to admin accounts only.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <RevenueByCategory />
                <RaceConditionRefresh />
                <InfiniteRenderLoop />
                <RevenueGraph />
                <ExportOrders />
                <TimezoneDisplay />
                <ChartLegend />
            </div>
        </div>
    );
}

// === BUG 1: Stale Closure ===
function RevenueByCategory() {
    const [revenueTab, setRevenueTab] = useState('Electronics');
    const [revenue, setRevenue] = useState(84320);
    const [orders, setOrders] = useState(412);

    useEffect(() => {
        const interval = setInterval(() => {
            setRevenue((prev) => prev + Math.floor(Math.random() * 100));
            setOrders((prev) => prev + Math.floor(Math.random() * 5));
        }, 3000);
        return () => clearInterval(interval);
        // MISSING DEPENDENCY: revenueTab — switching category tabs never
        // actually re-fetches per-category figures; the numbers shown are
        // always the same running total regardless of the selected tab.
    }, []);

    return (
        <Panel title="Revenue by Category" icon={Activity}>
            <div className="flex gap-2 mb-4">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setRevenueTab(tab)}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${revenueTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-slate-400 mb-3">Showing: {revenueTab}</p>
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Revenue</p>
                    <p className="font-bold text-slate-800">${revenue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Orders</p>
                    <p className="font-bold text-slate-800">{orders}</p>
                </div>
            </div>
        </Panel>
    );
}

// === BUG 17: Race Condition ===
function RaceConditionRefresh() {
    const [dashboardData, setDashboardData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFetch = () => {
        setIsLoading(true);
        setDashboardData('');
        // Request A: legacy aggregation pipeline (slow — 3000ms)
        setTimeout(() => {
            setDashboardData('Legacy Data loaded');
            setIsLoading(false);
        }, 3000);
        // Request B: fresh cache read (fast — 1000ms). Whichever response
        // lands LAST wins, regardless of which was actually requested more
        // recently — no request-id/AbortController guard exists.
        setTimeout(() => {
            setDashboardData('Fresh Data loaded');
        }, 1000);
    };

    return (
        <Panel title="Refresh Dashboard Data" icon={RefreshCw}>
            <button onClick={handleFetch} className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-100 mb-4 transition-colors">
                {isLoading ? 'Fetching…' : 'Refresh Dashboard Data'}
            </button>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex items-center justify-center h-16">
                <p className="font-mono text-sm text-slate-700">{dashboardData || 'No data loaded'}</p>
            </div>
        </Panel>
    );
}

// === BUG 20: Infinite Render Loop ===
function InfiniteRenderLoop() {
    const [loopCount, setLoopCount] = useState(0);
    const [triggerLoop, setTriggerLoop] = useState(false);
    const configObject = { active: triggerLoop }; // new reference every render

    useEffect(() => {
        if (configObject.active && loopCount < 100) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: Bug 20, runaway loop capped at 100
            setLoopCount((prev) => prev + 1);
        }
    }, [configObject, loopCount]);

    return (
        <Panel title="Live Refresh Engine" icon={RefreshCw}>
            <p className="text-sm text-slate-600 mb-3">Loop count: <strong className="text-slate-800">{loopCount}</strong></p>
            <button
                onClick={() => { setLoopCount(0); setTriggerLoop(true); }}
                disabled={triggerLoop && loopCount < 100}
                className="w-full bg-pink-50 text-pink-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-pink-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
                {loopCount >= 100 ? 'Safety Cap Hit (100)' : triggerLoop ? 'Looping…' : 'Trigger Live Refresh'}
            </button>
        </Panel>
    );
}

// === BUG 25: Graph Manipulation ===
function RevenueGraph() {
    const [graphData, setGraphData] = useState([100, 200, 150, 300, 250]);
    const [showFakeData, setShowFakeData] = useState(false);
    const toggleGraphData = () => {
        setShowFakeData(!showFakeData);
        setGraphData(showFakeData ? [100, 200, 150, 300, 250] : [999, 999, 999, 999, 999]);
    };

    return (
        <Panel title="Revenue Graph" icon={Activity}>
            <div className="h-24 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <div className="flex items-end gap-1 h-16">
                    {graphData.map((val, i) => (
                        <div key={i} className="w-6 bg-blue-500 rounded-t" style={{ height: `${(val / 1000) * 100}%` }}></div>
                    ))}
                </div>
            </div>
            <button onClick={toggleGraphData} className="w-full bg-blue-50 text-blue-600 py-2 rounded text-sm font-medium hover:bg-blue-100">
                {showFakeData ? 'Show Fake Data (Currently Active)' : 'Toggle Data Source'}
            </button>
            <p className="text-xs text-slate-400 mt-2">Current: {showFakeData ? 'FAKE DATA' : 'REAL DATA'}</p>
        </Panel>
    );
}

// === BUG 26: Export Corruption ===
function ExportOrders() {
    const handleExportCSV = () => {
        // Naive join — no quoting/escaping of commas or quotes already
        // present in shippingAddress, so addresses like the ones in
        // ORDERS break the CSV column structure.
        const csv = ORDERS.map((o) => `${o.id},${o.date},${o.total},${o.shippingAddress}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-export.csv';
        a.click();
    };
    const handleExportJSON = () => {
        const json = JSON.stringify(ORDERS, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-export.json';
        a.click();
    };

    return (
        <Panel title="Export Orders" icon={FileText}>
            <p className="text-xs text-slate-500 mb-3">{ORDERS.length} orders in range. Addresses containing commas/quotes will break the CSV.</p>
            <button onClick={handleExportCSV} className="w-full bg-slate-100 text-slate-600 py-2 rounded text-sm hover:bg-slate-200 mb-2">Export CSV</button>
            <button onClick={handleExportJSON} className="w-full bg-slate-100 text-slate-600 py-2 rounded text-sm hover:bg-slate-200">Export JSON</button>
        </Panel>
    );
}

// === BUG 27: Timezone Desync ===
function TimezoneDisplay() {
    const [timezone, setTimezone] = useState('UTC');
    const [displayTime, setDisplayTime] = useState('');
    useEffect(() => {
        // Depends on `timezone` but never actually uses it to convert — the
        // effect re-runs on every change and still just prints UTC.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: Bug 27, timezone desync
        setDisplayTime(new Date().toISOString());
    }, [timezone]);

    return (
        <Panel title="Order Timestamp Display" icon={Clock}>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2">
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
            </select>
            <div className="font-mono text-sm text-slate-600">{displayTime}</div>
            <p className="text-xs text-red-400 mt-2">Always shows UTC, regardless of selection.</p>
        </Panel>
    );
}

// === BUG 28: Legend Desync ===
function ChartLegend() {
    return (
        <Panel title="Revenue vs. Cost" icon={Database}>
            <div className="flex gap-2 mb-3 text-xs">
                <div className="w-4 h-4 bg-blue-500 rounded"></div><span>Revenue</span>
                <div className="w-4 h-4 bg-green-500 rounded ml-2"></div><span>Costs</span>
            </div>
            <div className="flex items-end gap-1 h-20">
                <div className="w-8 bg-blue-500 rounded-t h-16"></div>
                <div className="w-8 bg-blue-500 rounded-t h-12"></div>
                <div className="w-8 bg-blue-500 rounded-t h-20"></div>
            </div>
            <p className="text-xs text-red-400 mt-2">The "Costs" series in the legend is never actually rendered above.</p>
        </Panel>
    );
}

function Panel({ title, icon: Icon, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
            </div>
            {children}
        </div>
    );
}
