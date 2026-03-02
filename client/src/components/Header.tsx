import { useState, useEffect, cloneElement, type ReactElement, type SVGProps } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SiInstagram, SiFacebook } from '@icons-pack/react-simple-icons';
import { ShoppingBag, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getSettings } from '../hooks/useApi';
import { useQuery } from '@tanstack/react-query';

// ---------- HEADER ----------
export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    const isHome = location.pathname === '/';
    const isDarkHeader = !isHome || isScrolled;

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.catering'), path: '/catering' },
        { name: t('nav.menu'), path: '/menu' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isDarkHeader
                    ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-dark-100 py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Tamil Food Thaya" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-14" />
                    </NavLink>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `font-semibold text-sm tracking-wide transition-colors duration-200 px-1 py-0.5 border-b-2 ${isActive
                                        ? 'text-primary-600 border-primary-500'
                                        : isDarkHeader
                                            ? 'text-dark-700 border-transparent hover:text-primary-600 hover:border-primary-300'
                                            : 'text-white/90 border-transparent hover:text-white hover:border-white/60'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        <LanguageSwitcher />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-semibold ${isDarkHeader ? 'text-dark-700' : 'text-white'}`}>
                                    Hi, {user.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="btn-secondary text-sm py-2 px-4"
                                    style={{ borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    {t('nav.logout')}
                                </button>
                                {isAdmin && (
                                    <NavLink to="/admin/dashboard" className="btn-primary text-sm" style={{ borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                        {t('nav.admin')}
                                    </NavLink>
                                )}
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                className={`font-semibold text-sm px-4 py-2 rounded-xl border-2 transition-all duration-300 ${isDarkHeader
                                    ? 'border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white'
                                    : 'border-white/70 text-white hover:bg-white hover:text-primary-600'
                                    }`}
                            >
                                {t('nav.login')}
                            </NavLink>
                        )}
                    </nav>

                    {/* Mobile hamburger */}
                    <button
                        className={`md:hidden p-2 rounded-lg ${isDarkHeader ? 'text-dark-700' : 'text-white'}`}
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
                        <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
                        <div className="w-5 h-0.5 bg-current transition-all" />
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-dark-100 px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `block px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-dark-700 hover:bg-dark-50'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        {user ? (
                            <>
                                <div className="px-4 py-2 text-sm text-dark-500 font-medium">Hi, {user.username}</div>
                                <button onClick={logout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-dark-700 hover:bg-dark-50 font-semibold">{t('nav.logout')}</button>
                                {isAdmin && <NavLink to="/admin/dashboard" className="block px-4 py-2.5 rounded-xl text-sm text-primary-600 font-bold">{t('nav.admin')}</NavLink>}
                            </>
                        ) : (
                            <NavLink to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary-600 bg-primary-50">{t('nav.login')}</NavLink>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

// ---------- PAGE HEADER BANNER ----------
// Use this at the top of any inner page for a consistent V2 section header
export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 text-white pt-36 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=60')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow">{title}</h1>
            {subtitle && <p className="text-lg text-white/80 max-w-xl mx-auto">{subtitle}</p>}
            <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-gold-400 mx-auto mt-6 rounded-full" />
        </div>
    </section>
);

// ---------- FOOTER ----------
export const Footer = () => {
    const { t } = useTranslation();
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    return (
        <footer className="bg-dark-900 text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-extrabold text-xl">
                                T
                            </div>
                            <span className="font-extrabold text-xl tracking-tight">Tamil Food Thaya</span>
                        </div>
                        <p className="text-dark-400 max-w-sm mb-8 leading-relaxed">
                            {t('footer.description', 'Authentic Tamil cuisine in the heart of Netherlands. Dine-in, takeaway & event catering.')}
                        </p>
                        <div className="flex gap-3">
                            <SocialIcon icon={<SiInstagram />} href={settings?.instagramUrl || '#'} />
                            <SocialIcon icon={<SiFacebook />} href={settings?.facebookUrl || '#'} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-gold-400 mb-6">{t('footer.locations', 'Location')}</h4>
                        <ul className="space-y-4 text-dark-400 text-sm">
                            <li className="flex gap-2 items-start">
                                <MapPin size={16} className="text-primary-500 shrink-0 mt-0.5" />
                                <span>{settings?.address || 'Rotterdam (Hofplein 20)'}<br /><span className="text-xs text-dark-500">Restaurant & Catering</span></span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-gold-400 mb-6">{t('footer.contact', 'Contact')}</h4>
                        <ul className="space-y-4 text-dark-400 text-sm">
                            <li className="flex gap-2 items-center">
                                <Phone size={16} className="text-primary-500 shrink-0" />
                                <span>{settings?.phone || '+31 (0) 6 1234 5678'}</span>
                            </li>
                            <li className="flex gap-2 items-center">
                                <ShoppingBag size={16} className="text-primary-500 shrink-0" />
                                <span>{settings?.businessHours ? `Vandaag: ${settings.businessHours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]}` : 'Ma - Zo: 12:00 - 22:00'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-dark-500">
                    <p>© 2026 Tamil Food Thaya. {t('footer.rights', 'All rights reserved.')}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacybeleid</a>
                        <a href="#" className="hover:text-white transition-colors">Algemene Voorwaarden</a>
                        <a href="#" className="hover:text-white transition-colors">KvK: 12345678</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ---------- SOCIAL ICON ----------
type SocialIconProps = { icon: ReactElement<SVGProps<SVGSVGElement>>; href?: string; };
const SocialIcon = ({ icon, href = '#' }: SocialIconProps) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-xl bg-dark-800 text-dark-400 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300">
        {cloneElement(icon, { width: 16, height: 16 })}
    </a>
);