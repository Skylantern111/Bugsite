import { useState } from 'react';
import { useCart } from '../context/cartStore';

const STEPS = ['Shipping', 'Payment', 'Review', 'Confirm'];

export default function Checkout() {
    // === BUG 12: History Desync ===
    // The wizard step lives entirely in local state — the URL stays on
    // /checkout the whole time. Pressing the browser Back button exits
    // checkout completely instead of returning to the previous step,
    // because there's no route history entry to go back to.
    const [step, setStep] = useState(1);
    const { cart } = useCart();

    const [address, setAddress] = useState('');

    // === BUG 24: ReDoS ===
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState(null);
    const validatePromoCode = () => {
        // Catastrophic-backtracking pattern: nested quantifier + optional
        // trailing space, repeated. A crafted string with no valid match at
        // the end causes exponential backtracking and locks the tab.
        const badRegex = /^([a-zA-Z0-9]+\s?)*$/;
        console.warn('Validating promo code against a catastrophic-backtracking regex...');
        const isValid = badRegex.test(promoCode);
        setPromoStatus(isValid ? 'Promo code format OK (not necessarily a real code)' : 'Invalid characters in promo code');
    };

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
    const prev = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <div className="max-w-2xl mx-auto w-full p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

            <div className="flex items-center justify-between mb-8 px-2">
                {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center flex-grow last:flex-grow-0">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {i + 1}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1">{label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className="flex-grow h-1 bg-slate-100 mx-2"></div>}
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[220px] flex flex-col">
                {step === 1 && (
                    <div className="flex-grow">
                        <h2 className="font-semibold text-slate-800 mb-1">Shipping Details</h2>
                        <p className="text-sm text-slate-500 mb-4">Enter your delivery address</p>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full px-3 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="123 Main St, City, State ZIP"
                        />
                    </div>
                )}
                {step === 2 && (
                    <div className="flex-grow">
                        <h2 className="font-semibold text-slate-800 mb-1">Payment</h2>
                        <p className="text-sm text-slate-500 mb-4">This is a training environment — no real payment is processed.</p>
                        <input className="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full px-3 text-sm mb-3" placeholder="Card number" />
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Promo Code / Gift Note</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="flex-grow h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm"
                                    placeholder="e.g. WELCOME10"
                                />
                                <button onClick={validatePromoCode} className="bg-slate-800 text-white px-4 rounded-lg text-sm font-medium hover:bg-slate-700 cursor-pointer">
                                    Apply
                                </button>
                            </div>
                            {promoStatus && <p className="text-xs text-slate-500 mt-2">{promoStatus}</p>}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="flex-grow">
                        <h2 className="font-semibold text-slate-800 mb-3">Review Order</h2>
                        <div className="space-y-1 text-sm mb-3">
                            {cart.map((i) => (
                                <div key={i.id} className="flex justify-between"><span className="text-slate-600">{i.name} × {i.qty}</span><span className="text-slate-800">${(i.price * i.qty).toFixed(2)}</span></div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold border-t border-slate-200 pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                )}
                {step === 4 && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <h2 className="font-bold text-lg text-slate-800 mb-2">Order Confirmed 🎉</h2>
                        <p className="text-sm text-slate-500">Thanks for shopping at BugSite.</p>
                    </div>
                )}

                <div className="flex justify-between gap-3 mt-6">
                    <button onClick={prev} disabled={step === 1} className="flex-1 py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 disabled:opacity-40 cursor-pointer">
                        ← Back
                    </button>
                    <button onClick={next} disabled={step === STEPS.length} className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 cursor-pointer">
                        {step === STEPS.length - 1 ? 'Place Order' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
