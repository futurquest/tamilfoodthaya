import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCateringPackages } from '../hooks/useApi';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import AddonsSection from '../components/AddonsSection';
import { IconUsers, IconClock } from '../components/Icons';
import { useTranslation } from 'react-i18next';

interface CateringPackageData {
    _id: string;
    name: string | { en: string; ta?: string; nl?: string };
    description: string | { en: string; ta?: string; nl?: string };
    basePrice: number;
    minGuests: number;
    maxGuests?: number;
    image?: string;
    pricingModel?: string;
    durationHours?: number;
    categories: { name: string; items: any[] }[];
    available: boolean;
}

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600';

function getLabel(val: string | { nl?: string; en: string; ta?: string } | undefined, lang: string, fallback = '') {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    return (val as any)[lang] || val.nl || val.en || fallback;
}

export const CateringPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [packages, setPackages] = useState<CateringPackageData[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);

    const currentLang = i18n.language?.split('-')[0] || 'nl';

    useEffect(() => {
        getCateringPackages()
            .then((data: any) => {
                if (Array.isArray(data)) setPackages(data);
                else if (Array.isArray(data?.packages)) setPackages(data.packages);
                else if (Array.isArray(data?.data)) setPackages(data.data);
            })
            .catch(() => {})
            .finally(() => setLoadingPackages(false));
    }, []);

    const handlePackageSelect = (pkg: CateringPackageData) => navigate(`/catering/checkout/${pkg._id}`);

    return (
        <div>
            <SEO title="Catering" description="Premium Tamil catering packages for your events." />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

                .cp-root { font-family: 'DM Sans', sans-serif; }

                /* ═══════════════════════════════════════
                   HERO
                ═══════════════════════════════════════ */
                .cp-hero {
                    position: relative;
                    min-height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    background: #0a0806;
                }
                .cp-hero-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600');
                    background-size: cover; background-position: center;
                    opacity: 0.2;
                    transform: scale(1.04);
                }
                .cp-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.6) 55%, rgba(10,8,6,0.3) 100%);
                }
                .cp-hero-bottom {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 160px;
                    background: linear-gradient(to bottom, transparent, #0a0806);
                }
                .cp-hero-glow {
                    position: absolute; top: 0; left: 50%;
                    transform: translateX(-50%);
                    width: 800px; height: 400px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                .cp-hero-grain {
                    position: absolute; inset: 0; opacity: 0.03; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px 200px;
                }
                .cp-hero-inner {
                    position: relative; z-index: 10;
                    text-align: center;
                    padding: 120px 24px 80px;
                    max-width: 860px; margin: 0 auto;
                }
                .cp-hero-eyebrow {
                    font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
                    color: #e8a020; font-weight: 600; margin-bottom: 20px;
                    display: block;
                }
                .cp-hero-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(48px, 8vw, 96px);
                    font-weight: 300; line-height: 1.0;
                    color: #f5efe4; margin-bottom: 8px;
                    letter-spacing: -0.01em;
                }
                .cp-hero-title strong {
                    font-weight: 800; display: block;
                }
                .cp-hero-title em {
                    font-style: italic; color: #e8a020; font-weight: 400;
                }
                .cp-hero-divider {
                    width: 52px; height: 1px;
                    background: linear-gradient(90deg, transparent, #e8a020, transparent);
                    margin: 24px auto;
                }
                .cp-hero-sub {
                    font-size: 17px; color: rgba(240,236,228,0.55);
                    font-weight: 300; max-width: 500px;
                    margin: 0 auto 44px; line-height: 1.75;
                }
                .cp-hero-btn {
                    display: inline-flex; align-items: center; gap: 12px;
                    padding: 16px 44px; border-radius: 6px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #0c0a08; font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
                    text-decoration: none; border: none; cursor: pointer;
                    box-shadow: 0 4px 28px rgba(232,160,32,0.4);
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                }
                .cp-hero-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 40px rgba(232,160,32,0.55);
                    filter: brightness(1.07);
                }
                /* Scroll indicator */
                .cp-hero-scroll {
                    position: absolute; bottom: 36px; left: 50%;
                    transform: translateX(-50%);
                    z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 8px;
                }
                .cp-hero-scroll span {
                    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
                    color: rgba(255,255,255,0.3);
                }
                .cp-scroll-line {
                    width: 1px; height: 44px;
                    background: linear-gradient(to bottom, rgba(232,160,32,0.6), transparent);
                    animation: cpScrollPulse 2s ease-in-out infinite;
                }
                @keyframes cpScrollPulse {
                    0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
                }

                /* Stats bar */
                .cp-stats {
                    display: flex; align-items: center; justify-content: center;
                    gap: 40px; flex-wrap: wrap;
                    margin-top: 56px;
                }
                .cp-stat-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px; font-weight: 700; color: #e8a020; line-height: 1;
                }
                .cp-stat-label {
                    font-size: 11px; color: rgba(255,255,255,0.4);
                    text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;
                }
                .cp-stat-divider {
                    width: 1px; height: 36px;
                    background: rgba(255,255,255,0.12);
                }

                /* ═══════════════════════════════════════
                   PACKAGES SECTION
                ═══════════════════════════════════════ */
                .cp-packages {
                    background: #ffffff;
                    padding: 96px 0 88px;
                    position: relative;
                }
                .cp-packages-bg {
                    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                    width: 800px; height: 320px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.06) 0%, transparent 70%);
                    pointer-events: none;
                }
                .cp-packages-dots {
                    position: absolute; inset: 0; pointer-events: none; opacity: 0.25;
                    background-image: radial-gradient(circle, #e8a020 1px, transparent 1px);
                    background-size: 28px 28px;
                    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
                    -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
                }
                .cp-section-eyebrow {
                    font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase;
                    color: #c97a10; font-weight: 600; margin-bottom: 12px;
                }
                .cp-section-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(32px, 4.5vw, 52px);
                    font-weight: 700; color: #1a1209; line-height: 1.1; margin-bottom: 14px;
                }
                .cp-section-title em { font-style: italic; color: #e8a020; }
                .cp-section-sub {
                    font-size: 15px; color: #9a8c78; font-weight: 300;
                    max-width: 440px; margin: 0 auto; line-height: 1.7;
                }
                .cp-section-divider {
                    width: 52px; height: 2px;
                    background: linear-gradient(90deg, #e8a020, #f5c842);
                    border-radius: 2px; margin: 18px auto 0;
                }

                /* Cards grid */
                .cp-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    max-width: 1160px; margin: 0 auto; padding: 0 24px;
                }
                .cp-card {
                    background: #fff; border-radius: 20px; overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.08);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s, border-color 0.35s;
                    display: flex; flex-direction: column;
                }
                .cp-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 56px rgba(0,0,0,0.13);
                    border-color: rgba(232,160,32,0.35);
                }
                .cp-card-img { position: relative; height: 200px; overflow: hidden; }
                .cp-card-img img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); display: block;
                }
                .cp-card:hover .cp-card-img img { transform: scale(1.07); }
                .cp-card-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(26,18,9,0.55) 0%, transparent 55%);
                    pointer-events: none;
                }
                .cp-price-badge {
                    position: absolute; bottom: 14px; left: 16px;
                    background: #fff; border-radius: 100px; padding: 5px 14px;
                    display: inline-flex; align-items: baseline; gap: 3px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
                }
                .cp-price-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; font-weight: 700; color: #1a1209; line-height: 1;
                }
                .cp-price-unit { font-size: 11px; color: #999; font-weight: 400; }
                .cp-popular {
                    position: absolute; top: 14px; right: 14px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #fff; font-size: 9px; font-weight: 700;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    padding: 5px 12px; border-radius: 100px;
                    box-shadow: 0 2px 8px rgba(232,160,32,0.4);
                }
                .cp-card-num {
                    position: absolute; top: 14px; left: 16px;
                    font-family: 'Playfair Display', serif;
                    font-size: 13px; font-style: italic;
                    color: rgba(255,255,255,0.55); letter-spacing: 0.04em;
                }
                .cp-card-body {
                    padding: 20px 22px 22px;
                    display: flex; flex-direction: column; flex: 1;
                }
                .cp-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; font-weight: 700; color: #1a1209; line-height: 1.2;
                    padding-bottom: 10px;
                    border-bottom: 1px dashed rgba(232,160,32,0.5);
                    margin-bottom: 10px;
                    transition: color 0.2s, border-color 0.2s;
                }
                .cp-card:hover .cp-name { color: #b87a10; border-bottom-color: rgba(232,160,32,0.9); }
                .cp-desc {
                    font-size: 13px; color: #888070; line-height: 1.65; font-weight: 300;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    overflow: hidden; margin-bottom: 14px; flex: 1;
                }
                .cp-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
                .cp-meta-item {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 12px; color: #888070; font-weight: 400;
                    background: #faf7f2; border: 1px solid rgba(232,160,32,0.2);
                    border-radius: 100px; padding: 4px 12px;
                }
                .cp-meta-icon { color: #c97a10; }
                .cp-btn-primary {
                    display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1;
                    padding: 12px 16px; border-radius: 10px;
                    background: linear-gradient(135deg, #b87a10, #e8a020); color: #fff;
                    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
                    text-decoration: none; border: none; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                    box-shadow: 0 3px 12px rgba(232,160,32,0.3); white-space: nowrap;
                }
                .cp-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,160,32,0.4); }

                /* ── Responsive ── */
                @media (max-width: 960px) {
                    .cp-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 580px) {
                    .cp-grid { grid-template-columns: 1fr; max-width: 420px; }
                    .cp-packages { padding: 64px 0 72px; }
                    .cp-stats { gap: 24px; }
                }
            `}</style>

            {/* ══════════════════════════════════════
                HERO
            ══════════════════════════════════════ */}
            <section className="cp-hero">
                <div className="cp-hero-bg" />
                <div className="cp-hero-overlay" />
                <div className="cp-hero-bottom" />
                <div className="cp-hero-glow" />
                <div className="cp-hero-grain" />

                <div className="cp-hero-inner">
                    <motion.span
                        className="cp-hero-eyebrow"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        Tamil Food Thaya · Netherlands
                    </motion.span>

                    <motion.h1
                        className="cp-hero-title"
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                    >
                        {t('catering.hero.title', 'Premium Tamil')}{' '}
                        <em>{t('catering.hero.titleHighlight', 'Catering')}</em>
                        <strong style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: '0.65em', color: 'rgba(240,236,228,0.45)', display: 'block', marginTop: 4, letterSpacing: '0.02em' }}>
                            for every celebration
                        </strong>
                    </motion.h1>

                    <div className="cp-hero-divider" />

                    <motion.p
                        className="cp-hero-sub"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        {t('catering.hero.desc', 'Authentic Tamil cuisine for weddings, corporate events, and intimate gatherings — crafted with tradition and care.')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.55 }}
                    >
                        <button
                            className="cp-hero-btn"
                            onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {t('catering.hero.button', 'View Packages')}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="cp-stats"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.75 }}
                    >
                        {[
                            { num: '500+', label: 'Events Catered' },
                            { num: '40+',  label: 'Menu Items' },
                            { num: '6yrs', label: 'Experience' },
                        ].map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                                {i > 0 && <div className="cp-stat-divider" />}
                                <div style={{ textAlign: 'center' }}>
                                    <div className="cp-stat-num">{s.num}</div>
                                    <div className="cp-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll cue */}
                <div className="cp-hero-scroll">
                    <span>Scroll</span>
                    <div className="cp-scroll-line" />
                </div>
            </section>

            {/* ══════════════════════════════════════
                PACKAGES
            ══════════════════════════════════════ */}
            <section id="packages-section" className="cp-packages">
                <div className="cp-packages-bg" />
                <div className="cp-packages-dots" />

                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px', position: 'relative' }}>
                    <p className="cp-section-eyebrow">{t('catering.packages.eyebrow', 'Choose Your Package')}</p>
                    <h2 className="cp-section-title">
                        {t('catering.packages.title', 'Our Catering')} <em>Packages</em>
                    </h2>
                    <p className="cp-section-sub">{t('catering.packages.subtitle', 'Every package is crafted to bring authentic Tamil flavours to your celebration.')}</p>
                    <div className="cp-section-divider" />
                </div>

                {loadingPackages ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                        <Loader2 className="animate-spin" size={32} style={{ color: '#c97a10' }} />
                    </div>
                ) : packages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9a8c78' }}>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1a1209', marginBottom: 8 }}>Packages coming soon</p>
                        <p style={{ fontSize: 14, fontWeight: 300 }}>Check back soon for our catering packages.</p>
                    </div>
                ) : (
                    <div className="cp-grid">
                        {packages.map((pkg, idx) => (
                            <div key={pkg._id} className="cp-card">
                                <div className="cp-card-img">
                                    <img src={pkg.image || PLACEHOLDER_IMG} alt={getLabel(pkg.name, currentLang)} loading="lazy" />
                                    <div className="cp-card-img-overlay" />
                                    <span className="cp-card-num">0{idx + 1}</span>
                                    {idx === 1 && packages.length > 2 && <span className="cp-popular">Most Popular</span>}
                                    {pkg.basePrice != null && (
                                        <div className="cp-price-badge">
                                            <span className="cp-price-num">€{pkg.basePrice}</span>
                                            {pkg.pricingModel === 'per_person' && <span className="cp-price-unit">/ p.p.</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="cp-card-body">
                                    <h4 className="cp-name">{getLabel(pkg.name, currentLang)}</h4>
                                    <p className="cp-desc">{getLabel(pkg.description, currentLang)}</p>
                                    {(pkg.minGuests != null || pkg.durationHours != null) && (
                                        <div className="cp-meta">
                                            {pkg.minGuests != null && pkg.maxGuests != null && (
                                                <span className="cp-meta-item">
                                                    <span className="cp-meta-icon"><IconUsers size={12} /></span>
                                                    {pkg.minGuests}–{pkg.maxGuests} guests
                                                </span>
                                            )}
                                            {pkg.durationHours != null && (
                                                <span className="cp-meta-item">
                                                    <span className="cp-meta-icon"><IconClock size={12} /></span>
                                                    {pkg.durationHours} hrs
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => handlePackageSelect(pkg)} 
                                        className="cp-btn-primary"
                                        style={{ width: '100%' }}
                                    >
                                        Book Now
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Add-ons */}
            <AddonsSection />
        </div>
    );
};