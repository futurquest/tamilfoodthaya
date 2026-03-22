import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Settings, LogOut,
    UtensilsCrossed, ClipboardList, MessageSquare, Tag, Sparkles
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
        <div className="admin-panel-font flex h-screen bg-stone-100">
            <style>{`
                .admin-panel-font,
                .admin-panel-font h1,
                .admin-panel-font h2,
                .admin-panel-font h3,
                .admin-panel-font h4,
                .admin-panel-font h5,
                .admin-panel-font h6 {
                    font-family: var(--font-sans) !important;
                }
            `}</style>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-slate-200">
                    <NavLink to="/admin/dashboard" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Tamil Food Thaya" className="h-10 w-auto object-contain" />
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Panel</h2>
                            <p className="text-xs text-slate-500">Tamil Food Thaya</p>
                        </div>
                    </NavLink>
                </div>

                {/* Nav */}
                <nav className="flex-grow px-3 py-4 space-y-5 overflow-y-auto">
                    {navGroups.map(group => (
                        <div key={group.label}>
                            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${isActive
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                <div className="px-3 py-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500">Administrator</p>
                        </div>
                    </div>
                    <div className="px-3 py-2 mb-1">
                        <LanguageSwitcher />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 w-full transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>{t('admin.layout.logout', 'Logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto flex flex-col">
                <div className="p-8 flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
