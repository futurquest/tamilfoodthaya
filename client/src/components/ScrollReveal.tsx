import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../motion/setup';

const variants = {
    fadeUp: 'scroll-reveal-fade-up',
    fadeDown: 'scroll-reveal-fade-down',
    fadeIn: 'scroll-reveal-fade-in',
    slideLeft: 'scroll-reveal-slide-left',
    slideRight: 'scroll-reveal-slide-right',
    zoom: 'scroll-reveal-zoom',
};

const FROM = {
    fadeUp: { autoAlpha: 0, y: 34 },
    fadeDown: { autoAlpha: 0, y: -26 },
    fadeIn: { autoAlpha: 0 },
    slideLeft: { autoAlpha: 0, x: 34 },
    slideRight: { autoAlpha: 0, x: -34 },
    zoom: { autoAlpha: 0, scale: 0.94 },
} as const;

type ScrollRevealProps = {
    children: React.ReactNode;
    variant?: keyof typeof variants;
    className?: string;
    style?: React.CSSProperties;
    as?: React.ElementType;
    delay?: number;
};

export default function ScrollReveal({ children, variant = 'fadeUp', className = '', style = {}, as: Component = 'div', delay = 0 }: ScrollRevealProps) {
    const ref = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const tween = gsap.fromTo(
            el,
            FROM[variant] ?? FROM.fadeUp,
            { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: delay / 1000, paused: true },
        );
        const trigger = ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => tween.play(),
        });
        return () => {
            trigger.kill();
            tween.kill();
        };
    }, [variant, delay]);

    return (
        <Component
            ref={ref}
            className={`scroll-reveal ${className}`.trim()}
            style={style}
        >
            {children}
        </Component>
    );
}