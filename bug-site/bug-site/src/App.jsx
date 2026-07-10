import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AppErrorBoundary from './components/layout/AppErrorBoundary';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import SupportChatWidget from './components/widgets/SupportChatWidget';
import NewsletterModal from './components/widgets/NewsletterModal';
import CookieConsentBanner from './components/widgets/CookieConsentBanner';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Orders from './pages/Orders';
import AdminAnalytics from './pages/AdminAnalytics';
import PartnerDeals from './pages/PartnerDeals';
import Deals from './pages/Deals';
import Compare from './pages/Compare';
import Notifications from './pages/Notifications';
import BugIndex from './pages/BugIndex';
import Reviews from './pages/Reviews';
import AdminProducts from './pages/AdminProducts';
import AdminInventory from './pages/AdminInventory';

function AppShell() {
    const location = useLocation();
    const [showNewsletter, setShowNewsletter] = useState(false);
    const [cookieConsent, setCookieConsent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowNewsletter(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-800">
            {showNewsletter && <NewsletterModal onClose={() => setShowNewsletter(false)} />}
            {!cookieConsent && <CookieConsentBanner onAccept={() => setCookieConsent(true)} />}

            <NavBar />

            <main className="flex-grow mb-16">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/deals/:partnerSlug" element={<PartnerDeals />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/bugs" element={<BugIndex />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />

                </Routes>
            </main>

            <Footer />

            {/* Keyed by pathname so it fully remounts on every SPA
                navigation — see Bug 3 / Bug 13 in SupportChatWidget. */}
            <SupportChatWidget key={location.pathname} />
        </div>
    );
}

function App() {
    const [resetKey, setResetKey] = useState(0);
    const handleGlobalReset = () => {
        setResetKey((prev) => prev + 1);
        document.body.style.overflow = 'auto';
        window.__leakedListenersCount = 0;
    };

    return (
        <AppErrorBoundary onReset={handleGlobalReset}>
            <BrowserRouter>
                <CartProvider key={resetKey}>
                    <AppShell />
                </CartProvider>
            </BrowserRouter>
        </AppErrorBoundary>
    );
}

export default App;
