import { memo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, User, Send, ShoppingCart } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import { getReviewsForProduct } from '../data/reviews';
import { useCart } from '../context/cartStore';

// === BUG 16: Broken Memoization ===
// React.memo here is useless: the parent always passes a fresh inline
// onClick, so referential equality breaks and every related-product item
// re-renders whenever ANY parent state changes (e.g. switching tabs).
const RelatedProductCard = memo(({ product, onNotify }) => {
    return (
        <Link to={`/product/${product.slug}`} onClick={onNotify} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100">
            <span className="text-2xl">{product.emoji}</span>
            <div className="flex-grow">
                <p className="text-sm font-medium text-slate-700">{product.name}</p>
                <p className="text-xs text-slate-500">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
});

const TABS = ['Overview', 'Reviews', 'Specs', 'Shipping'];

export default function ProductDetails() {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const product = getProductBySlug(slug);

    // === BUG 14: Query Desync ===
    // Active tab lives in local state, never synced to the URL — refreshing
    // or sharing this link always lands back on Overview.
    const [activeTab, setActiveTab] = useState('Overview');

    // === BUG 35: Race Condition on Rapid Tab Switching ===
    // When user rapidly clicks tabs, older API responses can overwrite
    // the current tab's content with stale data.
    // No request cancellation or validation that activeTab still matches.
    const [tabContent, setTabContent] = useState({});
    const [loadingTab, setLoadingTab] = useState(null);

    const handleTabClick = async (tab) => {
        setActiveTab(tab);
        setLoadingTab(tab);

        // Simulate API call with variable latency to create race condition
        const delay = Math.random() * 2000 + 300; // 300-2300ms
        const startTime = Date.now();
        const tabBeingLoaded = tab; // Capture current tab

        // BUG 35: No abortController or comparison of activeTab
        // If user clicks another tab before this completes, this response
        // will still update the state, overwriting the new tab's content
        setTimeout(() => {
            const elapsed = Date.now() - startTime;
            const tabData = {
                'Overview': `Loaded after ${elapsed}ms`,
                'Reviews': `Reviews loaded after ${elapsed}ms (${reviews.length} reviews)`,
                'Specs': `Specs loaded after ${elapsed}ms`,
                'Shipping': `Shipping info loaded after ${elapsed}ms`,
            };

            // BUG: No check that the tab that finished loading is still active
            setTabContent((prev) => ({ ...prev, [tabBeingLoaded]: tabData[tabBeingLoaded] }));
            setLoadingTab(null);

            // Log shows which tab was loaded
            console.warn(`[BUG 35] Loaded content for "${tabBeingLoaded}", but current activeTab is "${tab}" — check if they match!`);
        }, delay);
    };

    // === BUG 5: A11y Violations ===
    const [rating, setRating] = useState(0);
    const [liked, setLiked] = useState(false);

    // === BUG 6: XSS Vector ===
    const [reviews, setReviews] = useState(() => getReviewsForProduct(slug));
    const [reviewInput, setReviewInput] = useState('');
    const handleAddReview = () => {
        if (reviewInput.trim()) {
            setReviews([...reviews, { id: `local-${Date.now()}`, author: '@you', text: reviewInput, rating: rating || 5 }]);
            setReviewInput('');
        }
    };

    if (!product) {
        return <div className="max-w-3xl mx-auto p-10 text-center text-slate-500">Product not found.</div>;
    }

    const related = getRelatedProducts(product);

    return (
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-8xl">{product.emoji}</div>
                <div className="flex flex-col">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">{product.category}</p>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">{product.name}</h1>

                    {/* BUG 5: A11y Violations — div/span-built rating & like controls */}
                    <div className="flex items-center gap-1 my-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} onClick={() => setRating(i)}>
                                <Star className={`w-4 h-4 cursor-pointer ${i <= rating && rating !== 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                            </span>
                        ))}
                        <span className="text-xs text-slate-500 ml-2">{rating === 0 ? 'No rating yet' : `${rating} stars`}</span>
                    </div>
                    <div
                        onClick={() => setLiked((v) => !v)}
                        className={`inline-flex w-fit items-center gap-1 text-xs px-3 py-1.5 rounded-full mb-4 cursor-pointer ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <Heart className={`w-3 h-3 ${liked ? 'fill-red-500' : ''}`} /> {liked ? 'Liked' : 'Like this product'}
                    </div>

                    <p className="text-3xl font-black text-slate-800 mb-4">${product.price.toFixed(2)}</p>
                    <button
                        onClick={() => addToCart(product)}
                        className="mt-auto bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                </div>
            </div>

            {/* BUG 14: Query Desync tabs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex border-b border-slate-100 px-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            disabled={loadingTab !== null}
                            className={`px-4 py-3 text-sm transition-colors disabled:opacity-60 ${activeTab === tab ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {loadingTab === tab && <span className="inline-block w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2\"></span>}
                            {tab} {tab === 'Reviews' && <span className="text-[10px] text-green-500 font-bold ml-1">{reviews.length}</span>}
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {tabContent[activeTab] && <p className="text-xs text-slate-400 mb-3 pb-3 border-b border-slate-100">{tabContent[activeTab]}</p>}
                    {loadingTab === activeTab && <p className="text-xs text-blue-500 mb-3">Loading content...</p>}
                    {activeTab === 'Overview' && <p className="text-sm text-slate-600">{product.description}</p>}
                    {activeTab === 'Specs' && (
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            {Object.entries(product.specs).map(([k, v]) => (
                                <div key={k} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <dt className="text-[10px] text-slate-400 uppercase font-bold">{k}</dt>
                                    <dd className="text-slate-700 font-medium">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    {activeTab === 'Shipping' && <p className="text-sm text-slate-600">Ships in 2-3 business days. Free returns within 30 days.</p>}
                    {activeTab === 'Reviews' && (
                        <div className="space-y-4">
                            <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                {reviews.map((rev) => (
                                    <div key={rev.id} className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">{rev.author}</p>
                                        {/* BUG 6: XSS Vector — reviews rendered raw, no sanitization */}
                                        <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: rev.text }}></p>
                                    </div>
                                ))}
                                {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet — be the first.</p>}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={reviewInput}
                                    onChange={(e) => setReviewInput(e.target.value)}
                                    placeholder="Write a review..."
                                    className="flex-grow text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                                />
                                <button onClick={handleAddReview} className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 cursor-pointer">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {related.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-4">You Might Also Like</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {related.map((rp) => (
                            <RelatedProductCard key={rp.id} product={rp} onNotify={() => console.log(`Viewing related: ${rp.name}`)} />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-6 h-6 bg-slate-300 rounded-full overflow-hidden flex items-center justify-center"><User className="w-4 h-4 text-slate-500" /></div>
                Reviewer avatars shown throughout this page have no alt text.
            </div>
        </div>
    );
}
