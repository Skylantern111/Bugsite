import { useState } from 'react';
import { CartContext } from './cartStore';

export function CartProvider({ children }) {
    const [cart, setCart] = useState([
        { id: 'p1', name: 'Premium Noise-Canceling Headphones', price: 79.99, qty: 1 },
        { id: 'p2', name: 'USB-C Hub (7-in-1)', price: 34.50, qty: 1 },
        { id: 'p3', name: 'Mechanical Keyboard (TKL)', price: 129.00, qty: 1 },
    ]);

    // Real add-to-cart flow (Catalog / PDP "Add to Cart" buttons) — this one
    // works correctly so the store is actually usable.
    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
        });
    };

    // === BUG 2: State Mutation ===
    // The "+" quantity stepper on the Cart page mutates the array directly
    // instead of calling setCart. React never sees a new reference, so the
    // line item's displayed quantity silently stops updating — but
    // cart.length (read via data-internal-cart-length in Cart.jsx) proves
    // the underlying array really did grow.
    const bumpQuantityMutating = (itemId) => {
        const item = cart.find((i) => i.id === itemId);
        if (!item) return;
        item.qty = item.qty + 1; // DIRECT MUTATION — no setCart call
        console.log('Bumped quantity (UI wont update due to mutation)', cart);
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, bumpQuantityMutating, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}
