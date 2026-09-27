import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackProvider } from './FeedbackModal';
import { useFeedback } from '../context/FeedbackContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

function Controls() {
  const { show } = useFeedback();
  return <>
    <button onClick={() => show({ type: 'success', message: 'Your message was sent.' })}>Succeed</button>
    <button onClick={() => show({ type: 'error', message: 'Try again.' })}>Fail</button>
  </>;
}

describe('FeedbackModal', () => {
  it('shows success, traps focus, and returns focus on dismissal', () => {
    render(<FeedbackProvider><Controls /></FeedbackProvider>);
    const trigger = screen.getByRole('button', { name: 'Succeed' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveClass('feedback-modal--success');
    expect(dialog).toHaveTextContent('All set');
    expect(dialog).toHaveTextContent('Your message was sent.');
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('btn-primary');
    const close = screen.getByRole('button', { name: 'Close notification' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('shows an error and closes with Escape', () => {
    render(<FeedbackProvider><Controls /></FeedbackProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alertdialog')).toHaveClass('feedback-modal--error');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Try again.');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Something went wrong');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
