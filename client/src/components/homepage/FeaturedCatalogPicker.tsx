import { Check, PackagePlus, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOMEPAGE_MAX_FEATURED } from './homepage.types';

export interface FeaturedCatalogItem {
    _id: string;
    label: string;
}

export const FeaturedCatalogPicker = ({
    title,
    helper,
    icon,
    items,
    selectedIds,
    emptyLabel,
    onToggle,
    loading,
}: {
    title: string;
    helper: string;
    icon: 'package' | 'menu';
    items: FeaturedCatalogItem[];
    selectedIds: string[];
    emptyLabel: string;
    onToggle: (id: string) => void;
    loading?: boolean;
}) => {
    const { t } = useTranslation();
    const atMax = selectedIds.length >= HOMEPAGE_MAX_FEATURED;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--brand-surface-dim) text-amber-800">
                    {icon === 'package' ? <PackagePlus size={18} /> : <UtensilsCrossed size={18} />}
                </span>
                <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
                    <p className="mt-1 max-w-[70ch] text-sm font-medium leading-6 text-slate-500">{helper}</p>
                    <p className="mt-1 text-xs font-extrabold tabular-nums text-amber-700">
                        {selectedIds.length}/{HOMEPAGE_MAX_FEATURED}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="mt-5 text-sm font-semibold text-slate-500">
                    {t('admin.homepage.catalogLoading', 'Loading catalogue...')}
                </p>
            ) : items.length === 0 ? (
                <p className="mt-5 text-sm font-semibold text-slate-500">{emptyLabel}</p>
            ) : (
                <div className="mt-5 flex flex-wrap gap-2">
                    {items.map((item) => {
                        const selected = selectedIds.includes(item._id);
                        const disabled = !selected && atMax;
                        return (
                            <button
                                key={item._id}
                                type="button"
                                disabled={disabled}
                                onClick={() => onToggle(item._id)}
                                aria-pressed={selected}
                                className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${
                                    selected
                                        ? 'border-(--brand-text) bg-(--brand-text) text-white'
                                        : disabled
                                        ? 'cursor-not-allowed border-slate-200 bg-stone-50 text-slate-400'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                                }`}
                            >
                                {selected && <Check size={14} className="shrink-0" />}
                                <span className="min-w-0 truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {atMax && items.length > selectedIds.length && (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                    {t('admin.homepage.maxReached', 'Maximum 3 selections — deselect one to pick another.')}
                </p>
            )}
        </section>
    );
};