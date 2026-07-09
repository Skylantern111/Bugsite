import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function Account() {
    // === BUG 15: Cache Pollution & Liar Label ===
    const [profile, setProfile] = useState({
        email: 'alice@bugsite.dev',
        balance: 12450.0,
        badge: 'Admin',
        isLoggedIn: true,
    });
    const [profileError, setProfileError] = useState(false);

    useEffect(() => {
        localStorage.setItem('bugsite_profile_cache', JSON.stringify(profile));
    }, [profile]);

    const handleLogout = () => {
        setProfile({ ...profile, isLoggedIn: false, balance: 0 });
        // MISSING: localStorage.removeItem('bugsite_profile_cache')
        // The stale profile — including balance and admin badge — is still
        // readable in localStorage after "logging out".
    };

    const handleExportData = () => {
        setProfileError(true);
        setProfile({ ...profile, isLoggedIn: false, balance: 0 });
    };

    // === BUG 19: Cross-Session Leak ===
    const [activeUser, setActiveUser] = useState('Alice');
    // Loaded once and deliberately never refreshed — a correct
    // implementation would re-fetch this per active user, but switching
    // accounts below only ever updates `activeUser`, so the previous
    // user's document keeps rendering under the new user's name.
    const [sensitiveDocument] = useState('Alice_Tax_Return_2025.pdf');
    const fastSwitchUser = () => {
        setActiveUser((prev) => (prev === 'Alice' ? 'Bob' : 'Alice'));
    };

    // === BUG 7: Obfuscation ===
    const fakeAdminToken = btoa('ADMIN_TOKEN_sk_live_12345_secret');

    // === Bonus: client-side-only form validation bypass ===
    const [settingsEmail, setSettingsEmail] = useState('');
    const [settingsPin, setSettingsPin] = useState('');
    const handleFormSubmit = (e) => {
        e.preventDefault();
        alert('Security details updated.');
    };

    return (
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <h1 className="md:col-span-2 text-2xl font-bold text-slate-800">Account & Settings</h1>

            {/* Profile / Cache Pollution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Profile</h3>
                {profile.isLoggedIn ? (
                    <>
                        <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center font-bold text-lg">
                                {profile.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{profile.email}</p>
                                <p className="text-xs text-slate-500">{profile.badge}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Balance</span><span className="font-mono font-bold">${profile.balance.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Last Order</span><span className="text-xs text-slate-700">Order #9821</span></div>
                        </div>
                        <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors mb-2">
                            Logout
                        </button>
                        <button onClick={handleExportData} className="w-full bg-green-50 text-green-600 border border-green-200 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                            Export My Data
                        </button>
                        {profileError && (
                            <div className="mt-2 bg-red-100 text-red-500 text-xs p-2 rounded-lg font-semibold text-center border border-red-200">
                                Data export complete.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 mb-3">You're logged out.</p>
                        <p className="text-[10px] text-slate-300">(Check devtools → Application → Local Storage → bugsite_profile_cache)</p>
                    </div>
                )}
            </div>

            {/* Security Panel / Obfuscation */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
                <h3 className="font-semibold text-slate-800 mb-4">Security Panel</h3>
                <div className="flex flex-col items-center justify-center py-4 mb-4 bg-slate-50 border border-slate-100 rounded-lg" data-token={fakeAdminToken}>
                    <Shield className="w-8 h-8 text-green-500 mb-2" />
                    <h4 className="font-semibold text-slate-800 text-sm">Security Status: Active</h4>
                    <p className="text-xs text-slate-500">All systems nominal.</p>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Auth Provider</span><span className="font-mono text-xs font-semibold">OAuth 2.0</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Session Type</span><span className="font-mono text-xs font-semibold">JWT / httpOnly</span></div>
                </div>
                <button className="opacity-0 absolute -left-[9999px]" onClick={() => console.log('Phantom auth bypass clicked')}>
                    Bypass Auth
                </button>
            </div>

            {/* Cross-Session Leak */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Shared Family Account</h3>
                <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${activeUser === 'Alice' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                        {activeUser.charAt(0)}
                    </div>
                    <p className="text-sm font-bold text-slate-800">Logged in as: {activeUser}</p>
                </div>
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-400 font-bold uppercase mb-1">Active Document in Memory</p>
                    <p className="text-sm font-mono text-red-600 truncate">{sensitiveDocument}</p>
                </div>
                <button onClick={fastSwitchUser} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                    Fast-Switch Account
                </button>
            </div>

            {/* Bonus: form validation bypass */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Account Security</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Email (max 20 chars)</label>
                        <input
                            type="email"
                            maxLength={20}
                            required
                            value={settingsEmail}
                            onChange={(e) => setSettingsEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">PIN (4 digits)</label>
                        <input
                            type="text"
                            pattern="\d{4}"
                            required
                            value={settingsPin}
                            onChange={(e) => setSettingsPin(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="1234"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={settingsEmail.length === 0 || settingsPin.length !== 4}
                        className="w-full bg-indigo-600 text-white font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                    >
                        Update Security Details
                    </button>
                </form>
            </div>
        </div>
    );
}
