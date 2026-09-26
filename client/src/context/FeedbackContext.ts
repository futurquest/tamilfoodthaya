import { createContext, useContext } from 'react';

export type FeedbackNotice = { type: 'success' | 'error'; message: string; title?: string };
export type Feedback = { show: (notice: FeedbackNotice) => void; dismiss: () => void };
export const FeedbackContext = createContext<Feedback | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used inside FeedbackProvider');
  return context;
}
