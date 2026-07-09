import { Link } from 'react-router-dom';
import { Bug, Globe, Mail, MessageCircle, ShieldAlert } from 'lucide-react';

const columns = [
    {
        title: 'Shop',
        links: [
            { label: 'All Products', to: '/catalog' },
            { label: 'Deals', to: '/deals' },
            { label: 'Compare', to: '/compare' },
            { label: 'Wishlist', to: '/wishlist' },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'My Account', to: '/account' },
            { label: 'Orders', to: '/orders' },
            { label: 'Cart', to: '/cart' },
            { label: 'Notifications', to: '/notifications' },
        ],
    },
    {
        title: 'Testing Lab',
        links: [
            { label: 'Bug Index', to: '/bugs' },
            { label: 'Admin Analytics', to: '/admin/analytics' },
            { label: 'Checkout Wizard', to: '/checkout' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="mt-auto bg-slate-900 text-slate-300">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bs-gradient-bg p-2 rounded-xl"><Bug className="w-6 h-6 text-white" /></div>
                        <span className="text-xl font-extrabold text-white">BugSite</span>
                    </div>
                    <p className="text-sm text-slate-400 max-w-xs mb-4">
                        A deliberately vulnerable e-commerce SPA for security training and AI agent testing.
                        Every feature hides a real, reproducible frontend bug.
                    </p>
                    <div className="flex gap-3">
                        {[Globe, Mail, MessageCircle].map((Icon, i) => (
                            <a key={i} href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors" aria-label="social link">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
                {columns.map((col) => (
                    <div key={col.title}>
                        <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
                        <ul className="space-y-2">
                            {col.links.map((l) => (
                                <li key={l.to}>
                                    <Link to={l.to} className="text-sm text-slate-400 hover:text-violet-300 transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                    <span>© {new Date().getFullYear()} BugSite. Not a real store — do not enter real data.</span>
                    <span className="flex items-center gap-1.5 text-amber-400/80">
                        <ShieldAlert className="w-3.5 h-3.5" /> 28 intentional vulnerabilities live
                    </span>
                </div>
            </div>
        </footer>
    );
}
