import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconArrowRight } from './Icons';
import { useState, useEffect, useRef } from 'react';

const heroImages = [
    '/hero-catering.jpg',
    '/hero-catering2.jpg',
];

export default function HeroSection() {
    const { t } = useTranslation();
    const [currentImage, setCurrentImage] = useState<number>(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goToSlide = (index: number) => {
        if (index === currentImage || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentImage(index);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 1200);
    };

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setIsTransitioning(true);
            setCurrentImage((prev) => {
                const next = (prev + 1) % heroImages.length;
                return next;
            });
            setTimeout(() => {
                setIsTransitioning(false);
            }, 1200);
        }, 6000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

                .hero-root {
                    font-family: 'Outfit', sans-serif;
                }

                .hero-display-font {
                    font-family: 'Cormorant Garamond', serif;
                }

                /* Slide images */
                .hero-img {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: opacity 1.2s cubic-bezier(0.77, 0, 0.18, 1),
                                transform 6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: scale(1.06);
                }
                .hero-img.active {
                    opacity: 1;
                    transform: scale(1);
                }
                .hero-img.inactive {
                    opacity: 0;
                    transform: scale(1.06);
                }

                /* Gold shimmer text */
                .gold-shimmer {
                    background: linear-gradient(
                        120deg,
                        #f5c842 0%,
                        #e8a020 30%,
                        #fde68a 55%,
                        #c97a10 80%,
                        #f5c842 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }

                /* Content animation */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
                .fade-up-2 { animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
                .fade-up-3 { animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both; }
                .fade-up-4 { animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both; }
                .fade-up-5 { animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.9s both; }

                /* Pill badge */
                .pill-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(245,200,66,0.35);
                    border-radius: 100px;
                    padding: 7px 18px;
                    color: #fde68a;
                    font-size: 13px;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .pill-dot {
                    width: 6px; height: 6px;
                    background: #f5c842;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.7); }
                }

                /* Buttons */
                .btn-primary-hero {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #e8a020 0%, #f5c842 60%, #e8a020 100%);
                    color: #1a0f00;
                    font-weight: 600;
                    font-size: 15px;
                    letter-spacing: 0.04em;
                    padding: 14px 32px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                    box-shadow: 0 4px 24px rgba(232,160,32,0.35);
                }
                .btn-primary-hero:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(232,160,32,0.5);
                    filter: brightness(1.08);
                }

                .btn-ghost-hero {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: transparent;
                    color: #fff;
                    font-weight: 500;
                    font-size: 15px;
                    letter-spacing: 0.04em;
                    padding: 13px 32px;
                    border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.35);
                    cursor: pointer;
                    text-decoration: none;
                    transition: background 0.2s, border-color 0.2s, transform 0.2s;
                    backdrop-filter: blur(8px);
                }
                .btn-ghost-hero:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.6);
                    transform: translateY(-2px);
                }

                /* Divider line */
                .hero-divider {
                    width: 56px;
                    height: 2px;
                    background: linear-gradient(90deg, #f5c842, transparent);
                    border-radius: 2px;
                    margin: 0 auto 28px;
                }

                /* Slide dots */
                .dot-btn {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.35);
                    cursor: pointer;
                    transition: all 0.3s;
                    padding: 0;
                }
                .dot-btn.dot-active {
                    background: #f5c842;
                    transform: scale(1.3);
                }
                .dot-btn:hover:not(.dot-active) {
                    background: rgba(255,255,255,0.65);
                }

                /* Decorative vertical text */
                .vertical-label {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-size: 11px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.35);
                    font-weight: 400;
                }

                /* Stats bar */
                .stat-item {
                    text-align: center;
                }
                .stat-number {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 28px;
                    font-weight: 700;
                    color: #f5c842;
                    line-height: 1;
                }
                .stat-label {
                    font-size: 11px;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-top: 4px;
                }
                .stat-divider {
                    width: 1px;
                    height: 36px;
                    background: rgba(255,255,255,0.15);
                }

                /* Noise overlay for grain texture */
                .hero-noise {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 2;
                    opacity: 0.03;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
                    background-size: 200px 200px;
                }

                @media (max-width: 640px) {
                    .hero-title { font-size: 44px !important; }
                    .hero-subtitle { font-size: 15px !important; }
                    .stat-number { font-size: 22px; }
                    .hero-stats { gap: 16px !important; }
                    .hero-ctas { flex-direction: column; align-items: stretch; }
                    .btn-primary-hero, .btn-ghost-hero { justify-content: center; }
                }
            `}</style>

            <section
                className="hero-root"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0d0804',
                }}
            >
                {/* Background images */}
                {heroImages.map((image, index) => (
                    <div
                        key={image}
                        className={`hero-img ${index === currentImage ? 'active' : 'inactive'}`}
                        style={{ backgroundImage: `url('${image}')` }}
                        aria-hidden
                    />
                ))}

                {/* Layered gradient overlays */}
                <div aria-hidden style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(105deg, rgba(10,5,0,0.88) 0%, rgba(10,5,0,0.55) 55%, rgba(10,5,0,0.3) 100%)',
                }} />
                <div aria-hidden style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(to top, rgba(10,5,0,0.95) 0%, transparent 40%)',
                }} />

                {/* Grain texture */}
                <div className="hero-noise" aria-hidden />

                {/* Geometric accent — top right corner */}
                <div aria-hidden style={{
                    position: 'absolute', top: 0, right: 0, zIndex: 3,
                    width: 320, height: 320,
                    background: 'radial-gradient(circle at 80% 20%, rgba(245,200,66,0.10) 0%, transparent 65%)',
                    pointerEvents: 'none',
                }} />

                {/* Left vertical label */}
                <div style={{
                    position: 'absolute', left: 24, top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)' }} />
                    <span className="vertical-label">Authentic Tamil Catering</span>
                </div>

                {/* Main content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 24px 60px',
                    maxWidth: 900,
                    margin: '0 auto',
                    width: '100%',
                }}>
                    <div style={{ textAlign: 'center', width: '100%' }}>

                        {/* Badge */}
                        <div className="fade-up-1" style={{ marginBottom: 28 }}>
                            <span className="pill-badge">
                                <span className="pill-dot" />
                                Netherlands &nbsp;·&nbsp; Est. 2020
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className="hero-display-font fade-up-2"
                            style={{
                                fontSize: 72,
                                fontWeight: 300,
                                lineHeight: 1.08,
                                color: '#fff',
                                margin: '0 0 8px',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            <span style={{ display: 'block', fontStyle: 'italic', fontWeight: 300 }}>
                                Authentic Tamil
                            </span>
                            <span className="gold-shimmer" style={{ display: 'block', fontWeight: 700, fontStyle: 'normal' }}>
                                Food &amp; Catering
                            </span>
                        </h1>

                        {/* Decorative divider */}
                        <div className="hero-divider fade-up-3" />

                        {/* Subtitle */}
                        <p
                            className="hero-subtitle fade-up-3"
                            style={{
                                fontSize: 17,
                                color: 'rgba(253,230,138,0.80)',
                                maxWidth: 560,
                                margin: '0 auto 40px',
                                lineHeight: 1.75,
                                fontWeight: 300,
                                letterSpacing: '0.01em',
                            }}
                        >
                            {t('home.heroSubtitle', 'Experience the rich flavors of traditional Tamil cuisine — from intimate gatherings to grand weddings, every event is a celebration.')}
                        </p>

                        {/* CTAs */}
                        <div className="hero-ctas fade-up-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
                            <Link to="/catering" className="btn-primary-hero">
                                {t('home.ctaBook', 'Book Catering')}
                                <IconArrowRight size={18} />
                            </Link>
                            <Link to="/menu" className="btn-ghost-hero">
                                {t('home.ctaExplore', 'Explore Menu')}
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div
                            className="hero-stats fade-up-5"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 32,
                                flexWrap: 'wrap',
                            }}
                        >
                            <div className="stat-item">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Events Catered</div>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <div className="stat-number">40+</div>
                                <div className="stat-label">Menu Items</div>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <div className="stat-number">5★</div>
                                <div className="stat-label">Avg. Rating</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar: dots + scroll cue */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 32,
                    gap: 10,
                }}>
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`dot-btn ${index === currentImage ? 'dot-active' : ''}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Scroll cue */}
                <div style={{
                    position: 'absolute', bottom: 28, right: 32,
                    zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Scroll</span>
                    <div style={{
                        width: 1, height: 48,
                        background: 'linear-gradient(to bottom, rgba(245,200,66,0.6), transparent)',
                        animation: 'scrollPulse 2s ease-in-out infinite',
                    }} />
                    <style>{`
                        @keyframes scrollPulse {
                            0%, 100% { opacity: 0.4; transform: scaleY(1); }
                            50% { opacity: 1; transform: scaleY(1.15); }
                        }
                    `}</style>
                </div>
            </section>
        </>
    );
}