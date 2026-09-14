import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ size = 16 }: { size?: number }) => {
    const { theme, toggleTheme } = useTheme();
    const dark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={dark}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid color-mix(in srgb, var(--brand-accent-olive) 35%, transparent)',
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-white) 18%, transparent), color-mix(in srgb, var(--brand-white) 6%, transparent))',
                color: 'var(--brand-ink-warm)',
                cursor: 'pointer',
                flexShrink: 0,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 3px 10px color-mix(in srgb, var(--brand-ink-char) 8%, transparent)',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
        >
            <span style={{ position: 'relative', width: size, height: size }}>
                <Sun
                    size={size}
                    strokeWidth={2.2}
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: dark ? 1 : 0,
                        transform: dark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
                        transition: 'opacity 200ms ease, transform 200ms ease',
                    }}
                />
                <Moon
                    size={size}
                    strokeWidth={2.2}
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: dark ? 0 : 1,
                        transform: dark ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
                        transition: 'opacity 200ms ease, transform 200ms ease',
                    }}
                />
            </span>
        </button>
    );
};