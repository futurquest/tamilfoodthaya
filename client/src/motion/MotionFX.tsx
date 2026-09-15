import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from './setup';

type MotionScope = { current: HTMLElement | null };

/**
 * Ambient motion layer — mount once inside the public shell.
 *
 * 1. Editorial entrance cascade for hero sections.
 * 2. Background parallax: any `[data-para="speed"]` layer drifts as it scrolls.
 * 3. Cursor parallax: any `[data-cur="depth px"]` layer eases toward the pointer.
 *
 * Reduced motion and coarse pointers are respected; everything is reverted
 * on route change so SPA transitions never leave stale tweens behind.
 */
export default function MotionFX({ scopeRef }: { scopeRef: MotionScope }) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let teardownCursor: (() => void) | undefined;

    const ctx = gsap.context(() => {
      /* 1 — Hero entrance cascade */
      root.querySelectorAll<HTMLElement>('.home-hero, .page-hero, .catering-hero').forEach((hero) => {
        const copy = hero.querySelectorAll<HTMLElement>(
          '.eyebrow, .display, h1, .lead, .page-hero p, .home-hero__actions, .catering-hero__actions, .home-hero__trust',
        );
        const primed = hero.querySelectorAll<HTMLElement>(
          '.hero-menu-board, .home-hero__proof, .catering-hero__panel',
        );

        if (copy.length) {
          gsap.fromTo(
            copy,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.2 },
          );
        }
        if (primed.length) {
          gsap.fromTo(
            primed,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.85, ease: 'power2.out', stagger: 0.16, delay: 0.6 },
          );
        }
      });

      /* 2 — Background parallax (scrubbed by scroll position) */
      root.querySelectorAll<HTMLElement>('[data-para]').forEach((el) => {
        const speed = parseFloat(el.dataset.para || '12');
        gsap.fromTo(
          el,
          { yPercent: -speed * 0.25 },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section') ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });

      /* 3 — Cursor parallax (lerped, pointer-events: fine only) */
      if (window.matchMedia('(pointer: fine)').matches) {
        const steppers = Array.from(root.querySelectorAll<HTMLElement>('[data-cur]')).map((el) => {
          const depth = parseFloat(el.dataset.cur || '10');
          const toX = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' });
          const toY = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' });
          return { depth, toX, toY };
        });

        const onMove = (event: PointerEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          steppers.forEach(({ depth, toX, toY }) => {
            toX(nx * depth * 2);
            toY(ny * depth * 2);
          });
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        teardownCursor = () => window.removeEventListener('pointermove', onMove);
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') refresh();
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 700);

    return () => {
      teardownCursor?.();
      ctx.revert();
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
    };
  }, [scopeRef, pathname]);

  return null;
}