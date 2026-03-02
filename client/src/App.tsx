import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Header';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CateringPage } from './pages/CateringPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmail } from './pages/VerifyEmail';
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
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-center" />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
            <Route path="/catering" element={<PublicLayout><CateringPage /></PublicLayout>} />
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
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default App;
