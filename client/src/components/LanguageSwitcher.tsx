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
                    border: dropUp ? '1px solid color-mix(in srgb, var(--brand-accent-soft) 28%, transparent)' : '1px solid color-mix(in srgb, var(--brand-accent-olive) 35%, transparent)',
                    background: dropUp
                        ? 'linear-gradient(135deg, color-mix(in srgb, var(--brand-cream) 10%, transparent), color-mix(in srgb, var(--brand-cream) 4%, transparent))'
                        : 'linear-gradient(135deg, color-mix(in srgb, var(--brand-white) 18%, transparent), color-mix(in srgb, var(--brand-white) 6%, transparent))',
                    color: dropUp ? 'var(--brand-surface-cream)' : 'var(--brand-ink-warm)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '6px 12px 6px 8px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    boxShadow: dropUp
                        ? (open ? '0 10px 28px color-mix(in srgb, var(--brand-black) 18%, transparent)' : '0 3px 10px color-mix(in srgb, var(--brand-black) 10%, transparent)')
                        : (open ? '0 8px 24px color-mix(in srgb, var(--brand-ink-char) 15%, transparent)' : '0 3px 10px color-mix(in srgb, var(--brand-ink-char) 8%, transparent)'),
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
                        background: 'linear-gradient(135deg, var(--brand-accent-olive), var(--brand-accent-bright))',
                        color: 'var(--brand-ink-deep-b)',
                        fontSize: 10,
                        fontWeight: 700,
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
                        border: '1px solid color-mix(in srgb, var(--brand-accent-olive) 22%, transparent)',
                        background: 'color-mix(in srgb, var(--brand-white) 95%, transparent)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 16px 40px color-mix(in srgb, var(--brand-ink-char-soft) 16%, transparent)',
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
                                    padding: '9px 10px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'var(--brand-ink-char)' : 'var(--brand-ink-mocha)',
                                    background: active ? 'color-mix(in srgb, var(--brand-accent-bright) 20%, transparent)' : 'transparent',
                                    transition: 'background 160ms ease',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '999px',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: active ? 'linear-gradient(135deg, var(--brand-accent-olive), var(--brand-accent-bright))' : 'color-mix(in srgb, var(--brand-ink-char) 8%, transparent)',
                                            color: active ? 'var(--brand-ink-deep-b)' : 'var(--brand-muted-warm)',
                                            fontSize: 10,
                                            fontWeight: 700,
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
                                            width: 7,
                                            height: 12,
                                            borderRight: '2px solid var(--brand-accent-olive)',
                                            borderBottom: '2px solid var(--brand-accent-olive)',
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
