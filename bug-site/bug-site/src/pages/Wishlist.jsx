import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const initialWishlist = [
    { id: 'p1', product: PRODUCTS.find((p) => p.id === 'p1'), note: 'Get for mom\'s birthday' },
    { id: 'p6', product: PRODUCTS.find((p) => p.id === 'p6'), note: 'Wait for a sale' },
    { id: 'p8', product: PRODUCTS.find((p) => p.id === 'p8'), note: 'Matches the new desk' },
];

export default function Wishlist() {
    const [items, setItems] = useState(initialWishlist);

    // === BUG 21: Index as Key (State Corruption) ===
    // Deleting an item shifts every subsequent item's array index down by
    // one. Since the list below is keyed by `index` instead of `item.id`,
    // React reuses the DOM node for that index and its underlying
    // uncontrolled <input defaultValue> — so any note you'd typed into the
    // item below the one you deleted appears to jump onto the wrong
    // product.
    const handleDelete = (indexToRemove) => {
        setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-10 text-center">
                <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">Your wishlist is empty.</p>
                <Link to="/catalog" className="text-indigo-600 font-semibold text-sm">Browse the catalog →</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Saved Items</h1>
            <p className="text-sm text-slate-500 -mt-4">Add a personal note to each item, then try deleting the one above it.</p>

            <div className="space-y-2">
                {items.map((item, index) => (
                    // BUG: using `index` instead of `item.id` as the key
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-2xl">{item.product.emoji}</span>
                        <div className="flex-grow">
                            <p className="text-sm font-medium text-slate-800">{item.product.name}</p>
                            <input
                                type="text"
                                defaultValue={item.note}
                                placeholder="Add a note..."
                                className="w-full text-xs bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-500 px-1 py-1 mt-1"
                            />
                        </div>
                        <button
                            onClick={() => handleDelete(index)}
                            className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
