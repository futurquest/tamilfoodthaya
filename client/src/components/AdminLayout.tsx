import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { name: t('admin.layout.dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: t('admin.layout.orders'), path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { name: t('admin.layout.leads'), path: '/admin/leads', icon: <Users size={20} /> },
        { name: t('admin.layout.menu'), path: '/admin/menu', icon: <BookOpen size={20} /> },
        { name: t('admin.layout.categories'), path: '/admin/categories', icon: <BookOpen size={20} /> },
        { name: t('admin.layout.settings'), path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-tamil-charcoal text-white flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-tamil-gold">{t('admin.layout.title')}</h2>
                    <p className="text-xs text-gray-400 mt-1">{t('admin.layout.loggedInAs')} {user?.username}</p>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-tamil-maroon text-white' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{t('admin.layout.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto">
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-tamil-charcoal">{t('admin.layout.overview')}</h3>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="w-8 h-8 rounded-full bg-tamil-maroon text-tamil-gold flex items-center justify-center font-bold">A</div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
