/**
 * FluidBackground engine.
 *
 * A single module-level animation loop drives every `.fx-fluid` layer mounted
 * on the page:
 *
 *   pointermove  ->  target coordinates (refs, no React state)
 *   rAF tick     ->  eased cursor toward target (gives inertia)
 *                  ->  drift blend for idle / touch devices
 *                  ->  per-layer CSS custom properties via style.setProperty
 *
 * Rules enforced here:
 *  - ONE requestAnimationFrame loop for the whole site.
 *  - No React state, no layout-triggering writes (transform/opacity only).
 *  - One passive pointer listener, attached once.
 *  - `prefers-reduced-motion` disables the loop entirely (static fallback).
 *  - Coarse pointers (mobile) get slow autonomous ambient drift, no cursor.
 *  - The loop pauses when the tab is hidden and while no layers are mounted.
 *  - Frame rate drops to ~20fps while fully idle so idle CPU stays near zero.
 */

export type FluidLayerConfig = {
  /** 0..1 global strength multiplier. */
  intensity?: number;
  /** 0..1 responsiveness of the layer's smoothing (higher = snappier). */
  fluidity?: number;
  /** Peak primary displacement in px at full cursor deflection. */
  parallaxStrength?: number;
  /** Peak secondary (texture / decor) displacement in px. */
  deepParallax?: number;
  /** Cursor light influence radius in px. */
  cursorInfluence?: number;
};

type Entry = {
  root: HTMLElement;
  cfg: Required<FluidLayerConfig>;
  ex: number;
  ey: number;
  kx: number;
  cache: Record<string, string>;
};

const DEFAULTS: Required<FluidLayerConfig> = {
  intensity: 0.55,
  fluidity: 0.5,
  parallaxStrength: 8,
  deepParallax: 14,
  cursorInfluence: 560,
};

const LAYERS = new Set<Entry>();

let listening = false;
let initialized = false;
let observer: IntersectionObserver | null = null;

let finePointer = false;
let reducedMotion = false;

let tx = 0; // target, centred viewport px
let ty = 0;
let ex = 0; // eased cursor, centred -1..1
let ey = 0;
let raf = 0;
let started = false;
let frameLast = 0;
let lastMoveAt = 0;
let idleFade = 1;
let glowFade = 0;

function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`;
}

function num(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Frame-rate independent first-order easing factor for a ~60fps target. */
function lerpFactor(k: number): number {
  return Math.min(1, 1 - Math.exp(-k));
}

export function registerFluidLayer(
  root: HTMLElement,
  config: FluidLayerConfig = {},
): () => void {
  setup();

  const cfg = { ...DEFAULTS, ...config } as Required<FluidLayerConfig>;
  const entry: Entry = {
    root,
    cfg,
    ex: 0,
    ey: 0,
    kx: 0.06 + cfg.fluidity * 0.18,
    cache: {},
  };
  LAYERS.add(entry);

  root.setAttribute('data-fb-layer', '1');

  ensureObserver();
  observer?.observe(root);

  if (!reducedMotion) {
    ensurePointer();
    start();
  }

  return () => {
    LAYERS.delete(entry);
    observer?.unobserve(root);
    if (LAYERS.size === 0) stop();
  };
}

const FLUID_VARS = [
  '--fb-x',
  '--fb-y',
  '--fb-x2',
  '--fb-y2',
  '--fb-x3',
  '--fb-y3',
  '--fb-lx',
  '--fb-ly',
  '--fb-glow',
];

function resetLayerStyles() {
  for (const layer of LAYERS) {
    for (const key of FLUID_VARS) {
      layer.root.style.removeProperty(key);
      delete layer.cache[key];
    }
  }
  glowFade = 0;
}

function ensurePointer() {
  if (listening) return;
  listening = true;
  lastMoveAt = 0;

  const onMove = (event: PointerEvent) => {
    tx = event.clientX;
    ty = event.clientY;
    lastMoveAt = performance.now();
  };
  const onLeave = () => {
    tx = window.innerWidth / 2;
    ty = window.innerHeight / 2;
    lastMoveAt = performance.now();
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave, { passive: true });
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        (entry.target as HTMLElement).setAttribute(
          'data-fb-visible',
          entry.isIntersecting ? '1' : '0',
        );
      }
    },
    { threshold: 0.02 },
  );
}

function start() {
  if (started || reducedMotion || LAYERS.size === 0) return;
  if (typeof requestAnimationFrame === 'undefined') return;
  started = true;
  frameLast = 0;
  raf = requestAnimationFrame(tick);
}

function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  started = false;
}

function onVisibility() {
  if (document.hidden) stop();
  else if (LAYERS.size > 0) start();
}

function tick(now: number) {
  if (typeof document !== 'undefined' && document.hidden) {
    stop();
    return;
  }

  const idle = !finePointer || now - lastMoveAt > 1400;

  // While fully idle (ambient drift only), drop to ~20fps to keep idle CPU low.
  if (idle && idleFade > 0.92 && now - frameLast < 50) {
    raf = requestAnimationFrame(tick);
    return;
  }
  frameLast = now;

  // Blend the cursor influence toward ambient drift (or permanently on touch).
  idleFade += ((idle ? 1 : 0) - idleFade) * 0.035;

  const inW = Math.max(1, window.innerWidth);
  const inH = Math.max(1, window.innerHeight);
  const tnx = (tx / inW) * 2 - 1;
  const tny = (ty / inH) * 2 - 1;

  ex += (tnx - ex) * lerpFactor(0.09);
  ey += (tny - ey) * lerpFactor(0.09);

  const t = now * 0.00042;
  const drx = Math.sin(t) * 0.62;
  const dry = Math.cos(t * 0.83) * 0.62;

  const targetX = ex * (1 - idleFade) + drx * idleFade;
  const targetY = ey * (1 - idleFade) + dry * idleFade;

  for (const layer of LAYERS) {
    if (layer.root.getAttribute('data-fb-visible') === '0') continue;

    layer.ex += (targetX - layer.ex) * lerpFactor(layer.kx);
    layer.ey += (targetY - layer.ey) * lerpFactor(layer.kx);

    const s = layer.cfg.intensity * (finePointer ? 1 : 0.5);
    const p1 = layer.cfg.parallaxStrength * s;
    const p2 = layer.cfg.deepParallax * s;
    const p3 = p2 * 1.5;

    const cache = layer.cache;
    const write = (key: string, value: string) => {
      if (cache[key] !== value) {
        cache[key] = value;
        layer.root.style.setProperty(key, value);
      }
    };

    write('--fb-x', px(-layer.ex * p1));
    write('--fb-y', px(-layer.ey * p1));
    write('--fb-x2', px(-layer.ex * p2));
    write('--fb-y2', px(-layer.ey * p2));
    write('--fb-x3', px(-layer.ex * p3));
    write('--fb-y3', px(-layer.ey * p3));
    write('--fb-lx', px(ex * layer.cfg.cursorInfluence * 0.5));
    write('--fb-ly', px(ey * layer.cfg.cursorInfluence * 0.5));

    glowFade += ((finePointer && !idle ? 1 : 0) - glowFade) * 0.06;
    write('--fb-glow', num(glowFade));
  }

  raf = requestAnimationFrame(tick);
}

function resolveCapabilities() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    finePointer = true;
    reducedMotion = true;
    return;
  }
  const fine = window.matchMedia('(pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  finePointer = fine.matches;
  reducedMotion = reduced.matches;

  const onChange = () => {
    finePointer = fine.matches;
    reducedMotion = reduced.matches;
    if (reducedMotion) {
      stop();
      resetLayerStyles();
    } else if (LAYERS.size > 0) {
      start();
    }
  };
  if (typeof fine.addEventListener === 'function') fine.addEventListener?.('change', onChange);
  if (typeof reduced.addEventListener === 'function') reduced.addEventListener?.('change', onChange);
}

function setup() {
  if (initialized) return;
  initialized = true;

  if (typeof window === 'undefined') return;

  tx = window.innerWidth / 2;
  ty = window.innerHeight / 2;

  resolveCapabilities();

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', () => {
    tx = window.innerWidth / 2;
    ty = window.innerHeight / 2;
  });
}