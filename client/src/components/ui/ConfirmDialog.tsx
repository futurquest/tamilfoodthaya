import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    busy = false,
    onCancel,
    onConfirm
}: ConfirmDialogProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;

        const previous = document.activeElement as HTMLElement | null;
        cancelRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onCancel();
                return;
            }

            if (event.key !== 'Tab') return;
            const container = containerRef.current;
            if (!container) return;

            const focusable = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first || !last) return;

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previous?.focus();
        };
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex overflow-y-auto bg-black/35 p-4 backdrop-blur-[2px]">
            <div
                ref={containerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="m-auto w-full max-w-md overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex items-start gap-4 px-6 py-6">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="min-w-0">
                        <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-slate-900">
                            {title}
                        </h2>
                        <p id="confirm-dialog-message" className="mt-1.5 text-sm font-semibold leading-6 text-slate-500">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        ref={cancelRef}
                        onClick={onCancel}
                        disabled={busy}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-600 px-5 text-sm font-extrabold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50"
                    >
                        <Trash2 size={15} />
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};