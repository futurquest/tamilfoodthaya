import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    ArrowDown,
    ArrowUp,
    Eye,
    Globe2,
    Lock,
    Package,
    Save,
    Send,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { api, getCateringPackages, getHomepageDraft, publishHomepage, updateHomepageDraft } from '../../hooks/useApi';
import { Spinner } from '../../components/ui/Spinner';
import { FeaturedCatalogPicker, type FeaturedCatalogItem } from '../../components/homepage/FeaturedCatalogPicker';
import { HomepageDraftPreview } from '../../components/homepage/HomepageDraftPreview';
import {
    HOMEPAGE_MAX_FEATURED,
    SECTION_KEYS,
    normalizeCatalog,
    pickText,
    toDraft,
    type Device,
    type Draft,
    type Lang,
    type Section,
    type SectionKey,
} from '../../components/homepage/homepage.types';

const LANGS: Lang[] = ['en', 'nl', 'ta'];

export const ManageHomepage = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.language?.split('-')[0] || 'nl') as Lang;

    const [draft, setDraft] = useState<Draft | null>(null);
    const [activeLang, setActiveLang] = useState<Lang>(currentLang);
    const [previewLang, setPreviewLang] = useState<Lang>(currentLang);
    const [device, setDevice] = useState<Device>('desktop');

    const draftQuery = useQuery({
        queryKey: ['homepage-draft'],
        queryFn: getHomepageDraft,
    });

    const packagesQuery = useQuery({
        queryKey: ['homepage-catalog-packages'],
        queryFn: () => getCateringPackages().then(normalizeCatalog),
    });

    const menuItemsQuery = useQuery({
        queryKey: ['homepage-catalog-menu'],
        queryFn: () => api.get('/menu/items').then((res) => normalizeCatalog(res.data)),
    });

    useEffect(() => {
        if (draftQuery.data && !draft) {
            setDraft(toDraft(draftQuery.data.draft));
        }
    }, [draftQuery.data, draft]);

    const saveMutation = useMutation({
        mutationFn: (payload: any) => updateHomepageDraft(payload),
        onSuccess: () => toast.success(t('admin.homepage.draftSaved', 'Draft saved')),
        onError: () => toast.error(t('admin.homepage.draftSaveFailed', 'Could not save draft')),
    });

    const publishMutation = useMutation({
        mutationFn: async (payload: any) => {
            await updateHomepageDraft(payload);
            return publishHomepage();
        },
        onSuccess: () => toast.success(t('admin.homepage.published', 'Homepage published')),
        onError: () => toast.error(t('admin.homepage.publishFailed', 'Could not publish homepage')),
    });

    const buildPayload = useMemo(() => {
        if (!draft) return null;
        const sectionText = (text: Section['title']) => ({ en: text.en, nl: text.nl, ta: text.ta });
        return {
            sections: draft.sections.map((section) => ({
                key: section.key,
                visible: section.visible,
                order: section.order,
                title: sectionText(section.title),
                subtitle: sectionText(section.subtitle),
            })),
            featuredPackageIds: draft.featuredPackageIds.slice(0, HOMEPAGE_MAX_FEATURED),
            featuredMenuItemIds: draft.featuredMenuItemIds.slice(0, HOMEPAGE_MAX_FEATURED),
        };
    }, [draft]);

    if (draftQuery.isLoading) {
        return (
            <div className="admin-loading-state">
                <Spinner size="lg" />
                <p>{t('admin.homepage.loading', 'Loading homepage draft...')}</p>
            </div>
        );
    }

    if (draftQuery.isError || !draft) {
        return (
            <div className="admin-page">
                <div className="admin-page-container min-w-0 max-w-[1180px]">
                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
                        <X size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p>{t('admin.homepage.loadFailed', 'Homepage draft could not be loaded.')}</p>
                            <button
                                type="button"
                                onClick={() => draftQuery.refetch()}
                                className="mt-2 font-extrabold underline decoration-red-300 underline-offset-4"
                            >
                                {t('admin.homepage.tryAgain', 'Try again')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const updateSection = (key: SectionKey, patch: Partial<Section>) => {
        setDraft((current) =>
            current
                ? { ...current, sections: current.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)) }
                : current
        );
    };

    const updateText = (key: SectionKey, field: 'title' | 'subtitle', lang: Lang, value: string) => {
        updateSection(key, { [field]: { ...getSection(key)[field], [lang]: value } } as Partial<Section>);
    };

    const moveSection = (key: SectionKey, dir: -1 | 1) => {
        setDraft((current) => {
            if (!current) return current;
            const sections = [...current.sections];
            const from = sections.find((section) => section.key === key);
            const to = sections.find((section) => section.order === (from?.order ?? 0) + dir);
            if (!from || !to) return current;
            const fromOrder = from.order;
            from.order = to.order;
            to.order = fromOrder;
            sections.sort((a, b) => a.order - b.order);
            return { ...current, sections };
        });
    };

    const toggleFeatured = (list: 'featuredPackageIds' | 'featuredMenuItemIds', id: string) => {
        setDraft((current) => {
            if (!current) return current;
            const ids = current[list];
            const has = ids.includes(id);
            if (has) return { ...current, [list]: ids.filter((item) => item !== id) };
            if (ids.length >= HOMEPAGE_MAX_FEATURED) {
                toast.error(t('admin.homepage.maxReached', 'Maximum 3 selections'));
                return current;
            }
            return { ...current, [list]: [...ids, id] };
        });
    };

    const getSection = (key: SectionKey) => draft.sections.find((section) => section.key === key)!;
    const orderedSections = [...draft.sections].sort((a, b) => a.order - b.order);

    const packageCatalog: FeaturedCatalogItem[] = (packagesQuery.data || []).map((pkg: any) => ({
        _id: pkg._id,
        label: pickText(pkg.nameTranslations || pkg.name, activeLang) || pkg.name || pkg._id,
    }));
    const menuCatalog: FeaturedCatalogItem[] = (menuItemsQuery.data || []).map((item: any) => ({
        _id: item._id,
        label: pickText(item.nameTranslations || item.name, activeLang) || item.name || item._id,
    }));
    const packageById = new Map((packagesQuery.data || []).map((pkg: any) => [pkg._id, pkg]));
    const menuItemById = new Map((menuItemsQuery.data || []).map((item: any) => [item._id, item]));

    const isSaving = saveMutation.isPending || publishMutation.isPending;

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.homepage.eyebrow', 'Homepage')}
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                {t('admin.homepage.title', 'Manage Homepage')}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t('admin.homepage.subtitle', 'Control the public homepage: section visibility and order, featured packages and menu items, and trilingual titles.')}
                            </p>
                        </div>

                        <div className="grid min-w-0 grid-cols-2 gap-3 self-end">
                            <button
                                type="button"
                                disabled={isSaving || !buildPayload}
                                onClick={() => buildPayload && saveMutation.mutate(buildPayload)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-(--brand-text) px-4 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={16} />
                                {isSaving ? t('admin.homepage.savingDraft', 'Saving...') : t('admin.homepage.saveDraft', 'Save draft')}
                            </button>
                            <button
                                type="button"
                                disabled={isSaving || !buildPayload}
                                onClick={() => buildPayload && publishMutation.mutate(buildPayload)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Send size={16} />
                                {isSaving ? t('admin.homepage.publishing', 'Publishing...') : t('admin.homepage.publish', 'Publish')}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
                    <div className="min-w-0 space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--brand-surface-dim) text-amber-800">
                                    <Globe2 size={18} />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-extrabold text-slate-950">
                                        {t('admin.homepage.sectionsTitle', 'Homepage sections')}
                                    </h2>
                                    <p className="mt-1 max-w-[70ch] text-sm font-medium leading-6 text-slate-500">
                                        {t('admin.homepage.sectionsSubtitle', 'The hero is always first and cannot be hidden or reordered. Catering and menu sections can be hidden and swapped.')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid min-w-0 gap-4">
                                {orderedSections.map((section) => {
                                    const isHero = section.key === 'hero';
                                    const isFirst = section.order === 0;
                                    const isLast = section.order === SECTION_KEYS.length - 1;
                                    return (
                                        <SectionCard
                                            key={section.key}
                                            section={section}
                                            isHero={isHero}
                                            isFirst={isFirst}
                                            isLast={isLast}
                                            activeLang={activeLang}
                                            onLangChange={setActiveLang}
                                            onToggle={() => updateSection(section.key, { visible: !section.visible })}
                                            onMove={(dir) => moveSection(section.key, dir)}
                                            onText={updateText}
                                            lockedLabel={t('admin.homepage.locked', 'Locked')}
                                            visibleLabel={t('admin.homepage.visible', 'Visible')}
                                            hiddenLabel={t('admin.homepage.hidden', 'Hidden')}
                                            moveUpLabel={t('admin.homepage.moveUp', 'Move up')}
                                            moveDownLabel={t('admin.homepage.moveDown', 'Move down')}
                                            titleLabel={t('admin.homepage.titleLabel', 'Title')}
                                            subtitleLabel={t('admin.homepage.subtitleLabel', 'Subtitle')}
                                            sectionLabel={t(`admin.homepage.section.${section.key}`, section.key)}
                                            sectionDesc={t(`admin.homepage.sectionDesc.${section.key}`, '')}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        <FeaturedCatalogPicker
                            title={t('admin.homepage.featuredPackagesTitle', 'Featured catering packages')}
                            helper={t('admin.homepage.featuredPackagesHelper', 'Up to 3 packages shown on the homepage catering section. Only active and available packages ever appear publicly.')}
                            icon="package"
                            items={packageCatalog}
                            selectedIds={draft.featuredPackageIds}
                            emptyLabel={t('admin.homepage.noPackages', 'No catering packages yet.')}
                            onToggle={(id) => toggleFeatured('featuredPackageIds', id)}
                            loading={packagesQuery.isLoading}
                        />

                        <FeaturedCatalogPicker
                            title={t('admin.homepage.featuredMenuTitle', 'Featured menu items')}
                            helper={t('admin.homepage.featuredMenuHelper', 'Up to 3 dishes highlighted in the homepage menu preview. Only active and available items ever appear publicly.')}
                            icon="menu"
                            items={menuCatalog}
                            selectedIds={draft.featuredMenuItemIds}
                            emptyLabel={t('admin.homepage.noMenuItems', 'No menu items yet.')}
                            onToggle={(id) => toggleFeatured('featuredMenuItemIds', id)}
                            loading={menuItemsQuery.isLoading}
                        />
                    </div>
                </div>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <HomepageDraftPreview
                        draft={draft}
                        lang={previewLang}
                        device={device}
                        packageById={packageById}
                        menuItemById={menuItemById}
                        onLangChange={setPreviewLang}
                        onDeviceChange={setDevice}
                    />
                </section>
            </div>
        </div>
    );
};

const SECTION_ICONS: Record<SectionKey, ReactNode> = {
    hero: <Eye size={16} />,
    catering: <Package size={16} />,
    menu: <UtensilsCrossed size={16} />,
};

const SectionCard = ({
    section,
    isHero,
    isFirst,
    isLast,
    activeLang,
    onLangChange,
    onToggle,
    onMove,
    onText,
    lockedLabel,
    visibleLabel,
    hiddenLabel,
    moveUpLabel,
    moveDownLabel,
    titleLabel,
    subtitleLabel,
    sectionLabel,
    sectionDesc,
}: {
    section: Section;
    isHero: boolean;
    isFirst: boolean;
    isLast: boolean;
    activeLang: Lang;
    onLangChange: (lang: Lang) => void;
    onToggle: () => void;
    onMove: (dir: -1 | 1) => void;
    onText: (key: SectionKey, field: 'title' | 'subtitle', lang: Lang, value: string) => void;
    lockedLabel: string;
    visibleLabel: string;
    hiddenLabel: string;
    moveUpLabel: string;
    moveDownLabel: string;
    titleLabel: string;
    subtitleLabel: string;
    sectionLabel: string;
    sectionDesc: string;
}) => {
    return (
        <div className={`rounded-2xl border p-4 transition ${section.visible ? 'border-slate-200 bg-white' : 'border-slate-200 bg-stone-50'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--brand-surface-dim) text-amber-800">
                        {SECTION_ICONS[section.key]}
                    </span>
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                            {sectionLabel}
                            {isHero && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                                    <Lock size={10} />
                                    {lockedLabel}
                                </span>
                            )}
                            {!section.visible && (
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                    {hiddenLabel}
                                </span>
                            )}
                        </p>
                        {sectionDesc && <p className="mt-0.5 text-xs font-semibold text-slate-500">{sectionDesc}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isHero && (
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" className="sr-only" checked={section.visible} onChange={onToggle} />
                            <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${section.visible ? 'bg-(--brand-text)' : 'bg-slate-300'}`}>
                                <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${section.visible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </span>
                            <span className="sr-only">{section.visible ? visibleLabel : hiddenLabel}</span>
                        </label>
                    )}
                    {!isHero && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                aria-label={moveUpLabel}
                                disabled={isFirst}
                                onClick={() => onMove(-1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                aria-label={moveDownLabel}
                                disabled={isLast}
                                onClick={() => onMove(1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ArrowDown size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-3 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {LANGS.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => onLangChange(lang)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition ${
                                activeLang === lang ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-(--brand-surface-dim) p-3">
                        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{titleLabel}</label>
                        <input
                            value={section.title[activeLang]}
                            onChange={(event) => onText(section.key, 'title', activeLang, event.target.value)}
                            className="h-10 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        />
                    </div>
                    <div className="rounded-xl bg-(--brand-surface-dim) p-3">
                        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{subtitleLabel}</label>
                        <input
                            value={section.subtitle[activeLang]}
                            onChange={(event) => onText(section.key, 'subtitle', activeLang, event.target.value)}
                            className="h-10 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};