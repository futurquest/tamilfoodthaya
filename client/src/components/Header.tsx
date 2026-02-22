import { useState, useEffect, cloneElement, type ReactElement, type SVGProps } from 'react';
import { Container } from './ui/Container';
import { Button } from './ui/Button';

import {
    ShoppingBag,
    MapPin,
    Phone,
} from 'lucide-react';
import { SiInstagram, SiFacebook } from '@icons-pack/react-simple-icons';


import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getSettings } from '../hooks/useApi';
import { useQuery } from '@tanstack/react-query';

// ---------- HEADER ----------
import { useLocation } from 'react-router-dom';

// ... imports

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    // Check if we are on the home page
    const isHome = location.pathname === '/';

    // Header should be dark (scrolled style) if not home, or if home and scrolled
    const isDarkHeader = !isHome || isScrolled;

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.menu'), path: '/menu' },
        { name: t('nav.catering'), path: '/catering' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    // Scroll listener just for HomeComponent effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isDarkHeader ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
                    }`}
            >
                <Container className="flex items-center justify-between">
                    <NavLink to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-tamil-maroon rounded-full flex items-center justify-center text-tamil-gold font-bold text-xl">
                            T
                        </div>
                        <span
                            className={`font-bold text-xl tracking-tight transition-colors ${isDarkHeader ? 'text-tamil-charcoal' : 'text-white'
                                }`}
                        >
                            Tamil Food Thaya
                        </span>
                    </NavLink>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `font-medium uppercase tracking-wider text-sm hover:text-tamil-maroon transition-colors ${isActive ? 'text-tamil-maroon' : isDarkHeader ? 'text-tamil-charcoal' : 'text-white'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        <LanguageSwitcher />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-bold ${isDarkHeader ? 'text-tamil-charcoal' : 'text-white'}`}>Hi, {user.username}</span>
                                <Button variant="outline" size="sm" onClick={logout} className="border-tamil-maroon text-tamil-maroon hover:bg-tamil-maroon hover:text-white">
                                    {t('nav.logout')}
                                </Button>
                                {isAdmin && (
                                    <NavLink to="/admin/dashboard">
                                        <Button size="sm">{t('nav.admin')}</Button>
                                    </NavLink>
                                )}
                            </div>
                        ) : (
                            <NavLink to="/login">
                                <Button variant="ghost" className={isDarkHeader ? 'text-tamil-charcoal' : 'text-white'}>{t('nav.login')}</Button>
                            </NavLink>
                        )}
                    </nav>

                    {/* TODO: Add mobile nav toggle & cart button */}
                </Container>
            </header>
        </>
    );
};

// ---------- FOOTER ----------
export const Footer = () => {
    const { t } = useTranslation();
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    return (
        <footer className="bg-tamil-charcoal text-white pt-24 pb-12">
            <Container>
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-tamil-maroon rounded-full flex items-center justify-center text-tamil-gold font-bold text-xl">
                                T
                            </div>
                            <span className="font-bold text-2xl tracking-tight">Tamil Food Thaya</span>
                        </div>
                        <p className="text-gray-400 max-w-sm mb-8">
                            {t('footer.description')}
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<SiInstagram />} href={settings?.instagramUrl || "#"} />
                            <SocialIcon icon={<SiFacebook />} href={settings?.facebookUrl || "#"} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 uppercase tracking-wider text-tamil-gold">{t('footer.locations')}</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex gap-2">
                                <MapPin size={20} className="text-tamil-maroon shrink-0" />
                                <span>
                                    {settings?.address || 'Rotterdam (Hofplein 20)'}
                                    <br />
                                    <span className="text-xs">Restaurant & Catering</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 uppercase tracking-wider text-tamil-gold">{t('footer.contact')}</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex gap-2">
                                <Phone size={20} className="text-tamil-maroon" />
                                <span>{settings?.phone || '+31 (0) 6 1234 5678'}</span>
                            </li>
                            <li className="flex gap-2">
                                <ShoppingBag size={20} className="text-tamil-maroon" />
                                <span>
                                    {settings?.businessHours ?
                                        `Vandaag: ${settings.businessHours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]}`
                                        : 'Ma - Zo: 12:00 - 22:00'}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
                    <p>© 2025 Tamil Food Thaya. {t('footer.rights')}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">
                            Privacybeleid
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Algemene Voorwaarden
                        </a>
                        <a href="#" className="hover:text-white transition-colors">KvK: 12345678</a>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

// ---------- SOCIAL ICON ----------
type SocialIconProps = {
    icon: ReactElement<SVGProps<SVGSVGElement>>;
    size?: number; // optional, default size
    href?: string;
};

const SocialIcon = ({ icon, size = 20, href = "#" }: SocialIconProps) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-tamil-gold text-tamil-charcoal flex items-center justify-center hover:bg-white transition-all"
    >
        {cloneElement(icon, { width: size, height: size })}
    </a>
);