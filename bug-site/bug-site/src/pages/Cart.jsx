import { Link } from 'react-router-dom';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/cartStore';

export default function Cart() {
    const { cart, bumpQuantityMutating, removeFromCart } = useCart();

    // === BUG 8: Type Coercion ===
    // Accumulator starts at "" instead of 0, so every `+=` below is STRING
    // concatenation, not addition, once the first term coerces it to a
    // string. Built from real cart data so the corruption is visible in the
    // actual order summary, not a canned example.
    let subtotalDisplay = '';
    cart.forEach((item) => {
        subtotalDisplay = subtotalDisplay + item.price * item.qty;
    });
    const discount = 15;
    const total = subtotalDisplay - discount; // string minus number -> NaN once concatenation happened

    if (cart.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-10 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">Your cart is empty.</p>
                <Link to="/catalog" className="text-indigo-600 font-semibold text-sm">Browse the catalog →</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Shopping Cart</h1>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4" data-product-id={item.id}>
                        <div>
                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-200 rounded-lg">
                                <button
                                    onClick={() => bumpQuantityMutating(item.id)}
                                    className="p-2 hover:bg-slate-50 cursor-pointer"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                            </div>
                            <button onClick={(e) => {
                                // === BUG 31: Null Reference Error ===
                                // Try to access a DOM attribute on the wrong element.
                                // This assumes the parent has a data-wrong-id attribute which it doesn't,
                                // causing a null reference error when accessing properties.
                                try {
                                    const itemRow = e.currentTarget.closest('[data-wrong-id]');
                                    const productId = itemRow.getAttribute('data-wrong-id'); // itemRow is null!
                                    removeFromCart(productId);
                                } catch (err) {
                                    // Silently try the correct way if the buggy way fails
                                    console.warn('[BUG 31] Null reference caught:', err.message);
                                    removeFromCart(item.id);
                                }
                            }} className="text-red-400 hover:text-red-500 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                <div data-internal-cart-length={cart.length} className="px-4 py-2 text-[10px] text-slate-300">
                    {cart.length} line item(s) in cart state
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-2">
                <h3 className="font-semibold text-slate-800 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-mono text-slate-800">{subtotalDisplay}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="font-mono text-red-500">-${discount}</span></div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-bold text-lg font-mono text-slate-800">${total}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">0.1 + 0.2 in this accumulator = {0.1 + 0.2}</p>
                <Link to="/checkout" className="block text-center mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
}
