import { X } from 'lucide-react';

export default function NewsletterModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative transform scale-100 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                    aria-label="Close Newsletter Modal"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Wait! Don't miss out!</h2>
                <p className="text-slate-600 mb-6 text-sm">Subscribe to our newsletter to receive 50% off your first order. This modal blocks all underlying interactions until dismissed.</p>
                <input type="email" placeholder="Enter your email" className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" />
                <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Subscribe & Close
                </button>
                <div className="mt-4 text-center">
                    <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 underline">No thanks, I prefer paying full price</button>
                </div>
            </div>
        </div>
    );
}
