import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FluidBackground from './FluidBackground';

const IMAGE_COUNT = 14;
const DWELL = 5000;

// Each slide's stage ratio is matched to its source frame so every photo
// (landscape 3:2, wide 16:9, portrait 3:4) fills its stage edge-to-edge
// without letterboxing or heavy crops.
const FRAMES: string[] = [
  '3/2', '3/4', '3/4', '3/2', '3/2', '3/2', '16/9',
  '16/9', '16/9', '16/9', '3/4', '3/2', '16/9', '3/2',
];

const slideSrc = (index: number) =>
  `/events/event-${String((index % IMAGE_COUNT) + 1).padStart(2, '0')}.png`;

export default function EventGallery() {
  const { t } = useTranslation();
  const id = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const imageNumber = String(active + 1).padStart(2, '0');
  const caption = t(`eventGallery.captions.${active}`);
  const move = (direction: number) =>
    setActive(index => (index + direction + IMAGE_COUNT) % IMAGE_COUNT);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => move(1), DWELL);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, active]);

  useEffect(() => {
    [active + 1, active + 2].forEach(index => {
      const img = new Image();
      img.src = slideSrc(index);
    });
  }, [active]);

  // Fit the whole gallery (stage + segments + caption) inside the device
  // height. Each slide's stage width is derived from its frame ratio and the
  // viewport budget, so no photo ever grows taller than the screen.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(0);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const compute = () => {
      const [numerator, denominator] = FRAMES[active].split('/').map(Number);
      const ratio = numerator / denominator;
      const viewportH = window.innerHeight;
      const narrow = window.innerWidth < 720;
      const reserved = narrow ? Math.round(viewportH * 0.42) : 420;
      const budget = Math.max(180, viewportH - reserved);
      const fitted = Math.min(shell.clientWidth, budget * ratio);
      setStageWidth(Math.round(fitted));
    };
    compute();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(compute) : null;
    ro?.observe(shell);
    window.addEventListener('resize', compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [active]);

  const shellStyle = {
    '--frame': FRAMES[active],
    width: stageWidth > 0 ? `${stageWidth}px` : undefined,
  } as CSSProperties;

  return (
    <section className="section event-gallery" aria-labelledby={`${id}-title`}>
      <FluidBackground intensity={0.4} parallaxStrength={5} deepParallax={9} />
      <div className="container">
        <div className="event-gallery__heading">
          <div>
            <p className="eyebrow">{t('eventGallery.eyebrow', 'Kitchen & Fire — Events in pictures')}</p>
            <h2 className="section-title" id={`${id}-title`}>{t('eventGallery.title')}</h2>
            <p className="lead">{t('eventGallery.description')}</p>
          </div>
          <Link to="/contact#inquiry" className="btn-secondary">{t('conversion.quote')}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>

        <div
          className={`event-gallery__carousel${paused ? ' is-paused' : ''}`}
          role="region"
          aria-roledescription={t('eventGallery.carousel')}
          aria-label={t('eventGallery.title')}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="event-gallery__shell" ref={shellRef} style={shellStyle}>
            <div className="event-gallery__stage">
            <div
              className="event-gallery__stage-inner"
              tabIndex={0}
              aria-label={t('eventGallery.keyboardHint')}
              onKeyDown={event => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  move(event.key === 'ArrowRight' ? 1 : -1);
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  setActive(event.key === 'Home' ? 0 : IMAGE_COUNT - 1);
                }
              }}
              onTouchStart={event => {
                setPaused(true);
                const touch = event.touches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchCancel={() => { touchStart.current = null; setPaused(false); }}
              onTouchEnd={event => {
                const start = touchStart.current;
                touchStart.current = null;
                setPaused(false);
                if (!start) return;
                const touch = event.changedTouches[0];
                const dx = touch.clientX - start.x;
                const dy = touch.clientY - start.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
              }}
            >
              <figure id={`${id}-slide`} role="group" aria-roledescription={t('eventGallery.slide')} aria-label={t('eventGallery.position', { current: active + 1, total: IMAGE_COUNT })}>
                <img
                  key={active}
                  src={slideSrc(active)}
                  alt={caption}
                  loading={active === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
                <figcaption className="sr-only">{caption}</figcaption>
              </figure>
            </div>
            <span className="event-gallery__chip" aria-hidden="true">
              <span className="event-gallery__chip-dot" />
              {t('eventGallery.badge', 'Gathering')} · {imageNumber} / {IMAGE_COUNT}
            </span>
          </div>

          <div className="event-gallery__segments" aria-label={t('eventGallery.selector', 'Browse slides')}>
            {Array.from({ length: IMAGE_COUNT }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t('eventGallery.position', { current: index + 1, total: IMAGE_COUNT })}
                aria-current={index === active ? 'true' : undefined}
                className={`event-gallery__segment${index === active ? ' is-active' : ''}${index < active ? ' is-done' : ''}`}
                onClick={() => setActive(index)}
              >
                <span />
              </button>
            ))}
          </div>

          <div className="event-gallery__footer">
            <div className="event-gallery__caption" aria-live="polite" aria-atomic="true">
              <span className="event-gallery__count">{imageNumber} / {IMAGE_COUNT}</span>
              <p>{caption}</p>
            </div>
            <div className="event-gallery__controls">
              <button type="button" aria-label={t('eventGallery.previous')} aria-controls={`${id}-slide`} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label={t('eventGallery.next')} aria-controls={`${id}-slide`} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}