import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Flame } from 'lucide-react';
import { getDeals } from '../data/products';
import { useCart } from '../context/cartStore';
import ProductCard from '../components/ui/ProductCard';

// Bug-free deals landing page. The affiliate "partner store" buttons route to
// /deals/:partnerSlug, which is where Bug 22 (Open Redirect) actually lives.
const PARTNERS = [
    { slug: 'techmart', name: 'TechMart', blurb: 'Extra 10% off bundles', emoji: '🛒' },
    { slug: 'gadgetzone', name: 'GadgetZone', blurb: 'Refurbished deals', emoji: '♻️' },
    { slug: 'peripherals-plus', name: 'Peripherals+', blurb: 'Keyboard & mouse combos', emoji: '⌨️' },
];

export default function Deals() {
    const { addToCart } = useCart();
    const deals = getDeals(8);

    return (
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-10">
            <header className="rounded-3xl bs-gradient-bg text-white p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute -bottom-16 -right-10 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    <Flame className="w-3.5 h-3.5" /> Today's best prices
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">Deals & Discounts</h1>
                <p className="text-violet-100 max-w-md">Markdowns across every category. Prices update weekly — grab them before stock runs out.</p>
            </header>

            <section>
                <div className="flex items-center gap-2 mb-5">
                    <Tag className="w-5 h-5 text-violet-600" />
                    <h2 className="text-2xl font-extrabold text-slate-900">On sale now</h2>
                    <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{deals.length} items</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {deals.map((p) => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Partner stores</h2>
                <p className="text-sm text-slate-500 mb-5">Extra savings from our affiliate partners.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                    {PARTNERS.map((partner) => (
                        <Link
                            key={partner.slug}
                            to={`/deals/${partner.slug}`}
                            className="bs-card bs-lift rounded-2xl p-6 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{partner.emoji}</div>
                                <div>
                                    <p className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{partner.name}</p>
                                    <p className="text-xs text-slate-500">{partner.blurb}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 transition-colors" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
