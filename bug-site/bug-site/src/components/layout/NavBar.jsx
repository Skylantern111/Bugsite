import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Bug, Home, LayoutGrid, ShoppingCart, Heart, CreditCard, UserCircle,
    ListOrdered, Activity, Tag, Bell, GitCompareArrows, FlaskConical, Menu, X,
} from 'lucide-react';
import { useCart } from '../../context/cartStore';

const primaryLinks = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
    { to: '/deals', label: 'Deals', icon: Tag },
    { to: '/compare', label: 'Compare', icon: GitCompareArrows },
    { to: '/orders', label: 'Orders', icon: ListOrdered },
    { to: '/account', label: 'Account', icon: UserCircle },
    { to: '/admin/analytics', label: 'Analytics', icon: Activity },
    { to: '/bugs', label: 'Testing', icon: FlaskConical },
];

const ANNOUNCEMENTS = [
    '🚚 Free shipping on orders over $50',
    '🔒 Deliberately vulnerable — 28 bugs to find',
    '🎧 Up to 40% off Audio this week',
    '🧪 Built for security training & AI agent testing',
    '💾 New: Storage & Networking categories',
];

export default function NavBar() {
    const { cart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);

    const linkClass = ({ isActive }) =>
        `relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
            isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <header className="sticky top-0 z-40">
            {/* Announcement marquee */}
            <div className="bs-gradient-bg text-white text-xs overflow-hidden">
                <div className="bs-marquee py-1.5">
                    {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
                        <span key={i} className="px-6 font-medium tracking-wide">{a}</span>
                    ))}
                </div>
            </div>

            <nav className="bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <NavLink to="/" className="flex items-center gap-3 shrink-0">
                        <div className="bs-gradient-bg p-2 rounded-xl shadow-lg shadow-violet-500/20">
                            <Bug className="w-6 h-6 text-white" />
                        </div>
                        <div className="leading-tight">
                            <span className="text-xl font-extrabold block bs-gradient-text">BugSite</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Tech Gadget Store</span>
                        </div>
                    </NavLink>

                    {/* Desktop primary links */}
                    <div className="hidden lg:flex gap-1 items-center">
                        {primaryLinks.map(({ to, label, icon: Icon, end }) => (
                            <NavLink key={to} to={to} end={end} className={linkClass}>
                                <Icon className="w-4 h-4" /> {label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <NavLink to="/notifications" className={linkClass} aria-label="Notifications">
                            <span className="relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
                            </span>
                        </NavLink>
                        <NavLink to="/wishlist" className={linkClass} aria-label="Wishlist">
                            <Heart className="w-5 h-5" />
                        </NavLink>
                        <NavLink to="/cart" className={linkClass} aria-label="Cart">
                            <span className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center bs-pop">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                        </NavLink>
                        <NavLink to="/checkout" className="hidden sm:flex items-center gap-2 ml-1 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                            <CreditCard className="w-4 h-4" /> Checkout
                        </NavLink>
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile / tablet expandable links */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-1 bs-slide-in">
                        {primaryLinks.map(({ to, label, icon: Icon, end }) => (
                            <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setMobileOpen(false)}>
                                <Icon className="w-4 h-4" /> {label}
                            </NavLink>
                        ))}
                        <NavLink to="/checkout" className={linkClass} onClick={() => setMobileOpen(false)}>
                            <CreditCard className="w-4 h-4" /> Checkout
                        </NavLink>
                    </div>
                )}
            </nav>
        </header>
    );
}
