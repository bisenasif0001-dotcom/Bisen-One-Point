import BusinessRulesProvider from './components/BusinessRulesProvider';
import RouteScreen from './components/RouteScreen';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { readSavedCart } from './utils/cartStorage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
const DualCheckoutModal = lazy(() => import('./components/DualCheckoutModal'));
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));
const SizeComparisonGuide = lazy(() => import('./components/SizeComparisonGuide'));

// Pages
import HomePage from './pages/HomePage';
const DuaPostersPage = lazy(() => import('./pages/DuaPostersPage'));
const DuaPosterDetailPage = lazy(() => import('./pages/DuaPostersPage').then(module => ({ default: module.DuaPosterDetailPage })));
const PrintingServicesPage = lazy(() => import('./pages/PrintingServicesPage'));
const PvcCardsPage = lazy(() => import('./pages/PvcCardsPage'));
const PvcCardPage = lazy(() => import('./pages/PvcCardsPage').then(module => ({ default: module.PvcCardPage })));
const CustomFramingPage = lazy(() => import('./pages/CustomFramingPage'));
const FrameCataloguePage = lazy(() => import('./pages/FrameCataloguePage'));
const IslamicArtPage = lazy(() => import('./pages/IslamicArtPage'));
const ItraPerfumesPage = lazy(() => import('./pages/ItraPerfumesPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const PhotoPrintsPage = lazy(() => import('./pages/PhotoPrintsPage'));
const BirthdayCardBuilderPage = lazy(() => import('./pages/BirthdayCardBuilderPage'));
const CardsInvitationsPage = lazy(() => import('./pages/CardsInvitationsPage'));
const OccasionLandingPage = lazy(() => import('./pages/OccasionLandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const GalleryWallBuilderPage = lazy(() => import('./pages/GalleryWallBuilderPage'));
const CardProductDetailPage = lazy(() => import('./pages/CardProductDetailPage'));
const ItraProductDetailPage = lazy(() => import('./pages/ItraProductDetailPage'));
import NotFoundPage from './pages/NotFoundPage';
const TrackOrderPage = lazy(() => import('./pages/CustomerTrackingPage'));
const StudioPanelPage = lazy(() => import('./pages/StudioPanelPage'));

import { MessageCircle, ArrowUp } from 'lucide-react';

import { getWhatsAppUrl } from './data/businessConfig';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [frameGuidePhoto, setFrameGuidePhoto] = useState(null);

  // Cart State (Initialized clean for customer orders with localStorage persistence)
  const [cartItems, setCartItems] = useState(readSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem('alnoor_cart', JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems]);

  // Discounts
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutInitialTab, setCheckoutInitialTab] = useState('online');
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // Cart Handlers
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(i => i.id === item.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + (item.quantity || 1) };
        return updated;
      }
      return [item, ...prev];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApplyDiscount = (code, percent) => {
    setDiscountCode(code);
    setDiscountPercent(percent);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProceedCheckout = (tab) => {
    setCheckoutInitialTab(tab);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <BrowserRouter><BusinessRulesProvider>
      <a className="skip-to-content" href="#main-content">Skip to content</a>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Persistent Luxury Navbar */}
        <SiteNavbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Multi-Page Routes */}
        <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
          <Suspense fallback={<div role="status" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Opening the studio…</div>}>
          <RouteScreen><Routes>
            {['/privacy', '/terms', '/returns', '/shipping', '/original-files', '/cancellation', '/grievance'].map(path => <Route key={path} path={path} element={<PolicyPage />} />)}
            <Route path="/dua-posters" element={<DuaPostersPage />} />
            <Route path="/dua-posters/:id" element={<DuaPosterDetailPage />} />
            <Route path="/studio/*" element={<StudioPanelPage />} />
            <Route path="/printing-services" element={<PrintingServicesPage />} />
            <Route path="/pvc-cards" element={<PvcCardsPage />} />
            <Route path="/pvc-cards/bulk" element={<PvcCardPage bulk />} />
            <Route path="/pvc-cards/:id" element={<PvcCardPage />} />
            <Route 
              path="/" 
              element={
                <HomePage
                  onAddToCart={handleAddToCart}
                  onQuickView={(item) => setQuickViewItem(item)}
                  onOpenSizeGuide={() => setIsSizeGuideModalOpen(true)}
                />
              } 
            />
            <Route 
              path="/custom-framing" 
              element={
                <CustomFramingPage
                  frameGuidePhoto={frameGuidePhoto}
                  onAddToCart={handleAddToCart}
                  onOpenSizeGuide={() => setIsSizeGuideModalOpen(true)}
                />
              } 
            />
            <Route 
              path="/photo-prints" 
              element={
                <PhotoPrintsPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/prints" 
              element={
                <PhotoPrintsPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/birthday-cards" 
              element={
                <BirthdayCardBuilderPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/create-card" 
              element={
                <BirthdayCardBuilderPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/cards" 
              element={<CardsInvitationsPage />} 
            />
            <Route 
              path="/cards-and-gifts" 
              element={<CardsInvitationsPage />} 
            />
            <Route 
              path="/cards-invitations" 
              element={<CardsInvitationsPage />} 
            />
            <Route 
              path="/card/:id" 
              element={<CardProductDetailPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/cards/:id" 
              element={<CardProductDetailPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/occasions/:occasionId" 
              element={<OccasionLandingPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/occasions" 
              element={<OccasionLandingPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/gift-sets" 
              element={<OccasionLandingPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/occasion/:occasionId" 
              element={<OccasionLandingPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/gallery-walls" 
              element={<GalleryWallBuilderPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/gallery-wall" 
              element={<GalleryWallBuilderPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/frames-catalogue" 
              element={<FrameCataloguePage />} 
            />
            <Route 
              path="/shop" 
              element={<FrameCataloguePage />} 
            />
            <Route 
              path="/islamic-art" 
              element={
                <IslamicArtPage
                  onAddToCart={handleAddToCart}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              } 
            />
            <Route 
              path="/asma-ul-husna" 
              element={
                <IslamicArtPage
                  onAddToCart={handleAddToCart}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              } 
            />
            <Route 
              path="/99-names" 
              element={
                <IslamicArtPage
                  onAddToCart={handleAddToCart}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              } 
            />
            <Route 
              path="/itra-perfumes" 
              element={
                <ItraPerfumesPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/itra" 
              element={
                <ItraPerfumesPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/fragrance" 
              element={
                <ItraPerfumesPage
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/itra/:id" 
              element={<ItraProductDetailPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/fragrance/:id" 
              element={<ItraProductDetailPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/itra-perfumes/:id" 
              element={<ItraProductDetailPage onAddToCart={handleAddToCart} />} 
            />
            <Route 
              path="/size-guide" 
              element={<SizeGuidePage onPrepareFrame={setFrameGuidePhoto} />} 
            />
            <Route 
              path="/about" 
              element={<AboutPage />} 
            />
            <Route 
              path="/contact" 
              element={<ContactPage />} 
            />
            <Route 
              path="/product/:id" 
              element={
                <ProductDetailPage
                  onAddToCart={handleAddToCart}
                  onOpenSizeGuide={() => setIsSizeGuideModalOpen(true)}
                />
              } 
            />
            <Route 
              path="/product" 
              element={
                <ProductDetailPage
                  onAddToCart={handleAddToCart}
                  onOpenSizeGuide={() => setIsSizeGuideModalOpen(true)}
                />
              } 
            />
            <Route 
              path="/track-order" 
              element={<TrackOrderPage />} 
            />
            <Route 
              path="/track" 
              element={<TrackOrderPage />} 
            />
            <Route 
              path="/orders" 
              element={<TrackOrderPage />} 
            />
            <Route 
              path="/my-orders" 
              element={<TrackOrderPage />} 
            />
            <Route 
              path="*" 
              element={<NotFoundPage />} 
            />
          </Routes></RouteScreen>
          </Suspense>
        </main>

        {/* Persistent Comprehensive Footer */}
        <SiteFooter />

        {/* Responsive Floating Controls (Prompt 36: WhatsApp never covers Add to Cart, Checkout, or Customizer controls) */}
        <FloatingActions
          isCartOpen={isCartOpen}
          isCheckoutOpen={isCheckoutOpen}
          showScrollTop={showScrollTop}
        />

        {/* Slide-out Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedCheckout={handleProceedCheckout}
          discountCode={discountCode}
          discountPercent={discountPercent}
          onApplyDiscount={handleApplyDiscount}
          onAddToCart={handleAddToCart}
        />

        {/* Size Guide Modal (Quick popup) */}
        {isSizeGuideModalOpen && <Suspense fallback={null}>
        <SizeComparisonGuide
          isOpen={isSizeGuideModalOpen}
          onClose={() => setIsSizeGuideModalOpen(false)}
          onSelectSizeForCustomizer={() => {}}
        />
        </Suspense>}

        {/* Product Quick View / Zoom Modal */}
        {quickViewItem && <Suspense fallback={null}>
        <ProductDetailModal
          item={quickViewItem}
          isOpen={!!quickViewItem}
          onClose={() => setQuickViewItem(null)}
          onAddToCart={handleAddToCart}
        />
        </Suspense>}

        {/* Dual Checkout Modal (UPI + WhatsApp) */}
        {isCheckoutOpen && <Suspense fallback={null}>
        <DualCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          initialTab={checkoutInitialTab}
          cartItems={cartItems}
          discountCode={discountCode}
          discountPercent={discountPercent}
          onClearCart={handleClearCart}
        />
        </Suspense>}

      </div>
    </BusinessRulesProvider></BrowserRouter>
  );
}

/**
 * PROMPT 36: Responsive Floating Controls
 * Strict Rules:
 * WhatsApp floating control must never cover:
 * - Add To Cart
 * - Checkout
 * - Customizer controls
 */
function FloatingActions({ isCartOpen, isCheckoutOpen, showScrollTop }) {
  const location = useLocation();

  // Tracking has contextual studio actions beside the request details.
  if (isCartOpen || isCheckoutOpen || location.pathname.startsWith('/track-order') || location.pathname.startsWith('/pvc-cards') || location.pathname.startsWith('/studio')) return null;

  // Check if current route has sticky bottom builder / purchase controls
  const isBuilderRoute = [
    '/custom-framing',
    '/create-card',
    '/birthday-cards',
    '/photo-prints',
    '/frames-catalogue',
    '/gallery-wall',
    '/printing-services',
    '/dua-posters/'
  ].some((path) => location.pathname.startsWith(path));

  return (
    <>
      <a
        href={getWhatsAppUrl('Assalam o Alaikum! I have an inquiry regarding custom photo framing.')}
        target="_blank"
        rel="noopener noreferrer"
        className={`studio-floating-whatsapp ${isBuilderRoute ? 'hide-on-mobile-builder' : ''} ${location.pathname === '/' ? 'hide-on-mobile-home' : ''}`}
        aria-label="Need Help? WhatsApp Us"
        title="Need Help? WhatsApp Us"
      >
        <style>{`
          .studio-floating-whatsapp {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 850;
            background-color: #FFFFFF;
            border: 1px solid #E6E2D8;
            border-radius: 50%;
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(23, 23, 23, 0.08);
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          }
          .studio-floating-whatsapp:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(23, 23, 23, 0.12);
            border-color: #D6D0C4;
          }
          @media (max-width: 767px) {
            .studio-floating-whatsapp {
              bottom: 84px;
              left: 16px;
              width: 44px;
              height: 44px;
            }
            /* Prompt 36: Never cover customizer controls or mobile sticky purchase bars */
            .studio-floating-whatsapp.hide-on-mobile-builder {
              display: none !important;
            }
          }
        `}</style>
        <MessageCircle size={22} color="#25D366" strokeWidth={2} />
      </a>

      {showScrollTop && !isBuilderRoute && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`studio-scroll-top-btn ${location.pathname === '/' ? 'hide-on-mobile-home' : ''}`}
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <style>{`
            .studio-scroll-top-btn {
              position: fixed;
              bottom: 24px;
              right: 24px;
              z-index: 850;
              background: #FFFFFF;
              border: 1px solid #E6E2D8;
              color: var(--text-primary);
              width: 44px;
              height: 44px;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(23, 23, 23, 0.08);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .studio-scroll-top-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(23, 23, 23, 0.12);
            }
            @media (max-width: 767px) {
              .studio-scroll-top-btn {
                bottom: 84px;
                right: 16px;
                width: 44px;
                height: 44px;
              }
            }
          `}</style>
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}

function SiteNavbar(props) { const location=useLocation(); return location.pathname.startsWith('/studio')?null:<Navbar {...props}/>; }
function SiteFooter() { const location=useLocation(); return location.pathname.startsWith('/studio')?null:<Footer/>; }
