import { Link } from 'react-router-dom';
import { IconMapPin, IconPhone, IconMail } from './Icons';
import { useTranslation } from 'react-i18next';

const hours = [
    { dayKey: 'footer.monFri', time: '10:00 - 22:30' },
    { dayKey: 'footer.saturday', time: '10:00 - 23:00' },
    { dayKey: 'footer.sunday', time: '11:00 - 22:00' },
];

export default function Footer() {
    const { t } = useTranslation();
    return (
        <>
            <style>{`
                .ft-root {
                    font-family: var(--font-sans);
                    background: var(--brand-ink-deep);
                    color: var(--brand-surface-mist);
                    position: relative;
                    overflow: hidden;
                }

                /* Top decorative border */
                .ft-top-border {
                    height: 1px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        color-mix(in srgb, var(--brand-accent-bright) 15%, transparent) 20%,
                        color-mix(in srgb, var(--brand-accent-bright) 50%, transparent) 50%,
                        color-mix(in srgb, var(--brand-accent-bright) 15%, transparent) 80%,
                        transparent 100%
                    );
                }

                /* Ambient glow */
                .ft-glow {
                    position: absolute;
                    top: 0; left: 50%;
                    transform: translateX(-50%);
                    width: 700px; height: 300px;
                    background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--brand-accent-bright) 7%, transparent) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Grain */
                .ft-grain {
                    position: absolute; inset: 0;
                    opacity: 0.03;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px 200px;
                    pointer-events: none;
                }

                .ft-inner {
                    max-width: 1160px;
                    margin: 0 auto;
                    padding: 72px 24px 0;
                    position: relative;
                }

                /* Brand column */
                .ft-brand-name {
                    font-family: var(--font-display);
                    font-size: 26px;
                    font-weight: 700;
                    color: var(--brand-surface-tint);
                    line-height: 1.1;
                    margin-bottom: 4px;
                    letter-spacing: -0.01em;
                }
                .ft-brand-name em {
                    font-style: italic;
                    color: var(--brand-accent-bright);
                }
                .ft-brand-sub {
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: color-mix(in srgb, var(--brand-accent-bright) 60%, transparent);
                    font-weight: 500;
                    margin-bottom: 20px;
                }
                .ft-brand-desc {
                    font-size: 13.5px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 45%, transparent);
                    line-height: 1.75;
                    font-weight: 300;
                    max-width: 240px;
                    margin-bottom: 28px;
                }

                /* Social icons */
                .ft-social {
                    display: flex;
                    gap: 10px;
                    list-style: none;
                    padding: 0; margin: 0;
                }
                .ft-social a {
                    width: 38px; height: 38px;
                    border-radius: 10px;
                    border: 1px solid color-mix(in srgb, var(--brand-white) 10%, transparent);
                    display: flex; align-items: center; justify-content: center;
                    color: color-mix(in srgb, var(--brand-surface-mist) 50%, transparent);
                    text-decoration: none;
                    transition: all 0.25s;
                    font-size: 15px;
                }
                .ft-social a:hover {
                    border-color: color-mix(in srgb, var(--brand-accent-bright) 50%, transparent);
                    color: var(--brand-accent-bright);
                    background: color-mix(in srgb, var(--brand-accent-bright) 8%, transparent);
                    transform: translateY(-2px);
                }

                /* Column titles */
                .ft-col-title {
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: color-mix(in srgb, var(--brand-accent-bright) 70%, transparent);
                    font-weight: 600;
                    margin-bottom: 20px;
                    font-family: var(--font-sans);
                }

                /* Nav links */
                .ft-nav {
                    list-style: none;
                    padding: 0; margin: 0;
                    display: flex; flex-direction: column; gap: 12px;
                }
                .ft-nav a {
                    font-size: 14px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 50%, transparent);
                    text-decoration: none;
                    font-weight: 400;
                    transition: color 0.2s, padding-left 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .ft-nav a::before {
                    content: '';
                    width: 0; height: 1px;
                    background: var(--brand-accent-bright);
                    transition: width 0.25s;
                    display: inline-block;
                }
                .ft-nav a:hover {
                    color: var(--brand-surface-mist);
                }
                .ft-nav a:hover::before { width: 12px; }

                /* Contact list */
                .ft-contact {
                    list-style: none;
                    padding: 0; margin: 0;
                    display: flex; flex-direction: column; gap: 16px;
                }
                .ft-contact li {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .ft-contact-icon {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    background: color-mix(in srgb, var(--brand-accent-bright) 10%, transparent);
                    border: 1px solid color-mix(in srgb, var(--brand-accent-bright) 20%, transparent);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    color: var(--brand-accent-bright);
                }
                .ft-contact-text {
                    display: flex; flex-direction: column; gap: 1px;
                }
                .ft-contact-label {
                    font-size: 10px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: color-mix(in srgb, var(--brand-surface-mist) 25%, transparent);
                    font-weight: 500;
                }
                .ft-contact-val {
                    font-size: 13.5px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 65%, transparent);
                    font-weight: 300;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                a.ft-contact-val:hover { color: var(--brand-surface-mist); }

                /* Hours */
                .ft-hours {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .ft-hours-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 12px;
                    border-bottom: 1px solid color-mix(in srgb, var(--brand-white) 5%, transparent);
                    gap: 16px;
                }
                .ft-hours-row:last-child { border-bottom: none; padding-bottom: 0; }
                .ft-hours-day {
                    font-size: 13px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 45%, transparent);
                    font-weight: 300;
                }
                .ft-hours-time {
                    font-size: 13px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 75%, transparent);
                    font-weight: 500;
                    font-variant-numeric: tabular-nums;
                }
                .ft-open-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: color-mix(in srgb, var(--brand-success-mid) 12%, transparent);
                    border: 1px solid color-mix(in srgb, var(--brand-success-mid) 25%, transparent);
                    border-radius: 100px;
                    padding: 4px 12px;
                    font-size: 11px;
                    color: var(--brand-success-bright);
                    font-weight: 500;
                    margin-top: 20px;
                }
                .ft-open-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: var(--brand-success-bright);
                    animation: ftpulse 2s ease-in-out infinite;
                }
                @keyframes ftpulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                /* Grid */
                .ft-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 0.8fr 1.1fr 1.1fr;
                    gap: 48px;
                    padding-bottom: 56px;
                }

                /* Divider */
                .ft-hr {
                    height: 1px;
                    background: color-mix(in srgb, var(--brand-white) 7%, transparent);
                    border: none;
                    margin: 0;
                }

                /* Bottom bar */
                .ft-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 0;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .ft-bottom-left {
                    font-size: 12.5px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 30%, transparent);
                    font-weight: 300;
                }
                .ft-bottom-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .ft-bottom-link {
                    font-size: 12px;
                    color: color-mix(in srgb, var(--brand-surface-mist) 25%, transparent);
                    text-decoration: none;
                    transition: color 0.2s;
                    font-weight: 400;
                }
                .ft-bottom-link:hover { color: color-mix(in srgb, var(--brand-surface-mist) 60%, transparent); }
                .ft-bottom-dot {
                    width: 3px; height: 3px;
                    border-radius: 50%;
                    background: color-mix(in srgb, var(--brand-white) 15%, transparent);
                    display: inline-block;
                }

                /* Tamil script decorative text */
                .ft-tamil {
                    font-size: 11px;
                    color: color-mix(in srgb, var(--brand-accent-bright) 25%, transparent);
                    letter-spacing: 0.1em;
                }

                @media (max-width: 900px) {
                    .ft-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 36px;
                    }
                }
                @media (max-width: 540px) {
                    .ft-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    .ft-bottom { flex-direction: column; align-items: flex-start; }
                    .ft-inner { padding-top: 52px; }
                }
            `}</style>

            <footer className="ft-root">
                <div className="ft-top-border" />
                <div className="ft-glow" />
                <div className="ft-grain" />

                <div className="ft-inner">
                    <div className="ft-grid">

                        {/* ── Brand ── */}
                        <div>
                            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 4 }}>
                                <div className="ft-brand-name">
                                    Tamil Food <em>Thaya</em>
                                </div>
                            </Link>
                            <p className="ft-brand-sub">{t('footer.tagline')}</p>
                            <p className="ft-brand-desc">
                                {t('footer.description')}
                            </p>
                            <ul className="ft-social">
                                <li>
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label={t('footer.facebook')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                        </svg>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label={t('footer.instagram')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                            <circle cx="12" cy="12" r="4"/>
                                            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                                        </svg>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://wa.me/31201234567" target="_blank" rel="noopener noreferrer" aria-label={t('footer.whatsapp')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* ── Quick Links ── */}
                        <div>
                            <p className="ft-col-title">{t('footer.explore')}</p>
                            <ul className="ft-nav">
                                {[
                                    { to: '/', key: 'nav.home' },
                                    { to: '/menu', key: 'nav.menu' },
                                    { to: '/catering', key: 'nav.catering' },
                                    { to: '/contact', key: 'nav.contact' },
                                ].map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="ft-nav a" style={{
                                            fontSize: 14,
                                            color: 'color-mix(in srgb, var(--brand-surface-mist) 50%, transparent)',
                                            textDecoration: 'none',
                                            fontWeight: 400,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-surface-mist)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-surface-mist) 50%, transparent)'}
                                        >
                                            <span style={{
                                                width: 16, height: 1,
                                                background: 'color-mix(in srgb, var(--brand-accent-bright) 50%, transparent)',
                                                display: 'inline-block',
                                                flexShrink: 0,
                                            }} />
                                            {t(link.key)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── Contact ── */}
                        <div>
                            <p className="ft-col-title">{t('footer.contact')}</p>
                            <ul className="ft-contact">
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconMapPin size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">{t('footer.locationLabel')}</span>
                                        <span className="ft-contact-val">{t('footer.locationValue')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconPhone size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">{t('footer.phone')}</span>
                                        <a href="tel:+31201234567" className="ft-contact-val">+31 20 123 4567</a>
                                    </div>
                                </li>
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconMail size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">{t('footer.email')}</span>
                                        <a href="mailto:hello@tamilfoodthaya.nl" className="ft-contact-val">hello@tamilfoodthaya.nl</a>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* ── Hours ── */}
                        <div>
                            <p className="ft-col-title">{t('footer.hours')}</p>
                            <div className="ft-hours">
                                {hours.map((h) => (
                                    <div key={h.dayKey} className="ft-hours-row">
                                        <span className="ft-hours-day">{t(h.dayKey)}</span>
                                        <span className="ft-hours-time">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="ft-open-badge">
                                <span className="ft-open-dot" />
                                {t('footer.openBadge')}
                            </div>
                        </div>

                    </div>

                    {/* Bottom bar */}
                    <hr className="ft-hr" />
                    <div className="ft-bottom">
<p className="ft-bottom-left">
                            {t('footer.copyright')}
                        </p>
                        <div className="ft-bottom-right">
                            <a href="/privacy" className="ft-bottom-link">{t('footer.privacy')}</a>
                            <span className="ft-bottom-dot" />
                            <a href="/terms" className="ft-bottom-link">{t('footer.terms')}</a>
                            <span className="ft-bottom-dot" />
                            <span className="ft-tamil">{t('footer.tamilScript')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
