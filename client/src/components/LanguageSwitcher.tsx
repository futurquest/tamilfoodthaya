import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'nl', label: 'Nederlands', short: 'NL', flag: 'NL' },
    { code: 'en', label: 'English', short: 'EN', flag: 'EN' },
    { code: 'ta', label: 'Tamil', short: 'TA', flag: 'TA' },
] as const;

export const LanguageSwitcher = () => {
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
                    gap: 8,
                    borderRadius: 999,
                    border: '1px solid rgba(184,122,16,0.35)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
                    color: '#2f2214',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '6px 10px 6px 8px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    boxShadow: open ? '0 8px 24px rgba(26,18,9,0.15)' : '0 3px 10px rgba(26,18,9,0.08)',
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
                        background: 'linear-gradient(135deg, #b87a10, #e8a020)',
                        color: '#0c0a08',
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
                        top: 'calc(100% + 10px)',
                        right: 0,
                        minWidth: 190,
                        borderRadius: 14,
                        border: '1px solid rgba(184,122,16,0.22)',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 16px 40px rgba(15,13,10,0.16)',
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
                                    color: active ? '#1a1209' : '#4a3728',
                                    background: active ? 'rgba(232,160,32,0.2)' : 'transparent',
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
                                            background: active ? 'linear-gradient(135deg, #b87a10, #e8a020)' : 'rgba(26,18,9,0.08)',
                                            color: active ? '#0c0a08' : '#6b5a3a',
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
                                            borderRight: '2px solid #b87a10',
                                            borderBottom: '2px solid #b87a10',
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
