import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { registerFluidLayer, type FluidLayerConfig } from '../motion/fluidEngine';

type FluidBackgroundProps = {
  /** Absolute (in-section) or fixed (viewport) positioning. */
  variant?: 'section' | 'fixed';
  /** 0..1 global strength multiplier. */
  intensity?: number;
  /** 0..1 smoothing responsiveness (higher = snappier). */
  fluidity?: number;
  /** Peak primary displacement in px. */
  parallaxStrength?: number;
  /** Peak texture / decor displacement in px. */
  deepParallax?: number;
  /** Cursor light influence radius in px. */
  cursorInfluence?: number;
  /** Procedural grain opacity (typically 0.02 - 0.04). */
  textureOpacity?: number;
  /** Render the abstract Kolam-inspired arc layer. */
  showKolam?: boolean;
  /** Fully disable the effect (static themed surface only). */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

const GRAIN_DEFAULT = 0.035;
const KOLAM_DEFAULT = 0.042;

export default function FluidBackground({
  variant = 'section',
  intensity = 0.55,
  fluidity = 0.5,
  parallaxStrength = 8,
  deepParallax = 14,
  cursorInfluence = 560,
  textureOpacity = GRAIN_DEFAULT,
  showKolam = true,
  disabled = false,
  className = '',
  children,
}: FluidBackgroundProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef<Required<FluidLayerConfig>>({
    intensity,
    fluidity,
    parallaxStrength,
    deepParallax,
    cursorInfluence,
  });

  useEffect(() => {
    if (disabled) return;
    const root = rootRef.current;
    if (!root) return;
    return registerFluidLayer(root, configRef.current);
  }, [disabled]);

  if (disabled) return null;

  const style = {
    '--fb-grain-alpha': String(textureOpacity),
    '--fb-kolam-alpha': showKolam ? String(KOLAM_DEFAULT) : String(0),
    '--fb-light-radius': `${cursorInfluence}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-fb-visible="1"
      aria-hidden="true"
      className={variant === 'fixed' ? `fx-fluid fx-fluid--fixed ${className}`.trim() : `fx-fluid ${className}`.trim()}
      style={style}
    >
      <div className="fx-fluid__ambient">
        <span className="fx-fluid__blob fx-fluid__blob--a" />
        <span className="fx-fluid__blob fx-fluid__blob--b" />
        <span className="fx-fluid__blob fx-fluid__blob--c" />
      </div>
      <div className="fx-fluid__texture" />
      <div className="fx-fluid__light" />
      {showKolam && <div className="fx-fluid__kolam" />}
      {children}
    </div>
  );
}