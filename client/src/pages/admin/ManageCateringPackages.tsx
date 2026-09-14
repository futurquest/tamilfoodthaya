import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Box,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Edit2,
    Filter,
    FolderPlus,
    Grid3X3,
    Layers3,
    List,
    Package,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    Users,
    UtensilsCrossed,
    X
} from 'lucide-react';
import {
    getCateringPackages,
    createCateringPackage,
    updateCateringPackage,
    deleteCateringPackage,
    useMenu
} from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface Item {
    menuItem: any;
}

interface Category {
    name: string;
    nameTranslations?: { nl: string; en: string; ta: string };
    description: string;
    descriptionTranslations?: { nl: string; en: string; ta: string };
    minSelect: number;
    maxSelect: number;
    items: Item[];
}

interface CateringPackage {
    _id?: string;
    name: string;
    nameTranslations?: { nl: string; en: string; ta: string };
    description: string;
    descriptionTranslations?: { nl: string; en: string; ta: string };
    basePrice: number;
    minGuests: number;
    maxGuests: number;
    categories: Category[];
    available: boolean;
    sortOrder: number;
}

type ViewMode = 'grid' | 'list';
type AvailabilityFilter = 'ALL' | 'ACTIVE' | 'HIDDEN';

const emptyItem: Item = { menuItem: '' };

const emptyCategory: Category = {
    name: '',
    nameTranslations: { nl: '', en: '', ta: '' },
    description: '',
    descriptionTranslations: { nl: '', en: '', ta: '' },
    minSelect: 1,
    maxSelect: 1,
    items: [{ ...emptyItem }]
};

const emptyPackage: CateringPackage = {
    name: '',
    nameTranslations: { nl: '', en: '', ta: '' },
    description: '',
    descriptionTranslations: { nl: '', en: '', ta: '' },
    basePrice: 0,
    minGuests: 20,
    maxGuests: 500,
    categories: [],
    available: true,
    sortOrder: 0
};

export const ManageCateringPackages = () => {
    const { menuItems } = useMenu();
    const [packages, setPackages] = useState<CateringPackage[]>([]);
    const [editing, setEditing] = useState<CateringPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const allMenuItems = useMemo(() => {
        if (Array.isArray(menuItems.data)) return menuItems.data;
        if (Array.isArray(menuItems.data?.data)) return menuItems.data.data;
        return [];
    }, [menuItems.data]);

    const stats = useMemo(() => {
        const totalPackages = packages.length;
        const activePackages = packages.filter((pkg) => pkg.available).length;
        const hiddenPackages = totalPackages - activePackages;
        const totalCategories = packages.reduce((acc, pkg) => acc + (pkg.categories?.length || 0), 0);
        const totalItems = packages.reduce(
            (acc, pkg) =>
                acc + (pkg.categories || []).reduce((catAcc, cat) => catAcc + (cat.items?.length || 0), 0),
            0
        );

        return { totalPackages, activePackages, hiddenPackages, totalCategories, totalItems };
    }, [packages]);

    const filteredPackages = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return [...packages]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .filter((pkg) => {
                if (availabilityFilter === 'ACTIVE' && !pkg.available) return false;
                if (availabilityFilter === 'HIDDEN' && pkg.available) return false;
                if (!query) return true;

                return [
                    getPackageName(pkg),
                    pkg.descriptionTranslations?.nl,
                    pkg.descriptionTranslations?.en,
                    pkg.descriptionTranslations?.ta,
                    String(pkg.basePrice),
                    String(pkg.minGuests),
                    String(pkg.maxGuests),
                    ...((pkg.categories || []).map((cat) => cat.nameTranslations?.nl || cat.name))
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));
            });
    }, [packages, searchTerm, availabilityFilter]);

    const featuredPackage = useMemo(
        () => packages.find((pkg) => pkg.available) || packages[0] || null,
        [packages]
    );

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await getCateringPackages();
            setPackages(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
        } catch {
            toast.error('Could not load packages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const normalizePackageForEdit = (pkg: CateringPackage): CateringPackage => ({
        ...pkg,
        nameTranslations: {
            nl: pkg.nameTranslations?.nl || pkg.name || '',
            en: pkg.nameTranslations?.en || '',
            ta: pkg.nameTranslations?.ta || ''
        },
        descriptionTranslations: {
            nl: pkg.descriptionTranslations?.nl || pkg.description || '',
            en: pkg.descriptionTranslations?.en || '',
            ta: pkg.descriptionTranslations?.ta || ''
        },
        categories: (pkg.categories || []).map((cat) => ({
            ...cat,
            nameTranslations: {
                nl: cat.nameTranslations?.nl || cat.name || '',
                en: cat.nameTranslations?.en || '',
                ta: cat.nameTranslations?.ta || ''
            },
            descriptionTranslations: {
                nl: cat.descriptionTranslations?.nl || cat.description || '',
                en: cat.descriptionTranslations?.en || '',
                ta: cat.descriptionTranslations?.ta || ''
            },
            items: cat.items?.length ? cat.items : [{ ...emptyItem }]
        }))
    });

    const buildPayload = (pkg: CateringPackage): CateringPackage => ({
        ...pkg,
        name: pkg.nameTranslations?.nl?.trim() || pkg.name || '',
        description: pkg.descriptionTranslations?.nl?.trim() || pkg.description || '',
        categories: (pkg.categories || []).map((cat) => ({
            ...cat,
            name: cat.nameTranslations?.nl?.trim() || cat.name || '',
            description: cat.descriptionTranslations?.nl?.trim() || cat.description || '',
            items: (cat.items || []).filter((item) => Boolean(getMenuItemId(item.menuItem)))
        }))
    });

    const openNewPackage = () => {
        setEditing({ ...emptyPackage, categories: [] });
        setExpandedCats({});
    };

    const openEditPackage = (pkg: CateringPackage) => {
        setEditing(normalizePackageForEdit(pkg));
        setExpandedCats({});
    };

    const handleSave = async () => {
        if (!editing) return;

        try {
            setSaving(true);
            const payload = buildPayload(editing);

            if (payload._id) {
                await updateCateringPackage(payload._id, payload);
                toast.success('Package updated');
            } else {
                await createCateringPackage(payload);
                toast.success('Package created');
            }

            setEditing(null);
            await fetchPackages();
        } catch {
            toast.error('Could not save package');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this catering package? Customers will no longer be able to select it.')) return;

        try {
            await deleteCateringPackage(id);
            toast.success('Package deleted');
            await fetchPackages();
        } catch {
            toast.error('Could not delete package');
        }
    };

    const updateField = (field: keyof CateringPackage, value: any) => {
        if (!editing) return;
        setEditing({ ...editing, [field]: value });
    };

    const addCategory = () => {
        if (!editing) return;
        const nextIndex = editing.categories.length;
        setEditing({
            ...editing,
            categories: [...editing.categories, { ...emptyCategory, items: [{ ...emptyItem }] }]
        });
        setExpandedCats((prev) => ({ ...prev, [nextIndex]: true }));
    };

    const updateCategory = (catIdx: number, field: keyof Category, value: any) => {
        if (!editing) return;
        const categories = [...editing.categories];
        categories[catIdx] = { ...categories[catIdx], [field]: value };
        setEditing({ ...editing, categories });
    };

    const removeCategory = (catIdx: number) => {
        if (!editing) return;
        setEditing({ ...editing, categories: editing.categories.filter((_, i) => i !== catIdx) });
    };

    const addItem = (catIdx: number) => {
        if (!editing) return;
        const categories = [...editing.categories];
        categories[catIdx] = {
            ...categories[catIdx],
            items: [...categories[catIdx].items, { ...emptyItem }]
        };
        setEditing({ ...editing, categories });
    };

    const updateItem = (catIdx: number, itemIdx: number, value: string) => {
        if (!editing) return;
        const categories = [...editing.categories];
        const items = [...categories[catIdx].items];
        items[itemIdx] = { ...items[itemIdx], menuItem: value };
        categories[catIdx] = { ...categories[catIdx], items };
        setEditing({ ...editing, categories });
    };

    const removeItem = (catIdx: number, itemIdx: number) => {
        if (!editing) return;
        const categories = [...editing.categories];
        categories[catIdx] = {
            ...categories[catIdx],
            items: categories[catIdx].items.filter((_, i) => i !== itemIdx)
        };
        setEditing({ ...editing, categories });
    };

    if (editing) {
        return (
            <PackageEditor
                editing={editing}
                saving={saving}
                expandedCats={expandedCats}
                allMenuItems={allMenuItems}
                onCancel={() => setEditing(null)}
                onSave={handleSave}
                onUpdateField={updateField}
                onAddCategory={addCategory}
                onToggleCategory={(idx) => setExpandedCats((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                onUpdateCategory={updateCategory}
                onRemoveCategory={removeCategory}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
            />
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="overflow-hidden rounded-[28px] border border-(--brand-outline-dark) bg-(--brand-night) text-white shadow-[0_28px_80px_var(--brand-text-a24)]">
                    <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--brand-accent-strong)/30 bg-(--brand-accent-strong)/15 px-3 py-1.5 text-xs font-extrabold text-(--brand-accent-haze)">
                                <Sparkles size={13} />
                                Main catering product
                            </span>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 className="admin-package-hero-title max-w-[760px] text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-[1.03]">
                                    Catering packages that sell the event clearly.
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white">
                                    <UtensilsCrossed size={13} />
                                    {viewMode === 'grid' ? 'Grid view' : 'List view'}
                                </span>
                            </div>
                            <p className="admin-package-hero-copy mt-4 max-w-2xl text-sm font-semibold leading-6">
                                Manage the packages customers compare first: price per person, guest range, included choices, publishing status and multilingual selling copy.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={openNewPackage}
                                    className="h-11 rounded-xl border border-(--brand-accent-strong) bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) px-5 text-sm font-extrabold text-white hover:opacity-95"
                                >
                                    <Plus size={16} className="mr-2" />
                                    New Package
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-extrabold text-white transition hover:bg-white/15"
                                >
                                    {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
                                    Switch to {viewMode === 'grid' ? 'list' : 'grid'}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <MetricCard label="Packages" value={stats.totalPackages} icon={<Package size={16} />} tone="dark" />
                                <MetricCard label="Active" value={stats.activePackages} icon={<CheckCircle2 size={16} />} tone="dark" />
                                <MetricCard label="Hidden" value={stats.hiddenPackages} icon={<X size={16} />} tone="dark" />
                                <MetricCard label="Choices" value={stats.totalItems} icon={<Box size={16} />} tone="dark" />
                            </div>
                            <FeaturedPackagePanel pkg={featuredPackage} />
                        </div>
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search package name, description, group, price or guest count..."
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                            <AvailabilityTabs
                                value={availabilityFilter}
                                counts={{
                                    ALL: stats.totalPackages,
                                    ACTIVE: stats.activePackages,
                                    HIDDEN: stats.hiddenPackages
                                }}
                                onChange={setAvailabilityFilter}
                            />
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={12} />
                            Showing {filteredPackages.length} of {packages.length} packages
                        </span>
                        {(searchTerm || availabilityFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setAvailabilityFilter('ALL');
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </section>

                {loading ? (
                    <LoadingPanel />
                ) : filteredPackages.length === 0 ? (
                    <EmptyState
                        title={packages.length === 0 ? 'No packages yet' : 'No matching packages'}
                        text={
                            packages.length === 0
                                ? 'Create the first catering package so customers can choose an event menu.'
                                : 'Adjust search or filters to find the package you need.'
                        }
                        action={packages.length === 0 ? openNewPackage : undefined}
                    />
                ) : viewMode === 'grid' ? (
                    <PackageGrid packages={filteredPackages} onEdit={openEditPackage} onDelete={handleDelete} />
                ) : (
                    <PackageList packages={filteredPackages} onEdit={openEditPackage} onDelete={handleDelete} />
                )}
            </div>
        </div>
    );
};

const PackageEditor = ({
    editing,
    saving,
    expandedCats,
    allMenuItems,
    onCancel,
    onSave,
    onUpdateField,
    onAddCategory,
    onToggleCategory,
    onUpdateCategory,
    onRemoveCategory,
    onAddItem,
    onUpdateItem,
    onRemoveItem
}: {
    editing: CateringPackage;
    saving: boolean;
    expandedCats: Record<number, boolean>;
    allMenuItems: any[];
    onCancel: () => void;
    onSave: () => void;
    onUpdateField: (field: keyof CateringPackage, value: any) => void;
    onAddCategory: () => void;
    onToggleCategory: (idx: number) => void;
    onUpdateCategory: (catIdx: number, field: keyof Category, value: any) => void;
    onRemoveCategory: (catIdx: number) => void;
    onAddItem: (catIdx: number) => void;
    onUpdateItem: (catIdx: number, itemIdx: number, value: string) => void;
    onRemoveItem: (catIdx: number, itemIdx: number) => void;
}) => {
    const choiceCount = editing.categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                {editing._id ? 'Edit Catering Package' : 'Create Catering Package'}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                Build package details, guest limits, multilingual descriptions and grouped meal choices.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-stone-50"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save package'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px]">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <SectionTitle title="Package details" subtitle="Customer-facing copy, pricing and event size." />
                        <div className="mt-5 grid gap-4 lg:grid-cols-3">
                            <InputBlock label="Name (NL)" value={editing.nameTranslations?.nl || ''} onChange={(value) => onUpdateField('nameTranslations', { ...editing.nameTranslations, nl: value })} />
                            <InputBlock label="Name (EN)" value={editing.nameTranslations?.en || ''} onChange={(value) => onUpdateField('nameTranslations', { ...editing.nameTranslations, en: value })} />
                            <InputBlock label="Name (TA)" value={editing.nameTranslations?.ta || ''} onChange={(value) => onUpdateField('nameTranslations', { ...editing.nameTranslations, ta: value })} />
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-3">
                            <TextAreaBlock label="Description (NL)" value={editing.descriptionTranslations?.nl || ''} onChange={(value) => onUpdateField('descriptionTranslations', { ...editing.descriptionTranslations, nl: value })} />
                            <TextAreaBlock label="Description (EN)" value={editing.descriptionTranslations?.en || ''} onChange={(value) => onUpdateField('descriptionTranslations', { ...editing.descriptionTranslations, en: value })} />
                            <TextAreaBlock label="Description (TA)" value={editing.descriptionTranslations?.ta || ''} onChange={(value) => onUpdateField('descriptionTranslations', { ...editing.descriptionTranslations, ta: value })} />
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <NumberBlock label="Base price" value={editing.basePrice} helper="Price per person" step="0.50" onChange={(value) => onUpdateField('basePrice', value)} />
                            <NumberBlock label="Minimum guests" value={editing.minGuests} helper="Smallest event size" onChange={(value) => onUpdateField('minGuests', value)} />
                            <NumberBlock label="Maximum guests" value={editing.maxGuests} helper="Largest event size" onChange={(value) => onUpdateField('maxGuests', value)} />
                            <NumberBlock label="Sort order" value={editing.sortOrder} helper="Public display order" onChange={(value) => onUpdateField('sortOrder', value)} />
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle title="Publishing" subtitle="Public package availability." />
                            <ToggleCard
                                title={editing.available ? 'Visible to customers' : 'Hidden from customers'}
                                description="Control whether this package appears on the catering page."
                                checked={editing.available}
                                onChange={(checked) => onUpdateField('available', checked)}
                            />
                        </section>

                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle title="Package summary" subtitle="Fast operational review." />
                            <div className="mt-4 grid gap-2">
                                <SummaryRow label="Price per person" value={formatPrice(editing.basePrice)} />
                                <SummaryRow label="Guest range" value={`${editing.minGuests} - ${editing.maxGuests}`} />
                                <SummaryRow label="Meal groups" value={String(editing.categories.length)} />
                                <SummaryRow label="Choices" value={String(choiceCount)} />
                            </div>
                        </section>
                    </aside>
                </div>

                <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-white)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
                    <WorkspaceHeader
                        title="Meal group builder"
                        text="Create the customer choice groups shown inside this catering package."
                        badge={`${editing.categories.length} ${editing.categories.length === 1 ? 'group' : 'groups'}`}
                    />
                    <div className="grid gap-3">
                        {editing.categories.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                                <FolderPlus className="mx-auto text-slate-400" size={28} />
                                <h3 className="mt-3 text-base font-extrabold text-slate-900">No meal groups yet</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                                    Add starters, mains, desserts or drinks as choice groups for this package.
                                </p>
                            </div>
                        ) : (
                            editing.categories.map((cat, catIdx) => (
                                <MealGroupEditor
                                    key={catIdx}
                                    cat={cat}
                                    catIdx={catIdx}
                                    expanded={Boolean(expandedCats[catIdx])}
                                    allMenuItems={allMenuItems}
                                    onToggle={() => onToggleCategory(catIdx)}
                                    onUpdateCategory={onUpdateCategory}
                                    onRemoveCategory={onRemoveCategory}
                                    onAddItem={onAddItem}
                                    onUpdateItem={onUpdateItem}
                                    onRemoveItem={onRemoveItem}
                                />
                            ))
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onAddCategory}
                        className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800"
                    >
                        <FolderPlus size={16} />
                        Add meal group
                    </button>
                </section>
            </div>
        </div>
    );
};

const MealGroupEditor = ({
    cat,
    catIdx,
    expanded,
    allMenuItems,
    onToggle,
    onUpdateCategory,
    onRemoveCategory,
    onAddItem,
    onUpdateItem,
    onRemoveItem
}: {
    cat: Category;
    catIdx: number;
    expanded: boolean;
    allMenuItems: any[];
    onToggle: () => void;
    onUpdateCategory: (catIdx: number, field: keyof Category, value: any) => void;
    onRemoveCategory: (catIdx: number) => void;
    onAddItem: (catIdx: number) => void;
    onUpdateItem: (catIdx: number, itemIdx: number, value: string) => void;
    onRemoveItem: (catIdx: number, itemIdx: number) => void;
}) => (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <button type="button" onClick={onToggle} className="flex min-w-0 items-center gap-3 text-left">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-white">
                    <Layers3 size={17} />
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-base font-extrabold text-slate-900">
                        {cat.nameTranslations?.nl || cat.name || `Meal group ${catIdx + 1}`}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">
                        Choose {cat.minSelect} to {cat.maxSelect} items, {cat.items.length} options
                    </span>
                </span>
                {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            <button
                type="button"
                onClick={() => onRemoveCategory(catIdx)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
                <Trash2 size={14} />
                Remove
            </button>
        </div>

        {expanded && (
            <div className="border-t border-slate-100 bg-(--brand-surface-ivory) p-4">
                <div className="grid gap-4 lg:grid-cols-3">
                    <InputBlock label="Group name (NL)" value={cat.nameTranslations?.nl || ''} onChange={(value) => onUpdateCategory(catIdx, 'nameTranslations', { ...cat.nameTranslations, nl: value })} />
                    <InputBlock label="Group name (EN)" value={cat.nameTranslations?.en || ''} onChange={(value) => onUpdateCategory(catIdx, 'nameTranslations', { ...cat.nameTranslations, en: value })} />
                    <InputBlock label="Group name (TA)" value={cat.nameTranslations?.ta || ''} onChange={(value) => onUpdateCategory(catIdx, 'nameTranslations', { ...cat.nameTranslations, ta: value })} />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <TextAreaBlock label="Description (NL)" value={cat.descriptionTranslations?.nl || ''} onChange={(value) => onUpdateCategory(catIdx, 'descriptionTranslations', { ...cat.descriptionTranslations, nl: value })} />
                    <TextAreaBlock label="Description (EN)" value={cat.descriptionTranslations?.en || ''} onChange={(value) => onUpdateCategory(catIdx, 'descriptionTranslations', { ...cat.descriptionTranslations, en: value })} />
                    <TextAreaBlock label="Description (TA)" value={cat.descriptionTranslations?.ta || ''} onChange={(value) => onUpdateCategory(catIdx, 'descriptionTranslations', { ...cat.descriptionTranslations, ta: value })} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <NumberBlock label="Minimum selections" value={cat.minSelect} onChange={(value) => onUpdateCategory(catIdx, 'minSelect', value)} />
                    <NumberBlock label="Maximum selections" value={cat.maxSelect} onChange={(value) => onUpdateCategory(catIdx, 'maxSelect', value)} />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <SectionTitle title="Included choices" subtitle="Menu items customers can choose from." />
                        <button
                            type="button"
                            onClick={() => onAddItem(catIdx)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 text-xs font-extrabold text-white"
                        >
                            <Plus size={14} />
                            Add choice
                        </button>
                    </div>
                    <div className="mt-4 grid gap-3">
                        {cat.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                <PremiumSelect
                                    label={`Choice ${itemIdx + 1}`}
                                    value={getMenuItemId(item.menuItem)}
                                    onChange={(value) => onUpdateItem(catIdx, itemIdx, value)}
                                    options={[
                                        { value: '', label: 'Select menu item' },
                                        ...allMenuItems.map((menuItem) => ({
                                            value: menuItem._id,
                                            label: menuItem.name || 'Untitled menu item'
                                        }))
                                    ]}
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(catIdx, itemIdx)}
                                    className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                    aria-label="Remove choice"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </article>
);

const PackageGrid = ({
    packages,
    onEdit,
    onDelete
}: {
    packages: CateringPackage[];
    onEdit: (pkg: CateringPackage) => void;
    onDelete: (id: string) => void;
}) => (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-white)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
        <WorkspaceHeader
            title="Package board"
            text="Review public package cards, pricing, guest ranges and included choice groups."
            badge={`${packages.length} ${packages.length === 1 ? 'package' : 'packages'}`}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    </section>
);

const PackageCard = ({
    pkg,
    onEdit,
    onDelete
}: {
    pkg: CateringPackage;
    onEdit: (pkg: CateringPackage) => void;
    onDelete: (id: string) => void;
}) => {
    const categoryCount = pkg.categories?.length || 0;
    const itemCount = getPackageItemCount(pkg);

    return (
        <article className="group flex min-h-[360px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_var(--brand-slate-a10)]">
            <div className="bg-(--brand-night) p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-white shadow-sm">
                        <UtensilsCrossed size={18} />
                    </div>
                    <StatusBadge available={pkg.available} variant="dark" />
                </div>
                <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-(--brand-stone)">
                    From
                </p>
                <div className="mt-1 flex items-end gap-2">
                    <span className="text-3xl font-extrabold leading-none text-white">
                        {formatPrice(pkg.basePrice)}
                    </span>
                    <span className="pb-1 text-xs font-bold text-(--brand-stone)">per person</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-extrabold leading-tight text-slate-900">
                            {getPackageName(pkg)}
                        </h3>
                        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-slate-600">
                            {pkg.descriptionTranslations?.nl || pkg.description || 'No description added yet.'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniStat icon={<Users size={14} />} label="Guests" value={`${pkg.minGuests} - ${pkg.maxGuests}`} />
                    <MiniStat icon={<Layers3 size={14} />} label="Groups" value={String(categoryCount)} />
                    <MiniStat icon={<Box size={14} />} label="Choices" value={String(itemCount)} />
                </div>

                <PackageGroupPills pkg={pkg} />

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                        Order {pkg.sortOrder ?? 0}
                    </span>
                    <PackageActions pkg={pkg} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </article>
    );
};

const PackageList = ({
    packages,
    onEdit,
    onDelete
}: {
    packages: CateringPackage[];
    onEdit: (pkg: CateringPackage) => void;
    onDelete: (id: string) => void;
}) => (
    <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
        <WorkspaceHeader
            title="List workspace"
            text="Scan price, guest limits, group count and publishing state in one dense table."
            badge={`${packages.length} ${packages.length === 1 ? 'package' : 'packages'}`}
        />
        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
            <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left">
                <thead className="bg-stone-50">
                    <tr>
                        {['Package', 'Status', 'Price', 'Guests', 'Groups', 'Choices', 'Action'].map((heading) => (
                            <th key={heading} className="border-b border-slate-200 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {packages.map((pkg) => (
                        <PackageRow key={pkg._id} pkg={pkg} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </tbody>
            </table>
        </div>
        <div className="grid gap-3 lg:hidden">
            {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    </section>
);

const PackageRow = ({
    pkg,
    onEdit,
    onDelete
}: {
    pkg: CateringPackage;
    onEdit: (pkg: CateringPackage) => void;
    onDelete: (id: string) => void;
}) => (
    <tr className="transition hover:bg-amber-50/50">
        <td className="border-b border-slate-100 px-4 py-4">
            <p className="text-sm font-extrabold text-slate-900">{getPackageName(pkg)}</p>
            <p className="mt-1 max-w-[320px] truncate text-xs font-bold text-slate-500">
                {pkg.descriptionTranslations?.nl || pkg.description || 'No description added yet.'}
            </p>
        </td>
        <td className="border-b border-slate-100 px-4 py-4"><StatusBadge available={pkg.available} /></td>
        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">{formatPrice(pkg.basePrice)}</td>
        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">{pkg.minGuests} - {pkg.maxGuests}</td>
        <td className="border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">{pkg.categories?.length || 0}</td>
        <td className="border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">{getPackageItemCount(pkg)}</td>
        <td className="border-b border-slate-100 px-4 py-4"><PackageActions pkg={pkg} onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
);

const MetricCard = ({
    label,
    value,
    icon,
    tone = 'light'
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
    tone?: 'light' | 'dark';
}) => (
    <div
        className={`rounded-2xl px-4 py-3 shadow-sm ${
            tone === 'dark'
                ? 'border border-white/10 bg-white/10 text-white'
                : 'border border-slate-200 bg-white'
        }`}
    >
        <div className={`flex items-center gap-2 ${tone === 'dark' ? 'text-(--brand-stone)' : 'text-slate-400'}`}>
            {icon}
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{label}</p>
        </div>
        <p className={`mt-2 text-2xl font-extrabold ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {value}
        </p>
    </div>
);

const AvailabilityTabs = ({
    value,
    counts,
    onChange
}: {
    value: AvailabilityFilter;
    counts: Record<AvailabilityFilter, number>;
    onChange: (value: AvailabilityFilter) => void;
}) => {
    const tabs: { value: AvailabilityFilter; label: string }[] = [
        { value: 'ALL', label: 'All' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'HIDDEN', label: 'Hidden' }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Filter size={13} />
                Status
            </span>
            <div className="flex max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {tabs.map((tab) => {
                    const active = value === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {tab.label}
                            <span className={`rounded-lg px-1.5 py-0.5 text-[10px] ${active ? 'bg-amber-50 text-amber-800' : 'bg-white text-slate-500'}`}>
                                {counts[tab.value]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ViewToggle = ({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) => {
    const options: { value: ViewMode; label: string; icon: ReactNode }[] = [
        { value: 'grid', label: 'Grid', icon: <Grid3X3 size={14} /> },
        { value: 'list', label: 'List', icon: <List size={14} /> }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">View</span>
            <div className="flex rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {options.map((option) => {
                    const active = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const WorkspaceHeader = ({ title, text, badge }: { title: string; text: string; badge: string }) => (
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

const PackageActions = ({
    pkg,
    onEdit,
    onDelete
}: {
    pkg: CateringPackage;
    onEdit: (pkg: CateringPackage) => void;
    onDelete: (id: string) => void;
}) => (
    <div className="flex flex-wrap justify-end gap-2">
        <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
        >
            <Edit2 size={14} />
            Edit
        </button>
        <button
            type="button"
            onClick={() => pkg._id && onDelete(pkg._id)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
            <Trash2 size={14} />
            Delete
        </button>
    </div>
);

const FeaturedPackagePanel = ({ pkg }: { pkg: CateringPackage | null }) => {
    if (!pkg) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-(--brand-stone)">
                    Featured package
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-(--brand-surface-beige-soft)">
                    Create a package to see the main catering offer here.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-(--brand-stone)">
                        Featured package
                    </p>
                    <p className="mt-2 truncate text-lg font-extrabold text-white">
                        {getPackageName(pkg)}
                    </p>
                </div>
                <StatusBadge available={pkg.available} variant="dark" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                <DarkMiniStat label="Price" value={formatPrice(pkg.basePrice)} />
                <DarkMiniStat label="Guests" value={`${pkg.minGuests} - ${pkg.maxGuests}`} />
                <DarkMiniStat label="Groups" value={String(pkg.categories?.length || 0)} />
            </div>
        </div>
    );
};

const DarkMiniStat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-(--brand-stone)">{label}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-white">{value}</p>
    </div>
);

const PackageGroupPills = ({ pkg }: { pkg: CateringPackage }) => {
    const groups = (pkg.categories || [])
        .map((cat) => cat.nameTranslations?.nl || cat.name)
        .filter(Boolean)
        .slice(0, 3);

    if (groups.length === 0) {
        return (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-3 py-3 text-xs font-bold text-slate-500">
                No meal groups configured yet.
            </p>
        );
    }

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
                <span
                    key={group}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-amber-800"
                >
                    {group}
                </span>
            ))}
            {(pkg.categories || []).length > groups.length && (
                <span className="rounded-xl border border-slate-200 bg-stone-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-600">
                    +{(pkg.categories || []).length - groups.length} more
                </span>
            )}
        </div>
    );
};

const StatusBadge = ({
    available,
    variant = 'light'
}: {
    available: boolean;
    variant?: 'light' | 'dark';
}) => {
    if (available) {
        return (
            <span
                className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                    variant === 'dark'
                        ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
            >
                Active
            </span>
        );
    }

    return (
        <span
            className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                variant === 'dark'
                    ? 'border-white/15 bg-white/10 text-(--brand-surface-beige-soft)'
                    : 'border-slate-200 bg-stone-50 text-slate-600'
            }`}
        >
            Hidden
        </span>
    );
};

const MiniStat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2">
        <div className="flex items-center gap-2 text-slate-400">
            {icon}
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em]">{label}</p>
        </div>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-800">{value}</p>
    </div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
    </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className="truncate text-sm font-extrabold text-slate-900">{value}</span>
    </div>
);

const InputBlock = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <label className="grid min-w-0 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
        <span className="block text-sm font-extrabold leading-5 text-slate-800">{label}</span>
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-slate-200 bg-(--brand-surface-ivory) px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        />
    </label>
);

const NumberBlock = ({
    label,
    value,
    onChange,
    step,
    helper
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: string;
    helper?: string;
}) => (
    <label className="grid min-w-0 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
        <span className="block text-sm font-extrabold leading-5 text-slate-800">{label}</span>
        <input
            type="number"
            step={step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value) || 0)}
            className="h-11 min-w-0 rounded-xl border border-slate-200 bg-(--brand-surface-ivory) px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        />
        {helper && <span className="text-xs font-semibold leading-5 text-slate-500">{helper}</span>}
    </label>
);

const TextAreaBlock = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <label className="grid min-w-0 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
        <span className="block text-sm font-extrabold leading-5 text-slate-800">{label}</span>
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            className="min-h-[110px] min-w-0 rounded-xl border border-slate-200 bg-(--brand-surface-ivory) px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        />
    </label>
);

const PremiumSelect = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) => (
    <label className="grid gap-2">
        <span className="text-sm font-extrabold text-slate-700">{label}</span>
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
    </label>
);

const ToggleCard = ({
    title,
    description,
    checked,
    onChange
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`mt-4 flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition ${
            checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
        }`}
    >
        <span>
            <span className="block text-sm font-extrabold">{title}</span>
            <span className={`mt-1 block text-xs font-semibold leading-5 ${checked ? 'text-slate-300' : 'text-slate-500'}`}>{description}</span>
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${checked ? 'bg-white text-slate-900' : 'bg-stone-100 text-slate-500'}`}>
            <CheckCircle2 size={16} />
        </span>
    </button>
);

const LoadingPanel = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 shadow-sm">
        <div className="flex justify-center">
            <Spinner />
        </div>
    </div>
);

const EmptyState = ({ title, text, action }: { title: string; text: string; action?: () => void }) => (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-400">
            <UtensilsCrossed size={22} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{text}</p>
        {action && (
            <Button onClick={action} className="mt-5 h-10 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800">
                <Plus size={16} className="mr-2" />
                New package
            </Button>
        )}
    </div>
);

const getPackageName = (pkg: CateringPackage) => pkg.nameTranslations?.nl || pkg.name || 'Untitled package';

const getPackageItemCount = (pkg: CateringPackage) =>
    (pkg.categories || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

const getMenuItemId = (menuItem: any) => {
    if (!menuItem) return '';
    if (typeof menuItem === 'object') return menuItem._id || '';
    return String(menuItem);
};

const formatPrice = (price?: number) => `EUR ${Number(price || 0).toFixed(2)}`;
