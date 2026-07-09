import { useEffect, useState } from 'react';
import { MessageSquare, X, Activity } from 'lucide-react';

// Persistent floating support widget, mounted on every page. Keyed by route
// in App.jsx so it fully remounts on every SPA navigation — that's what
// makes Bug 3 and Bug 13 accumulate across a normal browsing session instead
// of firing once.
export default function SupportChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
    const [mountCount] = useState(() => {
        const next = ((window).__chatWidgetMounts || 0) + 1;
        (window).__chatWidgetMounts = next;
        return next;
    });

    // === BUG 3: Memory Leak ===
    // Scroll/resize listeners attached on every mount, never removed.
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        // MISSING CLEANUP — every route change remounts this widget and
        // leaks two more listeners onto `window`.
    }, []);

    // === BUG 13: Listener Accumulator ===
    useEffect(() => {
        if ((window).__leakedListenersCount > 20) {
            console.warn('Safety cap reached: stopped adding intentional memory leaks to save CPU.');
            return;
        }
        const handleKeyPress = (e) => {
            console.log('[chat widget] Key pressed:', e.key);
        };
        window.addEventListener('keydown', handleKeyPress);
        (window).__leakedListenersCount = ((window).__leakedListenersCount || 0) + 1;
        // MISSING CLEANUP
    }, []);

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {isOpen && (
                <div className="mb-3 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
                        <span className="font-semibold text-sm">BugSite Support</span>
                        <button onClick={() => setIsOpen(false)} className="cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 text-xs text-slate-500 space-y-2">
                        <p>Hi! An agent will be with you shortly.</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5 text-slate-400">
                            <Activity className="w-3 h-3" /> widget mount #{mountCount} · scrollY {Math.floor(scrollY)} · {viewport.w}x{viewport.h}
                        </div>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg cursor-pointer"
                aria-label="Toggle support chat"
            >
                <MessageSquare className="w-5 h-5" />
            </button>
        </div>
    );
}
