// Catalog of the 28 intentional bugs, mirrored from BUGSITE_ARCHITECTURE_PLAN.md
// (Section 4 master matrix). Used by the /bugs testing dashboard so testers and
// AI agents have a single index of every vulnerability and how to trigger it.
export const BUG_CATALOG = [
    { id: 1, title: 'Stale Closure', group: 'State & Lifecycle', route: '/admin/analytics', where: 'Revenue by Category widget', trigger: 'Switch the category tab — interval counters never reflect the selection (missing dependency).' },
    { id: 2, title: 'State Mutation', group: 'Core Shopping', route: '/cart', where: 'Quantity stepper', trigger: 'Press "+" — the array is mutated directly, so the displayed qty desyncs from cart length.' },
    { id: 3, title: 'Memory Leak', group: 'State & Lifecycle', route: '/catalog', where: 'Support chat widget (global)', trigger: 'Navigate between pages — scroll/resize listeners attach on every mount, never cleaned up.' },
    { id: 4, title: 'Event Bubbling', group: 'Core Shopping', route: '/catalog', where: 'Recently Viewed list', trigger: 'Click a row\'s Remove button — the card\'s own navigate onClick still fires (no stopPropagation).' },
    { id: 5, title: 'A11y Violations', group: 'Content & Trust', route: '/product/premium-noise-canceling-headphones', where: 'Star rating & Like control', trigger: 'Inspect — rating/like are div/span, no button role, no aria-label, avatar has no alt.' },
    { id: 6, title: 'XSS Vector', group: 'Content & Trust', route: '/product/premium-noise-canceling-headphones', where: 'Product reviews', trigger: 'Submit a review with an HTML/script payload — stored raw, rendered via dangerouslySetInnerHTML.' },
    { id: 7, title: 'Obfuscation / Hidden Token', group: 'Content & Trust', route: '/account', where: 'Security panel', trigger: 'Inspect the DOM — a base64 admin token and an off-screen "Bypass Auth" button are present.' },
    { id: 8, title: 'Type Coercion', group: 'Core Shopping', route: '/cart', where: 'Order summary subtotal', trigger: 'View the subtotal — accumulator starts at "" causing string concat + float-precision artifacts.' },
    { id: 9, title: 'Layout Shift', group: 'Core Shopping', route: '/', where: 'Shop Flash Sale CTA', trigger: 'Hover the CTA — it randomly translates away from the cursor.' },
    { id: 10, title: 'Parse Failure', group: 'Data & Analytics', route: '/orders', where: 'Track Package', trigger: 'Track an order — the mocked carrier API returns malformed JSON and JSON.parse throws.' },
    { id: 11, title: 'Unmounted setState', group: 'State & Lifecycle', route: '/orders', where: 'Live order tracking', trigger: 'Click Track, then navigate away before the 2s response resolves — setState on unmounted component.' },
    { id: 12, title: 'History Desync', group: 'State & Lifecycle', route: '/checkout', where: 'Checkout wizard', trigger: 'Advance a step, then press browser Back — it exits checkout instead of stepping back (step not in URL).' },
    { id: 13, title: 'Listener Accumulator', group: 'State & Lifecycle', route: '/catalog', where: 'Support chat widget (global)', trigger: 'Navigate repeatedly — each remount adds another keydown listener (capped for CPU safety).' },
    { id: 14, title: 'Query Desync', group: 'Content & Trust', route: '/product/mechanical-keyboard-tkl', where: 'PDP tabs', trigger: 'Switch tabs then refresh/share the URL — always lands back on Overview (tab not in query).' },
    { id: 15, title: 'Cache Pollution', group: 'State & Lifecycle', route: '/account', where: 'Profile widget', trigger: 'Log out, then read localStorage — balance/badge cache is never cleared.' },
    { id: 16, title: 'Broken Memoization', group: 'Content & Trust', route: '/product/premium-noise-canceling-headphones', where: 'You Might Also Like', trigger: 'Switch a PDP tab — every memo\'d related card re-renders (fresh inline onClick breaks equality).' },
    { id: 17, title: 'Race Condition', group: 'State & Lifecycle', route: '/admin/analytics', where: 'Refresh Dashboard Data', trigger: 'Click refresh — a slow legacy response overwrites the fresh one, showing stale data as current.' },
    { id: 18, title: 'Ghost Modal / DOM Leak', group: 'Core Shopping', route: '/catalog', where: 'Quick View lightbox', trigger: 'Open Quick View, then navigate away via the nav bar — page stays scroll-locked (no cleanup).' },
    { id: 19, title: 'Cross-Session Leak', group: 'State & Lifecycle', route: '/account', where: 'Account switcher', trigger: 'Fast-switch the active user without a refresh — the previous user\'s sensitive data lingers.' },
    { id: 20, title: 'Infinite Render Loop', group: 'State & Lifecycle', route: '/admin/analytics', where: 'Trigger Live Refresh', trigger: 'Click trigger — a new inline config object in a useEffect dep array causes a runaway loop (capped 100).' },
    { id: 21, title: 'Index as Key', group: 'Core Shopping', route: '/wishlist', where: 'Saved Items notes', trigger: 'Type a note, then delete the item above it — the note appears to jump to the wrong product.' },
    { id: 22, title: 'Open Redirect', group: 'Content & Trust', route: '/deals/techmart', where: 'Visit Partner Store', trigger: 'The partner URL (query-controlled) is assigned straight to window.location.href, unvalidated.' },
    { id: 23, title: 'Missing Debounce', group: 'Core Shopping', route: '/catalog', where: 'Search bar', trigger: 'Type in search — every keystroke fires a simulated API call (watch the counter/console).' },
    { id: 24, title: 'ReDoS', group: 'Data & Analytics', route: '/checkout', where: 'Promo code field', trigger: 'Paste a crafted alphanumeric+space string — catastrophic backtracking freezes the tab.' },
    { id: 25, title: 'Graph Manipulation', group: 'Data & Analytics', route: '/admin/analytics', where: 'Revenue graph toggle', trigger: 'Toggle Data Source — flat fake values load and the toggle label logic is inverted.' },
    { id: 26, title: 'Export Corruption', group: 'Data & Analytics', route: '/admin/analytics', where: 'Export Orders (CSV/JSON)', trigger: 'Export orders with long/quoted addresses — unescaped commas/quotes break the CSV structure.' },
    { id: 27, title: 'Timezone Desync', group: 'Data & Analytics', route: '/admin/analytics', where: 'Timezone selector', trigger: 'Change the timezone dropdown — displayed timestamps stay in UTC regardless of selection.' },
    { id: 28, title: 'Legend Desync', group: 'Data & Analytics', route: '/admin/analytics', where: 'Revenue vs Cost chart', trigger: 'The legend lists a "Costs" series that is never actually drawn in the chart.' },
];

export const BUG_GROUPS = ['Core Shopping', 'Content & Trust', 'State & Lifecycle', 'Data & Analytics'];

export const GROUP_TONE = {
    'Core Shopping': 'bg-sky-100 text-sky-700',
    'Content & Trust': 'bg-rose-100 text-rose-700',
    'State & Lifecycle': 'bg-violet-100 text-violet-700',
    'Data & Analytics': 'bg-emerald-100 text-emerald-700',
};
