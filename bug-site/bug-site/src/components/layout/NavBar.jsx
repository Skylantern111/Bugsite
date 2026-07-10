import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Bug, Home, LayoutGrid, ShoppingCart, Heart, CreditCard, UserCircle,
    ListOrdered, Activity, Tag, Bell, GitCompareArrows, FlaskConical, Menu, X,
    Star, ChevronDown, BarChart3, Package,
} from 'lucide-react';
import { useCart } from '../../context/cartStore';

// Pages are grouped so the desktop nav can reveal them from a hover dropdown
// and the mobile "burger" menu can list them under section headers.
const menuGroups = [
    {
        label: 'Shop',
        icon: LayoutGrid,
        links: [
            { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
            { to: '/deals', label: 'Deals', icon: Tag },
            { to: '/compare', label: 'Compare', icon: GitCompareArrows },
            { to: '/wishlist', label: 'Wishlist', icon: Heart },
            { to: '/reviews', label: 'Reviews', icon: Star },
        ],
    },
    {
        label: 'Account',
        icon: UserCircle,
        links: [
            { to: '/account', label: 'My Account', icon: UserCircle },
            { to: '/orders', label: 'Orders', icon: ListOrdered },
            { to: '/cart', label: 'Cart', icon: ShoppingCart },
            { to: '/notifications', label: 'Notifications', icon: Bell },
        ],
    },
    {
        label: 'Testing Lab',
        icon: FlaskConical,
        links: [
            { to: '/admin/analytics', label: 'Analytics', icon: Activity },
            { to: '/admin/products', label: 'Product Manager', icon: Package },
            { to: '/admin/inventory', label: 'Store Stats', icon: BarChart3 },
            { to: '/bugs', label: 'Bug Index', icon: FlaskConical },
        ],
    },
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

    const dropdownLinkClass = ({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
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

                    {/* Desktop primary links — Home + hover dropdown groups */}
                    <div className="hidden lg:flex gap-1 items-center">
                        <NavLink to="/" end className={linkClass}>
                            <Home className="w-4 h-4" /> Home
                        </NavLink>

                        {menuGroups.map((group) => (
                            <div key={group.label} className="relative group">
                                {/* Hovering (or focusing) this button reveals the dropdown below. */}
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 group-hover:bg-slate-100 transition-colors whitespace-nowrap"
                                    aria-haspopup="true"
                                >
                                    <group.icon className="w-4 h-4" /> {group.label}
                                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                                </button>

                                {/* pt-2 bridges the gap so moving the cursor onto the menu keeps it open. */}
                                <div className="absolute left-0 top-full pt-2 w-56 z-50 opacity-0 invisible translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5">
                                        {group.links.map((l) => (
                                            <NavLink key={l.to} to={l.to} className={dropdownLinkClass}>
                                                <l.icon className="w-4 h-4 text-slate-400" /> {l.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
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

                {/* Mobile / tablet expandable "burger" menu — grouped into sections */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-4 bs-slide-in">
                        <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
                            <Home className="w-4 h-4" /> Home
                        </NavLink>

                        {menuGroups.map((group) => (
                            <div key={group.label}>
                                <div className="flex items-center gap-2 px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <group.icon className="w-3.5 h-3.5" /> {group.label}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {group.links.map((l) => (
                                        <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMobileOpen(false)}>
                                            <l.icon className="w-4 h-4" /> {l.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
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
