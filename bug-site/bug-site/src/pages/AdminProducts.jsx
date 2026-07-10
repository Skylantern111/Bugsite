import { useEffect, useState } from 'react';
import { PackagePlus, Trash2, Save, Loader2, Boxes, X } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';
import BackendRequired from '../components/ui/BackendRequired';

const CATEGORY_OPTIONS = ['Audio', 'Peripherals', 'Desk Setup', 'Components', 'Wearables', 'Storage', 'Networking', 'Gaming'];
const BLANK = { name: '', category: 'Components', brand: '', price: '', stock: '', emoji: '📦', description: '' };

// Admin Product Manager — DB-backed CRUD. Every change here is written to
// MongoDB and shows up on the Catalog after a refresh. No static fallback:
// without the backend this page cannot function. Manages store data only
// (never shopper PII), and touches no bug logic.
export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);

    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [busySlug, setBusySlug] = useState(null);
    // Local edits keyed by slug: { price, stock }
    const [edits, setEdits] = useState({});

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const list = await fetchProducts();
            setProducts(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    async function handleCreate(e) {
        e.preventDefault();
        setBusySlug('__new__');
        setNotice(null);
        try {
            const created = await createProduct({
                ...form,
                price: Number(form.price),
                stock: Number(form.stock || 0),
            });
            setProducts((prev) => [...prev, created]);
            setForm(BLANK);
            setCreating(false);
            setNotice(`✅ Created "${created.name}" in the database.`);
        } catch (err) {
            setNotice(`❌ ${err.message}`);
        } finally {
            setBusySlug(null);
        }
    }

    async function handleSave(slug) {
        const patch = edits[slug];
        if (!patch) return;
        setBusySlug(slug);
        setNotice(null);
        try {
            const updated = await updateProduct(slug, {
                price: Number(patch.price),
                stock: Number(patch.stock),
            });
            setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...updated } : p)));
            setEdits((e) => { const n = { ...e }; delete n[slug]; return n; });
            setNotice(`✅ Saved "${updated.name}".`);
        } catch (err) {
            setNotice(`❌ ${err.message}`);
        } finally {
            setBusySlug(null);
        }
    }

    async function handleDelete(slug, name) {
        if (!window.confirm(`Delete "${name}" from the database?`)) return;
        setBusySlug(slug);
        setNotice(null);
        try {
            await deleteProduct(slug);
            setProducts((prev) => prev.filter((p) => p.slug !== slug));
            setNotice(`🗑️ Deleted "${name}".`);
        } catch (err) {
            setNotice(`❌ ${err.message}`);
        } finally {
            setBusySlug(null);
        }
    }

    const setEdit = (slug, key, value, current) =>
        setEdits((e) => ({ ...e, [slug]: { price: current.price, stock: current.stock, ...e[slug], [key]: value } }));

    return (
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <Boxes className="w-3.5 h-3.5" /> Admin · Live from MongoDB
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900">Product Manager</h1>
                    <p className="text-sm text-slate-500">Create, edit, and delete products directly in the database.</p>
                </div>
                {!error && !loading && (
                    <button onClick={() => setCreating((v) => !v)}
                        className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors">
                        {creating ? <X className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
                        {creating ? 'Cancel' : 'Add product'}
                    </button>
                )}
            </header>

            {notice && <div className="bs-card rounded-xl px-4 py-2.5 text-sm text-slate-600">{notice}</div>}

            {loading ? (
                <div className="bs-card rounded-2xl p-10 flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading products…
                </div>
            ) : error ? (
                <BackendRequired error={error} onRetry={load} />
            ) : (
                <>
                    {creating && (
                        <form onSubmit={handleCreate} className="bs-card rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <label className="block sm:col-span-2 lg:col-span-1">
                                <span className="text-xs font-semibold text-slate-500">Name *</span>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Category</span>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                                    {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Brand</span>
                                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Price *</span>
                                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Stock</span>
                                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Emoji</span>
                                <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <label className="block sm:col-span-2 lg:col-span-3">
                                <span className="text-xs font-semibold text-slate-500">Description</span>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                            </label>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <button type="submit" disabled={busySlug === '__new__'}
                                    className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60">
                                    {busySlug === '__new__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
                                    Create in database
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="bs-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[640px]">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 w-28">Price</th>
                                        <th className="px-4 py-3 w-24">Stock</th>
                                        <th className="px-4 py-3 w-40 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => {
                                        const edit = edits[p.slug];
                                        const dirty = edit && (Number(edit.price) !== p.price || Number(edit.stock) !== p.stock);
                                        const busy = busySlug === p.slug;
                                        return (
                                            <tr key={p.slug} className="border-b border-slate-50 hover:bg-slate-50/60">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{p.emoji}</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                                                            <p className="text-[11px] text-slate-400">{p.brand} · {p.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{p.category}</td>
                                                <td className="px-4 py-3">
                                                    <input type="number" step="0.01" min="0"
                                                        value={edit ? edit.price : p.price}
                                                        onChange={(e) => setEdit(p.slug, 'price', e.target.value, p)}
                                                        className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input type="number" min="0"
                                                        value={edit ? edit.stock : p.stock}
                                                        onChange={(e) => setEdit(p.slug, 'stock', e.target.value, p)}
                                                        className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button onClick={() => handleSave(p.slug)} disabled={!dirty || busy}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                                                        </button>
                                                        <button onClick={() => handleDelete(p.slug, p.name)} disabled={busy}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                        {products.length} products in <code className="bg-slate-100 px-1.5 py-0.5 rounded">bugsite.products</code> · changes persist to MongoDB.
                    </p>
                </>
            )}
        </div>
    );
}
