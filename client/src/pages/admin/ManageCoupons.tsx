import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { api } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import {
    Plus,
    Pencil,
    Trash2,
    Tag,
    X,
    Percent,
    CalendarDays,
    Hash,
    Layers3,
    CheckCircle2,
    Clock3,
    Ban,
    TicketPercent,
    ChevronDown
} from 'lucide-react';

const EMPTY_FORM = {
    code: '',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: 0,
    validFrom: '',
    validUntil: ''
};

type CouponForm = typeof EMPTY_FORM;

interface Coupon extends CouponForm {
    _id: string;
    usedCount: number;
}

type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted';

export const ManageCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const r = await api.get('/coupons');
            const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
            setCoupons(data);
        } catch {
            setCoupons([]);
            toast.error('Failed to load coupons');
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

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (c: Coupon) => {
        setEditing(c._id);
        setForm({
            code: c.code || '',
            discountType: c.discountType,
            discountValue: Number(c.discountValue || 0),
            minOrderAmount: Number(c.minOrderAmount || 0),
            maxUses: Number(c.maxUses || 0),
            validFrom: c.validFrom?.split('T')[0] || '',
            validUntil: c.validUntil?.split('T')[0] || ''
        });
        setShowForm(true);
    };

    const getCouponStatus = (c: Coupon): CouponStatus => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const from = c.validFrom ? new Date(c.validFrom) : null;
        const until = c.validUntil ? new Date(c.validUntil) : null;

        if (from) from.setHours(0, 0, 0, 0);
        if (until) until.setHours(23, 59, 59, 999);

        if (c.maxUses > 0 && (c.usedCount || 0) >= c.maxUses) return 'exhausted';
        if (from && from > today) return 'scheduled';
        if (until && until < new Date()) return 'expired';
        return 'active';
    };

    const stats = useMemo(() => {
        const total = coupons.length;
        const active = coupons.filter((c) => getCouponStatus(c) === 'active').length;
        const scheduled = coupons.filter((c) => getCouponStatus(c) === 'scheduled').length;
        const expired = coupons.filter((c) => {
            const s = getCouponStatus(c);
            return s === 'expired' || s === 'exhausted';
        }).length;

        return { total, active, scheduled, expired };
    }, [coupons]);

    const handleSave = async () => {
        if (!form.code.trim()) {
            toast.error('Coupon code is required');
            return;
        }

        if (
            form.validFrom &&
            form.validUntil &&
            new Date(form.validUntil) < new Date(form.validFrom)
        ) {
            toast.error('Valid until date must be after valid from date');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...form,
                code: form.code.trim().toUpperCase(),
                discountValue: Number(form.discountValue || 0),
                minOrderAmount: Number(form.minOrderAmount || 0),
                maxUses: Number(form.maxUses || 0)
            };

            if (editing) {
                await api.put(`/coupons/${editing}`, payload);
                toast.success('Coupon updated');
            } else {
                await api.post('/coupons', payload);
                toast.success('Coupon created');
            }

            closeForm();
            await load();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this coupon?')) return;

        try {
            setLoading(true);
            await api.delete(`/coupons/${id}`);
            toast.success('Deleted');
            await load();
        } catch {
            toast.error('Failed');
            setLoading(false);
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
                                <TicketPercent size={24} className="text-slate-900" />
                                Discount Coupons
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Create and manage coupon codes for offers, campaigns and customer discounts.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <MetricCard label="Coupons" value={stats.total} icon={<Tag size={16} />} />
                                <MetricCard label="Active" value={stats.active} icon={<CheckCircle2 size={16} />} />
                                <MetricCard label="Scheduled" value={stats.scheduled} icon={<Clock3 size={16} />} />
                                <MetricCard label="Ended" value={stats.expired} icon={<Ban size={16} />} />
                            </div>

                            <button
                                onClick={openNew}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Plus size={16} />
                                New Coupon
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="px-6 py-16 text-center text-sm text-slate-400">
                            Loading coupons...
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
                                <Tag size={22} className="text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No coupons yet
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Click <strong>New Coupon</strong> to create the first one.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="border-b border-slate-200 bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Code
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Discount
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Min Order
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Uses
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Validity
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {coupons.map((c) => {
                                        const status = getCouponStatus(c);

                                        return (
                                            <tr key={c._id} className="transition hover:bg-stone-50/70">
                                                <td className="px-6 py-4">
                                                    <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-bold tracking-[0.18em] text-slate-800">
                                                        {c.code}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-slate-900">
                                                        <Percent size={14} className="text-slate-400" />
                                                        {c.discountType === 'percentage'
                                                            ? `${c.discountValue}%`
                                                            : `€${Number(c.discountValue || 0).toFixed(2)}`}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    €{Number(c.minOrderAmount || 0).toFixed(2)}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {c.usedCount || 0} / {c.maxUses || '∞'}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-slate-500">
                                                        <div>
                                                            From: {c.validFrom ? formatDate(c.validFrom) : '—'}
                                                        </div>
                                                        <div className="mt-1">
                                                            Until: {c.validUntil ? formatDate(c.validUntil) : '—'}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge status={status} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(c)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(c._id)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {showForm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
                        onClick={closeForm}
                    >
                        <div
                            className="w-full max-w-2xl rounded-[30px] border border-slate-200 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        Coupon Editor
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                        {editing ? 'Edit Coupon' : 'New Coupon'}
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
                                            title="Coupon Details"
                                            subtitle="Set the code and discount behavior."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <InputBlock
                                                label="Coupon Code"
                                                placeholder="SAVE20"
                                                value={form.code}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        code: value.toUpperCase()
                                                    }))
                                                }
                                                icon={<Hash size={16} />}
                                                mono
                                            />

                                            <PremiumSelect
                                                label="Discount Type"
                                                value={form.discountType}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        discountType: value as CouponForm['discountType']
                                                    }))
                                                }
                                                options={[
                                                    { value: 'percentage', label: 'Percentage (%)' },
                                                    { value: 'fixed', label: 'Fixed Amount (€)' }
                                                ]}
                                                icon={<Layers3 size={16} />}
                                            />
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                                            <NumberBlock
                                                label={`Value (${form.discountType === 'percentage' ? '%' : '€'})`}
                                                value={form.discountValue}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        discountValue: value
                                                    }))
                                                }
                                            />

                                            <NumberBlock
                                                label="Min Order Amount (€)"
                                                value={form.minOrderAmount}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        minOrderAmount: value
                                                    }))
                                                }
                                            />

                                            <NumberBlock
                                                label="Max Uses (0 = unlimited)"
                                                value={form.maxUses}
                                                integer
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        maxUses: value
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionTitle
                                            title="Validity"
                                            subtitle="Choose when the coupon becomes active and expires."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <DateBlock
                                                label="Valid From"
                                                value={form.validFrom}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        validFrom: value
                                                    }))
                                                }
                                            />

                                            <DateBlock
                                                label="Valid Until"
                                                value={form.validUntil}
                                                onChange={(value) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        validUntil: value
                                                    }))
                                                }
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
                                            : 'Create Coupon'}
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
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <p className="text-[11px] font-medium uppercase tracking-[0.18em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
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
    onChange,
    icon,
    mono
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    icon?: ReactNode;
    mono?: boolean;
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

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`h-11 w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 ${
                        icon ? 'pl-11 pr-4' : 'px-4'
                    } ${mono ? 'font-mono tracking-[0.18em]' : ''}`}
                />
            </div>
        </div>
    );
};

const NumberBlock = ({
    label,
    value,
    onChange,
    integer
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    integer?: boolean;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                type="number"
                min="0"
                step={integer ? '1' : '0.01'}
                value={value}
                onChange={(e) =>
                    onChange(integer ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
};

const DateBlock = ({
    label,
    value,
    onChange
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <CalendarDays size={16} />
                </span>

                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                />
            </div>
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

const StatusBadge = ({ status }: { status: CouponStatus }) => {
    const map: Record<CouponStatus, { label: string; className: string }> = {
        active: {
            label: 'Active',
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
        },
        scheduled: {
            label: 'Scheduled',
            className: 'border-blue-200 bg-blue-50 text-blue-700'
        },
        expired: {
            label: 'Expired',
            className: 'border-red-200 bg-red-50 text-red-700'
        },
        exhausted: {
            label: 'Used Up',
            className: 'border-amber-200 bg-amber-50 text-amber-700'
        }
    };

    const config = map[status];

    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}>
            {config.label}
        </span>
    );
};

const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};