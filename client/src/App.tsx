import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/Header';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CateringPage } from './pages/CateringPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmail } from './pages/VerifyEmail';
import { Navigate } from 'react-router-dom';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageCategories } from './pages/admin/ManageCategories';
import { ManageLeads } from './pages/admin/ManageLeads';
import { ViewMessages } from './pages/admin/ViewMessages';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ManageCateringPackages } from './pages/admin/ManageCateringPackages';
import { ManageCateringOrders } from './pages/admin/ManageCateringOrders';
import { ManageAddons } from './pages/admin/ManageAddons';
import { ManageCoupons } from './pages/admin/ManageCoupons';
import { ManageUsers } from './pages/admin/ManageUsers';
import { CateringCheckoutPage } from './pages/CateringCheckoutPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserProtectedRoute } from './components/UserProtectedRoute';
import { UserDashboard } from './pages/user/UserDashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import MotionFX from './motion/MotionFX';
import { useRef } from 'react';

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
            <AppRoutes />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const mainRef = useRef<HTMLElement | null>(null);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content" className="site-main" ref={mainRef}>{children}</main>
      <MotionFX scopeRef={mainRef} />
      <Footer />
    </div>
  );
};

export default App;
