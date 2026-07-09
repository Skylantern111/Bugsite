import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Eye, X, Trash2, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useCart } from '../context/cartStore';
import ProductCard from '../components/ui/ProductCard';
import StarRating from '../components/ui/StarRating';

const SORTS = {
    featured: 'Featured',
    'price-asc': 'Price: Low → High',
    'price-desc': 'Price: High → Low',
    rating: 'Top rated',
    name: 'Name A → Z',
};

export default function Catalog() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'All';

    // === BUG 23: Missing Debounce (API Spam) ===
    const [searchQuery, setSearchQuery] = useState('');
    const [apiCallCount, setApiCallCount] = useState(0);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // Simulating a heavy search API call fired on EVERY keystroke.
        setApiCallCount((prev) => prev + 1);
        console.log(`[API SPAM] Fetching results for: ${e.target.value}`);
    };

    // New (bug-free) storefront controls: sort + max-price filter.
    const [sort, setSort] = useState('featured');
    const [maxPrice, setMaxPrice] = useState(250);

    const filtered = useMemo(() => {
        const list = PRODUCTS.filter((p) => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = p.price <= maxPrice;
            return matchesCategory && matchesSearch && matchesPrice;
        });
        const sorted = [...list];
        if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        else if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
        else sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
        return sorted;
    }, [activeCategory, searchQuery, maxPrice, sort]);

    // === BUG 18: Ghost Modal (SPA DOM Leak) ===
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const openQuickView = (product) => {
        setQuickViewProduct(product);
        // eslint-disable-next-line react-hooks/immutability -- intentional: Bug 18, no cleanup on unmount
        document.body.style.overflow = 'hidden'; // Lock scroll
        // No useEffect cleanup exists for this — navigating away via the
        // NavBar (unmounting Catalog) leaves the page permanently
        // scroll-locked. Only the explicit close button below fixes it.
    };
    const closeQuickView = () => {
        setQuickViewProduct(null);
        document.body.style.overflow = 'auto';
    };

    // === BUG 4: Event Bubbling ===
    const [recentlyViewed, setRecentlyViewed] = useState(PRODUCTS.slice(0, 3));
    const handleRemoveRecentlyViewed = (productId) => {
        // MISSING e.stopPropagation() at the call site below — the card's
        // own onClick (navigate to PDP) fires too.
        setRecentlyViewed((prev) => prev.filter((p) => p.id !== productId));
    };

    return (
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Catalog</h1>
                    <p className="text-sm text-slate-500">Browse {PRODUCTS.length} products across {CATEGORIES.length} categories.</p>
                </div>
            </header>

            {/* Controls */}
            <div className="bs-card rounded-2xl p-4 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search products..."
                            className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 bg-white"
                        />
                    </div>
                    <select
                        value={activeCategory}
                        onChange={(e) => setSearchParams(e.target.value === 'All' ? {} : { category: e.target.value })}
                        className="border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white"
                    >
                        {Object.entries(SORTS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Max price
                    </label>
                    <input
                        type="range" min="20" max="250" step="5" value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="flex-grow accent-violet-600"
                    />
                    <span className="text-sm font-bold text-violet-600 w-16 text-right">${maxPrice}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                    API calls fired this session (no debounce — Bug 23):{' '}
                    <span className="font-mono font-bold text-orange-500">{apiCallCount}</span>
                </p>
            </div>

            {/* Recently viewed — Bug 4 lives here */}
            {recentlyViewed.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Recently Viewed</h2>
                    <div className="space-y-2">
                        {recentlyViewed.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/product/${item.slug}`)}
                                className="flex justify-between items-center p-3 bs-card rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveRecentlyViewed(item.id)}
                                    className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Results grid */}
            <section>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{filtered.length} Results</h2>
                {filtered.length === 0 ? (
                    <div className="bs-card rounded-2xl p-10 text-center text-slate-400 text-sm">No products match your filters.</div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((p) => (
                            <ProductCard key={p.id} product={p} onAdd={addToCart} onQuickView={openQuickView} />
                        ))}
                    </div>
                )}
            </section>

            {/* Quick View lightbox — Bug 18 trigger */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative bs-pop">
                        <button onClick={closeQuickView} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="h-32 bg-gradient-to-br from-slate-50 to-violet-50 rounded-xl flex items-center justify-center text-6xl mb-4">{quickViewProduct.emoji}</div>
                        <h3 className="font-bold text-slate-800 mb-1">{quickViewProduct.name}</h3>
                        {typeof quickViewProduct.rating === 'number' && (
                            <div className="mb-2"><StarRating rating={quickViewProduct.rating} count={quickViewProduct.reviewCount} /></div>
                        )}
                        <p className="text-sm text-slate-500 mb-4">{quickViewProduct.description}</p>
                        <p className="text-lg font-bold text-violet-600 mb-4">${quickViewProduct.price.toFixed(2)}</p>
                        <p className="text-[11px] text-slate-400">Tip: navigate away using the nav bar (instead of closing this) to see the page stay scroll-locked.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
