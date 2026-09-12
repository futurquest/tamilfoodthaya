import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Settings, LogOut,
    UtensilsCrossed, ClipboardList, MessageSquare, Tag, Sparkles,
    ShieldCheck, CircleDot, ChevronRight
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
            description: 'Daily control',
            items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
            ]
        },
        {
            label: 'Sales',
            description: 'Inbox and leads',
            items: [
                { name: 'Leads', path: '/admin/leads', icon: <Users size={18} /> },
                { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={18} /> },
            ]
        },
        {
            label: 'Menu',
            description: 'Food catalogue',
            items: [
                { name: 'Categories', path: '/admin/categories', icon: <BookOpen size={18} /> },
                { name: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed size={18} /> },
            ]
        },
        {
            label: 'Catering',
            description: 'Events and offers',
            items: [
                { name: 'Packages', path: '/admin/catering-packages', icon: <UtensilsCrossed size={18} /> },
                { name: 'Orders', path: '/admin/catering-orders', icon: <ClipboardList size={18} /> },
                { name: 'Add-ons', path: '/admin/addons', icon: <Sparkles size={18} /> },
                { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={18} /> },
            ]
        },
        {
            label: 'System',
            description: 'Access and setup',
            items: [
                { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
                { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
            ]
        },
    ];

    return (
        <div className="admin-panel-font admin-shell flex h-screen">
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
            <aside className="admin-sidebar-panel w-[17.5rem] flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="admin-brand-block px-4 py-4">
                    <NavLink to="/admin/dashboard" className="admin-brand-link group">
                        <span className="admin-brand-seal">
                            <img src="/logo.png" alt="Tamil Food Thaya" className="h-8 w-8 object-contain" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-extrabold leading-tight">Tamil Food Thaya</h2>
                            <p className="truncate text-xs">Restaurant operations</p>
                        </div>
                        <ChevronRight size={16} className="admin-brand-arrow" />
                    </NavLink>

                    <div className="admin-sidebar-status">
                        <div>
                            <span>System</span>
                            <strong>Admin console</strong>
                        </div>
                        <span className="admin-status-pill">
                            <CircleDot size={12} />
                            Live
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="admin-nav flex-grow px-3 py-4 space-y-4 overflow-y-auto" aria-label="Admin navigation">
                    {navGroups.map(group => (
                        <div className="admin-nav-group" key={group.label}>
                            <div className="admin-nav-group-header px-2">
                                <p className="admin-nav-label text-[10px] font-bold uppercase tracking-widest">{group.label}</p>
                                <span>{group.description}</span>
                            </div>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mb-0.5 ${isActive
                                            ? 'admin-nav-link--active'
                                            : ''
                                        }`
                                    }
                                >
                                    <span className="admin-nav-icon">{item.icon}</span>
                                    <span>{item.name}</span>
                                    <ChevronRight size={15} className="admin-nav-chevron" />
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="admin-user-block px-3 py-4">
                    <div className="admin-user-card flex items-center gap-3 px-3 py-3 rounded-xl mb-3">
                        <div className="admin-user-avatar w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{user?.username}</p>
                            <p className="text-xs">Administrator access</p>
                        </div>
                        <ShieldCheck size={16} className="admin-user-shield" />
                    </div>
                    <div className="admin-language-slot px-3 py-2 mb-2">
                        <LanguageSwitcher />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="admin-logout flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold w-full transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>{t('admin.layout.logout', 'Logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main flex-grow overflow-y-auto flex flex-col">
                <div className="admin-main-inner p-8 flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
