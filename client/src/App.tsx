import { RouteMetadata } from './components/SEO';
import { CateringInvitation } from './components/CateringInvitation';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/Header';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CateringPage } from './pages/CateringPage';
import { ContactPage } from './pages/ContactPage';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserProtectedRoute } from './components/UserProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import MotionFX from './motion/MotionFX';
import ScrollToTop from './components/ScrollToTop';
import { lazy, Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLoader } from './components/Logo';

const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminLayout = lazy(() => import('./components/AdminLayout').then(module => ({ default: module.AdminLayout })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const ManageMenu = lazy(() => import('./pages/admin/ManageMenu').then(module => ({ default: module.ManageMenu })));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories').then(module => ({ default: module.ManageCategories })));
const ManageLeads = lazy(() => import('./pages/admin/ManageLeads').then(module => ({ default: module.ManageLeads })));
const ViewMessages = lazy(() => import('./pages/admin/ViewMessages').then(module => ({ default: module.ViewMessages })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ManageCateringPackages = lazy(() => import('./pages/admin/ManageCateringPackages').then(module => ({ default: module.ManageCateringPackages })));
const ManageCateringOrders = lazy(() => import('./pages/admin/ManageCateringOrders').then(module => ({ default: module.ManageCateringOrders })));
const ManageAddons = lazy(() => import('./pages/admin/ManageAddons').then(module => ({ default: module.ManageAddons })));
const ManageCoupons = lazy(() => import('./pages/admin/ManageCoupons').then(module => ({ default: module.ManageCoupons })));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers').then(module => ({ default: module.ManageUsers })));
const CateringCheckoutPage = lazy(() => import('./pages/CateringCheckoutPage').then(module => ({ default: module.CateringCheckoutPage })));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(module => ({ default: module.UserDashboard })));

function AppRoutes() {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname} label="Router">
      <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
            <Route path="/catering" element={<PublicLayout><CateringPage /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
            <Route path="/catering/checkout/:packageId" element={<PublicLayout><CateringCheckoutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

            {/* Auth Routes */}
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />

            {/* User Dashboard */}
            <Route element={<UserProtectedRoute />}>
              <Route path="/dashboard" element={<PublicLayout><UserDashboard /></PublicLayout>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/leads" element={<ManageLeads />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/menu" element={<ManageMenu />} />
                <Route path="/admin/categories" element={<ManageCategories />} />
                <Route path="/admin/messages" element={<ViewMessages />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/catering-packages" element={<ManageCateringPackages />} />
                <Route path="/admin/catering-orders" element={<ManageCateringOrders />} />
                <Route path="/admin/addons" element={<ManageAddons />} />
                <Route path="/admin/coupons" element={<ManageCoupons />} />
              </Route>
            </Route>
          </Routes>
        </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" />
          <Router>
            <RouteMetadata />
            <Suspense fallback={<PageLoader />}><AppRoutes /></Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const mainRef = useRef<HTMLElement | null>(null);
  const { pathname: rawPathname } = useLocation();
  const { t } = useTranslation();
  const pathname = rawPathname.replace(/\/+$/, '') || '/';
  const isLanding = ['/', '/menu', '/catering', '/contact'].includes(pathname);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{t('common.skipLink')}</a>
      <ScrollToTop />
      <Header />
      <div className="fx-progress" aria-hidden="true" />
      <main id="main-content" className="site-main" ref={mainRef}>{children}{isLanding && <CateringInvitation contact={pathname === '/contact'} />}</main>
      {isLanding && <MotionFX scopeRef={mainRef} />}
      <Footer />
    </div>
  );
};

export default App;
