import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeedbackContext, type FeedbackNotice } from '../context/FeedbackContext';

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<FeedbackNotice | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { t } = useTranslation();
  const show = useCallback((next: FeedbackNotice) => setNotice(next), []);
  const dismiss = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    const appRoot = document.getElementById('root');
    appRoot?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('.feedback-modal__close')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute('inert');
      if (previouslyFocused.current?.isConnected) previouslyFocused.current.focus();
      else document.querySelector<HTMLElement>('#main-content, main, h1')?.focus();
    };
  }, [notice, dismiss]);

  return <FeedbackContext.Provider value={{ show, dismiss }}>
    {children}
    {notice && createPortal(
      <div className="feedback-modal__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
        <div className={`feedback-modal feedback-modal--${notice.type}`} ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
          <button type="button" className="feedback-modal__close" onClick={dismiss} aria-label={t('feedback.close', 'Close notification')}><X size={20} /></button>
          <span className="feedback-modal__icon" aria-hidden="true">{notice.type === 'success' ? <Check size={28} /> : <AlertCircle size={28} />}</span>
          <h2 id={titleId}>{notice.title || (notice.type === 'success'
            ? t('feedback.successTitle', 'All set')
            : t('feedback.errorTitle', 'Something went wrong'))}</h2>
          <p id={descriptionId}>{notice.message}</p>
          <button type="button" className="btn-primary feedback-modal__action" onClick={dismiss}>{t('feedback.continue', 'Continue')}</button>
        </div>
      </div>, document.body)}
  </FeedbackContext.Provider>;
}
