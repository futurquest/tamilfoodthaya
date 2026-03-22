import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconUsers, IconClock } from './Icons';
import ScrollReveal from './ScrollReveal';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600';

interface Package {
    _id: string;
    name: string | { en: string; ta?: string; nl?: string };
    description: string | { en: string; ta?: string; nl?: string };
    image?: string;
    basePrice?: number;
    pricingModel?: string;
    minGuests?: number;
    maxGuests?: number;
    durationHours?: number;
}

function getLabel(val: string | { nl?: string; en: string; ta?: string } | undefined, lang: string, fallback = '') {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    return (val as any)[lang] || val.nl || val.en || fallback;
}

export default function FeaturedPackagesSection({
    packages = [],
    loading = false,
}: {
    packages: Package[];
    loading?: boolean;
}) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const showCards = packages.length > 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

                .fp-root {
                    font-family: 'DM Sans', sans-serif;
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                    padding: 88px 0 96px;
                }

                /* Subtle warm tint at top */
                .fp-bg-top {
                    position: absolute;
                    top: 0; left: 50%;
                    transform: translateX(-50%);
                    width: 800px; height: 320px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.07) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Dot pattern */
                .fp-dots {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    opacity: 0.35;
                    background-image: radial-gradient(circle, #e8a020 1px, transparent 1px);
                    background-size: 28px 28px;
                    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
                    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
                }

                /* ── Heading ── */
                .fp-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.26em;
                    text-transform: uppercase;
                    color: #c97a10;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                .fp-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(34px, 5vw, 56px);
                    font-weight: 700;
                    color: #1a1209;
                    line-height: 1.1;
                    margin-bottom: 16px;
                }
                .fp-title em {
                    font-style: italic;
                    color: #e8a020;
                }
                .fp-subtitle {
                    font-size: 16px;
                    color: #888070;
                    font-weight: 300;
                    max-width: 460px;
                    margin: 0 auto;
                    line-height: 1.7;
                }
                .fp-divider {
                    width: 52px; height: 2px;
                    background: linear-gradient(90deg, #e8a020, #f5c842);
                    border-radius: 2px;
                    margin: 20px auto 0;
                }

                /* ── Cards grid ── */
                .fp-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    max-width: 1160px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* ── Card ── */
                .fp-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.08);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                                box-shadow 0.35s,
                                border-color 0.35s;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .fp-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 56px rgba(0,0,0,0.13);
                    border-color: rgba(232,160,32,0.35);
                }

                /* Image */
                .fp-card-img {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }
                .fp-card-img img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
                    display: block;
                }
                .fp-card:hover .fp-card-img img { transform: scale(1.07); }
                .fp-card-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(26,18,9,0.55) 0%, transparent 55%);
                    pointer-events: none;
                }

                /* Price badge */
                .fp-price-badge {
                    position: absolute;
                    bottom: 14px; left: 16px;
                    background: #fff;
                    border-radius: 100px;
                    padding: 5px 14px;
                    display: inline-flex; align-items: baseline; gap: 3px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
                }
                .fp-price-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; font-weight: 700;
                    color: #1a1209;
                    line-height: 1;
                }
                .fp-price-unit {
                    font-size: 11px;
                    color: #999;
                    font-weight: 400;
                }

                /* Popular badge */
                .fp-popular {
                    position: absolute;
                    top: 14px; right: 14px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #fff;
                    font-size: 9px; font-weight: 700;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    padding: 5px 12px; border-radius: 100px;
                    box-shadow: 0 2px 8px rgba(232,160,32,0.4);
                }

                /* Card number */
                .fp-card-num {
                    position: absolute;
                    top: 14px; left: 16px;
                    font-family: 'Playfair Display', serif;
                    font-size: 13px; font-style: italic;
                    color: rgba(255,255,255,0.55);
                    letter-spacing: 0.04em;
                }

                /* Body */
                .fp-card-body {
                    padding: 20px 22px 22px;
                    display: flex; flex-direction: column; flex: 1;
                }

                /* Name row — dashed underline */
                .fp-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; font-weight: 700;
                    color: #1a1209; line-height: 1.2;
                    padding-bottom: 10px;
                    border-bottom: 1px dashed rgba(232,160,32,0.5);
                    margin-bottom: 10px;
                    transition: color 0.2s, border-color 0.2s;
                }
                .fp-card:hover .fp-name {
                    color: #b87a10;
                    border-bottom-color: rgba(232,160,32,0.9);
                }

                .fp-desc {
                    font-size: 13px;
                    color: #888070;
                    line-height: 1.65;
                    font-weight: 300;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin-bottom: 14px;
                    flex: 1;
                }

                /* Meta pills */
                .fp-meta {
                    display: flex; flex-wrap: wrap; gap: 8px;
                    margin-bottom: 18px;
                }
                .fp-meta-item {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 12px; color: #888070; font-weight: 400;
                    background: #faf7f2;
                    border: 1px solid rgba(232,160,32,0.2);
                    border-radius: 100px;
                    padding: 4px 12px;
                }
                .fp-meta-icon { color: #c97a10; }

                /* Buttons */
                .fp-btn-primary {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    flex: 1;
                    padding: 12px 16px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 600;
                    text-decoration: none; border: none; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                    box-shadow: 0 3px 12px rgba(232,160,32,0.3);
                    white-space: nowrap;
                }
                .fp-btn-primary:hover {
                    filter: brightness(1.08);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(232,160,32,0.4);
                }
                .fp-btn-secondary {
                    display: flex; align-items: center; justify-content: center;
                    padding: 12px 16px;
                    border-radius: 10px;
                    background: transparent;
                    color: #6b5a3a;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 500;
                    text-decoration: none;
                    border: 1px solid rgba(232,160,32,0.35);
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .fp-btn-secondary:hover {
                    background: rgba(232,160,32,0.07);
                    border-color: rgba(232,160,32,0.7);
                    color: #b87a10;
                }

                /* CTA */
                .fp-cta {
                    display: inline-flex; align-items: center; gap: 10px;
                    padding: 15px 40px;
                    border-radius: 10px;
                    background: #1a1209;
                    color: #f5efe4;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 600;
                    text-decoration: none; border: none; cursor: pointer;
                    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 20px rgba(26,18,9,0.15);
                    letter-spacing: 0.02em;
                }
                .fp-cta:hover {
                    background: #2e2010;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(26,18,9,0.22);
                }
                .fp-cta-arrow {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: rgba(232,160,32,0.18);
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s, transform 0.2s;
                }
                .fp-cta:hover .fp-cta-arrow {
                    background: rgba(232,160,32,0.3);
                    transform: translateX(2px);
                }

                .fp-empty {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 28px;
                    text-align: center;
                    border: 1px dashed rgba(232,160,32,0.5);
                    border-radius: 16px;
                    background: rgba(232,160,32,0.05);
                }
                .fp-empty-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 26px;
                    color: #1a1209;
                    margin-bottom: 10px;
                }
                .fp-empty-desc {
                    color: #7f7461;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .fp-loading-dots {
                    display: inline-flex;
                    gap: 6px;
                    margin-top: 10px;
                }
                .fp-loading-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    background: #e8a020;
                    opacity: 0.35;
                    animation: fpBounce 1s infinite;
                }
                .fp-loading-dot:nth-child(2) { animation-delay: 0.12s; }
                .fp-loading-dot:nth-child(3) { animation-delay: 0.24s; }
                @keyframes fpBounce {
                    0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
                    40% { opacity: 1; transform: translateY(-3px); }
                }

                @media (max-width: 900px) {
                    .fp-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 580px) {
                    .fp-grid { grid-template-columns: 1fr; max-width: 420px; }
                    .fp-root { padding: 64px 0 72px; }
                }
            `}</style>

            <section className="fp-root">
                <div className="fp-bg-top" />
                <div className="fp-dots" />

                {/* ── Heading ── */}
                <ScrollReveal variant="fadeUp">
                    <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px', position: 'relative' }}>
                        <p className="fp-eyebrow">Catering Packages</p>
                        <h2 className="fp-title">
                            {t('home.featuredTitle', 'Featured')} <em>Packages</em>
                        </h2>
                        <p className="fp-subtitle">
                            {t('home.featuredSubtitle', 'Choose from our curated catering packages for every occasion.')}
                        </p>
                        <div className="fp-divider" />
                    </div>
                </ScrollReveal>

                {/* ── Cards ── */}
                <ScrollReveal variant="fadeUp" style={{ transitionDelay: '0.1s' }}>
                    {showCards ? (
                        <div className="fp-grid">
                            {packages.map((pkg, i) => (
                                <div key={pkg._id} className="fp-card">
                                    {/* Image */}
                                    <div className="fp-card-img">
                                        <img
                                            src={pkg.image || PLACEHOLDER_IMG}
                                            alt={getLabel(pkg.name, currentLang)}
                                            loading="lazy"
                                        />
                                        <div className="fp-card-img-overlay" />

                                        {/* Card index */}
                                        <span className="fp-card-num">0{i + 1}</span>

                                        {/* Popular badge */}
                                        {i === 1 && (
                                            <span className="fp-popular">Most Popular</span>
                                        )}

                                        {/* Price badge */}
                                        {pkg.basePrice != null && (
                                            <div className="fp-price-badge">
                                                <span className="fp-price-num">€{pkg.basePrice}</span>
                                                {pkg.pricingModel === 'per_person' && (
                                                    <span className="fp-price-unit">/ {t('home.perPerson', 'p.p.')}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="fp-card-body">
                                        <h4 className="fp-name">{getLabel(pkg.name, currentLang)}</h4>
                                        <p className="fp-desc">{getLabel(pkg.description, currentLang)}</p>

                                        {/* Meta */}
                                        {(pkg.minGuests != null || pkg.durationHours != null) && (
                                            <div className="fp-meta">
                                                {pkg.minGuests != null && pkg.maxGuests != null && (
                                                    <span className="fp-meta-item">
                                                        <span className="fp-meta-icon">
                                                            <IconUsers size={12} />
                                                        </span>
                                                        {pkg.minGuests}–{pkg.maxGuests} {t('home.guests', 'guests')}
                                                    </span>
                                                )}
                                                {pkg.durationHours != null && (
                                                    <span className="fp-meta-item">
                                                        <span className="fp-meta-icon">
                                                            <IconClock size={12} />
                                                        </span>
                                                        {pkg.durationHours} {t('home.hours', 'hrs')}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Buttons */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Link to={`/catering/checkout/${pkg._id}`} className="fp-btn-primary">
                                                {t('home.bookNow', 'Book Now')}
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Link>
                                            <Link to="/catering" className="fp-btn-secondary">
                                                {t('home.viewDetails', 'Details')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fp-empty">
                            <h3 className="fp-empty-title">
                                {loading ? t('home.loadingPackages', 'Loading packages...') : t('home.noPackagesTitle', 'Packages coming soon')}
                            </h3>
                            <p className="fp-empty-desc">
                                {loading
                                    ? t('home.loadingPackagesDesc', 'Please wait while we fetch our catering package lineup.')
                                    : t('home.noPackagesDesc', 'Our team is updating package details. You can still explore catering options now.')}
                            </p>

                            {loading ? (
                                <div className="fp-loading-dots" aria-hidden>
                                    <span className="fp-loading-dot" />
                                    <span className="fp-loading-dot" />
                                    <span className="fp-loading-dot" />
                                </div>
                            ) : (
                                <Link to="/catering" className="fp-btn-primary" style={{ display: 'inline-flex' }}>
                                    {t('home.viewAllPackages', 'View Catering')}
                                </Link>
                            )}
                        </div>
                    )}
                </ScrollReveal>

                {/* ── CTA ── */}
                {showCards && (
                    <ScrollReveal variant="fadeUp" style={{ transitionDelay: '0.2s' }}>
                        <div style={{ textAlign: 'center', marginTop: 56, padding: '0 24px', position: 'relative' }}>
                            <Link to="/catering" className="fp-cta">
                                View All Packages
                                <span className="fp-cta-arrow">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="#e8a020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </ScrollReveal>
                )}
            </section>
        </>
    );
}