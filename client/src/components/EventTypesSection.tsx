import { useTranslation } from 'react-i18next';
import { IconBirthday, IconWedding, IconCorporate, IconFamily, IconPrivate } from './Icons';
import ScrollReveal from './ScrollReveal';
import { useState } from 'react';

const eventIcons = [
    IconBirthday,
    IconWedding,
    IconCorporate,
    IconFamily,
    IconPrivate,
];

const eventTypes = ['birthday', 'wedding', 'corporate', 'family', 'private'] as const;

const defaultLabels: Record<string, string> = {
    birthday: 'Birthday',
    wedding: 'Wedding',
    corporate: 'Corporate',
    family: 'Family Gathering',
    private: 'Private Party',
};

const eventDescriptions: Record<string, string> = {
    birthday: 'Milestone moments',
    wedding: 'Your perfect day',
    corporate: 'Professional events',
    family: 'Cherished reunions',
    private: 'Exclusive soirées',
};

const eventAccents: Record<string, string> = {
    birthday:  '#f87171',
    wedding:   '#f9a8d4',
    corporate: '#93c5fd',
    family:    '#86efac',
    private:   '#c4b5fd',
};

export default function EventTypesSection() {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');

                .evt-root { font-family: 'Outfit', sans-serif; }
                .evt-title { font-family: 'Cormorant Garamond', serif; }

                .evt-card {
                    position: relative;
                    background: #fff;
                    border: 1px solid rgba(0,0,0,0.07);
                    border-radius: 16px;
                    padding: 32px 20px 28px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                                box-shadow 0.35s cubic-bezier(0.22,1,0.36,1),
                                border-color 0.35s;
                    text-align: center;
                }
                .evt-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 0.35s;
                    border-radius: inherit;
                }
                .evt-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 48px rgba(0,0,0,0.10);
                }
                .evt-card:hover::before { opacity: 1; }

                .evt-icon-wrap {
                    width: 72px; height: 72px;
                    border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 18px;
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s;
                    background: rgba(0,0,0,0.04);
                    position: relative; z-index: 1;
                }
                .evt-card:hover .evt-icon-wrap {
                    transform: scale(1.12) rotate(-4deg);
                }

                .evt-number {
                    position: absolute;
                    top: 14px; right: 16px;
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 13px;
                    font-weight: 400;
                    color: rgba(0,0,0,0.12);
                    letter-spacing: 0.04em;
                    transition: color 0.3s;
                    z-index: 1;
                }
                .evt-card:hover .evt-number { color: rgba(0,0,0,0.22); }

                .evt-label {
                    font-family: 'Outfit', sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 6px;
                    position: relative; z-index: 1;
                    transition: color 0.3s;
                }
                .evt-desc {
                    font-size: 12px;
                    color: #999;
                    letter-spacing: 0.03em;
                    font-weight: 400;
                    position: relative; z-index: 1;
                    transition: color 0.3s;
                }
                .evt-card:hover .evt-desc { color: #666; }

                /* Bottom accent line */
                .evt-accent-line {
                    position: absolute;
                    bottom: 0; left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 40px; height: 3px;
                    border-radius: 2px 2px 0 0;
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), width 0.35s;
                }
                .evt-card:hover .evt-accent-line {
                    transform: translateX(-50%) scaleX(1);
                    width: 60px;
                }

                /* Section heading */
                .evt-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: #c97a10;
                    font-weight: 500;
                    margin-bottom: 10px;
                    font-family: 'Outfit', sans-serif;
                }

                @media (max-width: 640px) {
                    .evt-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .evt-card { padding: 24px 14px 20px; }
                    .evt-icon-wrap { width: 56px; height: 56px; border-radius: 16px; }
                }
            `}</style>

            <section className="evt-root" style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '80px 24px',
            }}>
                {/* Heading */}
                <ScrollReveal variant="fadeUp">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <p className="evt-eyebrow">What We Offer</p>
                        <h2
                            className="evt-title"
                            style={{
                                fontSize: 'clamp(32px, 5vw, 52px)',
                                fontWeight: 600,
                                color: '#111',
                                lineHeight: 1.1,
                                marginBottom: 14,
                            }}
                        >
                            {t('home.eventsTitle', 'Events We Cater For')}
                        </h2>
                        <p style={{
                            fontSize: 17,
                            color: '#888',
                            maxWidth: 440,
                            margin: '0 auto',
                            lineHeight: 1.65,
                            fontWeight: 300,
                        }}>
                            {t('home.eventsSubtitle', 'From intimate gatherings to grand celebrations')}
                        </p>
                    </div>
                </ScrollReveal>

                {/* Cards grid */}
                <ScrollReveal variant="fadeUp" style={{ transitionDelay: '0.1s' }}>
                    <div
                        className="evt-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: 16,
                        }}
                    >
                        {eventTypes.map((type, i) => {
                            const IconComponent = eventIcons[i];
                            const accent = eventAccents[type];
                            const isHovered = hovered === type;

                            return (
                                <div
                                    key={type}
                                    className="evt-card"
                                    onMouseEnter={() => setHovered(type)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        boxShadow: isHovered
                                            ? `0 20px 48px rgba(0,0,0,0.10), 0 0 0 1px ${accent}55`
                                            : '0 2px 12px rgba(0,0,0,0.05)',
                                        borderColor: isHovered ? `${accent}55` : 'rgba(0,0,0,0.07)',
                                    }}
                                >
                                    {/* Card number */}
                                    <span className="evt-number">0{i + 1}</span>

                                    {/* Subtle bg wash on hover */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: `radial-gradient(ellipse at 50% 0%, ${accent}18 0%, transparent 70%)`,
                                        opacity: isHovered ? 1 : 0,
                                        transition: 'opacity 0.4s',
                                        borderRadius: 'inherit',
                                        pointerEvents: 'none',
                                    }} />

                                    {/* Icon */}
                                    <div
                                        className="evt-icon-wrap"
                                        style={{
                                            background: isHovered ? `${accent}22` : 'rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <span style={{
                                            color: isHovered ? accent : '#555',
                                            transition: 'color 0.3s',
                                            display: 'flex',
                                        }}>
                                            <IconComponent size={30} />
                                        </span>
                                    </div>

                                    {/* Label */}
                                    <p
                                        className="evt-label"
                                        style={{ color: isHovered ? '#111' : '#1a1a1a' }}
                                    >
                                        {t(`home.${type}`, defaultLabels[type])}
                                    </p>

                                    {/* Description */}
                                    <p className="evt-desc">
                                        {eventDescriptions[type]}
                                    </p>

                                    {/* Bottom accent line */}
                                    <div
                                        className="evt-accent-line"
                                        style={{ background: accent }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </ScrollReveal>
            </section>
        </>
    );
}