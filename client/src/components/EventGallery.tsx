import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FluidBackground from './FluidBackground';

const FRAME = '1672/941';
const IMAGE_COUNT = 14;
const DWELL = 1800;
// After the loop-back reset, resume the next glide almost immediately so the
// parked (identical-looking) frame never holds still for a full dwell.
const SEAM_RESUME = 60;
// Native size of every photo in /events (1672x941) - cards use this exact
// ratio so object-fit cover never crops or distorts the composition.

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [gap, setGap] = useState(20);
  const [cardW, setCardW] = useState(0);
  const [step, setStep] = useState(0);
  const posRef = useRef(0);

  const active = pos % IMAGE_COUNT;
  const imageNumber = String(active + 1).padStart(2, '0');
  const caption = t(`eventGallery.captions.${active}`);
  const slots = IMAGE_COUNT + perPage;

  // Stage ratio that keeps every card at the photo's native ratio: height is
  // derived from the stage's aspect-ratio, so the row can never collapse.
  const stageRatio = (() => {
    const [numerator, denominator] = FRAME.split('/').map(Number);
    const ratio = numerator / denominator;
    if (!stageWidth) return ratio;
    const cardW = (stageWidth - gap * (perPage - 1)) / perPage;
    const cardH = cardW / ratio;
    return stageWidth / cardH;
  })();

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

  // Autoplay: one glide per dwell, keyed ONLY on pause state - never on pos -
  // so the timing never re-arms or stretches. Slot IMAGE_COUNT is a seamless
  // twin of slot 0 (identical photo), so when the row parks there the next
  // advance resets to 0 with NO transition: identical visuals carry no wrap
  // trace. That reset normally leaves pos 0 static for a full dwell, so the
  // advance that follows the wrap is scheduled at SEAM_RESUME instead of DWELL
  // - the row never visibly holds still, it just keeps gliding forward.
  // Keyboard/touch moves that cross the seam produce the same reset.
  useEffect(() => {
    if (paused || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      const wrapping = posRef.current >= IMAGE_COUNT;
      timer = window.setTimeout(advance, wrapping ? SEAM_RESUME : DWELL);
      setInstant(wrapping);
      setPos(current => (current >= IMAGE_COUNT ? 0 : current + 1));
    };
    timer = window.setTimeout(advance, DWELL);
    return () => window.clearTimeout(timer);
  }, [paused, reducedMotion]);

  // Keep posRef in lockstep with real pos so the interval above reads the seam
  // state synchronously (setInterval fires before React re-renders the new pos,
  // so we cannot rely on `pos` in the interval closure).
  useEffect(() => {
    posRef.current = pos;
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
    const container = containerRef.current;
    const shell = shellRef.current;
    if (!container || !shell) return;
    const compute = () => {
      const viewportW = window.innerWidth;
      const nextPerPage = perPageFor(viewportW);
      setPerPage(prev => (prev === nextPerPage ? prev : nextPerPage));

      const gapPx = parseFloat(window.getComputedStyle(shell).getPropertyValue('--gutter')) || 20;
      setGap(gapPx);

      const [numerator, denominator] = FRAME.split('/').map(Number);
      const ratio = numerator / denominator;
      const viewportH = window.innerHeight;
      // Each photo renders at 35% of the device height (25% + 10%), with the
      // width following the native 1672:941 ratio. Single-photo rows simply
      // fill the container width.
      const targetCardH = Math.max(200, Math.round(viewportH * 0.35));
      const targetCardW = targetCardH * ratio;
      const availableWidth = container.clientWidth;
      const fitted = nextPerPage === 1
        ? availableWidth
        : Math.min(availableWidth, targetCardW * nextPerPage + gapPx * (nextPerPage - 1));
      setStageWidth(Math.round(fitted));
      const width = (fitted - gapPx * (nextPerPage - 1)) / nextPerPage;
      setCardW(width);
      setStep(width + gapPx);
    };
    compute();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(compute) : null;
    ro?.observe(container);
    window.addEventListener('resize', compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [perPage]);

  const shellStyle = {
    '--frame': String(stageRatio),
    maxWidth: stageWidth > 0 ? `${stageWidth}px` : undefined,
  } as CSSProperties;

  return (
    <section className="section event-gallery" aria-labelledby={`${id}-title`}>
      <FluidBackground intensity={0.4} parallaxStrength={5} deepParallax={9} />
      <div className="container">
        <div className="section-heading section-heading--centered text-balance text-center event-gallery__heading--centered">
          <div className="package-eyebrow-pill">
            <span className="text-primary font-bold">✦</span>
            <span>{t('eventGallery.eyebrow', 'Kitchen & Fire — Events in pictures')}</span>
          </div>
          <h2 className="section-title" id={`${id}-title`}>{t('eventGallery.title')}</h2>
          <p className="lead lead--centered">{t('eventGallery.description')}</p>
          <div className="event-gallery__cta-wrap">
            <Link to="/contact#inquiry" className="btn-primary">
              <span>{t('conversion.quote')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`event-gallery__carousel${paused ? ' is-paused' : ''}`}
          role="region"
          aria-roledescription={t('eventGallery.carousel')}
          aria-label={t('eventGallery.title')}
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
                  transform: `translate3d(${-pos * step}px, 0, 0)`,
                  transition: instant ? 'none' : `transform ${DWELL}ms linear`,
                  gap: `${gap}px`,
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
                      style={{ width: cardW > 0 ? `${cardW}px` : 0 }}
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
                      {/* {index === pos && (
                        <span className="event-gallery__chip" aria-hidden="true">
                          <span className="event-gallery__chip-dot" />
                          {t('eventGallery.badge', 'Gathering')} · {imageNumber} / {IMAGE_COUNT} 
                          
                        </span>
                      )} */}
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