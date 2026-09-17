import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FluidBackground from './FluidBackground';

const IMAGE_COUNT = 14;
const DWELL = 1800;
// Native size of every photo in /events (1672x941) - cards use this exact
// ratio so object-fit cover never crops or distorts the composition.
const FRAME = '1672/941';

const slideSrc = (index: number) =>
  `/events/event-${String((index % IMAGE_COUNT) + 1).padStart(2, '0')}.png`;

// How many photos fit on one slide at each screen size.
const perPageFor = (vw: number) => (vw >= 1180 ? 3 : vw >= 720 ? 2 : 1);

export default function EventGallery() {
  const { t } = useTranslation();
  const id = useId();
  // Slide position in card units. Runs 0..IMAGE_COUNT; slot IMAGE_COUNT is a
  // seamless duplicate of slot 0 used to hide the loop-back.
  const [pos, setPos] = useState(0);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const [perPage, setPerPage] = useState(() => perPageFor(window.innerWidth));
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const active = pos % IMAGE_COUNT;
  const imageNumber = String(active + 1).padStart(2, '0');
  const caption = t(`eventGallery.captions.${active}`);
  const slots = IMAGE_COUNT + perPage;

  const move = (direction: number) => setPos(current => {
    if (direction > 0) return current >= IMAGE_COUNT ? 0 : current + 1;
    if (current <= 0) return IMAGE_COUNT - 1;
    return current - 1;
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
      setPos(current => (current >= IMAGE_COUNT ? 0 : current + 1));
    }, DWELL);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, pos]);

  // Seamless loop-back: once the glide reaches the duplicated end, snap to
  // position 0 with no transition (identical visuals) and keep scrolling.
  useEffect(() => {
    if (pos !== IMAGE_COUNT) return;
    const snap = requestAnimationFrame(() => {
      setInstant(true);
      setPos(0);
      requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(snap);
  }, [pos]);

  useEffect(() => {
    [(pos + 1) % IMAGE_COUNT, (pos + perPage) % IMAGE_COUNT].forEach(index => {
      const img = new Image();
      img.src = slideSrc(index);
    });
  }, [pos, perPage]);

  // Responsive items-per-slide + viewport fit: pick how many photos the row
  // shows, then size the stage width so the row never grows past the screen.
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const compute = () => {
      const viewportW = window.innerWidth;
      const nextPerPage = perPageFor(viewportW);
      setPerPage(prev => (prev === nextPerPage ? prev : nextPerPage));

      const [numerator, denominator] = FRAME.split('/').map(Number);
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
  }, [pos, perPage]);

  const shellStyle = {
    '--frame': FRAME,
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
                  setInstant(true);
                  setPos(event.key === 'Home' ? 0 : IMAGE_COUNT - 1);
                } else if (event.key === 'Escape') {
                  setPaused(false);
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
                style={{
                  transform: `translate3d(-${(100 * pos) / perPage}%, 0, 0)`,
                  transition: instant ? 'none' : undefined,
                }}
              >
                {Array.from({ length: slots }, (_, index) => {
                  const imageIndex = index % IMAGE_COUNT;
                  const position = t('eventGallery.position', { current: imageIndex + 1, total: IMAGE_COUNT });
                  const cardImage = t(`eventGallery.captions.${imageIndex}`);
                  return (
                    <figure
                      key={index}
                      className={`event-gallery__card${index === pos ? ' is-active' : ''}`}
                      role="group"
                      aria-roledescription={t('eventGallery.slide')}
                      aria-label={position}
                    >
                      <img
                        src={slideSrc(imageIndex)}
                        alt={cardImage}
                        loading={imageIndex === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                      />
                      <figcaption className="sr-only">{cardImage}</figcaption>
                      {index === pos && (
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
              {Array.from({ length: IMAGE_COUNT }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={t('eventGallery.position', { current: index + 1, total: IMAGE_COUNT })}
                  aria-current={index === active ? 'true' : undefined}
                  className={`event-gallery__segment${index === active ? ' is-active' : ''}${index < active ? ' is-done' : ''}`}
                  onClick={() => setPos(index)}
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