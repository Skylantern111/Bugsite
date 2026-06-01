import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Bug, Activity, ShoppingCart, Monitor, LayoutGrid, Star, MessageSquare,
    Shield, Receipt, MousePointerClick, CloudRain, Skull, GitCommit,
    Headphones, User, RefreshCw, Eye, Trash2, Send, Info, Heart
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

// --- Helper Components ---

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
            <div className="grow flex flex-col mb-4">
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

// --- Zombie Child Component (Card 11) ---
const ZombieChild: React.FC<{ onDataFetched: () => void }> = ({ onDataFetched }) => {
    const [data, setData] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setData('{"status":"success","data":"Fetched!"}');
            onDataFetched();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDataFetched]);

    return <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded">{data || 'Loading...'}</div>;
};

// --- Memoized Product Item (Card 16) ---
const MemoizedProductItem = React.memo(({ name, price, onClick }: { name: string; price: string; onClick: () => void }) => (
    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <span className="text-sm font-medium text-slate-700">{name}</span>
        <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{price}</span>
            <span className="bg-red-100 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">×1</span>
        </div>
    </div>
));

// --- Main App Component ---

export default function VulnerableApp() {
    const [revenueTab, setRevenueTab] = useState('electronics');
    const [detailsTab, setDetailsTab] = useState('overview');

    // BUG 1: Stale Closure - fetchCount without revenueTab dependency
    const [fetchCount, setFetchCount] = useState(1);
    useEffect(() => {
        const interval = setInterval(() => {
            setFetchCount(prev => prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // BUG 2: State Mutation - cart array
    const [cart, setCart] = useState<string[]>([]);
    const addToCart = (item: string) => {
        cart.push(item); // Mutating directly instead of setState
        // This won't trigger re-render
    };

    // BUG 3: Memory Leak - scroll listener without cleanup
    const [scrollY, setScrollY] = useState(0);
    const [viewportSize, setViewportSize] = useState({ width: 1790, height: 834 });
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        // BUG: Missing cleanup! No return () => window.removeEventListener...
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
    }, []);

    // BUG 4: Event Bubbling
    const [eventLog, setEventLog] = useState<string[]>([]);
    const handleView = (itemName: string) => {
        setEventLog(prev => [...prev, `VIEW: ${itemName}`]);
    };
    const handleDelete = (e: React.MouseEvent, itemName: string) => {
        // BUG: No e.stopPropagation() - will bubble to parent!
        setEventLog(prev => [...prev, `DELETE: ${itemName}`]);
    };

    // BUG 6: XSS Vector - review input
    const [reviews, setReviews] = useState([
        { user: '@alice_buyer', text: 'Works exactly as described. Fast shipping!' },
        { user: '@h4ck3r_x', text: 'Great product! ⭐⭐⭐⭐⭐ <strong>Highly recommended!</strong>' }
    ]);
    const [reviewInput, setReviewInput] = useState('');
    const addReview = () => {
        if (reviewInput.trim()) {
            setReviews([...reviews, { user: '@user', text: reviewInput }]);
            setReviewInput('');
        }
    };

    // BUG 7: Obfuscation - fake admin token encoded
    const fakeToken = 'ADMIN_TOKEN_sk_live_51Ja9K2V3F5U8W3X';
    const encodedToken = btoa(fakeToken);
    const securityRef = useRef<HTMLDivElement>(null);

    // BUG 8: Type Coercion - empty string accumulator
    const calculateSubtotal = () => {
        let subtotal = ''; // BUG: starts as empty string!
        const items = [100, 20, 0.1, 0.2];
        items.forEach(item => {
            subtotal = subtotal + item; // String concatenation!
        });
        return subtotal;
    };
    const subtotalResult = calculateSubtotal();

    // BUG 9: Layout Shifts - button dodges
    const [buttonPosition, setButtonPosition] = useState({ x: 0 });
    const handleMouseEnter = () => {
        setButtonPosition({ x: 150 }); // Moves button away!
    };

    // BUG 10: Parse Failure - malformed JSON
    const [parseError, setParseError] = useState<string | null>(null);
    const fetchMalformed = async () => {
        const malformedJson = "{ 'key': 'value', }"; // Invalid JSON!
        const result = JSON.parse(malformedJson); // BUG: No try/catch!
        setParseError(JSON.stringify(result));
    };

    // BUG 11: Unmounted setState (Zombie)
    const [showZombie, setShowZombie] = useState(true);
    const [pendingCalls, setPendingCalls] = useState(0);
    const handleFetchData = () => {
        setPendingCalls(prev => prev + 1);
        setShowZombie(false);
    };
    const handleUnmount = () => {
        setShowZombie(false);
    };

    // BUG 12: History Desync - checkout step only in local state
    const [checkoutStep, setCheckoutStep] = useState(1);
    // BUG: No window.history.pushState() or URL updates!

    // BUG 13: Listener Accumulator - listeners in render body
    const [keyCount, setKeyCount] = useState(0);
    const [mountCount, setMountCount] = useState(1);
    const handleRemount = () => {
        setMountCount(prev => prev + 1);
    };
    // BUG: Adding listener directly in render (not in useEffect)!
    useEffect(() => {
        const handleKeyDown = () => setKeyCount(prev => prev + 1);
        window.addEventListener('keydown', handleKeyDown);
    }, [mountCount]); // Depends on mountCount, triggers on remount

    // BUG 14: Query Desync - hardcoded URL
    // BUG: URL text is hardcoded, doesn't match actual state
    const hardcodedUrl = '/?tab=overview';

    // BUG 15: Cache Pollution - logout doesn't clear localStorage
    const [userLoggedIn, setUserLoggedIn] = useState(true);
    const handleLogout = () => {
        setUserLoggedIn(false);
        // BUG: Missing localStorage.removeItem('bugsafari_profile')!
    };

    // BUG 16: Broken Memoization
    const [parentRenderCount, setParentRenderCount] = useState(1);
    const forceReRender = () => {
        setParentRenderCount(prev => prev + 1);
    };
    const products = [
        { name: "Wireless Mouse", price: "$29.99" },
        { name: "Desk Lamp", price: "$49.99" },
        { name: "Monitor Stand", price: "$79.99" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <header className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    {/* Subtle background pattern */}
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
                                <Bug className="w-4 h-4" /> 16 Bugs Injected
                            </span>
                            <span className="bg-orange-50 text-orange-500 border border-orange-200 text-sm font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Training Mode
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-y-3 gap-x-4 pt-4 border-t border-slate-100">
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
                    </div>
                </header>

                {/* 16-Card Grid Dashboard */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    {/* Card 1: Stale Closure */}
                    <Card title="Revenue by Category" icon={Activity} badgeText="STALE CLOSURE" badgeColor="red" infoText="Selected: &quot;electronics&quot; — Data shown: always &quot;electronics&quot; (stale)">
                        <p className="text-xs text-slate-500 mb-3">Fetched {fetchCount} time(s) — should increment per category change</p>
                        <div className="flex gap-2 mb-4">
                            {['Electronics', 'Clothing', 'Books'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setRevenueTab(tab.toLowerCase())}
                                    className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${revenueTab === tab.toLowerCase()
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">Revenue</p>
                                <p className="font-bold text-slate-800">$84,320</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">Orders</p>
                                <p className="font-bold text-slate-800">412</p>
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
                    <Card title="Shopping Cart" icon={ShoppingCart} badgeText="STATE MUTATION" badgeColor="orange" infoText={`Last action: ${cart.length > 0 ? 'Added ' + cart[cart.length - 1] : 'None'} — UI won&apos;t reflect cart.push() mutations`}>
                        <div className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                            <span>({cart.length} items)</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Wireless Headphones', price: '$79.99' },
                                { name: 'USB-C Hub', price: '$34.50' },
                                { name: 'Mechanical Keyboard', price: '$129.00' },
                            ].map((product, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.price}</p>
                                    </div>
                                    <button onClick={() => addToCart(product.name)} className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold hover:bg-green-100">+ Add</button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Card 3: Memory Leak */}
                    <Card title="Live Viewport Monitor" icon={Monitor} badgeText="MEMORY LEAK" badgeColor="yellow" infoText="Remount this component to see listeners pile up without cleanup">
                        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Width</p>
                                <p className="text-xl font-bold text-slate-700">{viewportSize.width}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                                <p className="text-xl font-bold text-slate-700">{viewportSize.height}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Scroll Y</p>
                                <p className="text-xl font-bold text-slate-700">{scrollY}</p>
                            </div>
                        </div>
                        <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                            <Activity className="w-3 h-3" /> 2 event listener(s) attached — never cleaned up
                        </p>
                    </Card>

                    {/* Card 4: Event Bubbling */}
                    <Card title="Product Cards" icon={LayoutGrid} badgeText="EVENT BUBBLING" badgeColor="green" infoText="Click &quot;Delete&quot; -> both DELETE and VIEW fire (no stopPropagation)">
                        <div className="space-y-3">
                            {[
                                { name: "Premium Widget", price: "$49.99" },
                                { name: "Deluxe Gadget", price: "$89.99" },
                                { name: "Ultra Component", price: "$129.99" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.price}</p>
                                        </div>
                                    </div>
                                    <button onClick={(e) => handleDelete(e, item.name)} className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors">
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
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-slate-300" />)}
                            <span className="text-xs text-slate-500 ml-2">No rating</span>
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
                            {reviews.map((review, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg" dangerouslySetInnerHTML={{ __html: `<p class="text-xs text-slate-400 mb-1">${review.user}</p><p class="text-sm text-slate-700">${review.text}</p>` }} />
                            ))}
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <input type="text" value={reviewInput} onChange={(e) => setReviewInput(e.target.value)} placeholder="Write a review (try HTML tags)..." className="flex-grow text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500" />
                            <button onClick={addReview} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>

                    {/* Card 7: Obfuscation */}
                    <Card title="Security Panel" icon={Shield} badgeText="OBFUSCATION" badgeColor="pink" infoText="Hidden data-tracker attribute: base64(&quot;ADMIN_TOKEN_sk_live_...&quot;) reversed -> &quot;=geZh3V2VFdTJXUw5Ub...&quot;">
                        <div className="flex flex-col items-center justify-center py-4 mb-4 bg-slate-50 border border-slate-100 rounded-lg">
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
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Subtotal (string concat)</span><span className="font-mono font-bold text-slate-800 text-xs">100400.10.2</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">Discount</span><span className="font-mono text-red-500 text-xs">-$15</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 text-xs">0.1 + 0.2 =</span><span className="font-mono text-orange-500 text-[10px]">0.30000000000000004</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-auto">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="font-bold text-lg text-slate-800 font-mono">$NaN</span>
                        </div>
                    </Card>

                    {/* Card 9: Layout Shifts */}
                    <Card title="UI Traps" icon={MousePointerClick} badgeText="LAYOUT SHIFT" badgeColor="orange" infoText="Hovering button dodges clicks. Modal overlay traps the user.">
                        <p className="text-sm text-slate-600 mb-3">Try to click this button:</p>
                        <button onMouseEnter={handleMouseEnter} style={{ transform: `translateX(${buttonPosition.x}px)` }} className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold w-max mb-4 transition-all duration-100">
                            Click Me (I dodge!)
                        </button>
                        <div className="space-y-3 mt-auto">
                            <a href="#" className="text-sm text-green-500 underline block">Load dynamic content</a>
                            <button className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium w-max hover:bg-red-100">
                                Open Trapped Modal
                            </button>
                        </div>
                    </Card>

                    {/* Card 10: Parse Failure */}
                    <Card title="API Response Parser" icon={CloudRain} badgeText="PARSE FAILURE" badgeColor="green" infoText="API returns malformed JSON — trailing commas, unquoted keys, missing commas">
                        <button onClick={fetchMalformed} className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2 mb-4">
                            <CloudRain className="w-4 h-4" /> Fetch Malformed API Data
                        </button>
                        <div className="font-mono text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 flex-grow">
                            API returns malformed JSON — trailing commas, unquoted keys, missing commas
                        </div>
                    </Card>

                    {/* Card 11: Unmounted setState */}
                    <Card title="Zombie Component" icon={Skull} badgeText="UNMOUNTED SETSTATE" badgeColor="red" infoText={`Fetch calls pending: ${pendingCalls}`}>
                        <div className="space-y-3">
                            <button onClick={handleUnmount} className="w-full bg-red-50 text-red-500 border border-red-200 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                Unmount Inner Component
                            </button>
                            <button onClick={handleFetchData} className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" /> Fetch Data (then unmount!)
                            </button>
                        </div>
                    </Card>

                    {/* Card 12: History Desync */}
                    <Card title="Checkout Wizard" icon={GitCommit} badgeText="HISTORY DESYNC" badgeColor="purple" infoText="URL stays at &quot;/&quot; throughout. Browser Back exits the form instead of going to step 1.">
                        <div className="flex items-center justify-between mb-6 px-2">
                            {[1, 2, 3, 4].map((step, i) => (
                                <React.Fragment key={step}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {step}
                                    </div>
                                    {i < 3 && <div className="flex-grow h-0.5 bg-slate-100 mx-2"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="mb-6 flex-grow">
                            <h4 className="font-semibold text-slate-800 text-sm mb-1">Shipping Details</h4>
                            <p className="text-xs text-slate-500 mb-2">Enter your delivery address</p>
                            <div className="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full"></div>
                        </div>
                        <div className="flex justify-between gap-3 mt-auto">
                            <button className="flex-1 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-100 flex items-center justify-center gap-1">
                                ← Back
                            </button>
                            <button className="flex-1 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center justify-center gap-1">
                                Next →
                            </button>
                        </div>
                    </Card>

                    {/* Card 13: Listener Leak */}
                    <Card title="Listener Accumulator" icon={Activity} badgeText="LISTENER LEAK" badgeColor="orange" infoText={`Each remount adds 2 permanent listeners. Press any key to see ${keyCount} duplicate fires.`}>
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mounts</p>
                                <p className="text-xl font-bold text-slate-700">{mountCount}</p>
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Listeners</p>
                                <p className="text-xl font-bold text-red-500">{mountCount * 2}</p>
                            </div>
                        </div>
                        <button onClick={handleRemount} className="w-full bg-orange-50 text-orange-500 border border-orange-200 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center justify-center gap-2 mb-4">
                            <RefreshCw className="w-4 h-4" /> Remount (+2 more leaked listeners)
                        </button>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Keydown Log</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Key presses: {keyCount}</p>
                            </div>
                            <div className="text-xs text-slate-400 text-center py-4">Press any key to see duplicate fires</div>
                        </div>
                    </Card>

                    {/* Card 14: Query Desync */}
                    <Card title="Product Details" icon={LayoutGrid} badgeText="QUERY DESYNC" badgeColor="cyan" infoText="URL stays at / despite tab changes">
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
                                <span className="font-mono text-slate-600">{hardcodedUrl}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Should be:</span>
                                <span className="font-mono text-green-500">/?tab={detailsTab}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Card 15: Cache Pollution */}
                    <Card title="User Profile" icon={User} badgeText="CACHE POLLUTION" badgeColor="purple" infoText="localStorage[&quot;bugsafari_profile_cache&quot;] = &quot;{polluted}&quot;">
                        <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-bold text-lg">A</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">alice@company.com</p>
                                <p className="text-xs text-slate-500">Admin</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-xs">Balance</span>
                                <span className="font-mono font-bold">$12,450.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-xs">Last Order</span>
                                <span className="text-xs text-slate-700">Order #9821 — MacBook Pro M3</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full mt-auto bg-red-50 text-red-500 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                            [→ Logout (won't clear localStorage)
                        </button>
                    </Card>

                    {/* Card 16: Broken Memoization */}
                    <Card title="Broken Memoization" icon={RefreshCw} badgeText="MEMO BYPASS" badgeColor="red" infoText="React.memo is useless here — inline style/onClick props break referential equality on every render.">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Activity className="w-4 h-4 text-slate-400" /> Parent renders: <strong className="text-slate-800">1</strong>
                            </div>
                            <button onClick={forceReRender} className="bg-green-50 text-green-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                                Force Re-render (0)
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Product</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">×N = Re-renders (Should be ×1)</span>
                        </div>

                        <div className="space-y-2 flex-grow">
                            {[
                                { name: "Wireless Mouse", price: "$29.99" },
                                { name: "Desk Lamp", price: "$49.99" },
                                { name: "Monitor Stand", price: "$79.99" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">{item.price}</span>
                                        <span className="bg-red-100 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">×1</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </main>
            </div>
        </div>
    );
}
