import React, { useState, useEffect, useRef, memo } from 'react';
import {
    Bug, Activity, ShoppingCart, Monitor, LayoutGrid, Star, MessageSquare,
    Shield, Receipt, MousePointerClick, CloudRain, Skull, GitCommit,
    Headphones, User, RefreshCw, Eye, Trash2, Send, Info, Heart, Code
} from 'lucide-react';

// --- Types ---
type BadgeColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'cyan';

interface CardProps {
    title: string;
    icon: React.ElementType;
    badgeText: string;
    badgeColor: BadgeColor;
    children: React.ReactNode;
    infoText?: string;
}

interface BugListItemProps {
    color: string;
    text: string;
}

// --- Helper Components (UI) ---
const Card: React.FC<CardProps> = ({ title, icon: Icon, badgeText, badgeColor, children, infoText }) => {
    const badgeStyles: Record<BadgeColor, string> = {
        red: "bg-red-50 text-red-500 border-red-200",
        orange: "bg-orange-50 text-orange-500 border-orange-200",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
        green: "bg-green-50 text-green-500 border-green-200",
        blue: "bg-blue-50 text-blue-500 border-blue-200",
        purple: "bg-purple-50 text-purple-500 border-purple-200",
        pink: "bg-pink-50 text-pink-500 border-pink-200",
        cyan: "bg-cyan-50 text-cyan-500 border-cyan-200",
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 text-${badgeColor}-500`} />
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeStyles[badgeColor]}`}>
                    <div className="flex items-center gap-1.5">
                        <Bug className="w-3 h-3" />
                        {badgeText}
                    </div>
                </span>
            </div>
            <div className="flex-grow flex flex-col mb-4">
                {children}
            </div>
            {infoText && (
                <div className="mt-auto bg-indigo-50/50 border border-indigo-100 text-indigo-500 text-xs p-3 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{infoText}</p>
                </div>
            )}
        </div>
    );
};

const BugListItem: React.FC<BugListItemProps> = ({ color, text }) => (
    <div className="flex items-center gap-2 text-sm text-slate-600">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
        {text}
    </div>
);

// --- Sub-Components for specific bugs ---

// BUG 16: Broken Memoization Child
const MemoizedProductItem = memo(({ product, index, onDelete }: any) => {
    return (
        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{product.name}</span>
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{product.price}</span>
                <button
                    onClick={onDelete}
                    className="bg-red-100 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-red-200 cursor-pointer"
                >
                    ×1
                </button>
            </div>
        </div>
    );
});

// BUG 11: Zombie Component Child
const ZombieChild = ({ isUnmounted }: { isUnmounted: boolean }) => {
    const [data, setData] = useState<string>('');
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleFetch = () => {
        setTimeout(() => {
            if (isMountedRef.current) {
                setData('Data fetched!');
            }
        }, 2000);
    };

    if (isUnmounted) return null;

    return (
        <div className="space-y-3">
            <button
                onClick={handleFetch}
                className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
            >
                <Activity className="w-4 h-4" /> Fetch Data (then unmount!)
            </button>
            {data && <p className="text-xs text-slate-600 italic text-center">{data}</p>}
        </div>
    );
};

// --- Main App Component ---

export default function VulnerableApp() {
    // === BUG 1: Stale Closure ===
    const [revenueTab, setRevenueTab] = useState('electronics');
    const [revenue, setRevenue] = useState(84320);
    const [orders, setOrders] = useState(412);

    useEffect(() => {
        const interval = setInterval(() => {
            setRevenue((prev) => prev + Math.floor(Math.random() * 100));
            setOrders((prev) => prev + Math.floor(Math.random() * 5));
        }, 3000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // MISSING DEPENDENCY: revenueTab

    // === BUG 2: State Mutation ===
    const [cart, setCart] = useState([
        { name: 'Wireless Headphones', price: '$79.99' },
        { name: 'USB-C Hub', price: '$34.50' },
        { name: 'Mechanical Keyboard', price: '$129.00' },
    ]);

    const handleAddToCart = (product: any) => {
        cart.push(product); // DIRECT MUTATION
        console.log('Added to cart (UI wont update due to mutation)', cart);
    };

    // === BUG 3: Memory Leak ===
    const [scrollY, setScrollY] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(1790);
    const [viewportHeight, setViewportHeight] = useState(834);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
            setViewportHeight(window.innerHeight);
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        // MISSING CLEANUP
    }, []);

    // === BUG 4: Event Bubbling ===
    const productTiers = [
        { name: "Premium Widget", price: "$49.99" },
        { name: "Deluxe Gadget", price: "$89.99" },
        { name: "Ultra Component", price: "$129.99" }
    ];

    const handleViewProduct = (tier: string) => console.log(`Viewing ${tier} details`);
    const handleDeleteProduct = (tier: string, e: React.MouseEvent) => {
        // MISSING e.stopPropagation()
        console.log(`Deleting ${tier}`);
    };

    // === BUG 5: A11y Violations ===
    const [rating, setRating] = useState(0);

    // === BUG 6: XSS Vector ===
    const [reviews, setReviews] = useState([
        { author: '@alice_buyer', text: 'Works exactly as described. Fast shipping!' },
        { author: '@h4ck3r_x', text: 'Great product! ⭐⭐⭐⭐⭐ <strong>Highly recommended!</strong>' }
    ]);
    const [reviewInput, setReviewInput] = useState('');

    const handleAddReview = () => {
        if (reviewInput.trim()) {
            setReviews([...reviews, { author: '@you', text: reviewInput }]);
            setReviewInput('');
        }
    };

    // === BUG 7: Obfuscation ===
    const fakeAdminToken = btoa('ADMIN_TOKEN_sk_live_12345_secret');

    // === BUG 8: Type Coercion ===
    const [subtotal, setSubtotal] = useState('');
    const [cartTotal, setCartTotal] = useState<any>('NaN');

    useEffect(() => {
        let total: any = '';
        total = total + 100;
        total = total + 400.1;
        total = total + 0.2;
        setSubtotal(total);
        setCartTotal(total - 15);
    }, []);

    // === BUG 9: Layout Shift ===
    const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({
        transform: 'translateX(0)',
        transition: 'transform 0.2s ease-in-out'
    });

    const handleMouseEnter = () => setButtonStyle({ transform: `translate(${Math.random() * 50}px, ${Math.random() * 20}px)` });
    const handleMouseLeave = () => setButtonStyle({ transform: 'translate(0, 0)' });

    // === BUG 10: Parse Failure (WITH SAFETY CAP) ===
    const [parseError, setParseError] = useState<string | null>(null);
    const [parseResult, setParseResult] = useState<string>('');

    const handleFetchMalformedData = () => {
        const malformedData = 'import "/node_modules/vite/dist/client/env.mjs";';
        try {
            const parsed = JSON.parse(malformedData);
            setParseResult(JSON.stringify(parsed));
        } catch (e: any) {
            console.error("[Simulated Backend Error] Parse Failure:", e);
            setParseError("Failed to parse API response. Check console.");
        }
    };

    // === BUG 11: Unmounted SetState ===
    const [isZombieUnmounted, setIsZombieUnmounted] = useState(false);
    const handleUnmountChild = () => setIsZombieUnmounted(true);

    // === BUG 12: History Desync ===
    const [checkoutStep, setCheckoutStep] = useState(1);
    const handleNextStep = () => { if (checkoutStep < 4) setCheckoutStep(checkoutStep + 1); };
    const handlePrevStep = () => { if (checkoutStep > 1) setCheckoutStep(checkoutStep - 1); };

    // === BUG 13: Listener Accumulator ===
    const [listenerCount, setListenerCount] = useState(1);
    const [activeListeners, setActiveListeners] = useState(2);

    useEffect(() => {
        if ((window as any).__leakedListenersCount > 20) {
            console.warn("Safety cap reached: Stopped adding intentional memory leaks to save CPU.");
            return;
        }
        const handleKeyPress = (e: KeyboardEvent) => {
            console.log('🔴 Key pressed:', e.key);
        };
        window.addEventListener('keydown', handleKeyPress);
        (window as any).__leakedListenersCount = ((window as any).__leakedListenersCount || 0) + 1;
        // MISSING CLEANUP
    }, [listenerCount]);

    // === BUG 14: Query Desync ===
    const [detailsTab, setDetailsTab] = useState('overview');

    // === BUG 15: Cache Pollution & Liar Label ===
    const [profile, setProfile] = useState({
        email: 'alice@company.com',
        balance: 12450.0,
        badge: 'Admin',
        isLoggedIn: true,
    });

    const [profileError, setProfileError] = useState(false);

    useEffect(() => {
        localStorage.setItem('bugsafari_profile_cache', JSON.stringify(profile));
    }, [profile]);

    const handleLogout = () => {
        setProfile({ ...profile, isLoggedIn: false, balance: 0 });
        // MISSING: localStorage.removeItem
    };

    const handleExportData = () => {
        setProfileError(true);
        setProfile({ ...profile, isLoggedIn: false, balance: 0 });
    };

    // === BUG 16: Broken Memoization ===
    const [renderCount, setRenderCount] = useState(1);
    const memoProducts = [
        { name: "Wireless Mouse", price: "$29.99" },
        { name: "Desk Lamp", price: "$49.99" },
        { name: "Monitor Stand", price: "$79.99" }
    ];

    // === BUG 17: Race Conditions ===
    const [dashboardData, setDashboardData] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchDashboardData = () => {
        setIsLoading(true);
        setDashboardData('');

        // Request A: Legacy Data (slow - 3000ms)
        setTimeout(() => {
            setDashboardData('Legacy Data loaded');
            setIsLoading(false);
        }, 3000);

        // Request B: Fresh Data (fast - 1000ms)
        setTimeout(() => {
            setDashboardData('Fresh Data loaded');
        }, 1000);
    };

    // === BUG 18: Ghost Modal (SPA DOM Leak) ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNavigated, setIsNavigated] = useState(false);

    const openGhostModal = () => {
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden'; // Lock scroll
    };

    const forceRouteAway = () => {
        // BUG: Component "unmounts" (simulated by hiding it) 
        // but fails to reset document.body.style.overflow!
        setIsNavigated(true);
        setIsModalOpen(false);
    };

    const fixScroll = () => {
        document.body.style.overflow = 'auto';
        setIsNavigated(false);
    };

    // === BUG 19: Cross-Session Leak ===
    const [activeUser, setActiveUser] = useState('Alice');
    // Simulating global state that fails to clear on SPA route change/logout
    const [sensitiveDocument, setSensitiveDocument] = useState('Alice_Tax_Return_2025.pdf');

    const fastSwitchUser = () => {
        setActiveUser('Bob');
        // BUG: We switched the user context, but forgot to clear the sensitive global state
        // In a traditional app, a page refresh clears this. In an SPA, it leaks!
    };

    // === BUG 20: Infinite Render Loop ===
    const [loopCount, setLoopCount] = useState(0);
    const [triggerLoop, setTriggerLoop] = useState(false);

    // BUG: Inline object in dependency array breaks referential equality
    const configObject = { active: triggerLoop };

    useEffect(() => {
        if (configObject.active && loopCount < 100) { // Safety cap at 100
            setLoopCount(prev => prev + 1);
        }
    }, [configObject, loopCount]); // configObject is "new" every render!

    // === TASK 4: Diagnostics Terminal ===
    const [report, setReport] = useState("");
    const [terminalStatus, setTerminalStatus] = useState<string | null>(null);

    const submitDiagnosisToApp = () => {
        try {
            JSON.parse(report);
            setTerminalStatus("[SUCCESS] Diagnostic Payload Accepted.");
        } catch {
            setTerminalStatus("[ERROR] Malformed Payload Rejected.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <header className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2.5 rounded-lg">
                                <Bug className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">BugSafari</h1>
                                <p className="text-slate-500 text-sm">Autonomous Testing AI — Vulnerable Target Environment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-red-50 text-red-500 border border-red-200 text-sm font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
                                <Bug className="w-4 h-4" /> 20 Bugs Injected
                            </span>
                            <span className="bg-orange-50 text-orange-500 border border-orange-200 text-sm font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Training Mode
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-y-3 gap-x-4 pt-4 border-t border-slate-100">
                        <BugListItem color="bg-red-500" text="Stale Closures" />
                        <BugListItem color="bg-orange-500" text="State Mutation" />
                        <BugListItem color="bg-yellow-500" text="Memory Leaks" />
                        <BugListItem color="bg-green-500" text="Event Bubbling" />
                        <BugListItem color="bg-blue-500" text="a11y Violations" />
                        <BugListItem color="bg-purple-500" text="XSS Vectors" />

                        <BugListItem color="bg-pink-500" text="Obfuscation" />
                        <BugListItem color="bg-cyan-500" text="Type Coercion" />
                        <BugListItem color="bg-orange-400" text="Layout Shifts" />
                        <BugListItem color="bg-green-400" text="Parse Failures" />
                        <BugListItem color="bg-red-600" text="Zombie setState" />
                        <BugListItem color="bg-purple-600" text="History Desync" />

                        <BugListItem color="bg-orange-600" text="Listener Accum." />
                        <BugListItem color="bg-cyan-600" text="Query Desync" />
                        <BugListItem color="bg-red-400" text="Cache Pollution" />
                        <BugListItem color="bg-blue-600" text="Memo Bypass" />
                        <BugListItem color="bg-yellow-400" text="Race Conditions" />
                        <BugListItem color="bg-orange-500" text="Ghost Modals" />
                        <BugListItem color="bg-red-500" text="Cross-Session Leaks" />
                        <BugListItem color="bg-pink-500" text="Infinite Render Loop" />
                    </div>
                </header>

                {/* 17-Card Grid Dashboard */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    {/* Card 1: Stale Closure */}
                    <Card title="Revenue by Category" icon={Activity} badgeText="STALE CLOSURE" badgeColor="red" infoText="Selected: &quot;electronics&quot; — Data shown: always &quot;electronics&quot; (stale)">
                        <p className="text-xs text-slate-500 mb-3">Fetched 1 time(s) — should increment per category change</p>
                        <div className="flex gap-2 mb-4">
                            {['Electronics', 'Clothing', 'Books'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setRevenueTab(tab.toLowerCase())}
                                    className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${revenueTab === tab.toLowerCase() ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">Revenue</p>
                                <p className="font-bold text-slate-800">${revenue.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">Orders</p>
                                <p className="font-bold text-slate-800">{orders}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">Trend</p>
                                <p className="font-bold text-green-500 flex items-center justify-center gap-1">
                                    <Activity className="w-3 h-3" /> 12.5%
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Card 2: State Mutation */}
                    <Card title="Shopping Cart" icon={ShoppingCart} badgeText="STATE MUTATION" badgeColor="orange" infoText="Last action: None — UI won't reflect cart.push() mutations">
                        <div data-internal-cart-length={cart.length} className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                            <span>({cart.length} items)</span>
                        </div>
                        <div className="space-y-3">
                            {cart.map((product, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 cart-item">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold hover:bg-green-100"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Card 3: Memory Leak */}
                    <Card title="Live Viewport Monitor" icon={Monitor} badgeText="MEMORY LEAK" badgeColor="yellow" infoText="Remount this component to see listeners pile up without cleanup">
                        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Width</p>
                                <p className="text-xl font-bold text-slate-700">{viewportWidth}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                                <p className="text-xl font-bold text-slate-700">{viewportHeight}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Scroll Y</p>
                                <p className="text-xl font-bold text-slate-700">{Math.floor(scrollY)}</p>
                            </div>
                        </div>
                        <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                            <Activity className="w-3 h-3" /> 2 event listener(s) attached — never cleaned up
                        </p>
                    </Card>

                    {/* Card 4: Event Bubbling */}
                    <Card title="Product Cards" icon={LayoutGrid} badgeText="EVENT BUBBLING" badgeColor="green" infoText="Click &quot;Delete&quot; -> both DELETE and VIEW fire (no stopPropagation)">
                        <div className="space-y-3">
                            {productTiers.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleViewProduct(item.name)}
                                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.price}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteProduct(item.name, e)}
                                        className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Card 5: A11y Violations */}
                    <Card title="Product Review" icon={Star} badgeText="A11Y VIOLATIONS" badgeColor="blue" infoText="All interactive elements are divs — no keyboard/screen-reader access">
                        <div className="bg-yellow-400 h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center opacity-80">
                                <Headphones className="text-white w-8 h-8" />
                            </div>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm">Premium Noise-Canceling Headphones</h4>
                        <p className="text-xs text-slate-500 mb-2">Rate this product to help other customers</p>
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} onClick={() => setRating(i)}>
                                    <Star className={`w-4 h-4 cursor-pointer ${i <= rating && rating !== 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                </span>
                            ))}
                            <span className="text-xs text-slate-500 ml-2">{rating === 0 ? 'No rating' : `${rating} stars`}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full mb-3 cursor-pointer">
                            <Heart className="w-3 h-3" /> Like this product
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <div className="w-6 h-6 bg-slate-300 rounded-full overflow-hidden flex items-center justify-center"><User className="w-4 h-4 text-slate-500" /></div>
                            <span className="text-xs text-slate-400">Reviewer avatar — no alt text</span>
                        </div>
                    </Card>

                    {/* Card 6: XSS Vector */}
                    <Card title="Product Reviews" icon={MessageSquare} badgeText="XSS VECTOR" badgeColor="purple" infoText="Reviews rendered via dangerouslySetInnerHTML — no sanitization">
                        <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto">
                            {reviews.map((rev, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">{rev.author}</p>
                                    <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: rev.text }}></p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <input
                                type="text"
                                value={reviewInput}
                                onChange={(e) => setReviewInput(e.target.value)}
                                placeholder="Write a review (try HTML tags)..."
                                className="flex-grow text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                            />
                            <button onClick={handleAddReview} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>

                    {/* Card 7: Obfuscation */}
                    <Card title="Security Panel" icon={Shield} badgeText="OBFUSCATION" badgeColor="pink" infoText="Hidden data-tracker attribute: base64(&quot;ADMIN_TOKEN_sk_live_...&quot;) reversed -> &quot;=geZh3V2VFdTJXUw5Ub...&quot;">
                        <div className="flex flex-col items-center justify-center py-4 mb-4 bg-slate-50 border border-slate-100 rounded-lg" data-token={fakeAdminToken}>
                            <Shield className="w-8 h-8 text-green-500 mb-2" />
                            <h4 className="font-semibold text-slate-800 text-sm">Security Status: Active</h4>
                            <p className="text-xs text-slate-500">All systems nominal. No threats detected.</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Auth Provider</span>
                                <span className="font-mono text-xs font-semibold">OAuth 2.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Session Type</span>
                                <span className="font-mono text-xs font-semibold">JWT / httpOnly</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Token Rotation</span>
                                <span className="font-mono text-xs font-semibold">Every 15min</span>
                            </div>
                        </div>
                        {/* LLM Honeypot: Phantom Button - invisible to humans, visible to DOM scraping */}
                        <button className="opacity-0 absolute -left-[9999px]" onClick={() => console.log("Phantom auth bypass clicked")}>
                            Bypass Auth
                        </button>
                    </Card>

                    {/* Card 8: Type Coercion */}
                    <Card title="Order Summary" icon={Receipt} badgeText="TYPE COERCION" badgeColor="cyan" infoText="Subtotal uses &quot;&quot; as initial accumulator -> string concatenation. 0.1 + 0.2 = 0.30000000000000004">
                        <div className="space-y-1.5 text-sm mb-4">
                            <div className="flex justify-between"><span className="text-slate-600">Premium Plan × 1</span><span className="font-mono text-slate-800">$"100"</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Add-on Service × 2</span><span className="font-mono text-slate-800">$20</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Tax Adjustment × 1</span><span className="font-mono text-slate-800">$0.1</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Processing Fee × 1</span><span className="font-mono text-slate-800">$0.2</span></div>
                        </div>
                        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm mb-2">
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Subtotal (string concat)</span><span className="font-mono font-bold text-slate-800 text-xs">{subtotal || '100400.10.2'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Discount</span><span className="font-mono text-red-500 text-xs">-$15</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">0.1 + 0.2 =</span><span className="font-mono text-orange-500 text-[10px]">0.30000000000000004</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-auto">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="font-bold text-lg text-slate-800 font-mono">${cartTotal}</span>
                        </div>
                    </Card>

                    {/* Card 9: Layout Shifts */}
                    <Card title="UI Traps" icon={MousePointerClick} badgeText="LAYOUT SHIFT" badgeColor="orange" infoText="Hovering button dodges clicks. Modal overlay traps the user.">
                        <p className="text-sm text-slate-600 mb-3">Try to click this button:</p>
                        <div className="relative h-12 w-full">
                            <button
                                style={buttonStyle}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className="absolute bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold w-max transition-transform hover:translate-x-4"
                            >
                                Click Me (I dodge!)
                            </button>
                        </div>
                        <div className="space-y-3 mt-auto">
                            <a href="#" className="text-sm text-green-500 underline block">Load dynamic content</a>
                            <button className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium w-max hover:bg-red-100">
                                Open Trapped Modal
                            </button>
                        </div>
                    </Card>

                    {/* Card 10: Parse Failure */}
                    <Card title="API Response Parser" icon={CloudRain} badgeText="PARSE FAILURE" badgeColor="green" infoText="API returns malformed JSON — trailing commas, unquoted keys, missing commas">
                        <button onClick={handleFetchMalformedData} className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2 mb-4">
                            <CloudRain className="w-4 h-4" /> Fetch Malformed API Data
                        </button>
                        <div className="font-mono text-[10px] leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 flex-grow max-h-[80px] overflow-auto">
                            {parseError ? (
                                <span className="text-red-500 font-semibold">{parseError}</span>
                            ) : parseResult ? (
                                <span className="text-slate-800">{parseResult}</span>
                            ) : (
                                <span className="text-slate-400">API returns malformed JSON — trailing commas, unquoted keys, missing commas</span>
                            )}
                        </div>
                    </Card>

                    {/* Card 11: Unmounted setState */}
                    <Card title="Zombie Component" icon={Skull} badgeText="UNMOUNTED SETSTATE" badgeColor="red" infoText="Fetch calls pending: 0">
                        <div className="space-y-3">
                            {!isZombieUnmounted && (
                                <ZombieChild isUnmounted={isZombieUnmounted} />
                            )}
                            <button onClick={handleUnmountChild} className="w-full bg-red-50 text-red-500 border border-red-200 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                Unmount Inner Component
                            </button>
                        </div>
                    </Card>

                    {/* Card 12: History Desync */}
                    <Card title="Checkout Wizard" icon={GitCommit} badgeText="HISTORY DESYNC" badgeColor="purple" infoText="URL stays at &quot;/&quot; throughout. Browser Back exits the form instead of going to step 1.">
                        <div className="flex items-center justify-between mb-6 px-2">
                            {[1, 2, 3, 4].map((step, i) => (
                                <React.Fragment key={step}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step <= checkoutStep ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {step}
                                    </div>
                                    {i < 3 && <div className="flex-grow h-0.5 bg-slate-100 mx-2"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="mb-6 flex-grow">
                            <h4 className="font-semibold text-slate-800 text-sm mb-1">Shipping Details</h4>
                            <p className="text-xs text-slate-500 mb-2">Enter your delivery address</p>
                            <input type="text" className="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full px-3 text-sm" placeholder="Address..." />
                        </div>
                        <div className="flex justify-between gap-3 mt-auto">
                            <button onClick={handlePrevStep} className="flex-1 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-100 flex items-center justify-center gap-1">
                                ← Back
                            </button>
                            <button onClick={handleNextStep} className="flex-1 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center justify-center gap-1">
                                Next →
                            </button>
                        </div>
                    </Card>

                    {/* Card 13: Listener Leak */}
                    <Card title="Listener Accumulator" icon={Activity} badgeText="LISTENER LEAK" badgeColor="orange" infoText="Each remount adds 2 permanent listeners. Press any key to see 1 duplicate fires.">
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mounts</p>
                                <p className="text-xl font-bold text-slate-700">{listenerCount}</p>
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Listeners</p>
                                <p className="text-xl font-bold text-red-500">{activeListeners}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setListenerCount(c => c + 1); setActiveListeners(a => a + 1); }}
                            className="w-full bg-orange-50 text-orange-500 border border-orange-200 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center justify-center gap-2 mb-4"
                        >
                            <RefreshCw className="w-4 h-4" /> Remount (+2 more leaked listeners)
                        </button>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Keydown Log</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Scroll events: 310</p>
                            </div>
                            <div className="text-xs text-slate-400 text-center py-4">Press any key to see duplicate fires</div>
                        </div>
                    </Card>

                    {/* Card 14: Query Desync */}
                    <Card title="Product Details" icon={LayoutGrid} badgeText="QUERY DESYNC" badgeColor="cyan" infoText="">
                        <div className="flex border-b border-slate-100 mb-4 text-xs">
                            {['Overview', 'Reviews', 'Specs', 'Shipping'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailsTab(tab.toLowerCase())}
                                    className={`px-3 py-2 flex items-center gap-1 transition-colors ${detailsTab === tab.toLowerCase()
                                        ? 'border-b-2 border-slate-800 font-semibold text-slate-800'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab}
                                    {tab === 'Reviews' && <span className="text-[10px] text-green-500 font-bold">142</span>}
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 mb-4 flex-grow">
                            Product overview: A premium wireless headset with 40hr battery, ANC, and spatial audio support.
                        </div>
                        <div className="space-y-2 mt-auto text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Actual URL:</span>
                                <span className="font-mono text-slate-600">/?tab={detailsTab}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Should be:</span>
                                <span className="font-mono text-green-500">/?tab={detailsTab}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Card 15: Cache Pollution & Liar Label */}
                    <Card title="User Profile" icon={User} badgeText="CACHE POLLUTION" badgeColor="purple" infoText="localStorage[&quot;bugsafari_profile_cache&quot;] = &quot;{polluted}&quot;">
                        {profile.isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-lg">A</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{profile.email}</p>
                                        <p className="text-xs text-slate-500">{profile.badge}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm mb-4 flex-grow">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-xs">Balance</span>
                                        <span className="font-mono font-bold">${profile.balance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-xs">Last Order</span>
                                        <span className="text-xs text-slate-700">Order #9821 — MacBook Pro M3</span>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full mt-auto bg-red-50 text-red-500 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                    [→ Logout (won't clear localStorage)
                                </button>
                                {/* LLM Honeypot: Liar Label - says "Export" but deletes user */}
                                <button onClick={handleExportData} className="w-full mt-2 bg-green-50 text-green-600 border border-green-200 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                                    Export User Data
                                </button>
                                {profileError && (
                                    <div className="mt-2 bg-red-100 text-red-500 text-xs p-2 rounded-lg font-semibold text-center border border-red-200">
                                        User Deleted!
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-sm text-slate-400">
                                User logged out
                            </div>
                        )}
                    </Card>

                    {/* Card 16: Broken Memoization */}
                    <Card title="Broken Memoization" icon={RefreshCw} badgeText="MEMO BYPASS" badgeColor="red" infoText="React.memo is useless here — inline style/onClick props break referential equality on every render.">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Activity className="w-4 h-4 text-slate-400" /> Parent renders: <strong className="text-slate-800">{renderCount}</strong>
                            </div>
                            <button onClick={() => setRenderCount(c => c + 1)} className="bg-green-50 text-green-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                                Force Re-render ({renderCount - 1})
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Product</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">×N = Re-renders (Should be ×1)</span>
                        </div>

                        <div className="space-y-2 flex-grow">
                            {memoProducts.map((product, idx) => (
                                // BUG: Passing inline onClick breaks referential equality
                                <MemoizedProductItem
                                    key={idx}
                                    product={product}
                                    index={idx}
                                    onDelete={() => console.log(`Delete ${product.name}`)}
                                />
                            ))}
                        </div>
                    </Card>

                    {/* Card 17: Race Conditions */}
                    <Card title="Dashboard Data" icon={Activity} badgeText="RACE CONDITION" badgeColor="yellow" infoText="Click fetch. Fast request resolves first, but slow request overwrites it later.">
                        <button onClick={handleFetchDashboardData} className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-100 mb-4 transition-colors">
                            {isLoading ? "Fetching..." : "Fetch Dashboard Data"}
                        </button>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex-grow flex items-center justify-center">
                            <p className="font-mono text-sm text-slate-700">{dashboardData || "No data loaded"}</p>
                        </div>
                    </Card>

                    {/* Card 18: Ghost Modal */}
                    <Card title="Ghost Modal" icon={LayoutGrid} badgeText="DOM LEAK" badgeColor="orange" infoText="Open modal, then click 'Force Route Away'. Try scrolling the main page afterwards.">
                        {!isNavigated ? (
                            <div className="space-y-3 flex-grow flex flex-col">
                                <button onClick={openGhostModal} className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                                    Open Image Viewer
                                </button>
                                {isModalOpen && (
                                    <div className="bg-slate-800 text-white p-4 rounded-lg mt-2 relative z-50">
                                        <p className="text-sm mb-4">Modal Open (Body scroll locked)</p>
                                        <button onClick={forceRouteAway} className="w-full bg-red-500 text-white py-2 rounded text-sm font-medium hover:bg-red-600">
                                            Force Route Away (Simulate SPA Link)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center space-y-3">
                                <p className="text-sm text-red-500 font-semibold">Navigated away!</p>
                                <p className="text-xs text-slate-500 text-center">But the body is still locked. You can't scroll the app.</p>
                                <button onClick={fixScroll} className="text-xs bg-slate-200 px-3 py-1 rounded hover:bg-slate-300">Fix Scroll</button>
                            </div>
                        )}
                    </Card>

                    {/* Card 19: Cross-Session Leak */}
                    <Card title="Session State" icon={User} badgeText="STATE LEAK" badgeColor="red" infoText="SPA navigations don't clear memory automatically. Switching users leaks data.">
                        <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${activeUser === 'Alice' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                {activeUser.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Logged in as: {activeUser}</p>
                            </div>
                        </div>
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex-grow">
                            <p className="text-xs text-red-400 font-bold uppercase mb-1">Active Secure Document in Memory</p>
                            <p className="text-sm font-mono text-red-600 truncate">{sensitiveDocument}</p>
                        </div>
                        <button onClick={fastSwitchUser} className="w-full mt-auto bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                            Fast-Switch Account
                        </button>
                    </Card>

                    {/* Card 20: Infinite Render */}
                    <Card title="Infinite Render" icon={RefreshCw} badgeText="RENDER LOOP" badgeColor="pink" infoText="useEffect depends on an inline object. Breaks referential equality.">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Activity className="w-4 h-4 text-slate-400" /> Loop Count: <strong className="text-slate-800">{loopCount}</strong>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex-grow flex items-center justify-center mb-4">
                            <p className="font-mono text-xs text-slate-500 text-center">useEffect(() ={`{`}{`}`}, <br />[ configObject ])</p>
                        </div>
                        <button
                            onClick={() => { setLoopCount(0); setTriggerLoop(true); }}
                            disabled={triggerLoop && loopCount < 100}
                            className="w-full bg-pink-50 text-pink-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-pink-100 transition-colors disabled:opacity-50"
                        >
                            {loopCount >= 100 ? "Safety Cap Hit (100)" : triggerLoop ? "Looping..." : "Trigger Death Spiral"}
                        </button>
                    </Card>

                </main>

                {/* Interactive Diagnostics Terminal */}
                <div className="w-full bg-slate-900 p-6 rounded-xl mt-8 border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="w-5 h-5 text-green-400" />
                        <h3 className="text-green-400 font-mono text-lg font-bold tracking-wider">AGENT DIAGNOSTICS TERMINAL</h3>
                    </div>
                    <textarea
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                        placeholder='{"bugId": "...", "rootCause": "..."}'
                        className="w-full bg-black text-green-500 p-4 font-mono text-sm rounded-lg border border-slate-700 focus:outline-none focus:border-green-500 min-h-[100px] resize-y"
                    />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                        <button onClick={submitDiagnosisToApp} className="bg-green-600 text-white px-6 py-2 rounded font-mono font-bold hover:bg-green-500 transition-colors w-full sm:w-auto">
                            SUBMIT_REPORT
                        </button>
                        {terminalStatus && (
                            <span className={`font-mono text-sm font-semibold ${terminalStatus.includes('SUCCESS') ? 'text-green-400' : 'text-red-500'}`}>
                                {terminalStatus}
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}