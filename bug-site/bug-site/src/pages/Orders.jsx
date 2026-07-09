import { useState } from 'react';
import { Package, CloudRain } from 'lucide-react';
import { ORDERS } from '../data/orders';

// === BUG 11: Unmounted setState ===
// Deliberately has NO isMountedRef guard (see BUGSITE_ARCHITECTURE_PLAN.md
// fidelity note on Bug 11 — the original reference component guarded this
// and never actually reproduced its own badge). Click "Track", then close
// this panel before the 2s response resolves to trigger a genuine
// "Can't perform a React state update on an unmounted component" warning.
function LiveTrackingWidget() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = () => {
        setLoading(true);
        setTimeout(() => {
            setStatus('Package is out for delivery — arriving today by 8pm.');
            setLoading(false); // fires even if this widget has since unmounted
        }, 2000);
    };

    return (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2">
            <button
                onClick={handleTrack}
                disabled={loading}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
                {loading ? 'Tracking…' : 'Track Package'}
            </button>
            {status && <p className="text-xs text-slate-600 mt-2">{status}</p>}
        </div>
    );
}

export default function Orders() {
    const [trackingOpenFor, setTrackingOpenFor] = useState(null);

    // === BUG 10: Parse Failure ===
    const [parseError, setParseError] = useState(null);
    const [carrierResult, setCarrierResult] = useState(null);
    const handleFetchCarrierStatus = () => {
        // Mocked external carrier-tracking integration returning malformed
        // JSON (trailing comma) — a very real class of third-party API bug.
        const malformedResponse = '{"carrier": "legacy-carrier-api", "eta": "2026-07-12",}';
        try {
            const parsed = JSON.parse(malformedResponse);
            setCarrierResult(JSON.stringify(parsed));
            setParseError(null);
        } catch (e) {
            console.error('[Carrier API] Parse failure:', e);
            setParseError('Failed to parse carrier response. Check console.');
            setCarrierResult(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Order History</h1>

            <div className="space-y-3">
                {ORDERS.map((order) => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Order #{order.id}</p>
                                <p className="text-xs text-slate-500">{order.date} · {order.status}</p>
                            </div>
                            <p className="font-bold text-slate-800">${order.total.toFixed(2)}</p>
                        </div>
                        <div className="mt-2 space-y-0.5">
                            {order.items.map((item, i) => (
                                <p key={i} className="text-xs text-slate-500">{item.qty} × {item.name}</p>
                            ))}
                        </div>
                        <button
                            onClick={() => setTrackingOpenFor(trackingOpenFor === order.id ? null : order.id)}
                            className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold cursor-pointer"
                        >
                            <Package className="w-3.5 h-3.5" /> {trackingOpenFor === order.id ? 'Hide tracking' : 'Live tracking'}
                        </button>
                        {trackingOpenFor === order.id && <LiveTrackingWidget key={order.id} />}
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><CloudRain className="w-4 h-4" /> Carrier Status Check</h3>
                <p className="text-xs text-slate-500 mb-3">Pings the legacy carrier integration directly.</p>
                <button onClick={handleFetchCarrierStatus} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
                    Check Carrier Status
                </button>
                {parseError && <p className="text-xs text-red-500 mt-3 font-mono">{parseError}</p>}
                {carrierResult && <p className="text-xs text-slate-700 mt-3 font-mono">{carrierResult}</p>}
            </div>
        </div>
    );
}
