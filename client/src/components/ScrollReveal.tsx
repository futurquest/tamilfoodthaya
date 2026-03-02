import React from 'react';
import { useInView } from '../hooks/useInView';

const variants = {
    fadeUp: 'scroll-reveal-fade-up',
    fadeDown: 'scroll-reveal-fade-down',
    fadeIn: 'scroll-reveal-fade-in',
    slideLeft: 'scroll-reveal-slide-left',
    slideRight: 'scroll-reveal-slide-right',
    zoom: 'scroll-reveal-zoom',
};

type ScrollRevealProps = {
    children: React.ReactNode;
    variant?: keyof typeof variants;
    className?: string;
    style?: React.CSSProperties;
    as?: React.ElementType;
};

export default function ScrollReveal({ children, variant = 'fadeUp', className = '', style = {}, as: Component = 'div' }: ScrollRevealProps) {
    const { ref, isInView } = useInView({ rootMargin: '0px 0px -80px 0px', threshold: 0.1, once: true });
    const variantClass = variants[variant] || variants.fadeUp;

    return (
        <Component
            ref={ref}
            className={`scroll-reveal ${variantClass} ${isInView ? 'scroll-reveal-visible' : ''} ${className}`.trim()}
            style={style}
        >
            {children}
        </Component>
    );
}
