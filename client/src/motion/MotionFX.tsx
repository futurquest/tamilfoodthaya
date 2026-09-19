import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from './setup';

type MotionScope = { current: HTMLElement | null };
export default function MotionFX({ scopeRef }: { scopeRef: MotionScope }) {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(root.querySelectorAll('.home-hero__copy, .page-hero .container, .catering-hero__grid'),
        { y: 12 }, { y: 0, duration: 0.65, ease: 'power3.out', clearProps: 'transform' });
    }, root);
    return () => context.revert();
  }, [pathname, scopeRef]);
  return null;
}
