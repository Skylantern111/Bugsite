export default function CookieConsentBanner({ onAccept }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 z-50 flex justify-between items-center shadow-2xl border-t border-slate-700">
            <p className="text-sm">We use tracking cookies. By clicking accept, you agree to our ToS.</p>
            <button onClick={onAccept} className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded font-bold text-sm">
                Accept All
            </button>
        </div>
    );
}
