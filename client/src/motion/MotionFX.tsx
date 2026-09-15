import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, SplitText } from './setup';

type MotionScope = { current: HTMLElement | null };

type Splits = Array<{ el: HTMLElement; split: SplitText }>;

function maskSelector(root: HTMLElement) {
  return root.querySelectorAll<HTMLElement>(
    '.home-hero__actions [class*="btn-"], .page-hero__actions [class*="btn-"], .catering-hero [class*="btn-"], .hero-menu-board__cta',
  );
}

/**
 * Ambient motion layer — mount once inside the public shell.
 *
 * 1. Editorial entrance cascade for hero sections.
 * 2. Masked word-reveal for section headings (SplitText).
 * 3. Background parallax: any `[data-para="speed"]` layer drifts on scroll.
 * 4. Cursor parallax: any `[data-cur="depth px"]` layer eases toward the pointer.
 * 5. Magnetic CTAs + 3D card tilt (fine pointers only).
 * 6. Scroll progress hairline.
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
    let teardownPointers: (() => void) | undefined;
    const splits: Splits = [];

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

      /* 2 — Masked word reveal for section headings */
      root.querySelectorAll<HTMLElement>('.section-heading .section-title').forEach((el) => {
        if (el.dataset.fxSplit === '1') return;
        el.dataset.fxSplit = '1';
        const split = SplitText.create(el, { type: 'words', mask: 'words' });
        if (!split.words?.length) {
          split.revert();
          delete el.dataset.fxSplit;
          return;
        }
        splits.push({ el, split });
        gsap.from(split.words, {
          yPercent: 110,
          duration: 1.05,
          ease: 'power4.out',
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });

      /* 3 — Background parallax (scrubbed by scroll position) */
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

      /* 4 + 5 — Cursor parallax, magnetic CTAs, 3D card tilt (fine pointers only) */
      if (window.matchMedia('(pointer: fine)').matches) {
        const cursors = Array.from(root.querySelectorAll<HTMLElement>('[data-cur]')).map((el) => {
          const depth = parseFloat(el.dataset.cur || '10');
          const toX = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' });
          const toY = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' });
          return { depth, toX, toY };
        });

        const onMove = (event: PointerEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          cursors.forEach(({ depth, toX, toY }) => {
            toX(nx * depth * 2);
            toY(ny * depth * 2);
          });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        teardownCursor = () => window.removeEventListener('pointermove', onMove);

        /* Magnetic CTAs */
        const cleanups: Array<() => void> = [];
        maskSelector(root).forEach((btn) => {
          const strength = 0.32;
          const toX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
          const toY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
          const onMove = (event: PointerEvent) => {
            const rect = btn.getBoundingClientRect();
            toX((event.clientX - (rect.left + rect.width / 2)) * strength);
            toY((event.clientY - (rect.top + rect.height / 2)) * strength);
          };
          const onLeave = () => {
            toX(0);
            toY(0);
          };
          btn.addEventListener('pointermove', onMove, { passive: true });
          btn.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            btn.removeEventListener('pointermove', onMove);
            btn.removeEventListener('pointerleave', onLeave);
          });
        });
        teardownPointers = () => cleanups.forEach((kill) => kill());

        /* 3D card tilt */
        root.querySelectorAll<HTMLElement>('.package-card').forEach((card) => {
          gsap.set(card, { transformPerspective: 900 });
          const toX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power2' });
          const toY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power2' });
          const toShift = gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power2' });
          const onMove = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            toY((px - 0.5) * 6);
            toX((0.5 - py) * 4);
            toShift((px - 0.5) * -6);
          };
          const onLeave = () => {
            toX(0);
            toY(0);
            toShift(0);
          };
          card.addEventListener('pointermove', onMove, { passive: true });
          card.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
          });
        });
      }

      /* 6 — Scroll progress hairline */
      const bar = root.querySelector<HTMLElement>('.fx-progress');
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
          },
        );
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') refresh();
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 700);

    return () => {
      teardownCursor?.();
      teardownPointers?.();
      splits.forEach(({ el, split }) => {
        split.revert();
        el.removeAttribute('data-fx-split');
      });
      ctx.revert();
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
    };
  }, [scopeRef, pathname]);

  return null;
}