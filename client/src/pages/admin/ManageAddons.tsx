import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
    Sparkles,
    ChevronDown,
    X,
    Package,
    Euro,
    Layers3,
    Wand2
} from 'lucide-react';

type PricingType = 'fixed' | 'per_person';
type CategoryType =
    | 'decoration'
    | 'entertainment'
    | 'service'
    | 'extra_time'
    | 'other';

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
    extra_time: <Baby size={16} />,
    other: <Camera size={16} />
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

const PRESETS: Array<Partial<AddonForm> & { icon: ReactNode }> = [
    {
        name: 'DJ & Music',
        description:
            'Professional DJ with full sound system and lighting for 4 hours.',
        price: 350,
        pricingType: 'fixed',
        category: 'entertainment',
        icon: <Music size={16} />
    },
    {
        name: 'Flower Decoration',
        description: 'Elegant floral arrangements for tables and entrance.',
        price: 200,
        pricingType: 'fixed',
        category: 'decoration',
        icon: <Flower2 size={16} />
    },
    {
        name: 'Welcome Drinks',
        description:
            'Mocktail / juice welcome drinks for all guests on arrival.',
        price: 8,
        pricingType: 'per_person',
        category: 'service',
        icon: <Wine size={16} />
    },
    {
        name: "Kids' Menu",
        description: 'Specially prepared mild dishes for children under 12.',
        price: 12,
        pricingType: 'per_person',
        category: 'service',
        icon: <Baby size={16} />
    },
    {
        name: 'Photographer',
        description: 'Professional event photographer for up to 5 hours.',
        price: 450,
        pricingType: 'fixed',
        category: 'other',
        icon: <Camera size={16} />
    }
];

export const ManageAddons = () => {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<AddonForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const stats = useMemo(() => {
        const total = addons.length;
        const fixed = addons.filter((a) => a.pricingType === 'fixed').length;
        const perPerson = addons.filter(
            (a) => a.pricingType === 'per_person'
        ).length;
        const categories = new Set(addons.map((a) => a.category)).size;

        return { total, fixed, perPerson, categories };
    }, [addons]);

    const load = async () => {
        try {
            setLoading(true);
            const response = await api.get('/addons');
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
            setAddons(data);
        } catch {
            setAddons([]);
            toast.error('Failed to load add-ons');
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
                toast.error('Please enter at least the Dutch name');
                return;
            }

            setSaving(true);

            if (editing) {
                await api.put(`/addons/${editing}`, payload);
                toast.success('Add-on updated');
            } else {
                await api.post('/addons', payload);
                toast.success('Add-on created');
            }

            closeForm();
            await load();
        } catch {
            toast.error('Failed to save add-on');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this add-on?')) return;

        try {
            await api.delete(`/addons/${id}`);
            toast.success('Deleted');
            await load();
        } catch {
            toast.error('Failed to delete');
        }
    };

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
                                <Sparkles size={24} className="text-slate-900" />
                                Event Add-ons
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Manage optional extras guests can add to their
                                catering package.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <MetricCard label="Add-ons" value={stats.total} />
                                <MetricCard label="Fixed" value={stats.fixed} />
                                <MetricCard
                                    label="Per Person"
                                    value={stats.perPerson}
                                />
                                <MetricCard
                                    label="Categories"
                                    value={stats.categories}
                                />
                            </div>

                            <button
                                onClick={() => openNew()}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Plus size={16} />
                                New Add-on
                            </button>
                        </div>
                    </div>
                </div>

                {addons.length === 0 && !loading && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-600">
                                <Wand2 size={18} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-[15px] font-semibold text-slate-900">
                                    Quick Presets
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Click one to start with a common add-on.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={String(preset.name)}
                                            onClick={() => openNew(preset)}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50"
                                        >
                                            {preset.icon}
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <p className="text-sm text-slate-400">Loading add-ons...</p>
                    </div>
                ) : addons.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
                            <Package size={22} className="text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No add-ons yet
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Click <strong>New Add-on</strong> to create the first
                            option.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {addons.map((addon) => (
                            <div
                                key={addon._id}
                                className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_STYLES[addon.category]}`}
                                    >
                                        {CATEGORY_ICONS[addon.category]}
                                        {formatCategory(addon.category)}
                                    </span>

                                    <div className="flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                                        <button
                                            onClick={() => openEdit(addon)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-stone-50 hover:text-slate-700"
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(addon._id)
                                            }
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-[16px] font-semibold text-slate-900">
                                    {addon.nameTranslations?.nl || addon.name}
                                </h3>

                                <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500">
                                    {addon.descriptionTranslations?.nl ||
                                        addon.description ||
                                        'No description added'}
                                </p>

                                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Euro size={14} />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                                            Price
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-base font-semibold text-slate-900">
                                            € {Number(addon.price || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {addon.pricingType === 'per_person'
                                                ? 'per person'
                                                : 'fixed'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showForm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
                        onClick={closeForm}
                    >
                        <div
                            className="w-full max-w-3xl rounded-[30px] border border-slate-200 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        Add-on Editor
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                        {editing ? 'Edit Add-on' : 'New Add-on'}
                                    </h2>
                                </div>

                                <button
                                    onClick={closeForm}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
                                <div className="space-y-6">
                                    <div>
                                        <SectionTitle
                                            title="Names"
                                            subtitle="Add multilingual display names."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                                            <InputBlock
                                                label="Name (NL)"
                                                placeholder="Dutch name"
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
                                                label="Name (EN)"
                                                placeholder="English name"
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
                                                label="Name (TA)"
                                                placeholder="Tamil name"
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
                                            title="Descriptions"
                                            subtitle="Add descriptions in each language."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                                            <TextAreaBlock
                                                label="Description (NL)"
                                                placeholder="Dutch description"
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
                                                label="Description (EN)"
                                                placeholder="English description"
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
                                                label="Description (TA)"
                                                placeholder="Tamil description"
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
                                            title="Pricing & Category"
                                            subtitle="Configure how this add-on is billed."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                                            <NumberBlock
                                                label="Price (€)"
                                                value={form.price}
                                                onChange={(value) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        price: value
                                                    }))
                                                }
                                            />

                                            <PremiumSelect
                                                label="Pricing Type"
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
                                                        label: 'Fixed Price'
                                                    },
                                                    {
                                                        value: 'per_person',
                                                        label: 'Per Person'
                                                    }
                                                ]}
                                                icon={<Euro size={16} />}
                                            />

                                            <PremiumSelect
                                                label="Category"
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
                                                        label: 'Decoration'
                                                    },
                                                    {
                                                        value: 'entertainment',
                                                        label: 'Entertainment'
                                                    },
                                                    {
                                                        value: 'service',
                                                        label: 'Service'
                                                    },
                                                    {
                                                        value: 'extra_time',
                                                        label: 'Extra Time'
                                                    },
                                                    {
                                                        value: 'other',
                                                        label: 'Other'
                                                    }
                                                ]}
                                                icon={<Layers3 size={16} />}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={closeForm}
                                        className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {saving
                                            ? 'Saving...'
                                            : editing
                                            ? 'Save Changes'
                                            : 'Create Add-on'}
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
    onChange
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                type="number"
                min="0"
                step="0.01"
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
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
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
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
                    className={`h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100 ${
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