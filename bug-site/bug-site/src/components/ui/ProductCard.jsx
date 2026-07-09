import { Link } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import StarRating from './StarRating';

const BADGE_STYLES = {
    'Best Seller': 'bg-amber-100 text-amber-700',
    Deal: 'bg-rose-100 text-rose-600',
    'Low Stock': 'bg-orange-100 text-orange-600',
    New: 'bg-emerald-100 text-emerald-700',
};

function discountPct(product) {
    if (typeof product.oldPrice !== 'number' || product.oldPrice <= product.price) return null;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

// Presentational product card reused across Home, Catalog, Deals, Compare.
// onAdd / onQuickView are optional so callers keep their own bug wiring.
export default function ProductCard({ product, onAdd, onQuickView }) {
    const pct = discountPct(product);
    const badge = product.newArrival && !product.badge ? 'New' : product.badge;

    return (
        <div className="bs-card bs-lift rounded-2xl p-4 relative group flex flex-col">
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${BADGE_STYLES[badge] || 'bg-slate-100 text-slate-600'}`}>
                        {badge}
                    </span>
                )}
                {pct && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">-{pct}%</span>
                )}
            </div>

            {onQuickView && (
                <button
                    onClick={() => onQuickView(product)}
                    className="absolute top-3 right-3 bg-white/90 border border-slate-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    aria-label="Quick view"
                >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                </button>
            )}

            <Link to={`/product/${product.slug}`} className="block">
                <div className="h-32 bg-gradient-to-br from-slate-50 to-violet-50/40 rounded-xl flex items-center justify-center text-6xl mb-3">
                    {product.emoji}
                </div>
                {product.brand && <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{product.brand}</p>}
                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{product.name}</p>
            </Link>

            {typeof product.rating === 'number' && (
                <div className="mt-1.5"><StarRating rating={product.rating} count={product.reviewCount} /></div>
            )}

            <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
                <div>
                    <span className="text-base font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                    {typeof product.oldPrice === 'number' && product.oldPrice > product.price && (
                        <span className="ml-1.5 text-xs text-slate-400 line-through">${product.oldPrice.toFixed(2)}</span>
                    )}
                </div>
                {onAdd && (
                    <button
                        onClick={() => onAdd(product)}
                        className="flex items-center gap-1 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-violet-700 cursor-pointer transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                )}
            </div>
        </div>
    );
}
