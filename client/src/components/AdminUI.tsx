/**
 * AdminUI.tsx
 * -----------
 * Shared UI primitives used across all admin pages.
 * Import from here instead of defining local copies in each page file.
 *
 * Components:
 *   - AdminHero         — page-level header (kicker + title + subtitle + right slot)
 *   - MetricCard        — small stat card (icon + label + value)
 *   - InfoCard          — detail card (icon + label + value, used in order detail panels)
 *   - SectionTitle      — two-line form/panel section heading
 *   - WorkspaceHeader   — frosted-glass header row inside workspace sections
 *   - FilterSelect      — labelled <select> filter
 *   - TabStrip          — pill-style tab switcher (generic)
 *   - AdminActionButton — primary CTA button (crimson gradient, white text)
 */

import { createElement, isValidElement, type ElementType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   AdminHero
   Full-width hero section at the top of every admin page.
───────────────────────────────────────────────────────────────────────────── */
export interface AdminHeroProps {
    kicker?: string;
    title: ReactNode;
    subtitle?: string;
    right?: ReactNode;
    className?: string;
}

export const AdminHero = ({ kicker, title, subtitle, right, className = '' }: AdminHeroProps) => (
    <section className={`admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6 ${className}`}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div>
                {kicker && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {kicker}
                    </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MetricCard
   Small stat tile: icon, label, numeric/text value.
───────────────────────────────────────────────────────────────────────────── */
export interface MetricCardProps {
    label: string;
    value: string | number;
    icon: ReactNode | ElementType;
    detail?: string;
    tone?: 'brass' | 'leaf' | 'spice' | 'ink';
    to?: string;
}

export const MetricCard = ({ label, value, icon, detail, tone = 'ink', to }: MetricCardProps) => {
    const iconNode = isValidElement(icon) ? icon : createElement(icon as ElementType, { size: 16 });
    const content = (
    <div className={`admin-metric-card admin-metric-card--${tone} min-w-0 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 shadow-sm`}>
        <div className="flex items-center gap-2 text-slate-400">
            {iconNode}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-2 truncate text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
        {detail && <p className="mt-1 truncate text-xs font-medium text-slate-500">{detail}</p>}
    </div>
    );

    return to ? <Link to={to} className="block min-w-0 no-underline">{content}</Link> : content;
};

/* ─────────────────────────────────────────────────────────────────────────────
   InfoCard
   Detail tile used inside order/lead detail panels.
───────────────────────────────────────────────────────────────────────────── */
export interface InfoCardProps {
    icon: ReactNode;
    label: string;
    value: string;
}

export const InfoCard = ({ icon, label, value }: InfoCardProps) => (
    <div className="rounded-[22px] border border-slate-200 bg-stone-50 p-4">
        <div className="flex items-center gap-2 text-slate-400">
            {icon}
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-2 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SectionTitle
   Two-line heading used at the top of form sections / panel sections.
───────────────────────────────────────────────────────────────────────────── */
export interface SectionTitleProps {
    title: string;
    subtitle?: string;
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => (
    <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        {subtitle && (
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   WorkspaceHeader
   Frosted-glass header bar inside workspace/board sections.
───────────────────────────────────────────────────────────────────────────── */
export interface WorkspaceHeaderProps {
    title: string;
    text: string;
    badge: string;
}

export const WorkspaceHeader = ({ title, text, badge }: WorkspaceHeaderProps) => (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">{title}</p>
            <p className="mt-1 text-sm font-bold leading-5 text-slate-700">{text}</p>
        </div>
        <span className="hidden shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-800 sm:inline-flex">
            {badge}
        </span>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FilterSelect
   Labelled <select> dropdown used in filter toolbars.
───────────────────────────────────────────────────────────────────────────── */
export interface FilterSelectOption<T extends string = string> {
    value: T;
    label: string;
}

export interface FilterSelectProps<T extends string = string> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options?: FilterSelectOption<T>[];
    counts?: Partial<Record<T, number>>;
    icon?: ReactNode;
    className?: string;
}

export function FilterSelect<T extends string>({ label, value, onChange, options, counts, icon, className = '' }: FilterSelectProps<T>) {
    const resolvedOptions = options ?? Object.keys(counts ?? {}).map((optionValue) => ({
        value: optionValue as T,
        label: `${optionValue.charAt(0)}${optionValue.slice(1).toLowerCase()}${counts?.[optionValue as T] === undefined ? '' : ` (${counts[optionValue as T]})`}`
    }));

    return (
    <label className={`grid gap-1.5 xl:w-[210px] ${className}`}>
        <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            {icon ?? <Filter size={13} />}
            {label}
        </span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        >
            {resolvedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </label>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TabStrip
   Generic pill-tab switcher. Pass an array of { value, label, count? } tabs.
───────────────────────────────────────────────────────────────────────────── */
export interface TabStripTab<T extends string = string> {
    value: T;
    label: string;
    count?: number;
}

export interface TabStripProps<T extends string = string> {
    tabs: TabStripTab<T>[];
    value: T;
    onChange: (value: T) => void;
    label?: string;
    labelIcon?: ReactNode;
}

export function TabStrip<T extends string>({ tabs, value, onChange, label, labelIcon }: TabStripProps<T>) {
    return (
        <div className="grid gap-1.5">
            {label && (
                <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {labelIcon}
                    {label}
                </span>
            )}
            <div className="flex max-w-full flex-wrap rounded-2xl border border-slate-200 bg-stone-50 p-1 admin-tab-strip">
                {tabs.map((tab) => {
                    const active = value === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`rounded-lg px-1.5 py-0.5 text-[10px] ${active ? 'bg-amber-50 text-amber-800' : 'bg-white text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AdminActionButton
   Primary CTA button — dark slate with white text.
   Replaces the inline `bg-slate-900` button pattern across pages.
───────────────────────────────────────────────────────────────────────────── */
export interface AdminActionButtonProps {
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
    children: ReactNode;
}

export const AdminActionButton = ({ onClick, type = 'button', disabled, className = '', children }: AdminActionButtonProps) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);
