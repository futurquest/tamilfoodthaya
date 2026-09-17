import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FluidBackground from './FluidBackground';

const IMAGE_COUNT = 14;
const DWELL = 5000;

// Smart frame per source photo (used in single-card mode) so the full
// composition is always shown.
const FRAMES: string[] = [
  '3/2', '3/4', '3/4', '3/2', '3/2', '3/2', '16/9',
  '16/9', '16/9', '16/9', '3/4', '3/2', '16/9', '3/2',
];

const slideSrc = (index: number) =>
  `/events/event-${String((index % IMAGE_COUNT) + 1).padStart(2, '0')}.png`;

// How many photos fit on one slide at each screen size.
const perPageFor = (vw: number) => (vw >= 1180 ? 3 : vw >= 720 ? 2 : 1);

export default function EventGallery() {
  const { t } = useTranslation();
  const id = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const [perPage, setPerPage] = useState(() => perPageFor(window.innerWidth));
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const maxIndex = IMAGE_COUNT - perPage;
  const imageNumber = String(active + 1).padStart(2, '0');
  const caption = t(`eventGallery.captions.${active}`);
  const frameRatio = perPage === 1 ? FRAMES[active] : '3/2';
  const move = (direction: number) =>
    setActive(index => {
      const next = index + direction;
      if (next > maxIndex) return 0;
      if (next < 0) return maxIndex;
      return next;
    });

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
    const timer = window.setInterval(() => {
      setActive(index => (index + 1 > maxIndex ? 0 : index + 1));
    }, DWELL);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, maxIndex]);

  useEffect(() => {
    [active, active + 1, active + perPage].forEach(index => {
      const img = new Image();
      img.src = slideSrc(index);
    });
  }, [active, perPage]);

  // Responsive items-per-slide + viewport fit: pick how many photos the row
  // shows, then size the stage width so the row never grows past the screen.
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const compute = () => {
      const viewportW = window.innerWidth;
      const nextPerPage = perPageFor(viewportW);
      setPerPage(prev => (prev === nextPerPage ? prev : nextPerPage));
      setActive(index => Math.min(index, IMAGE_COUNT - nextPerPage));

      const [numerator, denominator] = (nextPerPage === 1 ? FRAMES[active] : '3/2').split('/').map(Number);
      const ratio = numerator / denominator;
      const viewportH = window.innerHeight;
      const narrow = viewportW < 720;
      const reserved = narrow ? Math.round(viewportH * 0.42) : 420;
      const budget = Math.max(180, viewportH - reserved);
      const fitted = Math.min(shell.clientWidth, budget * ratio * nextPerPage);
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
    '--frame': frameRatio,
    '--per-page': perPage,
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
            <div
              className="event-gallery__stage"
              id={`${id}-stage`}
              tabIndex={0}
              aria-label={t('eventGallery.keyboardHint')}
              onKeyDown={event => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  move(event.key === 'ArrowRight' ? 1 : -1);
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  setActive(event.key === 'Home' ? 0 : maxIndex);
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
              <div
                className="event-gallery__track"
                style={{ transform: `translate3d(-${(100 * active) / perPage}%, 0, 0)` }}
              >
                {Array.from({ length: IMAGE_COUNT }, (_, index) => {
                  const position = t('eventGallery.position', { current: index + 1, total: IMAGE_COUNT });
                  const cardImage = t(`eventGallery.captions.${index}`);
                  return (
                    <figure
                      key={index}
                      className={`event-gallery__card${index === active ? ' is-active' : ''}`}
                      role="group"
                      aria-roledescription={t('eventGallery.slide')}
                      aria-label={position}
                    >
                      <img
                        src={slideSrc(index)}
                        alt={cardImage}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                      />
                      <figcaption className="sr-only">{cardImage}</figcaption>
                      {index === active && (
                        <span className="event-gallery__chip" aria-hidden="true">
                          <span className="event-gallery__chip-dot" />
                          {t('eventGallery.badge', 'Gathering')} · {imageNumber} / {IMAGE_COUNT}
                        </span>
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>

            <div className="event-gallery__controls">
              <button type="button" aria-label={t('eventGallery.previous')} aria-controls={`${id}-stage`} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label={t('eventGallery.next')} aria-controls={`${id}-stage`} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
            </div>

            <div className="event-gallery__segments" aria-label={t('eventGallery.selector', 'Browse slides')}>
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
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
                <span className="event-gallery__count">{imageNumber}</span>
                <p>{caption}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}