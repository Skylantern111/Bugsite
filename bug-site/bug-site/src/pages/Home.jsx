import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, Headphones, ArrowRight, Sparkles, Star } from 'lucide-react';
import {
    CATEGORIES, CATEGORY_META, getFeatured, getBestSellers, getNewArrivals, getDeals,
} from '../data/products';
import { useCart } from '../context/cartStore';
import ProductCard from '../components/ui/ProductCard';

const TRUST = [
    { icon: Truck, title: 'Free shipping', sub: 'On orders over $50' },
    { icon: RotateCcw, title: '30-day returns', sub: 'No questions asked' },
    { icon: ShieldCheck, title: '2-year warranty', sub: 'On select gear' },
    { icon: Headphones, title: '24/7 support', sub: 'Chat with an agent' },
];

const TESTIMONIALS = [
    { name: 'Jordan P.', role: 'Security Researcher', text: 'Perfect sandbox for teaching frontend bug classes. The bugs are real, not staged.', avatar: '🧑‍💻' },
    { name: 'Mara L.', role: 'QA Lead', text: 'We point our new automation agents at BugSite before anything else. Great coverage.', avatar: '👩‍🔬' },
    { name: 'Devon K.', role: 'Bootcamp Instructor', text: 'Students find the XSS and race conditions in minutes. Fantastic teaching tool.', avatar: '🧑‍🏫' },
];

export default function Home() {
    const { addToCart } = useCart();

    // === BUG 9: Layout Shift ===
    // Hovering the Flash Sale CTA randomly nudges it away from the cursor
    // instead of just showing a hover state. (Logic preserved verbatim.)
    const [ctaStyle, setCtaStyle] = useState({
        transform: 'translate(0, 0)',
        transition: 'transform 0.2s ease-in-out',
    });
    const handleCtaMouseEnter = () =>
        setCtaStyle({ transform: `translate(${Math.random() * 60 - 10}px, ${Math.random() * 24 - 8}px)`, transition: 'transform 0.2s ease-in-out' });
    const handleCtaMouseLeave = () => setCtaStyle({ transform: 'translate(0, 0)', transition: 'transform 0.2s ease-in-out' });

    const featured = getFeatured(4);
    const bestSellers = getBestSellers(8);
    const newArrivals = getNewArrivals(4);
    const deals = getDeals(4);

    return (
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-14">
            {/* Hero */}
            <header className="relative overflow-hidden rounded-3xl bs-gradient-bg text-white p-8 sm:p-14">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-32 -left-10 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl" />
                <div className="relative max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full mb-5">
                        <Sparkles className="w-3.5 h-3.5" /> Flash Sale — this week only
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] mb-4">
                        Gear up<br />for less.
                    </h1>
                    <p className="text-violet-100 text-lg mb-8 max-w-md">
                        Headphones, keyboards, hubs, wearables, and full desk setups — up to 40% off across 28 products.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* BUG 9 lives on this button. */}
                        <div className="relative h-14 w-60">
                            <button
                                style={ctaStyle}
                                onMouseEnter={handleCtaMouseEnter}
                                onMouseLeave={handleCtaMouseLeave}
                                className="absolute bg-white text-violet-700 px-6 py-3.5 rounded-full font-bold shadow-xl cursor-pointer whitespace-nowrap flex items-center gap-2"
                            >
                                Shop Flash Sale <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <Link to="/catalog" className="text-white font-semibold underline underline-offset-4 decoration-white/40 hover:decoration-white">
                            Browse all products
                        </Link>
                    </div>
                </div>
            </header>

            {/* Trust strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {TRUST.map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="bs-card rounded-2xl p-4 flex items-center gap-3">
                        <div className="bg-violet-50 text-violet-600 p-2.5 rounded-xl"><Icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{title}</p>
                            <p className="text-xs text-slate-500">{sub}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Categories */}
            <section>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Shop by category</h2>
                        <p className="text-sm text-slate-500">{CATEGORIES.length} categories, freshly stocked.</p>
                    </div>
                    <Link to="/catalog" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        return (
                            <Link
                                key={cat}
                                to={`/catalog?category=${encodeURIComponent(cat)}`}
                                className="bs-card bs-lift rounded-2xl p-5 group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center text-2xl mb-3 shadow-sm`}>
                                    {meta.emoji}
                                </div>
                                <p className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{cat}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{meta.blurb}</p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Best sellers */}
            <section>
                <div className="flex items-end justify-between mb-5">
                    <h2 className="text-2xl font-extrabold text-slate-900">Best sellers</h2>
                    <Link to="/catalog" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                        See more <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {bestSellers.slice(0, 4).map((p) => (
                        <ProductCard key={p.id} product={p} onAdd={addToCart} />
                    ))}
                </div>
            </section>

            {/* Deals banner */}
            <section className="rounded-3xl bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bs-gradient-bg opacity-20" />
                <div className="relative p-8 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                            <Star className="w-3.5 h-3.5 fill-rose-300" /> Limited-time deals
                        </span>
                        <h2 className="text-3xl font-extrabold mb-3">Save big on top gear</h2>
                        <p className="text-slate-300 mb-6 max-w-sm">Hand-picked markdowns across audio, storage, and networking. When they're gone, they're gone.</p>
                        <Link to="/deals" className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                            Shop all deals <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {deals.map((p) => (
                            <Link key={p.id} to={`/product/${p.slug}`} className="bg-white/10 backdrop-blur rounded-2xl p-4 hover:bg-white/15 transition-colors">
                                <div className="text-4xl mb-2">{p.emoji}</div>
                                <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                                <p className="text-sm font-extrabold mt-1">
                                    ${p.price.toFixed(2)} <span className="text-xs text-slate-400 line-through font-normal">${p.oldPrice.toFixed(2)}</span>
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New arrivals */}
            <section>
                <div className="flex items-end justify-between mb-5">
                    <h2 className="text-2xl font-extrabold text-slate-900">New arrivals</h2>
                    <Link to="/catalog" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                        See more <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {newArrivals.map((p) => (
                        <ProductCard key={p.id} product={p} onAdd={addToCart} />
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-5 text-center">Loved by testers & teachers</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.name} className="bs-card rounded-2xl p-6">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                            </div>
                            <p className="text-sm text-slate-600 mb-4">“{t.text}”</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center text-lg">{t.avatar}</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                                    <p className="text-xs text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="bs-card rounded-3xl p-8 sm:p-10 text-center">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Get deals in your inbox</h2>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Join 12,000+ shoppers. One email a week, unsubscribe anytime. (This form does nothing — it's a demo.)</p>
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="you@example.com" className="flex-grow px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                    <button className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">Subscribe</button>
                </form>
            </section>
        </div>
    );
}
