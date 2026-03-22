import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { SiInstagram, SiFacebook } from '@icons-pack/react-simple-icons';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getSettings } from '../hooks/useApi';
import { useQuery } from '@tanstack/react-query';

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuAnim, setMenuAnim] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    const isHome = location.pathname === '/';
    const isDark = !isHome || scrolled;

    const navLinks = [
        { name: t('nav.home', 'Home'), path: '/' },
        { name: t('nav.catering', 'Catering'), path: '/catering' },
        { name: t('nav.menu', 'Menu'), path: '/menu' },
        { name: t('nav.contact', 'Contact'), path: '/contact' },
    ];

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const toggleMobile = () => {
        if (!mobileOpen) { setMobileOpen(true); setTimeout(() => setMenuAnim(true), 10); }
        else { setMenuAnim(false); setTimeout(() => setMobileOpen(false), 280); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

                .hdr-root {
                    position: fixed; top: 0; width: 100%; z-index: 100;
                    transition: background 0.35s, padding 0.35s, box-shadow 0.35s, border-color 0.35s;
                }
                .hdr-root.light {
                    background: rgba(255,255,255,0.97); backdrop-filter: blur(16px);
                    box-shadow: 0 1px 0 rgba(0,0,0,0.06);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    padding: 0;
                }
                .hdr-root.dark { background: transparent; padding: 0; }

                .hdr-inner {
                    max-width: 1200px; margin: 0 auto;
                    padding: 0 24px; height: 68px;
                    display: flex; align-items: center; justify-content: space-between;
                }

                /* Logo */
                .hdr-logo {
                    display: flex; align-items: center; gap: 10px; text-decoration: none;
                    transition: opacity 0.2s;
                }
                .hdr-logo:hover { opacity: 0.85; }
                .hdr-logo-dot {
                    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif; font-weight: 700;
                    font-size: 16px; color: #0c0a08;
                    box-shadow: 0 2px 10px rgba(232,160,32,0.35);
                }
                .hdr-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 18px; font-weight: 700; letter-spacing: -0.01em;
                    transition: color 0.3s;
                }
                .hdr-logo-name em { font-style: italic; color: #e8a020; }
                .hdr-root.light  .hdr-logo-name { color: #1a1209; }
                .hdr-root.dark   .hdr-logo-name { color: #f5efe4; }

                /* Desktop nav */
                .hdr-nav { display: flex; align-items: center; gap: 4px; }

                .hdr-link {
                    position: relative; font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 500; letter-spacing: 0.02em;
                    padding: 7px 13px; border-radius: 8px;
                    text-decoration: none; transition: color 0.2s, background 0.2s;
                }
                .hdr-link::after {
                    content: ''; position: absolute; bottom: 3px; left: 13px; right: 13px;
                    height: 1.5px; background: #e8a020; border-radius: 2px;
                    transform: scaleX(0); transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
                    transform-origin: left;
                }
                .hdr-link.active::after,
                .hdr-link:hover::after { transform: scaleX(1); }

                .hdr-root.light .hdr-link         { color: #4a3728; }
                .hdr-root.light .hdr-link:hover   { color: #1a1209; background: rgba(0,0,0,0.04); }
                .hdr-root.light .hdr-link.active  { color: #b87a10; }

                .hdr-root.dark .hdr-link         { color: rgba(240,236,228,0.75); }
                .hdr-root.dark .hdr-link:hover   { color: #f5efe4; background: rgba(255,255,255,0.07); }
                .hdr-root.dark .hdr-link.active  { color: #e8a020; }

                .hdr-login {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px; font-weight: 600; letter-spacing: 0.03em;
                    padding: 7px 18px; border-radius: 8px; cursor: pointer;
                    text-decoration: none; transition: all 0.2s; border: none;
                }
                .hdr-root.light .hdr-login {
                    background: #1a1209; color: #f5efe4;
                    border: 1px solid #1a1209;
                }
                .hdr-root.light .hdr-login:hover {
                    background: #2e2010;
                }
                .hdr-root.dark .hdr-login {
                    background: transparent; color: #f5efe4;
                    border: 1px solid rgba(240,236,228,0.3);
                }
                .hdr-root.dark .hdr-login:hover {
                    background: rgba(255,255,255,0.08); border-color: rgba(240,236,228,0.6);
                }

                .hdr-admin-btn {
                    font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 8px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #0c0a08; text-decoration: none;
                    box-shadow: 0 2px 10px rgba(232,160,32,0.3);
                    transition: filter 0.2s, transform 0.2s;
                }
                .hdr-admin-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

                /* Hamburger */
                .hdr-burger {
                    display: none; flex-direction: column; gap: 5px;
                    background: none; border: none; cursor: pointer; padding: 6px;
                }
                .hdr-burger span {
                    display: block; width: 22px; height: 1.5px; border-radius: 2px;
                    transition: transform 0.25s, opacity 0.25s, background 0.3s;
                }
                .hdr-root.light .hdr-burger span { background: #1a1209; }
                .hdr-root.dark  .hdr-burger span { background: #f5efe4; }
                .hdr-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
                .hdr-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
                .hdr-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

                /* Mobile drawer */
                .hdr-mobile {
                    position: fixed; inset: 0; top: 68px; z-index: 99;
                    display: flex; flex-direction: column;
                }
                .hdr-mobile-backdrop {
                    position: absolute; inset: 0;
                    background: rgba(10,8,6,0.7); backdrop-filter: blur(4px);
                    transition: opacity 0.28s; opacity: 0;
                }
                .hdr-mobile-backdrop.in { opacity: 1; }
                .hdr-mobile-panel {
                    position: relative; width: 280px; max-width: 90vw;
                    background: #0f0d0a; height: 100%;
                    border-right: 1px solid rgba(255,255,255,0.07);
                    padding: 24px 20px;
                    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
                    display: flex; flex-direction: column; gap: 4px;
                }
                .hdr-mobile-panel.in { transform: translateX(0); }

                .hdr-mobile-link {
                    display: block; padding: 11px 16px; border-radius: 10px;
                    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
                    text-decoration: none; color: rgba(240,236,228,0.75);
                    transition: background 0.18s, color 0.18s;
                    border: 1px solid transparent;
                }
                .hdr-mobile-link:hover  { background: rgba(255,255,255,0.05); color: #f5efe4; }
                .hdr-mobile-link.active { color: #e8a020; border-color: rgba(232,160,32,0.2); background: rgba(232,160,32,0.05); }
                .hdr-mobile-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 0; }

                @media (max-width: 900px) {
                    .hdr-desktop { display: none !important; }
                    .hdr-burger   { display: flex !important; }
                }
                @media (min-width: 901px) {
                    .hdr-mobile { display: none !important; }
                }
            `}</style>

            <header className={`hdr-root ${isDark ? 'light' : 'dark'}`}>
                <div className="hdr-inner">
                    {/* Logo */}
                    <NavLink to="/" className="hdr-logo">
                        <div className="hdr-logo-dot">T</div>
                        <span className="hdr-logo-name">
                            Tamil Food <em>Thaya</em>
                        </span>
                    </NavLink>

                    {/* Desktop */}
                    <nav className="hdr-nav hdr-desktop" style={{ display: 'flex' }}>
                        {navLinks.map(l => (
                            <NavLink
                                key={l.path}
                                to={l.path}
                                end={l.path === '/'}
                                className={({ isActive }) => `hdr-link${isActive ? ' active' : ''}`}
                            >
                                {l.name}
                            </NavLink>
                        ))}

                        <div style={{ width: 1, height: 20, background: 'rgba(128,100,60,0.3)', margin: '0 8px', alignSelf: 'center' }} />

                        <LanguageSwitcher />

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <NavLink to="/dashboard" className={({ isActive }) => `hdr-link${isActive ? ' active' : ''}`}>
                                    {t('nav.my_dashboard', 'Dashboard')}
                                </NavLink>
                                <button onClick={logout} className="hdr-login">
                                    {t('nav.logout', 'Log out')}
                                </button>
                                {isAdmin && (
                                    <NavLink to="/admin/dashboard" className="hdr-admin-btn">
                                        {t('nav.admin', 'Admin')}
                                    </NavLink>
                                )}
                            </div>
                        ) : (
                            <NavLink to="/login" className="hdr-login" style={{ marginLeft: 4 }}>
                                {t('nav.login', 'Log in')}
                            </NavLink>
                        )}
                    </nav>

                    {/* Burger */}
                    <button
                        className={`hdr-burger${mobileOpen ? ' open' : ''}`}
                        onClick={toggleMobile}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="hdr-mobile">
                    <div className={`hdr-mobile-backdrop${menuAnim ? ' in' : ''}`} onClick={toggleMobile} />
                    <div className={`hdr-mobile-panel${menuAnim ? ' in' : ''}`}>
                        {navLinks.map(l => (
                            <NavLink
                                key={l.path}
                                to={l.path}
                                end={l.path === '/'}
                                className={({ isActive }) => `hdr-mobile-link${isActive ? ' active' : ''}`}
                            >
                                {l.name}
                            </NavLink>
                        ))}
                        <div className="hdr-mobile-divider" />
                        <div style={{ padding: '2px 10px 10px' }}>
                            <LanguageSwitcher />
                        </div>
                        <div className="hdr-mobile-divider" />
                        {user ? (
                            <>
                                <NavLink to="/dashboard" className={({ isActive }) => `hdr-mobile-link${isActive ? ' active' : ''}`}>
                                    {t('nav.my_dashboard', 'Dashboard')}
                                </NavLink>
                                <button onClick={logout} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '11px 16px', borderRadius: 10, textAlign: 'left', width: '100%',
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
                                    color: 'rgba(240,236,228,0.75)', transition: 'background 0.18s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                    {t('nav.logout', 'Log out')}
                                </button>
                                {isAdmin && (
                                    <NavLink to="/admin/dashboard" className="hdr-mobile-link" style={{ color: '#e8a020', fontWeight: 700 }}>
                                        {t('nav.admin', 'Admin')}
                                    </NavLink>
                                )}
                            </>
                        ) : (
                            <NavLink to="/login" className="hdr-mobile-link" style={{ color: '#e8a020', fontWeight: 600, marginTop: 4 }}>
                                {t('nav.login', 'Log in')}
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};


// ─────────────────────────────────────────────────────────────
// PAGE HEADER BANNER  (used at top of inner pages)
// ─────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, description }: { title: string; subtitle?: string; description?: string }) => (
    <>
        <style>{`
            .ph-root {
                position: relative;
                background: #0a0806;
                padding: 140px 24px 88px;
                text-align: center;
                overflow: hidden;
            }
            .ph-glow {
                position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                width: 800px; height: 400px;
                background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.1) 0%, transparent 65%);
                pointer-events: none;
            }
            .ph-grain {
                position: absolute; inset: 0; opacity: 0.03; pointer-events: none;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                background-size: 200px;
            }
            .ph-bottom {
                position: absolute; bottom: 0; left: 0; right: 0; height: 72px;
                pointer-events: none;
            }
            .ph-eyebrow {
                display: block; font-family: 'DM Sans', sans-serif;
                font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
                color: #e8a020; font-weight: 600; margin-bottom: 14px; position: relative;
            }
            .ph-title {
                font-family: 'Playfair Display', serif;
                font-size: clamp(38px, 6vw, 68px); font-weight: 700;
                line-height: 1.08; color: #f5efe4; position: relative; margin-bottom: 14px;
            }
            .ph-sub {
                font-family: 'DM Sans', sans-serif;
                font-size: 16px; color: rgba(240,236,228,0.5); font-weight: 300;
                max-width: 480px; margin: 0 auto; line-height: 1.75; position: relative;
            }
            .ph-divider {
                width: 52px; height: 1px;
                background: linear-gradient(90deg, transparent, #e8a020, transparent);
                margin: 20px auto 0; position: relative;
            }
        `}</style>
        <section className="ph-root">
            <div className="ph-glow" />
            <div className="ph-grain" />
            <div className="ph-bottom" style={{ background: 'linear-gradient(to bottom, transparent, var(--page-bg, #0f0d0a))' }} />
            <span className="ph-eyebrow">Tamil Food Thaya</span>
            <h1 className="ph-title">{title}</h1>
            {(subtitle || description) && <p className="ph-sub">{subtitle || description}</p>}
            <div className="ph-divider" />
        </section>
    </>
);


// ─────────────────────────────────────────────────────────────
// FOOTER  (kept in sync with /outputs/Footer.tsx)
// ─────────────────────────────────────────────────────────────
export const Footer = () => {
    const { t } = useTranslation();
    const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

    const isOpen = true; // Wire up real open/closed logic if needed

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

                .ft-root {
                    font-family: 'DM Sans', sans-serif;
                    background: #0a0806;
                    color: rgba(240,236,228,0.55);
                    position: relative;
                    overflow: hidden;
                }
                .ft-top-line {
                    position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent 0%, #b87a10 30%, #e8a020 50%, #b87a10 70%, transparent 100%);
                }
                .ft-glow {
                    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                    width: 700px; height: 320px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.07) 0%, transparent 68%);
                    pointer-events: none;
                }
                .ft-grain {
                    position: absolute; inset: 0; opacity: 0.025; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px;
                }

                .ft-body { max-width: 1200px; margin: 0 auto; padding: 68px 24px 0; position: relative; }

                .ft-grid {
                    display: grid;
                    grid-template-columns: 1.8fr 1fr 1.3fr 1.2fr;
                    gap: 48px;
                    padding-bottom: 56px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                /* Brand column */
                .ft-brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; font-weight: 700; color: #f5efe4;
                    margin-bottom: 14px; display: block;
                }
                .ft-brand-name em { font-style: italic; color: #e8a020; }
                .ft-brand-desc {
                    font-size: 13.5px; line-height: 1.75; margin-bottom: 20px;
                    color: rgba(240,236,228,0.4); font-weight: 300;
                }
                .ft-socials { display: flex; gap: 9px; }
                .ft-social {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    display: flex; align-items: center; justify-content: center;
                    color: rgba(240,236,228,0.5);
                    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
                    text-decoration: none;
                }
                .ft-social:hover {
                    background: rgba(232,160,32,0.12); color: #e8a020;
                    border-color: rgba(232,160,32,0.3); transform: translateY(-2px);
                }

                /* Col heading */
                .ft-col-head {
                    font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
                    font-weight: 600; color: rgba(240,236,228,0.28); margin-bottom: 20px;
                }

                /* Nav links */
                .ft-nav-link {
                    display: flex; align-items: center; gap: 0;
                    font-size: 13.5px; font-weight: 400; color: rgba(240,236,228,0.5);
                    text-decoration: none; padding: 5px 0;
                    transition: color 0.2s; position: relative; overflow: hidden;
                }
                .ft-nav-link::before {
                    content: '—'; color: #e8a020; font-size: 11px; font-weight: 300;
                    margin-right: 0; max-width: 0; overflow: hidden;
                    transition: max-width 0.25s cubic-bezier(0.22,1,0.36,1), margin-right 0.25s;
                    display: inline-block;
                }
                .ft-nav-link:hover { color: #f5efe4; }
                .ft-nav-link:hover::before { max-width: 20px; margin-right: 8px; }

                /* Contact items */
                .ft-contact-item {
                    display: flex; align-items: flex-start; gap: 10px; padding: 8px 0;
                }
                .ft-contact-icon {
                    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
                    background: rgba(232,160,32,0.08); border: 1px solid rgba(232,160,32,0.15);
                    display: flex; align-items: center; justify-content: center;
                    color: #c97a10; font-size: 13px; margin-top: 1px;
                }
                .ft-contact-label {
                    font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase;
                    color: rgba(240,236,228,0.28); font-weight: 600; margin-bottom: 2px;
                }
                .ft-contact-val {
                    font-size: 13px; color: rgba(240,236,228,0.65); line-height: 1.4;
                }

                /* Hours */
                .ft-hours-row {
                    display: flex; justify-content: space-between;
                    font-size: 12.5px; padding: 5px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: rgba(240,236,228,0.45);
                }
                .ft-hours-row:last-child { border-bottom: none; }
                .ft-hours-row .val { color: rgba(240,236,228,0.65); }

                .ft-open-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
                    color: #4ade80; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
                    border-radius: 100px; padding: 4px 10px; margin-bottom: 14px;
                }
                .ft-open-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
                    animation: ft-pulse 2s ease-in-out infinite;
                }
                @keyframes ft-pulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
                    50%      { box-shadow: 0 0 0 5px rgba(74,222,128,0); }
                }

                /* Bottom bar */
                .ft-bottom {
                    max-width: 1200px; margin: 0 auto;
                    padding: 22px 24px;
                    display: flex; align-items: center; justify-content: space-between; gap: 16px;
                    flex-wrap: wrap; position: relative;
                }
                .ft-copy { font-size: 12px; color: rgba(240,236,228,0.25); }
                .ft-bottom-links { display: flex; gap: 24px; }
                .ft-bottom-link {
                    font-size: 12px; color: rgba(240,236,228,0.25);
                    text-decoration: none; transition: color 0.2s;
                }
                .ft-bottom-link:hover { color: rgba(240,236,228,0.6); }
                .ft-tamil {
                    font-size: 11px; color: rgba(232,160,32,0.4);
                    letter-spacing: 0.08em;
                }

                @media (max-width: 900px) {
                    .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
                }
                @media (max-width: 560px) {
                    .ft-grid { grid-template-columns: 1fr; gap: 28px; }
                    .ft-bottom { flex-direction: column; align-items: flex-start; gap: 10px; }
                }
            `}</style>

            <footer className="ft-root">
                <div className="ft-top-line" />
                <div className="ft-glow" />
                <div className="ft-grain" />

                <div className="ft-body">
                    <div className="ft-grid">

                        {/* Brand */}
                        <div>
                            <span className="ft-brand-name">Tamil Food <em>Thaya</em></span>
                            <p className="ft-brand-desc">
                                {t('footer.description', 'Authentic Tamil cuisine in the heart of the Netherlands. Dine-in, takeaway & event catering.')}
                            </p>
                            <div className="ft-socials">
                                <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="Instagram">
                                    <SiInstagram width={15} height={15} />
                                </a>
                                <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="Facebook">
                                    <SiFacebook width={15} height={15} />
                                </a>
                            </div>
                        </div>

                        {/* Navigate */}
                        <div>
                            <p className="ft-col-head">Navigate</p>
                            <nav style={{ display: 'flex', flexDirection: 'column' }}>
                                {[
                                    { label: 'Home', to: '/' },
                                    { label: 'Catering', to: '/catering' },
                                    { label: 'Menu', to: '/menu' },
                                    { label: 'Contact', to: '/contact' },
                                ].map(l => (
                                    <Link key={l.to} to={l.to} className="ft-nav-link">{l.label}</Link>
                                ))}
                            </nav>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="ft-col-head">Get in Touch</p>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {[
                                    { icon: <MapPin size={13} />, label: 'Location', val: settings?.address || 'Hofplein 20, Rotterdam' },
                                    { icon: <Phone size={13} />, label: 'Phone', val: settings?.phone || '+31 (0) 6 1234 5678' },
                                    { icon: <Mail size={13} />, label: 'Email', val: settings?.email || 'info@tamilfoodthaya.nl' },
                                ].map((c, i) => (
                                    <div key={i} className="ft-contact-item">
                                        <div className="ft-contact-icon">{c.icon}</div>
                                        <div>
                                            <p className="ft-contact-label">{c.label}</p>
                                            <p className="ft-contact-val">{c.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hours */}
                        <div>
                            <p className="ft-col-head">Opening Hours</p>
                            <div className="ft-open-badge">
                                <span className="ft-open-dot" />
                                {isOpen ? 'Open Now' : 'Closed'}
                            </div>
                            {[
                                { day: 'Mon – Fri', val: '12:00 – 22:00' },
                                { day: 'Saturday', val: '11:00 – 23:00' },
                                { day: 'Sunday', val: '12:00 – 21:00' },
                            ].map((r, i) => (
                                <div key={i} className="ft-hours-row">
                                    <span>{r.day}</span>
                                    <span className="val">{r.val}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Bottom bar */}
                <div className="ft-bottom">
                    <p className="ft-copy">© 2026 Tamil Food Thaya. {t('footer.rights', 'All rights reserved.')}</p>
                    <div className="ft-bottom-links">
                        <a href="#" className="ft-bottom-link">Privacybeleid</a>
                        <a href="#" className="ft-bottom-link">Algemene Voorwaarden</a>
                        <a href="#" className="ft-bottom-link">KvK: 12345678</a>
                    </div>
                    <span className="ft-tamil">தமிழ் உணவு</span>
                </div>
            </footer>
        </>
    );
};