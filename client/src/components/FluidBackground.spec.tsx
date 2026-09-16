import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import FluidBackground from './FluidBackground';

describe('FluidBackground', () => {
  it('renders the full fluid layer structure', () => {
    const { container } = render(<FluidBackground />);
    const root = container.querySelector('.fx-fluid');
    expect(root).toBeInTheDocument();
    expect(root?.querySelector('.fx-fluid__ambient')).not.toBeNull();
    expect(root?.querySelector('.fx-fluid__texture')).not.toBeNull();
    expect(root?.querySelector('.fx-fluid__light')).not.toBeNull();
    expect(root?.querySelector('.fx-fluid__kolam')).not.toBeNull();
  });

  it('omits the kolam layer when showKolam is false', () => {
    const { container } = render(<FluidBackground showKolam={false} />);
    expect(container.querySelector('.fx-fluid__kolam')).toBeNull();
  });

  it('renders nothing when disabled', () => {
    const { container } = render(<FluidBackground disabled />);
    expect(container.querySelector('.fx-fluid')).toBeNull();
  });

  it('unmounts cleanly (StrictMode-safe register/unregister)', () => {
    const { unmount } = render(<FluidBackground />);
    unmount();
  });
});