import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-tamil-maroon text-white hover:bg-opacity-90',
            secondary: 'bg-tamil-gold text-tamil-charcoal hover:bg-opacity-80',
            outline: 'border-2 border-tamil-maroon text-tamil-maroon hover:bg-tamil-maroon hover:text-white',
            ghost: 'text-tamil-maroon hover:bg-tamil-maroon/10',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-tamil-maroon focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
