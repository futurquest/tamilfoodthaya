import { Link } from 'react-router-dom';
import { IconMapPin, IconPhone, IconMail } from './Icons';

const footerLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/catering', label: 'Catering' },
    { to: '/buffet-packages', label: 'Buffet Packages' },
    { to: '/contact', label: 'Contact' },
];

const hours = [
    { day: 'Mon – Fri', time: '10:00 – 22:30' },
    { day: 'Saturday', time: '10:00 – 23:00' },
    { day: 'Sunday', time: '11:00 – 22:00' },
];

export default function Footer() {
    return (
        <>
            <style>{`
                .ft-root {
                    font-family: var(--font-sans);
                    background: #0a0806;
                    color: #f0ece4;
                    position: relative;
                    overflow: hidden;
                }

                /* Top decorative border */
                .ft-top-border {
                    height: 1px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(232,160,32,0.15) 20%,
                        rgba(232,160,32,0.5) 50%,
                        rgba(232,160,32,0.15) 80%,
                        transparent 100%
                    );
                }

                /* Ambient glow */
                .ft-glow {
                    position: absolute;
                    top: 0; left: 50%;
                    transform: translateX(-50%);
                    width: 700px; height: 300px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.07) 0%, transparent 70%);
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
                    color: #f5efe4;
                    line-height: 1.1;
                    margin-bottom: 4px;
                    letter-spacing: -0.01em;
                }
                .ft-brand-name em {
                    font-style: italic;
                    color: #e8a020;
                }
                .ft-brand-sub {
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(232,160,32,0.6);
                    font-weight: 500;
                    margin-bottom: 20px;
                }
                .ft-brand-desc {
                    font-size: 13.5px;
                    color: rgba(240,236,228,0.45);
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
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    color: rgba(240,236,228,0.5);
                    text-decoration: none;
                    transition: all 0.25s;
                    font-size: 15px;
                }
                .ft-social a:hover {
                    border-color: rgba(232,160,32,0.5);
                    color: #e8a020;
                    background: rgba(232,160,32,0.08);
                    transform: translateY(-2px);
                }

                /* Column titles */
                .ft-col-title {
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(232,160,32,0.7);
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
                    color: rgba(240,236,228,0.5);
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
                    background: #e8a020;
                    transition: width 0.25s;
                    display: inline-block;
                }
                .ft-nav a:hover {
                    color: #f0ece4;
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
                    background: rgba(232,160,32,0.1);
                    border: 1px solid rgba(232,160,32,0.2);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    color: #e8a020;
                }
                .ft-contact-text {
                    display: flex; flex-direction: column; gap: 1px;
                }
                .ft-contact-label {
                    font-size: 10px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(240,236,228,0.25);
                    font-weight: 500;
                }
                .ft-contact-val {
                    font-size: 13.5px;
                    color: rgba(240,236,228,0.65);
                    font-weight: 300;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                a.ft-contact-val:hover { color: #f0ece4; }

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
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    gap: 16px;
                }
                .ft-hours-row:last-child { border-bottom: none; padding-bottom: 0; }
                .ft-hours-day {
                    font-size: 13px;
                    color: rgba(240,236,228,0.45);
                    font-weight: 300;
                }
                .ft-hours-time {
                    font-size: 13px;
                    color: rgba(240,236,228,0.75);
                    font-weight: 500;
                    font-variant-numeric: tabular-nums;
                }
                .ft-open-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(34,197,94,0.12);
                    border: 1px solid rgba(34,197,94,0.25);
                    border-radius: 100px;
                    padding: 4px 12px;
                    font-size: 11px;
                    color: #4ade80;
                    font-weight: 500;
                    margin-top: 20px;
                }
                .ft-open-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #4ade80;
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
                    background: rgba(255,255,255,0.07);
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
                    color: rgba(240,236,228,0.3);
                    font-weight: 300;
                }
                .ft-bottom-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .ft-bottom-link {
                    font-size: 12px;
                    color: rgba(240,236,228,0.25);
                    text-decoration: none;
                    transition: color 0.2s;
                    font-weight: 400;
                }
                .ft-bottom-link:hover { color: rgba(240,236,228,0.6); }
                .ft-bottom-dot {
                    width: 3px; height: 3px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    display: inline-block;
                }

                /* Tamil script decorative text */
                .ft-tamil {
                    font-size: 11px;
                    color: rgba(232,160,32,0.25);
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
                            <p className="ft-brand-sub">Authentic · Netherlands · Est. 2020</p>
                            <p className="ft-brand-desc">
                                Bringing the rich traditions of Tamil cuisine to the Netherlands — from intimate dinners to grand celebrations.
                            </p>
                            <ul className="ft-social">
                                <li>
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                        </svg>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                            <circle cx="12" cy="12" r="4"/>
                                            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                                        </svg>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://wa.me/31201234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* ── Quick Links ── */}
                        <div>
                            <p className="ft-col-title">Navigate</p>
                            <ul className="ft-nav">
                                {footerLinks.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="ft-nav a" style={{
                                            fontSize: 14,
                                            color: 'rgba(240,236,228,0.5)',
                                            textDecoration: 'none',
                                            fontWeight: 400,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#f0ece4'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,228,0.5)'}
                                        >
                                            <span style={{
                                                width: 16, height: 1,
                                                background: 'rgba(232,160,32,0.5)',
                                                display: 'inline-block',
                                                flexShrink: 0,
                                            }} />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── Contact ── */}
                        <div>
                            <p className="ft-col-title">Get in Touch</p>
                            <ul className="ft-contact">
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconMapPin size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">Location</span>
                                        <span className="ft-contact-val">Amsterdam, Netherlands</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconPhone size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">Phone</span>
                                        <a href="tel:+31201234567" className="ft-contact-val">+31 20 123 4567</a>
                                    </div>
                                </li>
                                <li>
                                    <div className="ft-contact-icon">
                                        <IconMail size={15} />
                                    </div>
                                    <div className="ft-contact-text">
                                        <span className="ft-contact-label">Email</span>
                                        <a href="mailto:hello@tamilfoodthaya.nl" className="ft-contact-val">hello@tamilfoodthaya.nl</a>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* ── Hours ── */}
                        <div>
                            <p className="ft-col-title">Opening Hours</p>
                            <div className="ft-hours">
                                {hours.map((h) => (
                                    <div key={h.day} className="ft-hours-row">
                                        <span className="ft-hours-day">{h.day}</span>
                                        <span className="ft-hours-time">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="ft-open-badge">
                                <span className="ft-open-dot" />
                                Open for Dine-in &amp; Takeaway
                            </div>
                        </div>

                    </div>

                    {/* Bottom bar */}
                    <hr className="ft-hr" />
                    <div className="ft-bottom">
                        <p className="ft-bottom-left">
                            © 2026 Tamil Food Thaya. All rights reserved.
                        </p>
                        <div className="ft-bottom-right">
                            <a href="/privacy" className="ft-bottom-link">Privacy Policy</a>
                            <span className="ft-bottom-dot" />
                            <a href="/terms" className="ft-bottom-link">Terms of Use</a>
                            <span className="ft-bottom-dot" />
                            <span className="ft-tamil">தமிழ் உணவு</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
