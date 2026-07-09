import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

// === BUG 22: Open Redirect ===
export default function PartnerDeals() {
    const { partnerSlug } = useParams();
    const [searchParams] = useSearchParams();

    // A real partner-deal page commonly takes a `?to=` return URL from the
    // affiliate link itself — that raw, unvalidated value is what gets
    // assigned to window.location.href below with no allowlist check.
    const [redirectUrl, setRedirectUrl] = useState(searchParams.get('to') || 'https://example-partner-store.com/deal');

    const handleRedirect = () => {
        window.location.href = redirectUrl;
    };

    return (
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h1 className="text-lg font-bold text-slate-800 mb-1">Partner Deal: {partnerSlug}</h1>
                <p className="text-sm text-slate-500 mb-6">This link forwards you to our partner's store to redeem your discount.</p>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Destination URL</label>
                <input
                    type="text"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                    onClick={handleRedirect}
                    className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                    Continue to Partner Store <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
