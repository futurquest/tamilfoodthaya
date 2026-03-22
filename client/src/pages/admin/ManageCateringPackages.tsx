import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import {
    Plus,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    Save,
    X,
    Layers3,
    Box,
    Users,
    Euro,
    CheckCircle2,
    UtensilsCrossed,
    FolderPlus
} from 'lucide-react';
import {
    getCateringPackages,
    createCateringPackage,
    updateCateringPackage,
    deleteCateringPackage,
    useMenu
} from '../../hooks/useApi';
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

    const allMenuItems = Array.isArray(menuItems.data) ? menuItems.data : [];

    const stats = useMemo(() => {
        const totalPackages = packages.length;
        const activePackages = packages.filter((pkg) => pkg.available).length;
        const totalCategories = packages.reduce(
            (acc, pkg) => acc + pkg.categories.length,
            0
        );
        const totalItems = packages.reduce(
            (acc, pkg) =>
                acc +
                pkg.categories.reduce((catAcc, cat) => catAcc + cat.items.length, 0),
            0
        );

        return {
            totalPackages,
            activePackages,
            totalCategories,
            totalItems
        };
    }, [packages]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await getCateringPackages();
            setPackages(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load packages');
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
            items:
                cat.items?.length > 0 ? cat.items : [{ ...emptyItem }]
        }))
    });

    const buildPayload = (pkg: CateringPackage): CateringPackage => ({
        ...pkg,
        name: pkg.nameTranslations?.nl?.trim() || pkg.name || '',
        description:
            pkg.descriptionTranslations?.nl?.trim() || pkg.description || '',
        categories: (pkg.categories || []).map((cat) => ({
            ...cat,
            name: cat.nameTranslations?.nl?.trim() || cat.name || '',
            description:
                cat.descriptionTranslations?.nl?.trim() || cat.description || '',
            items: (cat.items || []).filter((item) => {
                const value =
                    typeof item.menuItem === 'object'
                        ? item.menuItem?._id
                        : item.menuItem;
                return Boolean(value);
            })
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
            toast.error('Failed to save package');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this package?')) return;

        try {
            await deleteCateringPackage(id);
            toast.success('Package deleted');
            await fetchPackages();
        } catch {
            toast.error('Failed to delete package');
        }
    };

    const toggleCat = (idx: number) => {
        setExpandedCats((prev) => ({ ...prev, [idx]: !prev[idx] }));
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
            categories: [
                ...editing.categories,
                { ...emptyCategory, items: [{ ...emptyItem }] }
            ]
        });

        setExpandedCats((prev) => ({ ...prev, [nextIndex]: true }));
    };

    const updateCategory = (
        catIdx: number,
        field: keyof Category,
        value: any
    ) => {
        if (!editing) return;

        const categories = [...editing.categories];
        categories[catIdx] = { ...categories[catIdx], [field]: value };

        setEditing({ ...editing, categories });
    };

    const removeCategory = (catIdx: number) => {
        if (!editing) return;

        setEditing({
            ...editing,
            categories: editing.categories.filter((_, i) => i !== catIdx)
        });
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

    const updateItem = (
        catIdx: number,
        itemIdx: number,
        field: keyof Item,
        value: any
    ) => {
        if (!editing) return;

        const categories = [...editing.categories];
        const items = [...categories[catIdx].items];

        items[itemIdx] = { ...items[itemIdx], [field]: value };
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
            <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
                <div className="mx-auto max-w-[1080px] space-y-5">
                    <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                    Catering Packages
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                    {editing._id ? 'Edit Package' : 'Create Package'}
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    Build a premium package with category groups, item choices,
                                    guest limits, and multilingual content.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Package'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                        <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-5 md:p-6">
                                <SectionTitle
                                    title="Package Details"
                                    subtitle="Core pricing, names, descriptions and customer availability."
                                />

                                <div className="mt-5 space-y-5">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <InputBlock
                                            label="Name (NL)"
                                            placeholder="Goud Pakket"
                                            value={editing.nameTranslations?.nl || ''}
                                            onChange={(value) =>
                                                updateField('nameTranslations', {
                                                    ...editing.nameTranslations,
                                                    nl: value
                                                })
                                            }
                                        />

                                        <InputBlock
                                            label="Name (EN)"
                                            placeholder="Gold Package"
                                            value={editing.nameTranslations?.en || ''}
                                            onChange={(value) =>
                                                updateField('nameTranslations', {
                                                    ...editing.nameTranslations,
                                                    en: value
                                                })
                                            }
                                        />

                                        <InputBlock
                                            label="Name (TA)"
                                            placeholder="தங்க தொகுப்பு"
                                            value={editing.nameTranslations?.ta || ''}
                                            onChange={(value) =>
                                                updateField('nameTranslations', {
                                                    ...editing.nameTranslations,
                                                    ta: value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <TextAreaBlock
                                            label="Description (NL)"
                                            placeholder="Dutch description"
                                            value={
                                                editing.descriptionTranslations?.nl || ''
                                            }
                                            onChange={(value) =>
                                                updateField('descriptionTranslations', {
                                                    ...editing.descriptionTranslations,
                                                    nl: value
                                                })
                                            }
                                        />

                                        <TextAreaBlock
                                            label="Description (EN)"
                                            placeholder="English description"
                                            value={
                                                editing.descriptionTranslations?.en || ''
                                            }
                                            onChange={(value) =>
                                                updateField('descriptionTranslations', {
                                                    ...editing.descriptionTranslations,
                                                    en: value
                                                })
                                            }
                                        />

                                        <TextAreaBlock
                                            label="Description (TA)"
                                            placeholder="Tamil description"
                                            value={
                                                editing.descriptionTranslations?.ta || ''
                                            }
                                            onChange={(value) =>
                                                updateField('descriptionTranslations', {
                                                    ...editing.descriptionTranslations,
                                                    ta: value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <NumberBlock
                                            label="Base Price (€ p.p.)"
                                            value={editing.basePrice}
                                            step="0.50"
                                            onChange={(value) =>
                                                updateField('basePrice', value)
                                            }
                                        />

                                        <NumberBlock
                                            label="Sort Order"
                                            value={editing.sortOrder}
                                            onChange={(value) =>
                                                updateField('sortOrder', value)
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <NumberBlock
                                            label="Minimum Guests"
                                            value={editing.minGuests}
                                            onChange={(value) =>
                                                updateField('minGuests', value)
                                            }
                                        />

                                        <NumberBlock
                                            label="Maximum Guests"
                                            value={editing.maxGuests}
                                            onChange={(value) =>
                                                updateField('maxGuests', value)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-5">
                            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                                <CardContent className="p-5">
                                    <SectionTitle
                                        title="Visibility"
                                        subtitle="Control whether customers can select this package."
                                    />

                                    <div className="mt-4">
                                        <ToggleCard
                                            title={
                                                editing.available
                                                    ? 'Visible to customers'
                                                    : 'Hidden from customers'
                                            }
                                            description="Toggle package availability for the front-end booking flow."
                                            checked={editing.available}
                                            onChange={(checked) =>
                                                updateField('available', checked)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                                <CardContent className="p-5">
                                    <SectionTitle
                                        title="Quick Summary"
                                        subtitle="Live snapshot of the current package configuration."
                                    />

                                    <div className="mt-4 space-y-2">
                                        <SummaryRow
                                            label="Package Name"
                                            value={editing.nameTranslations?.nl || '-'}
                                        />
                                        <SummaryRow
                                            label="Base Price"
                                            value={`€ ${Number(
                                                editing.basePrice || 0
                                            ).toFixed(2)}`}
                                        />
                                        <SummaryRow
                                            label="Guests"
                                            value={`${editing.minGuests} - ${editing.maxGuests}`}
                                        />
                                        <SummaryRow
                                            label="Categories"
                                            value={String(editing.categories.length)}
                                        />
                                        <SummaryRow
                                            label="Items"
                                            value={String(
                                                editing.categories.reduce(
                                                    (acc, cat) => acc + cat.items.length,
                                                    0
                                                )
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5 md:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <SectionTitle
                                        title="Package Categories"
                                        subtitle="Create item groups such as rice, curries, desserts, drinks and sides."
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={addCategory}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                                >
                                    <FolderPlus size={16} />
                                    Add Category
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {editing.categories.length === 0 ? (
                                    <EmptyState
                                        title="No categories yet"
                                        text="Add your first category to start building this package."
                                    />
                                ) : (
                                    editing.categories.map((cat, catIdx) => {
                                        const isExpanded = expandedCats[catIdx];

                                        return (
                                            <div
                                                key={catIdx}
                                                className="rounded-[24px] border border-slate-200 bg-white"
                                            >
                                                <div
                                                    className="flex cursor-pointer items-center justify-between gap-3 px-4 py-4 md:px-5"
                                                    onClick={() => toggleCat(catIdx)}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-600">
                                                            {isExpanded ? (
                                                                <ChevronUp size={18} />
                                                            ) : (
                                                                <ChevronDown size={18} />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-[15px] font-semibold text-slate-900">
                                                                {cat.nameTranslations?.nl ||
                                                                    cat.name ||
                                                                    `Category ${catIdx + 1}`}
                                                            </h3>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {cat.items.length} item(s) · select{' '}
                                                                {cat.minSelect} - {cat.maxSelect}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeCategory(catIdx);
                                                        }}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-200 px-4 py-5 md:px-5">
                                                        <div className="space-y-5">
                                                            <div className="grid gap-4 md:grid-cols-3">
                                                                <InputBlock
                                                                    label="Category Name (NL)"
                                                                    placeholder="Dutch name"
                                                                    value={
                                                                        cat.nameTranslations?.nl ||
                                                                        ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'nameTranslations',
                                                                            {
                                                                                ...cat.nameTranslations,
                                                                                nl: value
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <InputBlock
                                                                    label="Category Name (EN)"
                                                                    placeholder="English name"
                                                                    value={
                                                                        cat.nameTranslations?.en ||
                                                                        ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'nameTranslations',
                                                                            {
                                                                                ...cat.nameTranslations,
                                                                                en: value
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <InputBlock
                                                                    label="Category Name (TA)"
                                                                    placeholder="Tamil name"
                                                                    value={
                                                                        cat.nameTranslations?.ta ||
                                                                        ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'nameTranslations',
                                                                            {
                                                                                ...cat.nameTranslations,
                                                                                ta: value
                                                                            }
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-4 md:grid-cols-3">
                                                                <TextAreaBlock
                                                                    label="Description (NL)"
                                                                    placeholder="Dutch description"
                                                                    value={
                                                                        cat
                                                                            .descriptionTranslations
                                                                            ?.nl || ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'descriptionTranslations',
                                                                            {
                                                                                ...cat.descriptionTranslations,
                                                                                nl: value
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <TextAreaBlock
                                                                    label="Description (EN)"
                                                                    placeholder="English description"
                                                                    value={
                                                                        cat
                                                                            .descriptionTranslations
                                                                            ?.en || ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'descriptionTranslations',
                                                                            {
                                                                                ...cat.descriptionTranslations,
                                                                                en: value
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <TextAreaBlock
                                                                    label="Description (TA)"
                                                                    placeholder="Tamil description"
                                                                    value={
                                                                        cat
                                                                            .descriptionTranslations
                                                                            ?.ta || ''
                                                                    }
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'descriptionTranslations',
                                                                            {
                                                                                ...cat.descriptionTranslations,
                                                                                ta: value
                                                                            }
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <NumberBlock
                                                                    label="Minimum Select"
                                                                    value={cat.minSelect}
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'minSelect',
                                                                            value
                                                                        )
                                                                    }
                                                                />

                                                                <NumberBlock
                                                                    label="Maximum Select"
                                                                    value={cat.maxSelect}
                                                                    onChange={(value) =>
                                                                        updateCategory(
                                                                            catIdx,
                                                                            'maxSelect',
                                                                            value
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="rounded-[22px] border border-slate-200 bg-stone-50 p-4">
                                                                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-900">
                                                                            Category Items
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                            Add menu choices that customers can pick from.
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            addItem(catIdx)
                                                                        }
                                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                                                                    >
                                                                        <Plus size={15} />
                                                                        Add Item
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {cat.items.length === 0 ? (
                                                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                                                                            No items added yet
                                                                        </div>
                                                                    ) : (
                                                                        cat.items.map(
                                                                            (
                                                                                item,
                                                                                itemIdx
                                                                            ) => {
                                                                                const selectedValue =
                                                                                    typeof item.menuItem ===
                                                                                        'object' &&
                                                                                    item.menuItem
                                                                                        ? item
                                                                                              .menuItem
                                                                                              ._id
                                                                                        : item.menuItem ||
                                                                                          '';

                                                                                return (
                                                                                    <div
                                                                                        key={itemIdx}
                                                                                        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                                                                                    >
                                                                                        <div className="flex-1">
                                                                                            <PremiumSelect
                                                                                                label={`Menu Item ${
                                                                                                    itemIdx +
                                                                                                    1
                                                                                                }`}
                                                                                                value={selectedValue}
                                                                                                onChange={(value) =>
                                                                                                    updateItem(
                                                                                                        catIdx,
                                                                                                        itemIdx,
                                                                                                        'menuItem',
                                                                                                        value
                                                                                                    )
                                                                                                }
                                                                                                options={[
                                                                                                    {
                                                                                                        value: '',
                                                                                                        label: 'Select Menu Item'
                                                                                                    },
                                                                                                    ...allMenuItems.map(
                                                                                                        (
                                                                                                            mi: any
                                                                                                        ) => ({
                                                                                                            value: mi._id,
                                                                                                            label: `${mi.name} - €${Number(
                                                                                                                mi.price ||
                                                                                                                    0
                                                                                                            ).toFixed(
                                                                                                                2
                                                                                                            )}`
                                                                                                        })
                                                                                                    )
                                                                                                ]}
                                                                                            />
                                                                                        </div>

                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                removeItem(
                                                                                                    catIdx,
                                                                                                    itemIdx
                                                                                                )
                                                                                            }
                                                                                            className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                                        >
                                                                                            <Trash2 size={15} />
                                                                                        </button>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1080px] space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                <UtensilsCrossed size={24} className="text-slate-900" />
                                Catering Packages
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Manage catering packages, multilingual package content, item groups
                                and customer selection rules in one clean editor.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <MetricCard label="Packages" value={stats.totalPackages} />
                                <MetricCard label="Active" value={stats.activePackages} />
                                <MetricCard
                                    label="Categories"
                                    value={stats.totalCategories}
                                />
                                <MetricCard label="Items" value={stats.totalItems} />
                            </div>

                            <button
                                type="button"
                                onClick={openNewPackage}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Plus size={16} />
                                New Package
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">Loading packages...</p>
                        </CardContent>
                    </Card>
                ) : packages.length === 0 ? (
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="px-6 py-16">
                            <EmptyState
                                title="No packages yet"
                                text="Create your first catering package to get started."
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {packages.map((pkg) => {
                            const categoryCount = pkg.categories.length;
                            const itemCount = pkg.categories.reduce(
                                (acc, cat) => acc + cat.items.length,
                                0
                            );

                            return (
                                <Card
                                    key={pkg._id}
                                    className="rounded-[26px] border border-slate-200 bg-white shadow-sm"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-[18px] font-semibold text-slate-900">
                                                        {pkg.nameTranslations?.nl || pkg.name}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                            pkg.available
                                                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border border-slate-200 bg-stone-50 text-slate-500'
                                                        }`}
                                                    >
                                                        {pkg.available
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </div>

                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                    {pkg.descriptionTranslations?.nl ||
                                                        pkg.description ||
                                                        'No description added'}
                                                </p>

                                                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                                    <MiniStat
                                                        icon={<Euro size={14} />}
                                                        label="Base Price"
                                                        value={`€ ${Number(
                                                            pkg.basePrice || 0
                                                        ).toFixed(2)}`}
                                                    />
                                                    <MiniStat
                                                        icon={<Users size={14} />}
                                                        label="Guests"
                                                        value={`${pkg.minGuests} - ${pkg.maxGuests}`}
                                                    />
                                                    <MiniStat
                                                        icon={<Layers3 size={14} />}
                                                        label="Categories"
                                                        value={String(categoryCount)}
                                                    />
                                                    <MiniStat
                                                        icon={<Box size={14} />}
                                                        label="Items"
                                                        value={String(itemCount)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 lg:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditPackage(pkg)}
                                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50"
                                                >
                                                    <Edit2 size={15} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(pkg._id!)
                                                    }
                                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={15} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value
}: {
    label: string;
    value: string | number;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
    );
};

const MiniStat = ({
    icon,
    label,
    value
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-stone-50 px-3 py-3">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {label}
                </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
};

const SummaryRow = ({
    label,
    value
}: {
    label: string;
    value: string;
}) => {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-slate-900">{value}</span>
        </div>
    );
};

const EmptyState = ({
    title,
    text
}: {
    title: string;
    text: string;
}) => {
    return (
        <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-400">
                <CheckCircle2 size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{text}</p>
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
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
};

const NumberBlock = ({
    label,
    value,
    onChange,
    step
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                type="number"
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
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
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
};

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
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
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
}) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                checked
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
            }`}
        >
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p
                    className={`mt-1 text-xs leading-5 ${
                        checked ? 'text-slate-300' : 'text-slate-500'
                    }`}
                >
                    {description}
                </p>
            </div>

            <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    checked ? 'bg-white text-slate-900' : 'bg-stone-100 text-slate-500'
                }`}
            >
                <CheckCircle2 size={16} />
            </div>
        </button>
    );
};