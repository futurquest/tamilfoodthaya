import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Settings, LogOut,
    UtensilsCrossed, ClipboardList, MessageSquare, Tag, Sparkles, ChevronRight
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const navGroups = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
            ]
        },
        {
            label: 'Sales',
            items: [
                { name: 'Leads', path: '/admin/leads', icon: <Users size={18} /> },
                { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={18} /> },
            ]
        },
        {
            label: 'Menu',
            items: [
                { name: 'Categories', path: '/admin/categories', icon: <BookOpen size={18} /> },
                { name: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed size={18} /> },
            ]
        },
        {
            label: 'Catering',
            items: [
                { name: 'Packages', path: '/admin/catering-packages', icon: <UtensilsCrossed size={18} /> },
                { name: 'Orders', path: '/admin/catering-orders', icon: <ClipboardList size={18} /> },
                { name: 'Add-ons', path: '/admin/addons', icon: <Sparkles size={18} /> },
                { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={18} /> },
            ]
        },
        {
            label: 'System',
            items: [
                { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
                { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
            ]
        },
    ];

    return (
        <div className="flex h-screen bg-dark-950">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-dark-800">
                    <NavLink to="/admin/dashboard" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Tamil Food Thaya" className="h-10 w-auto object-contain" />
                        <div>
                            <h2 className="text-sm font-bold text-white leading-tight">Admin Panel</h2>
                            <p className="text-xs text-dark-500">Tamil Food Thaya</p>
                        </div>
                    </NavLink>
                </div>

                {/* Nav */}
                <nav className="flex-grow px-3 py-4 space-y-5 overflow-y-auto">
                    {navGroups.map(group => (
                        <div key={group.label}>
                            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-dark-600">{group.label}</p>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${isActive
                                            ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                                            : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                    {/* active indicator */}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="px-3 py-4 border-t border-dark-800">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-800 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{user?.username}</p>
                            <p className="text-xs text-dark-500">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:bg-dark-800 hover:text-red-400 w-full transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>{t('admin.layout.logout', 'Logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto flex flex-col">
                {/* Top bar */}
                <header className="bg-dark-900/80 backdrop-blur-sm border-b border-dark-800 px-8 py-4 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-dark-400 text-sm">
                        <ChevronRight size={14} className="text-dark-600" />
                        <span className="text-white font-semibold">{t('admin.layout.overview', 'Admin')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                    </div>
                </header>

                <div className="p-8 flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
