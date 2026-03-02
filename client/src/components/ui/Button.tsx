import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            gold: 'btn-gold',
            outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white rounded-xl font-semibold transition-all duration-300',
            ghost: 'text-primary-600 hover:bg-primary-50 rounded-xl font-semibold transition-all duration-300',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        // btn-primary / btn-secondary / btn-gold already have their own padding from CSS
        // Only apply size overrides for outline/ghost variants
        const needsSizeClass = variant === 'outline' || variant === 'ghost';

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    needsSizeClass ? sizes[size] : '',
                    className
                )}
                {...props}
            />
        );
    }
);
