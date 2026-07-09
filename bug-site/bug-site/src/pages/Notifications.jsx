import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, Tag, Star, ShieldCheck, CheckCheck, Trash2, Dot } from 'lucide-react';

// Bug-free notification center. Real, functional feature (per the architecture
// plan, Notification Center is built correctly rather than hiding a new bug).
const ICONS = { order: Package, deal: Tag, review: Star, security: ShieldCheck };
const TONE = {
    order: 'bg-sky-50 text-sky-600',
    deal: 'bg-rose-50 text-rose-600',
    review: 'bg-amber-50 text-amber-600',
    security: 'bg-emerald-50 text-emerald-600',
};

const INITIAL = [
    { id: 1, type: 'order', title: 'Order #9821 delivered', body: 'Your Mechanical Keyboard (TKL) was delivered.', time: '2h ago', read: false, to: '/orders' },
    { id: 2, type: 'deal', title: 'Price drop on your wishlist', body: 'Ultra Component is now part of this week\'s deals.', time: '5h ago', read: false, to: '/deals' },
    { id: 3, type: 'review', title: 'Your review was published', body: 'Thanks for reviewing the Studio USB Microphone.', time: '1d ago', read: false, to: '/product/studio-usb-microphone' },
    { id: 4, type: 'security', title: 'New sign-in detected', body: 'A new device signed into your account from Austin, TX.', time: '2d ago', read: true, to: '/account' },
    { id: 5, type: 'order', title: 'Order #9819 is in transit', body: 'Premium Noise-Canceling Headphones are on the way.', time: '3d ago', read: true, to: '/orders' },
    { id: 6, type: 'deal', title: 'Flash sale started', body: 'Up to 40% off Audio — ends this weekend.', time: '4d ago', read: true, to: '/deals' },
];

export default function Notifications() {
    const [items, setItems] = useState(INITIAL);
    const [filter, setFilter] = useState('all');

    const unread = items.filter((i) => !i.read).length;
    const visible = filter === 'unread' ? items.filter((i) => !i.read) : items;

    const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    const toggleRead = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: !i.read } : i)));
    const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
    const clearAll = () => setItems([]);

    return (
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative bs-gradient-bg p-2.5 rounded-xl">
                        <Bell className="w-6 h-6 text-white" />
                        {unread > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
                        <p className="text-sm text-slate-500">{unread} unread · {items.length} total</p>
                    </div>
                </div>
            </header>

            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['all', 'unread'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                    <button onClick={clearAll} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg hover:bg-rose-100">
                        <Trash2 className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            {visible.length === 0 ? (
                <div className="bs-card rounded-2xl p-12 text-center">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">You're all caught up.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map((n) => {
                        const Icon = ICONS[n.type] || Bell;
                        return (
                            <div key={n.id} className={`bs-card rounded-2xl p-4 flex items-start gap-4 ${!n.read ? 'ring-1 ring-violet-200' : ''}`}>
                                <div className={`p-2.5 rounded-xl ${TONE[n.type]}`}><Icon className="w-5 h-5" /></div>
                                <Link to={n.to} className="flex-grow min-w-0" onClick={() => toggleRead(n.id)}>
                                    <div className="flex items-center gap-1.5">
                                        {!n.read && <Dot className="w-5 h-5 text-violet-600 -ml-1.5" />}
                                        <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                                    </div>
                                    <p className="text-sm text-slate-500">{n.body}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                                </Link>
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button onClick={() => toggleRead(n.id)} className="text-[11px] font-semibold text-violet-600 hover:underline whitespace-nowrap">
                                        {n.read ? 'Mark unread' : 'Mark read'}
                                    </button>
                                    <button onClick={() => remove(n.id)} className="text-[11px] text-slate-400 hover:text-rose-500 whitespace-nowrap">Dismiss</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
