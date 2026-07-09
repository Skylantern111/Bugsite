import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, Plus, X, Check, Minus, ShoppingCart } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/cartStore';
import StarRating from '../components/ui/StarRating';

// Bug-free product comparison tool (up to 3 side by side).
export default function Compare() {
    const { addToCart } = useCart();
    const [slugs, setSlugs] = useState(['premium-noise-canceling-headphones', 'true-wireless-earbuds-pro', '']);

    const selected = slugs.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean);

    // Union of every spec key across the chosen products, so rows line up.
    const specKeys = useMemo(() => {
        const keys = new Set();
        selected.forEach((p) => Object.keys(p.specs || {}).forEach((k) => keys.add(k)));
        return [...keys];
    }, [selected]);

    const setSlot = (index, value) => {
        setSlugs((prev) => prev.map((s, i) => (i === index ? value : s)));
    };

    const cheapest = selected.length > 1 ? Math.min(...selected.map((p) => p.price)) : null;
    const topRated = selected.length > 1 ? Math.max(...selected.map((p) => p.rating || 0)) : null;

    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header className="flex items-center gap-3">
                <div className="bs-gradient-bg p-2.5 rounded-xl"><GitCompareArrows className="w-6 h-6 text-white" /></div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Compare products</h1>
                    <p className="text-sm text-slate-500">Pick up to 3 items to see specs side by side.</p>
                </div>
            </header>

            {/* Slot pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {slugs.map((slug, i) => (
                    <div key={i} className="bs-card rounded-2xl p-3">
                        <div className="flex items-center gap-2">
                            <select
                                value={slug}
                                onChange={(e) => setSlot(i, e.target.value)}
                                className="flex-grow border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
                            >
                                <option value="">— Select a product —</option>
                                {PRODUCTS.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
                            </select>
                            {slug && (
                                <button onClick={() => setSlot(i, '')} className="p-1.5 text-slate-400 hover:text-rose-500" aria-label="Clear slot">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selected.length === 0 ? (
                <div className="bs-card rounded-2xl p-12 text-center">
                    <Plus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Select at least one product above to start comparing.</p>
                </div>
            ) : (
                <div className="bs-card rounded-2xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left p-4 text-xs uppercase tracking-wide text-slate-400 font-bold w-40">Attribute</th>
                                {selected.map((p) => (
                                    <th key={p.id} className="p-4 text-center align-top">
                                        <Link to={`/product/${p.slug}`} className="block">
                                            <div className="text-4xl mb-2">{p.emoji}</div>
                                            <p className="font-bold text-slate-800 leading-snug hover:text-violet-600">{p.name}</p>
                                        </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-semibold text-slate-500">Price</td>
                                {selected.map((p) => (
                                    <td key={p.id} className="p-4 text-center">
                                        <span className={`font-extrabold ${p.price === cheapest ? 'text-emerald-600' : 'text-slate-800'}`}>${p.price.toFixed(2)}</span>
                                        {p.price === cheapest && <span className="block text-[10px] font-bold text-emerald-600 uppercase">Cheapest</span>}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-semibold text-slate-500">Rating</td>
                                {selected.map((p) => (
                                    <td key={p.id} className="p-4">
                                        <div className="flex justify-center"><StarRating rating={p.rating} count={p.reviewCount} /></div>
                                        {p.rating === topRated && <span className="block text-center text-[10px] font-bold text-amber-600 uppercase mt-1">Top rated</span>}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-semibold text-slate-500">Brand</td>
                                {selected.map((p) => <td key={p.id} className="p-4 text-center text-slate-700">{p.brand || '—'}</td>)}
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-semibold text-slate-500">Category</td>
                                {selected.map((p) => <td key={p.id} className="p-4 text-center text-slate-700">{p.category}</td>)}
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-semibold text-slate-500">In stock</td>
                                {selected.map((p) => (
                                    <td key={p.id} className="p-4 text-center">
                                        {p.stock > 0
                                            ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="w-4 h-4" /> {p.stock}</span>
                                            : <span className="inline-flex items-center gap-1 text-rose-500"><Minus className="w-4 h-4" /> Out</span>}
                                    </td>
                                ))}
                            </tr>
                            {specKeys.map((key) => (
                                <tr key={key} className="border-b border-slate-50">
                                    <td className="p-4 font-semibold text-slate-500 capitalize">{key}</td>
                                    {selected.map((p) => (
                                        <td key={p.id} className="p-4 text-center text-slate-700">
                                            {p.specs?.[key] ?? <span className="text-slate-300">—</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="p-4"></td>
                                {selected.map((p) => (
                                    <td key={p.id} className="p-4 text-center">
                                        <button
                                            onClick={() => addToCart(p)}
                                            className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
