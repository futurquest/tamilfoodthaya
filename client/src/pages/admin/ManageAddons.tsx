import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import {
    Plus,
    Pencil,
    Trash2,
    Music,
    Flower2,
    Wine,
    Baby,
    Camera,
    AlertCircle,
    Clock3,
    Sparkles,
    ChevronDown,
    Filter,
    Grid3X3,
    List,
    RotateCcw,
    Search,
    Shapes,
    X,
    Package,
    Euro,
    Layers3,
    Users,
    Wand2
} from 'lucide-react';

type PricingType = 'fixed' | 'per_person';
type CategoryType =
    | 'decoration'
    | 'entertainment'
    | 'service'
    | 'extra_time'
    | 'other';
type ViewMode = 'grid' | 'list';
type PricingFilter = 'all' | PricingType;

type AddonForm = {
    name: string;
    nameTranslations?: { nl: string; en: string; ta: string };
    description: string;
    descriptionTranslations?: { nl: string; en: string; ta: string };
    price: number;
    pricingType: PricingType;
    category: CategoryType;
};

interface Addon extends AddonForm {
    _id: string;
}

const CATEGORY_ICONS: Record<CategoryType, ReactNode> = {
    entertainment: <Music size={16} />,
    decoration: <Flower2 size={16} />,
    service: <Wine size={16} />,
    extra_time: <Clock3 size={16} />,
    other: <Shapes size={16} />
};

const CATEGORY_STYLES: Record<CategoryType, string> = {
    entertainment: 'border-purple-200 bg-purple-50 text-purple-700',
    decoration: 'border-pink-200 bg-pink-50 text-pink-700',
    service: 'border-blue-200 bg-blue-50 text-blue-700',
    extra_time: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    other: 'border-slate-200 bg-stone-50 text-slate-700'
};

const EMPTY_FORM: AddonForm = {
    name: '',
    nameTranslations: { nl: '', en: '', ta: '' },
    description: '',
    descriptionTranslations: { nl: '', en: '', ta: '' },
    price: 0,
    pricingType: 'fixed',
    category: 'decoration'
};

const PRESETS: Array<Partial<AddonForm> & { icon: ReactNode; labelKey: string }> = [
    {
        name: 'DJ & Music',
        labelKey: 'admin.addons.presetDjAndMusic',
        description:
            'Professional DJ with full sound system and lighting for 4 hours.',
        price: 350,
        pricingType: 'fixed',
        category: 'entertainment',
        icon: <Music size={16} />
    },
    {
        name: 'Flower Decoration',
        labelKey: 'admin.addons.presetFlowerDecoration',
        description: 'Elegant floral arrangements for tables and entrance.',
        price: 200,
        pricingType: 'fixed',
        category: 'decoration',
        icon: <Flower2 size={16} />
    },
    {
        name: 'Welcome Drinks',
        labelKey: 'admin.addons.presetWelcomeDrinks',
        description:
            'Mocktail / juice welcome drinks for all guests on arrival.',
        price: 8,
        pricingType: 'per_person',
        category: 'service',
        icon: <Wine size={16} />
    },
    {
        name: "Kids' Menu",
        labelKey: 'admin.addons.presetKidsMenu',
        description: 'Specially prepared mild dishes for children under 12.',
        price: 12,
        pricingType: 'per_person',
        category: 'service',
        icon: <Baby size={16} />
    },
    {
        name: 'Photographer',
        labelKey: 'admin.addons.presetPhotographer',
        description: 'Professional event photographer for up to 5 hours.',
        price: 450,
        pricingType: 'fixed',
        category: 'other',
        icon: <Camera size={16} />
    }
];

export const ManageAddons = () => {
    const { t } = useTranslation();
    const [addons, setAddons] = useState<Addon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<AddonForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryType>('all');
    const [pricingFilter, setPricingFilter] = useState<PricingFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const stats = useMemo(() => {
        const total = addons.length;
        const fixed = addons.filter((a) => a.pricingType === 'fixed').length;
        const perPerson = addons.filter(
            (a) => a.pricingType === 'per_person'
        ).length;
        const categories = new Set(addons.map((a) => a.category)).size;

        return { total, fixed, perPerson, categories };
    }, [addons]);

    const categoryCounts = useMemo(() => {
        const categories: CategoryType[] = [
            'decoration',
            'entertainment',
            'service',
            'extra_time',
            'other'
        ];

        return categories.reduce<Record<CategoryType, number>>((counts, category) => {
            counts[category] = addons.filter((addon) => addon.category === category).length;
            return counts;
        }, {} as Record<CategoryType, number>);
    }, [addons]);

    const filteredAddons = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return addons.filter((addon) => {
            if (categoryFilter !== 'all' && addon.category !== categoryFilter) return false;
            if (pricingFilter !== 'all' && addon.pricingType !== pricingFilter) return false;
            if (!query) return true;

            return [
                addon.name,
                addon.description,
                ...Object.values(addon.nameTranslations || {}),
                ...Object.values(addon.descriptionTranslations || {}),
                formatCategory(addon.category),
                String(addon.price || 0)
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [addons, categoryFilter, pricingFilter, searchTerm]);

    const hasActiveFilters =
        Boolean(searchTerm.trim()) || categoryFilter !== 'all' || pricingFilter !== 'all';

    const load = async () => {
        try {
            setLoading(true);
            setLoadError(false);
            const response = await api.get('/addons/all');
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
            setAddons(data);
        } catch {
            setAddons([]);
            setLoadError(true);
            toast.error(t('admin.addons.loadFailed', 'Failed to load add-ons'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const buildPresetForm = (preset?: Partial<AddonForm>): AddonForm => {
        const presetName = preset?.name || '';
        const presetDescription = preset?.description || '';

        return {
            ...EMPTY_FORM,
            ...preset,
            name: presetName,
            description: presetDescription,
            nameTranslations: {
                nl: preset?.nameTranslations?.nl || presetName,
                en: preset?.nameTranslations?.en || '',
                ta: preset?.nameTranslations?.ta || ''
            },
            descriptionTranslations: {
                nl: preset?.descriptionTranslations?.nl || presetDescription,
                en: preset?.descriptionTranslations?.en || '',
                ta: preset?.descriptionTranslations?.ta || ''
            }
        };
    };

    const openNew = (preset?: Partial<AddonForm>) => {
        setEditing(null);
        setForm(buildPresetForm(preset));
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (addon: Addon) => {
        setEditing(addon._id);
        setForm({
            name: addon.name || '',
            nameTranslations: {
                nl: addon.nameTranslations?.nl || addon.name || '',
                en: addon.nameTranslations?.en || '',
                ta: addon.nameTranslations?.ta || ''
            },
            description: addon.description || '',
            descriptionTranslations: {
                nl:
                    addon.descriptionTranslations?.nl ||
                    addon.description ||
                    '',
                en: addon.descriptionTranslations?.en || '',
                ta: addon.descriptionTranslations?.ta || ''
            },
            price: Number(addon.price || 0),
            pricingType: addon.pricingType,
            category: addon.category
        });
        setFormError('');
        setShowForm(true);
    };

    const buildPayload = (current: AddonForm): AddonForm => {
        const normalizedName =
            current.nameTranslations?.nl?.trim() || current.name.trim();
        const normalizedDescription =
            current.descriptionTranslations?.nl?.trim() ||
            current.description.trim();

        return {
            ...current,
            name: normalizedName,
            description: normalizedDescription,
            nameTranslations: {
                nl: current.nameTranslations?.nl || '',
                en: current.nameTranslations?.en || '',
                ta: current.nameTranslations?.ta || ''
            },
            descriptionTranslations: {
                nl: current.descriptionTranslations?.nl || '',
                en: current.descriptionTranslations?.en || '',
                ta: current.descriptionTranslations?.ta || ''
            },
            price: Number(current.price || 0)
        };
    };

    const handleSave = async () => {
        try {
            const payload = buildPayload(form);

            if (!payload.name.trim()) {
                setFormError(
                    t(
                        'admin.addons.errorDutchName',
                        'Enter a Dutch name before saving this add-on.'
                    )
                );
                return;
            }

            setSaving(true);
            setFormError('');

            if (editing) {
                await api.put(`/addons/${editing}`, payload);
                toast.success(t('admin.addons.updated', 'Add-on updated'));
            } else {
                await api.post('/addons', payload);
                toast.success(t('admin.addons.created', 'Add-on created'));
            }

            closeForm();
            await load();
        } catch {
            setFormError(
                t(
                    'admin.addons.saveFailed',
                    'The add-on could not be saved. Check the details and try again.'
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.addons.confirmDelete', 'Delete this add-on?'))) return;

        try {
            await api.delete(`/addons/${id}`);
            toast.success(t('admin.addons.deleted', 'Deleted'));
            await load();
        } catch {
            toast.error(t('admin.addons.deleteFailed', 'Failed to delete'));
        }
    };

const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setPricingFilter('all');
    };

    const categoryName = (category: CategoryType) => {
        switch (category) {
            case 'extra_time':
                return t('admin.addons.categoryExtraTime', 'Extra Time');
            case 'decoration':
                return t('admin.addons.categoryDecoration', 'Decoration');
            case 'entertainment':
                return t('admin.addons.categoryEntertainment', 'Entertainment');
            case 'service':
                return t('admin.addons.categoryService', 'Service');
            default:
                return t('admin.addons.categoryOther', 'Other');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="admin-command-hero min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-6 px-5 py-6 md:px-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                        <div className="min-w-0 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-text) text-(--brand-accent-haze)">
                                    <Sparkles size={21} />
                                </span>
<h1 className="text-2xl font-extrabold text-slate-950 md:text-[32px]">
                                    {t('admin.addons.title', 'Event Add-ons')}
                                </h1>
                            </div>
<p className="mt-3 max-w-[68ch] text-sm font-medium leading-6 text-slate-600">
                                {t('admin.addons.subtitle', 'Manage optional services customers can add to a catering booking, with clear pricing and multilingual descriptions.')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => openNew()}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white shadow-[0_10px_24px_var(--brand-text-a18)] transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100 sm:w-auto"
                        >
<Plus size={17} />
                            {t('admin.addons.addAddOn', 'Add add-on')}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 border-t border-slate-200 bg-(--brand-surface-dim) sm:grid-cols-4">
<MetricCard label={t('admin.addons.statsTotal', 'Total add-ons')} value={stats.total} icon={<Package size={15} />} />
                        <MetricCard label={t('admin.addons.statsFixedPrice', 'Fixed price')} value={stats.fixed} icon={<Euro size={15} />} />
                        <MetricCard label={t('admin.addons.perPerson', 'Per person')} value={stats.perPerson} icon={<Users size={15} />} />
                        <MetricCard label={t('admin.addons.categories', 'Categories')} value={stats.categories} icon={<Layers3 size={15} />} />
                    </div>
                </section>

                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(280px,1fr)_auto] xl:items-end">
                        <label className="relative block min-w-0">
                            <span className="sr-only">{t('admin.addons.searchAria', 'Search add-ons')}</span>
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={t('admin.addons.searchPlaceholder', 'Search name, description, category or price')}
                                className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </label>

                        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
<div className="grid min-w-0 gap-1.5">
                                <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                    <Euro size={13} /> {t('admin.addons.pricingLabel', 'Pricing')}
                                </span>
                                <div className="grid h-11 grid-cols-3 rounded-xl bg-stone-100 p-1">
{([
                                        ['all', t('admin.addons.pricingFilterAll', 'All')],
                                        ['fixed', t('admin.addons.pricingFilterFixed', 'Fixed')],
                                        ['per_person', t('admin.addons.perPerson', 'Per person')]
                                    ] as Array<[PricingFilter, string]>).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPricingFilter(value)}
                                            aria-pressed={pricingFilter === value}
                                            className={`rounded-lg px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                                                pricingFilter === value
                                                    ? 'bg-white text-slate-950 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <span className="px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{t('admin.addons.viewLabel', 'View')}</span>
                                <div className="grid h-11 grid-cols-2 rounded-xl bg-stone-100 p-1">
<ViewButton label={t('admin.addons.viewGrid', 'Grid')} icon={<Grid3X3 size={15} />} active={viewMode === 'grid'} onClick={() => setViewMode('grid')} />
                                    <ViewButton label={t('admin.addons.viewList', 'List')} icon={<List size={15} />} active={viewMode === 'list'} onClick={() => setViewMode('list')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 min-w-0 border-t border-slate-100 pt-3">
                        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                            <CategoryTab label={t('admin.addons.allCategories', 'All categories')} count={addons.length} active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
                            {(Object.keys(CATEGORY_ICONS) as CategoryType[]).map((category) => (
                                <CategoryTab
                                    key={category}
                                    label={categoryName(category)}
                                    count={categoryCounts[category] || 0}
                                    icon={CATEGORY_ICONS[category]}
                                    active={categoryFilter === category}
                                    onClick={() => setCategoryFilter(category)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={13} /> {t('admin.addons.showingAddOns', 'Showing {{shown}} of {{total}} add-ons', { shown: filteredAddons.length, total: addons.length })}
                        </span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            >
<RotateCcw size={13} /> {t('admin.addons.clearFilters', 'Clear filters')}
                            </button>
                        )}
                    </div>
                </section>

                {addons.length === 0 && !loading && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-600">
                                <Wand2 size={18} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-[15px] font-semibold text-slate-900">
                                    {t('admin.addons.quickPresets', 'Quick Presets')}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {t('admin.addons.quickPresetsHint', 'Click one to start with a common add-on.')}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={String(preset.name)}
                                            onClick={() => openNew(preset)}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50"
                                        >
                                            {preset.icon}
                                            {t(preset.labelKey)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <LoadingPanel />
                ) : loadError ? (
                    <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <AlertCircle size={21} />
                        </span>
<h3 className="mt-4 text-lg font-extrabold text-slate-950">{t('admin.addons.loadFailedTitle', 'Add-ons could not be loaded')}</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                            {t('admin.addons.loadFailedBody', 'Check the connection and retry. Existing add-on data has not been changed.')}
                        </p>
                        <button
                            type="button"
                            onClick={load}
                            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100"
                        >
                            <RotateCcw size={15} /> {t('admin.addons.retryLoading', 'Retry loading')}
                        </button>
                    </div>
                ) : filteredAddons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
                            {addons.length > 0 ? <Search size={22} className="text-slate-400" /> : <Package size={22} className="text-slate-400" />}
                        </div>
<h3 className="mt-4 text-lg font-extrabold text-slate-950">
                            {addons.length > 0 ? t('admin.addons.noMatchTitle', 'No add-ons match these filters') : t('admin.addons.emptyTitle', 'Create your first add-on')}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                            {addons.length > 0
                                ? t('admin.addons.noMatchBody', 'Clear the filters or try a different search term.')
                                : t('admin.addons.emptyBody', 'Add optional services such as welcome drinks, decoration or entertainment.')}
                        </p>
                        <button
                            type="button"
                            onClick={addons.length > 0 ? clearFilters : () => openNew()}
                            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100"
                        >
                            {addons.length > 0 ? <RotateCcw size={15} /> : <Plus size={15} />}
                            {addons.length > 0 ? t('admin.addons.clearFilters', 'Clear filters') : t('admin.addons.emptyAction', 'Add first add-on')}
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid min-w-0 gap-4 lg:grid-cols-2 xl:grid-cols-3' : 'grid min-w-0 gap-3'}>
                        {filteredAddons.map((addon) => (
                            <div
                                key={addon._id}
                                className={`group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_var(--brand-text-a09)] ${
                                    viewMode === 'list'
                                        ? 'md:grid md:grid-cols-[minmax(150px,0.8fr)_minmax(220px,1.4fr)_150px_145px_82px] md:items-center md:gap-4'
                                        : 'flex flex-col'
                                }`}
                            >
                                <div className={`flex items-start justify-between gap-3 ${viewMode === 'grid' ? 'mb-4' : 'mb-4 md:contents'}`}>
                                    <span
                                        className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${CATEGORY_STYLES[addon.category]} ${viewMode === 'list' ? 'md:col-start-3 md:row-start-1' : ''}`}
                                    >
                                        {CATEGORY_ICONS[addon.category]}
                                        {categoryName(addon.category)}
                                    </span>

                                    <div className={`flex shrink-0 gap-1.5 ${viewMode === 'list' ? 'md:col-start-5 md:row-start-1 md:justify-end' : ''}`}>
                                        <button
                                            onClick={() => openEdit(addon)}
aria-label={t('admin.addons.editAddon', 'Edit {{name}}', { name: addon.nameTranslations?.nl || addon.name })}
                                            title={t('admin.addons.editAddonTitle', 'Edit add-on')}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(addon._id)
                                            }
aria-label={t('admin.addons.deleteAddon', 'Delete {{name}}', { name: addon.nameTranslations?.nl || addon.name })}
                                            title={t('admin.addons.deleteAddonTitle', 'Delete add-on')}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className={`break-words text-base font-extrabold text-slate-950 ${viewMode === 'list' ? 'md:col-start-1 md:row-start-1' : ''}`}>
                                    {addon.nameTranslations?.nl || addon.name}
                                </h3>

                                <p className={`break-words text-sm font-medium leading-6 text-slate-600 ${viewMode === 'grid' ? 'mt-2 flex-1' : 'mt-2 md:col-start-2 md:row-start-1 md:mt-0'}`}>
                                    {addon.descriptionTranslations?.nl ||
                                        addon.description ||
                                        t('admin.addons.noDescription', 'No description added')}
                                </p>

                                <div className={`flex items-center justify-between gap-3 ${viewMode === 'grid' ? 'mt-5 border-t border-slate-100 pt-4' : 'mt-4 md:col-start-4 md:row-start-1 md:mt-0'}`}>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Euro size={14} />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                                            {t('admin.addons.priceLabel', 'Price')}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-base font-semibold text-slate-900">
                                            € {Number(addon.price || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {addon.pricingType === 'per_person'
                                                ? t('admin.addons.pricePerPerson', 'per person')
                                                : t('admin.addons.priceFixed', 'fixed')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showForm && (
                    <div
className="fixed inset-0 z-[100] flex overflow-y-auto bg-(--brand-char-deep)/60 p-3 backdrop-blur-[2px] sm:p-5"
                        onClick={closeForm}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="addon-editor-title"
                            className="m-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_32px_90px_var(--brand-char-a32)] sm:max-h-[calc(100dvh-2.5rem)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div className="min-w-0">
<h2 id="addon-editor-title" className="text-xl font-extrabold text-slate-950">
                                        {editing ? t('admin.addons.editorTitleEdit', 'Edit add-on') : t('admin.addons.editorTitleCreate', 'Create add-on')}
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        {t('admin.addons.editorSubtitle', 'Add customer-facing translations, pricing and catalogue placement.')}
                                    </p>
                                </div>

                                <button
                                    onClick={closeForm}
aria-label={t('admin.addons.closeEditor', 'Close add-on editor')}
                                    title={t('admin.addons.close', 'Close')}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                                <div className="space-y-6">
                                    <div>
                                        <SectionTitle
                                            title={t('admin.addons.namesTitle', 'Names')}
                                            subtitle={t('admin.addons.namesSubtitle', 'Add multilingual display names.')}
                                        />

                                        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-3">
                                            <InputBlock
                                                label={t('admin.addons.nameNl', 'Name (NL)')}
                                                placeholder={t('admin.addons.placeholderDutchName', 'Dutch name')}
                                                value={
                                                    form.nameTranslations?.nl ||
                                                    ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        nameTranslations: {
                                                            ...(prev.nameTranslations || {
                                                                nl: '',
                                                                en: '',
                                                                ta: ''
                                                            }),
                                                            nl: value
                                                        }
                                                    }))
                                                }
                                            />

                                            <InputBlock
                                                label={t('admin.addons.nameEn', 'Name (EN)')}
                                                placeholder={t('admin.addons.placeholderEnglishName', 'English name')}
                                                value={
                                                    form.nameTranslations?.en ||
                                                    ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        nameTranslations: {
                                                            ...(prev.nameTranslations || {
                                                                nl: '',
                                                                en: '',
                                                                ta: ''
                                                            }),
                                                            en: value
                                                        }
                                                    }))
                                                }
                                            />

                                            <InputBlock
                                                label={t('admin.addons.nameTa', 'Name (TA)')}
                                                placeholder={t('admin.addons.placeholderTamilName', 'Tamil name')}
                                                value={
                                                    form.nameTranslations?.ta ||
                                                    ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        nameTranslations: {
                                                            ...(prev.nameTranslations || {
                                                                nl: '',
                                                                en: '',
                                                                ta: ''
                                                            }),
                                                            ta: value
                                                        }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionTitle
                                            title={t('admin.addons.descriptionsTitle', 'Descriptions')}
                                            subtitle={t('admin.addons.descriptionsSubtitle', 'Add descriptions in each language.')}
                                        />

                                        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-3">
                                            <TextAreaBlock
                                                label={t('admin.addons.descriptionNl', 'Description (NL)')}
                                                placeholder={t('admin.addons.placeholderDutchDescription', 'Dutch description')}
                                                value={
                                                    form.descriptionTranslations
                                                        ?.nl || ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        descriptionTranslations:
                                                            {
                                                                ...(prev.descriptionTranslations || {
                                                                    nl: '',
                                                                    en: '',
                                                                    ta: ''
                                                                }),
                                                                nl: value
                                                            }
                                                    }))
                                                }
                                            />

                                            <TextAreaBlock
                                                label={t('admin.addons.descriptionEn', 'Description (EN)')}
                                                placeholder={t('admin.addons.placeholderEnglishDescription', 'English description')}
                                                value={
                                                    form.descriptionTranslations
                                                        ?.en || ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        descriptionTranslations:
                                                            {
                                                                ...(prev.descriptionTranslations || {
                                                                    nl: '',
                                                                    en: '',
                                                                    ta: ''
                                                                }),
                                                                en: value
                                                            }
                                                    }))
                                                }
                                            />

                                            <TextAreaBlock
                                                label={t('admin.addons.descriptionTa', 'Description (TA)')}
                                                placeholder={t('admin.addons.placeholderTamilDescription', 'Tamil description')}
                                                value={
                                                    form.descriptionTranslations
                                                        ?.ta || ''
                                                }
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        descriptionTranslations:
                                                            {
                                                                ...(prev.descriptionTranslations || {
                                                                    nl: '',
                                                                    en: '',
                                                                    ta: ''
                                                                }),
                                                                ta: value
                                                            }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionTitle
                                            title={t('admin.addons.pricingCategoryTitle', 'Pricing & Category')}
                                            subtitle={t('admin.addons.pricingCategorySubtitle', 'Configure how this add-on is billed.')}
                                        />

                                        <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <NumberBlock
                                                label={t('admin.addons.priceFieldLabel', 'Price (€)')}
                                                value={form.price}
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        price: value
                                                    }))
                                                }
                                            />

                                            <PremiumSelect
                                                label={t('admin.addons.pricingTypeLabel', 'Pricing Type')}
                                                value={form.pricingType}
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        pricingType:
                                                            value as PricingType
                                                    }))
                                                }
                                                options={[
                                                    {
                                                        value: 'fixed',
                                                        label: t('admin.addons.fixedPriceOption', 'Fixed Price')
                                                    },
                                                    {
                                                        value: 'per_person',
                                                        label: t('admin.addons.perPersonOption', 'Per Person')
                                                    }
                                                ]}
                                                icon={<Euro size={16} />}
                                            />

                                            <PremiumSelect
                                                label={t('admin.addons.categoryLabel', 'Category')}
                                                value={form.category}
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        category:
                                                            value as CategoryType
                                                    }))
                                                }
                                                options={[
                                                    {
                                                        value: 'decoration',
                                                        label: t('admin.addons.categoryDecoration', 'Decoration')
                                                    },
                                                    {
                                                        value: 'entertainment',
                                                        label: t('admin.addons.categoryEntertainment', 'Entertainment')
                                                    },
                                                    {
                                                        value: 'service',
                                                        label: t('admin.addons.categoryService', 'Service')
                                                    },
                                                    {
                                                        value: 'extra_time',
                                                        label: t('admin.addons.categoryExtraTime', 'Extra Time')
                                                    },
                                                    {
                                                        value: 'other',
                                                        label: t('admin.addons.categoryOther', 'Other')
                                                    }
                                                ]}
                                                icon={<Layers3 size={16} />}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {formError && (
                                    <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 pb-1 pt-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                                    <button
                                        onClick={closeForm}
                                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                    >
                                        {t('admin.common.cancel', 'Cancel')}
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="h-11 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? t('admin.addons.saving', 'Saving...')
                                            : editing
                                            ? t('admin.addons.saveChanges', 'Save Changes')
                                            : t('admin.addons.createAddOn', 'Create Add-on')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => {
    return (
        <div className="min-w-0 border-slate-200 px-4 py-4 odd:border-r sm:border-r sm:last:border-r-0 md:px-5">
            <div className="flex items-center gap-2 text-slate-500">
                {icon}
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.1em]">{label}</p>
            </div>
            <p className="mt-1.5 text-xl font-extrabold tabular-nums text-slate-950">{value}</p>
        </div>
    );
};

const ViewButton = ({
    label,
    icon,
    active,
    onClick
}: {
    label: string;
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
            active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
        }`}
    >
        {icon}
        {label}
    </button>
);

const CategoryTab = ({
    label,
    count,
    icon,
    active,
    onClick
}: {
    label: string;
    count: number;
    icon?: ReactNode;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
            active
                ? 'border-(--brand-text) bg-(--brand-text) text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50'
        }`}
    >
        {icon}
        <span>{label}</span>
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/15' : 'bg-stone-100'}`}>
            {count}
        </span>
    </button>
);

const LoadingPanel = () => {
    const { t } = useTranslation();

    return (
    <div aria-label={t('admin.addons.loading', 'Loading add-ons')} className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="min-h-[250px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm motion-reduce:animate-none"
            >
                <div className="flex justify-between">
                    <div className="h-7 w-28 rounded-lg bg-stone-200" />
                    <div className="h-9 w-20 rounded-lg bg-stone-100" />
                </div>
                <div className="mt-6 h-5 w-3/5 rounded bg-stone-200" />
                <div className="mt-3 h-4 w-full rounded bg-stone-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-stone-100" />
                <div className="mt-8 h-14 rounded-xl bg-stone-100" />
            </div>
        ))}
</div>
    );
};

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div>
            <h3 className="text-base font-extrabold text-slate-950">
                {title}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        </div>
    );
};

const InputBlock = ({
    label,
    placeholder,
    value,
    onChange
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    return (
        <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
            <label className="mb-2 block text-sm font-bold text-slate-800">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
        </div>
    );
};

const NumberBlock = ({
    label,
    value,
    onChange
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) => {
    return (
        <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
            <label className="mb-2 block text-sm font-bold text-slate-800">
                {label}
            </label>
            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold tabular-nums text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
        </div>
    );
};

const TextAreaBlock = ({
    label,
    placeholder,
    value,
    onChange
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    return (
        <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
            <label className="mb-2 block text-sm font-bold text-slate-800">
                {label}
            </label>
            <textarea
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[120px] w-full min-w-0 resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
        </div>
    );
};

const PremiumSelect = ({
    label,
    value,
    onChange,
    options,
    icon
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: ReactNode;
}) => {
    return (
        <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
            <label className="mb-2 block text-sm font-bold text-slate-800">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}

                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                        icon ? 'pl-11 pr-10' : 'px-4 pr-10'
                    }`}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </div>
    );
};

const formatCategory = (value: CategoryType) => {
    switch (value) {
        case 'extra_time':
            return 'Extra Time';
        case 'decoration':
            return 'Decoration';
        case 'entertainment':
            return 'Entertainment';
        case 'service':
            return 'Service';
        default:
            return 'Other';
    }
};
