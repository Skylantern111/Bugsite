import { useMemo, useState } from 'react';
import { KeyRound, ShieldAlert, Users, Sparkles, RefreshCw } from 'lucide-react';

const initialUsers = [
    { id: 1, name: 'Avery', role: 'user', token: 'alpha-token', lastLogin: '12m ago' },
    { id: 2, name: 'Jordan', role: 'admin', token: 'admin-token', lastLogin: '3m ago' },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState(initialUsers);
    const [activeUserId, setActiveUserId] = useState(1);
    const [notice, setNotice] = useState('Select a user to inspect role permissions.');

    const activeUser = useMemo(() => users.find((user) => user.id === activeUserId) || users[0], [activeUserId, users]);

    const promoteUser = () => {
        setUsers((prev) => prev.map((user) => (user.id === activeUserId ? { ...user, role: 'admin' } : user)));
        setNotice(`Promoted ${activeUser.name} to admin.`);
    };

    const resetToken = () => {
        setUsers((prev) => prev.map((user) => (user.id === activeUserId ? { ...user, token: `token-${Date.now()}` } : user)));
        setNotice(`Reset token for ${activeUser.name}.`);
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-violet-600">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">Training Lab</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-500">This page collects the permission and session issues from the plan into a single user-admin surface.</p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <h2 className="text-lg font-semibold text-slate-800">Users</h2>
                    </div>
                    <div className="space-y-2">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => setActiveUserId(user.id)}
                                className={`w-full rounded-xl border px-3 py-3 text-left ${activeUserId === user.id ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">{user.name}</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{user.role}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Last login: {user.lastLogin}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-600" />
                            <h2 className="text-lg font-semibold text-slate-800">Role management</h2>
                        </div>
                        <p className="text-sm text-slate-500">Current user: <span className="font-semibold text-slate-700">{activeUser?.name}</span></p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={promoteUser} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white">Promote</button>
                            <button onClick={resetToken} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Reset Token</button>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">{notice}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <KeyRound className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-slate-800">Session / token view</h2>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                            <p><span className="font-semibold">Current token:</span> {activeUser?.token}</p>
                            <p className="mt-1">This view is intentionally easy to manipulate for training exercises.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-semibold">Known training issues</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                            <li>Role changes can be triggered without a confirmation step</li>
                            <li>Tokens change client-side without a full session reset</li>
                            <li>Permission state is easy to desync while switching accounts</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
