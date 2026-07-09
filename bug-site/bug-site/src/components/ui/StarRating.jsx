import { Star } from 'lucide-react';

// Read-only display stars (interactive rating on the PDP is deliberately built
// from non-button <span>s for Bug 5 — this component is NOT that one).
export default function StarRating({ rating = 0, count, size = 'sm', className = '' }) {
    const px = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    const full = Math.round(rating);
    return (
        <div className={`flex items-center gap-1 ${className}`} aria-label={`Rated ${rating} out of 5`}>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`${px} ${i <= full ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                ))}
            </div>
            {typeof rating === 'number' && <span className="text-xs font-semibold text-slate-600">{rating.toFixed(1)}</span>}
            {typeof count === 'number' && <span className="text-xs text-slate-400">({count})</span>}
        </div>
    );
}
