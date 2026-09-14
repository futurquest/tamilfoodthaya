import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
    LayoutDashboard, Users, BookOpen, Settings, LogOut,
    UtensilsCrossed, ClipboardList, MessageSquare, Tag, Sparkles,
    ShieldCheck, CircleDot, ChevronRight, PanelLeftOpen, PanelLeftClose, Menu, X, Package, UserCog
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from 'react-i18next';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation();

    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('tft-admin-sidebar-collapsed') === '1'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('tft-admin-sidebar-collapsed', collapsed ? '1' : '0'); } catch { /* noop */ }
    }, [collapsed]);

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    );
    const [mobileOpen, setMobileOpen] = useState(false);
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const onChange = () => {
            setIsMobile(mq.matches);
            if (!mq.matches) setMobileOpen(false);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
        const scroller = mainRef.current;
        const prevOverflow = scroller?.style.overflow || '';
        if (scroller) scroller.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            if (scroller) scroller.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [mobileOpen]);

    const toggleSidebar = () => {
        if (isMobile) setMobileOpen(o => !o);
        else setCollapsed(c => !c);
    };

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
            description: 'Orders, leads and messages',
            items: [
                { name: 'Orders', path: '/admin/catering-orders', icon: <ClipboardList size={18} /> },
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
                { name: 'Packages', path: '/admin/catering-packages', icon: <Package size={18} /> },
                { name: 'Add-ons', path: '/admin/addons', icon: <Sparkles size={18} /> },
                { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={18} /> },
            ]
        },
        {
            label: 'System',
            description: 'Access and setup',
            items: [
                { name: 'Users', path: '/admin/users', icon: <UserCog size={18} /> },
                { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
            ]
        },
    ];

const activePage = navGroups
        .flatMap(group => group.items)
        .find(item => pathname === item.path || pathname.startsWith(item.path + '/'))?.name;

    return (
        <div className={`admin-panel-font admin-shell ${collapsed ? 'admin-sidebar-collapsed' : ''} flex h-screen`}>
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
            <aside
                id="admin-sidebar"
                className={`admin-sidebar-panel w-[17.5rem] flex flex-col flex-shrink-0 ${mobileOpen ? 'admin-mobile-open' : ''}`}
            >
                {/* Logo */}
                
                <div className="admin-brand-block px-4 py-4">
                    <NavLink to="/admin/dashboard" className="admin-brand-link group">
                 
                        <span className="admin-brand-seal">
                            <img src="/logo-seal.png" alt="Tamil Food Thaya" className="h-8 w-8 object-contain" />
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
                                    onClick={() => { if (isMobile) setMobileOpen(false); }}
                                    className={({ isActive }) =>
                                        `admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mb-0.5 ${isActive
                                            ? 'admin-nav-link--active'
                                            : ''
                                        }`
                                    }
                                >
<span className="admin-nav-icon shrink-0">{item.icon}</span>
                                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                                    <ChevronRight size={15} className="admin-nav-chevron shrink-0" />
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
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <div className="flex-1">
                                <LanguageSwitcher dropUp />
                            </div>
                        </div>
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

            {isMobile && mobileOpen && (
                <div
                    className="admin-sidebar-backdrop"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

{/* Main Content */}
            <main ref={mainRef} className="admin-main flex-grow overflow-y-auto flex flex-col">
                <header className="admin-topbar">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="admin-sidebar-toggle"
                        aria-controls="admin-sidebar"
                        aria-expanded={isMobile ? mobileOpen : !collapsed}
                        aria-label={isMobile
                            ? (mobileOpen ? t('admin.layout.closeMenu', 'Close menu') : t('admin.layout.openMenu', 'Open menu'))
                            : (collapsed ? t('admin.layout.expandSidebar', 'Expand sidebar') : t('admin.layout.collapseSidebar', 'Collapse sidebar'))}
                        title={isMobile
                            ? (mobileOpen ? t('admin.layout.closeMenu', 'Close menu') : t('admin.layout.openMenu', 'Open menu'))
                            : (collapsed ? t('admin.layout.expandSidebar', 'Expand sidebar') : t('admin.layout.collapseSidebar', 'Collapse sidebar'))}
                    >
                        {isMobile
                            ? (mobileOpen ? <X size={19} /> : <Menu size={19} />)
                            : (collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />)}
                    </button>
                    <span className="admin-topbar-logo">
                        <img src="/logo-seal.png" alt="Tamil Food Thaya" />
                    </span>
                    {activePage && <p className="admin-topbar-page">{activePage}</p>}
                </header>
                <div className="admin-main-inner p-8 flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
