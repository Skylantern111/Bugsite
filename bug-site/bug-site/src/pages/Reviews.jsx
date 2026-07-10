import { useEffect, useState } from 'react';
import { MessagesSquare, Send, Loader2, Star } from 'lucide-react';
import { fetchProducts, fetchReviews, createReview } from '../lib/api';
import StarRating from '../components/ui/StarRating';
import BackendRequired from '../components/ui/BackendRequired';

// Community Reviews — fully DB-backed. Reviews submitted here are POSTed to
// MongoDB and read back from it; there is no static fallback. Text is rendered
// as escaped plain text (this page is bug-free by design — the intentional
// stored-XSS vector, Bug 6, lives only on the Product Details page).
export default function Reviews() {
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState(null);

    const [form, setForm] = useState({ productSlug: '', author: '', rating: 5, title: '', text: '' });

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const [prods, revs] = await Promise.all([fetchProducts(), fetchReviews()]);
            setProducts(prods);
            setReviews(revs);
            setForm((f) => ({ ...f, productSlug: f.productSlug || prods[0]?.slug || '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setNotice(null);
        try {
            const created = await createReview(form);
            setReviews((prev) => [created, ...prev]);
            setForm((f) => ({ ...f, author: '', title: '', text: '', rating: 5 }));
            setNotice('✅ Review posted and saved to the database.');
        } catch (err) {
            setNotice(`❌ ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    }

    const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-8">
            <header>
                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <MessagesSquare className="w-3.5 h-3.5" /> Community · Live from MongoDB
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900">Product Reviews</h1>
                <p className="text-sm text-slate-500">Every review here is stored in and served from the database.</p>
            </header>

            {loading ? (
                <div className="bs-card rounded-2xl p-10 flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading reviews…
                </div>
            ) : error ? (
                <BackendRequired error={error} onRetry={load} />
            ) : (
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Submit form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 bs-card rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-28">
                        <h2 className="font-bold text-slate-800">Write a review</h2>
                        <label className="block">
                            <span className="text-xs font-semibold text-slate-500">Product</span>
                            <select value={form.productSlug} onChange={update('productSlug')} required
                                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                                {products.map((p) => <option key={p.slug} value={p.slug}>{p.emoji} {p.name}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-xs font-semibold text-slate-500">Your name</span>
                            <input value={form.author} onChange={update('author')} required maxLength={60}
                                placeholder="@your_handle"
                                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                        </label>
                        <div className="block">
                            <span className="text-xs font-semibold text-slate-500">Rating</span>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button type="button" key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))}
                                        className="p-0.5" aria-label={`${n} stars`}>
                                        <Star className={`w-6 h-6 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="block">
                            <span className="text-xs font-semibold text-slate-500">Title <span className="text-slate-300">(optional)</span></span>
                            <input value={form.title} onChange={update('title')} maxLength={120}
                                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                        </label>
                        <label className="block">
                            <span className="text-xs font-semibold text-slate-500">Review</span>
                            <textarea value={form.text} onChange={update('text')} required rows={4} maxLength={1000}
                                placeholder="Share your experience…"
                                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white resize-none" />
                        </label>
                        <button type="submit" disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? 'Posting…' : 'Post review'}
                        </button>
                        {notice && <p className="text-xs text-center text-slate-500">{notice}</p>}
                        <p className="text-[11px] text-slate-400 text-center">Training target — do not enter real personal data.</p>
                    </form>

                    {/* Review feed */}
                    <div className="lg:col-span-3 space-y-3">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{reviews.length} reviews</p>
                        {reviews.length === 0 && (
                            <div className="bs-card rounded-2xl p-8 text-center text-slate-400 text-sm">No reviews yet — be the first.</div>
                        )}
                        {reviews.map((r) => (
                            <article key={r.id} className="bs-card rounded-2xl p-5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-bold text-slate-800">{r.author}</span>
                                    <StarRating rating={r.rating} />
                                </div>
                                <p className="text-[11px] font-semibold text-violet-500 mb-2">{r.productName}</p>
                                {r.title && <p className="font-semibold text-slate-700 text-sm">{r.title}</p>}
                                {/* Plain text render — intentionally NOT dangerouslySetInnerHTML. */}
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{r.text}</p>
                                {r.createdAt && (
                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
