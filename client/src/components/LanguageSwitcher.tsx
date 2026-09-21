import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'nl', label: 'Nederlands', short: 'NL', flag: 'NL' },
    { code: 'en', label: 'English', short: 'EN', flag: 'EN' },
    { code: 'ta', label: 'Tamil', short: 'TA', flag: 'TA' },
] as const;

export const LanguageSwitcher = ({ dropUp = false }: { dropUp?: boolean }) => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const currentCode = i18n.language?.split('-')[0] || 'en';
    const currentLang = LANGUAGES.find((l) => l.code === currentCode) || LANGUAGES[1];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('lang', lng);
        setOpen(false);
    };

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) setOpen(false);
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

    return (
        <div ref={rootRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Select language"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: dropUp ? 'space-between' : 'flex-start',
                    width: dropUp ? '100%' : 'auto',
                    gap: 8,
                    borderRadius: 999,
                    border: '1px solid color-mix(in srgb, var(--brand-text) 14%, transparent)',
                    background: 'color-mix(in srgb, var(--brand-surface) 85%, transparent)',
                    color: 'var(--brand-text)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '6px 12px 6px 8px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: open
                        ? '0 8px 24px color-mix(in srgb, var(--brand-shadow-warm) 22%, transparent)'
                        : '0 2px 8px color-mix(in srgb, var(--brand-shadow-warm) 10%, transparent)',
                    transition: 'all 200ms ease',
                }}
            >
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '999px',
                        background: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)',
                        color: 'var(--brand-primary)',
                        fontSize: 10,
                        fontWeight: 800,
                    }}
                >
                    {currentLang.flag}
                </span>
                <span>{currentLang.short}</span>
                <span
                    style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRight: '1.5px solid currentColor',
                        borderBottom: '1.5px solid currentColor',
                        transform: open ? 'rotate(-135deg)' : 'rotate(45deg)',
                        transition: 'transform 180ms ease',
                        marginTop: open ? 3 : -1,
                        opacity: 0.75,
                    }}
                />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Language options"
                    style={{
                        position: 'absolute',
                        ...(dropUp
                            ? { bottom: 'calc(100% + 10px)' }
                            : { top: 'calc(100% + 10px)' }),
                        right: 0,
                        width: dropUp ? '100%' : 'auto',
                        minWidth: 190,
                        borderRadius: 14,
                        border: '1px solid color-mix(in srgb, var(--brand-text) 14%, transparent)',
                        background: 'var(--brand-surface-dim)',
                        color: 'var(--brand-text)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        boxShadow: 'var(--shadow-lift)',
                        padding: 6,
                        zIndex: 150,
                    }}
                >
                    {LANGUAGES.map((lang) => {
                        const active = currentCode === lang.code;
                        return (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => changeLanguage(lang.code)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '9px 12px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'var(--brand-primary)' : 'var(--brand-text)',
                                    background: active
                                        ? 'color-mix(in srgb, var(--brand-primary) 14%, transparent)'
                                        : 'transparent',
                                    transition: 'background 160ms ease, color 160ms ease',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-text) 7%, transparent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '999px',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: active
                                                ? 'color-mix(in srgb, var(--brand-primary) 22%, transparent)'
                                                : 'color-mix(in srgb, var(--brand-text) 8%, transparent)',
                                            color: active
                                                ? 'var(--brand-primary)'
                                                : 'var(--brand-text-muted)',
                                            fontSize: 10,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {lang.flag}
                                    </span>
                                    {lang.label}
                                </span>
                                {active && (
                                    <span
                                        aria-hidden
                                        style={{
                                            width: 6,
                                            height: 11,
                                            borderRight: '2px solid var(--brand-primary)',
                                            borderBottom: '2px solid var(--brand-primary)',
                                            transform: 'rotate(45deg)',
                                            marginRight: 4,
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
