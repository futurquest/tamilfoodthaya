import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('toggles the theme and persists the choice', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        expect(document.documentElement).toHaveAttribute('data-theme', 'light');

        fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('keeps the active theme across remounts', () => {
        const { unmount } = render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
        unmount();

        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
    });
});