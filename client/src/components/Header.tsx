import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Mail, MapPin, Menu, Phone, Shield, ShoppingBag, UserRound, X } from 'lucide-react';
import { SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { getSettings } from '../hooks/useApi';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.catering', 'Catering'), path: '/catering' },
    { name: t('nav.menu', 'Menu'), path: '/menu' },
    { name: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  const solid = scrolled || location.pathname !== '/';

  return (
    <>
      <header className={`site-header ${solid ? 'site-header--solid' : ''}`}>
        <div className="site-header__inner">
          <NavLink to="/" className="brand-mark" aria-label="Tamil Food Thaya home">
            <Logo />
            <span className="brand-mark__copy">
              <strong>Tamil Food Thaya</strong>
              <span>Traditional kitchen and catering</span>
            </span>
          </NavLink>

          <nav className="site-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === '/'} className="site-nav__link">
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <LanguageSwitcher />
            {user ? (
              <>
                <NavLink to="/dashboard" className="icon-action" title={t('nav.my_dashboard', 'Dashboard')}>
                  <UserRound size={18} />
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin/dashboard" className="icon-action" title={t('nav.admin', 'Admin')}>
                    <Shield size={18} />
                  </NavLink>
                )}
                <button onClick={logout} className="icon-action" title={t('nav.logout', 'Log out')}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <NavLink to="/login" className="site-login">
                {t('nav.login', 'Log in')}
              </NavLink>
            )}
            <NavLink to="/menu" className="btn-primary site-order">
              <ShoppingBag size={17} />
              {t('nav.orderFood', 'Order food')}
            </NavLink>
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu__panel" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === '/'} className="mobile-menu__link">
                {link.name}
              </NavLink>
            ))}
            <div className="mobile-menu__tools">
              <LanguageSwitcher />
              {user ? (
                <>
                  <NavLink to="/dashboard" className="mobile-menu__link">{t('nav.my_dashboard', 'Dashboard')}</NavLink>
                  {isAdmin && <NavLink to="/admin/dashboard" className="mobile-menu__link">{t('nav.admin', 'Admin')}</NavLink>}
                  <button onClick={logout} className="mobile-menu__button">{t('nav.logout', 'Log out')}</button>
                </>
              ) : (
                <NavLink to="/login" className="mobile-menu__link">{t('nav.login', 'Log in')}</NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export const PageHeader = ({ title, subtitle, description, image }: { title: string; subtitle?: string; description?: string; image?: string }) => (
  <section className="page-hero" style={image ? ({ '--page-image': `url('${image}')` } as React.CSSProperties) : undefined}>
    <div className="container">
      <h1>{title}</h1>
      {(subtitle || description) && <p>{subtitle || description}</p>}
    </div>
  </section>
);

export const Footer = () => {
  const { t } = useTranslation();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/" className="brand-mark brand-mark--footer">
            <Logo />
            <span className="brand-mark__copy">
              <strong>Tamil Food Thaya</strong>
              <span>{t('footer.tagline', 'Traditional Tamil food in the Netherlands')}</span>
            </span>
          </Link>
          <p>{t('footer.description', 'Authentic Tamil and Sri Lankan dishes for everyday meals, family gatherings, weddings, and community celebrations.')}</p>
          <div className="site-footer__socials">
            <a href={settings?.instagramUrl || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <SiInstagram width={18} height={18} />
            </a>
            <a href={settings?.facebookUrl || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <SiFacebook width={18} height={18} />
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h3>{t('footer.explore', 'Explore')}</h3>
          <Link to="/">{t('nav.home', 'Home')}</Link>
          <Link to="/catering">{t('nav.catering', 'Catering')}</Link>
          <Link to="/menu">{t('nav.menu', 'Menu')}</Link>
          <Link to="/contact">{t('nav.contact', 'Contact')}</Link>
        </div>

        <div className="site-footer__col">
          <h3>{t('footer.visit', 'Visit')}</h3>
          <p className="footer-line"><MapPin size={16} /> {settings?.address || 'Hofplein 20, Rotterdam'}</p>
          <p className="footer-line"><Phone size={16} /> {settings?.phone || '+31 (0) 6 1234 5678'}</p>
          <p className="footer-line"><Mail size={16} /> {settings?.email || 'info@tamilfoodthaya.nl'}</p>
        </div>

        <div className="site-footer__col">
          <h3>{t('footer.hours', 'Kitchen hours')}</h3>
          <p>{t('footer.monFri', 'Mon - Fri')} <strong>12:00 - 22:00</strong></p>
          <p>{t('footer.saturday', 'Saturday')} <strong>11:00 - 23:00</strong></p>
          <p>{t('footer.sunday', 'Sunday')} <strong>12:00 - 21:00</strong></p>
          <Link to="/contact" className="btn-primary">{t('footer.cateringCta', 'Ask about catering')}</Link>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>{t('footer.copyright', 'Copyright 2026 Tamil Food Thaya. All rights reserved.')}</span>
        <span>{t('footer.privacy', 'Privacy Policy')}</span>
        <span>{t('footer.terms', 'Terms of Use')}</span>
      </div>
    </footer>
  );
};
