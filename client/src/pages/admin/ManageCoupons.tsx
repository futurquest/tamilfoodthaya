import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { api } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    Ban,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Copy,
    Filter,
    Hash,
    Layers3,
    Pencil,
    Percent,
    Plus,
    ReceiptText,
    RotateCcw,
    Search,
    Tag,
    TicketPercent,
    Trash2,
    TrendingUp,
    WalletCards,
    X
} from 'lucide-react';

type DiscountType = 'percentage' | 'fixed';
type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted';
type StatusFilter = 'all' | CouponStatus;
type DiscountFilter = 'all' | DiscountType;

type CouponForm = {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxUses: number;
    validFrom: string;
    validUntil: string;
};

interface Coupon extends CouponForm {
    _id: string;
    usedCount: number;
}

const EMPTY_FORM: CouponForm = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: 0,
    validFrom: '',
    validUntil: ''
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'All coupons' },
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'expired', label: 'Expired' },
    { value: 'exhausted', label: 'Used up' }
];

export const ManageCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all');

    const load = async () => {
        try {
            setLoading(true);
            setLoadError(false);
            const r = await api.get('/coupons');
            const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
            setCoupons(data);
        } catch {
            setCoupons([]);
            setLoadError(true);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

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
        const ended = coupons.filter((c) => {
            const status = getCouponStatus(c);
            return status === 'expired' || status === 'exhausted';
        }).length;
        const redemptions = coupons.reduce(
            (sum, coupon) => sum + Number(coupon.usedCount || 0),
            0
        );

        return { total, active, scheduled, ended, redemptions };
    }, [coupons]);

    const filteredCoupons = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return coupons.filter((coupon) => {
            const status = getCouponStatus(coupon);

            if (statusFilter !== 'all' && status !== statusFilter) return false;
            if (discountFilter !== 'all' && coupon.discountType !== discountFilter) return false;
            if (!query) return true;

            return [
                coupon.code,
                status,
                coupon.discountType,
                describeDiscount(coupon),
                formatCurrency(coupon.minOrderAmount),
                String(coupon.usedCount || 0),
                String(coupon.maxUses || 'unlimited'),
                coupon.validFrom ? formatDate(coupon.validFrom) : '',
                coupon.validUntil ? formatDate(coupon.validUntil) : ''
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [coupons, discountFilter, searchTerm, statusFilter]);

    const hasActiveFilters =
        Boolean(searchTerm.trim()) || statusFilter !== 'all' || discountFilter !== 'all';

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (coupon: Coupon) => {
        setEditing(coupon._id);
        setForm({
            code: coupon.code || '',
            discountType: coupon.discountType || 'percentage',
            discountValue: Number(coupon.discountValue || 0),
            minOrderAmount: Number(coupon.minOrderAmount || 0),
            maxUses: Number(coupon.maxUses || 0),
            validFrom: coupon.validFrom?.split('T')[0] || '',
            validUntil: coupon.validUntil?.split('T')[0] || ''
        });
        setFormError('');
        setShowForm(true);
    };

    const validateForm = () => {
        if (!form.code.trim()) return 'Enter a coupon code before saving.';
        if (Number(form.discountValue || 0) <= 0) return 'Enter a discount value greater than zero.';
        if (form.discountType === 'percentage' && Number(form.discountValue || 0) > 100) {
            return 'Percentage coupons cannot be more than 100%.';
        }
        if (
            form.validFrom &&
            form.validUntil &&
            new Date(form.validUntil) < new Date(form.validFrom)
        ) {
            return 'Valid until must be after the start date.';
        }

        return '';
    };

    const handleSave = async () => {
        const validationMessage = validateForm();

        if (validationMessage) {
            setFormError(validationMessage);
            toast.error(validationMessage);
            return;
        }

        try {
            setSaving(true);
            setFormError('');

            const payload: CouponForm = {
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
            const message = err?.response?.data?.message || 'The coupon could not be saved.';
            setFormError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this coupon? This cannot be undone.')) return;

        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            await load();
        } catch {
            toast.error('Failed to delete coupon');
        }
    };

    const handleCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(`${code} copied`);
        } catch {
            toast.error('Could not copy coupon code');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDiscountFilter('all');
    };

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="admin-command-hero min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-6 px-5 py-6 md:px-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                        <div className="min-w-0 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#251917] text-[#f4d38b]">
                                    <TicketPercent size={21} />
                                </span>
                                <h1 className="text-2xl font-extrabold text-slate-950 md:text-[32px]">
                                    Discount Coupons
                                </h1>
                            </div>
                            <p className="mt-3 max-w-[68ch] text-sm font-medium leading-6 text-slate-600">
                                Plan, monitor and retire restaurant offers with clear redemption
                                rules, campaign windows and usage limits.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openNew}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#251917] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,25,23,0.18)] transition hover:bg-[#3a2825] focus:outline-none focus:ring-4 focus:ring-amber-100 sm:w-auto"
                        >
                            <Plus size={17} />
                            Create coupon
                        </button>
                    </div>

                    <div className="grid grid-cols-2 border-t border-slate-200 bg-[#fbf6ed] sm:grid-cols-5">
                        <MetricCard label="Total" value={stats.total} icon={<Tag size={15} />} />
                        <MetricCard label="Active" value={stats.active} icon={<CheckCircle2 size={15} />} />
                        <MetricCard label="Scheduled" value={stats.scheduled} icon={<Clock3 size={15} />} />
                        <MetricCard label="Ended" value={stats.ended} icon={<Ban size={15} />} />
                        <MetricCard label="Redemptions" value={stats.redemptions} icon={<TrendingUp size={15} />} />
                    </div>
                </section>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(280px,1fr)_auto] xl:items-end">
                        <label className="relative block min-w-0">
                            <span className="sr-only">Search coupons</span>
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search code, status, discount, dates or usage"
                                className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </label>

                        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="grid min-w-0 gap-1.5">
                                <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                    <Percent size={13} /> Discount type
                                </span>
                                <div className="grid h-11 grid-cols-3 rounded-xl bg-stone-100 p-1">
                                    {([
                                        ['all', 'All'],
                                        ['percentage', 'Percent'],
                                        ['fixed', 'Fixed']
                                    ] as Array<[DiscountFilter, string]>).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setDiscountFilter(value)}
                                            aria-pressed={discountFilter === value}
                                            className={`rounded-lg px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                                                discountFilter === value
                                                    ? 'bg-white text-slate-950 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <PremiumSelect
                                compact
                                label="Status"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as StatusFilter)}
                                options={STATUS_OPTIONS}
                                icon={<Filter size={16} />}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-1 pt-3 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={13} /> Showing {filteredCoupons.length} of {coupons.length} coupons
                        </span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            >
                                <RotateCcw size={13} /> Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {loadError && !loading && (
                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p>Coupons could not be loaded.</p>
                            <button
                                type="button"
                                onClick={load}
                                className="mt-2 font-extrabold underline decoration-red-300 underline-offset-4"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <LoadingPanel />
                ) : coupons.length === 0 ? (
                    <EmptyState
                        title="No coupons yet"
                        copy="Create your first campaign code for a weekend special, catering follow-up or returning customer offer."
                        actionLabel="Create coupon"
                        onAction={openNew}
                    />
                ) : filteredCoupons.length === 0 ? (
                    <EmptyState
                        title="No matching coupons"
                        copy="Adjust the search or filters to see more campaign codes."
                        actionLabel="Clear filters"
                        onAction={clearFilters}
                    />
                ) : (
                    <CouponResults
                        coupons={filteredCoupons}
                        getCouponStatus={getCouponStatus}
                        onCopy={handleCopy}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}

                {showForm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
                        onClick={closeForm}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="coupon-editor-title"
                            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                                <div className="min-w-0">
                                    <h2 id="coupon-editor-title" className="text-xl font-extrabold text-slate-950">
                                        {editing ? 'Edit coupon' : 'Create coupon'}
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Define the code, discount, redemption limit and active dates.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    aria-label="Close coupon editor"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="max-h-[82vh] overflow-y-auto px-5 py-6 sm:px-6">
                                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
                                    <div className="min-w-0 space-y-6">
                                        <div>
                                            <SectionTitle
                                                title="Coupon rules"
                                                subtitle="Use short, memorable codes that staff can read quickly."
                                            />

                                            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                                                <InputBlock
                                                    label="Coupon code"
                                                    placeholder="SAVE20"
                                                    value={form.code}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            code: value.toUpperCase().replace(/\s/g, '')
                                                        }))
                                                    }
                                                    icon={<Hash size={16} />}
                                                    mono
                                                />

                                                <PremiumSelect
                                                    label="Discount type"
                                                    value={form.discountType}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            discountType: value as DiscountType
                                                        }))
                                                    }
                                                    options={[
                                                        { value: 'percentage', label: 'Percentage (%)' },
                                                        { value: 'fixed', label: 'Fixed amount (EUR)' }
                                                    ]}
                                                    icon={<Layers3 size={16} />}
                                                />
                                            </div>

                                            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-3">
                                                <NumberBlock
                                                    label={`Value (${form.discountType === 'percentage' ? '%' : 'EUR'})`}
                                                    value={form.discountValue}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            discountValue: value
                                                        }))
                                                    }
                                                />

                                                <NumberBlock
                                                    label="Minimum order"
                                                    value={form.minOrderAmount}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            minOrderAmount: value
                                                        }))
                                                    }
                                                />

                                                <NumberBlock
                                                    label="Max uses"
                                                    helper="0 means unlimited"
                                                    value={form.maxUses}
                                                    integer
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            maxUses: value
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <SectionTitle
                                                title="Campaign window"
                                                subtitle="Leave either date blank when the offer should stay open-ended."
                                            />

                                            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                                                <DateBlock
                                                    label="Valid from"
                                                    value={form.validFrom}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            validFrom: value
                                                        }))
                                                    }
                                                />

                                                <DateBlock
                                                    label="Valid until"
                                                    value={form.validUntil}
                                                    onChange={(value) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            validUntil: value
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-[#fbf6ed] p-4">
                                        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                                            <ReceiptText size={17} className="text-amber-700" />
                                            Campaign preview
                                        </div>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                                Code
                                            </p>
                                            <p className="mt-1 break-all text-2xl font-extrabold tracking-[0.05em] text-slate-950">
                                                {form.code.trim() || 'SAVE20'}
                                            </p>
                                            <p className="mt-3 text-sm font-bold text-slate-700">
                                                {describeDiscount(form)} off
                                            </p>
                                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                                Minimum order {formatCurrency(form.minOrderAmount)}.
                                                {form.maxUses > 0
                                                    ? ` Limited to ${form.maxUses} uses.`
                                                    : ' Unlimited uses.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 space-y-3 text-xs font-semibold text-slate-500">
                                            <PreviewLine label="Starts" value={form.validFrom ? formatDate(form.validFrom) : 'Immediately'} />
                                            <PreviewLine label="Ends" value={form.validUntil ? formatDate(form.validUntil) : 'No end date'} />
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
                                        type="button"
                                        onClick={closeForm}
                                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="h-11 rounded-xl bg-[#251917] px-5 text-sm font-bold text-white transition hover:bg-[#3a2825] focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? 'Saving...'
                                            : editing
                                            ? 'Save changes'
                                            : 'Create coupon'}
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

const CouponResults = ({
    coupons,
    getCouponStatus,
    onCopy,
    onEdit,
    onDelete
}: {
    coupons: Coupon[];
    getCouponStatus: (coupon: Coupon) => CouponStatus;
    onCopy: (code: string) => void;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
}) => (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1040px] text-sm">
                <thead className="border-b border-slate-200 bg-[#fbf6ed]">
                    <tr>
                        <TableHeader>Code</TableHeader>
                        <TableHeader>Discount</TableHeader>
                        <TableHeader>Minimum order</TableHeader>
                        <TableHeader>Usage</TableHeader>
                        <TableHeader>Validity</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader align="right">Actions</TableHeader>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {coupons.map((coupon) => {
                        const status = getCouponStatus(coupon);

                        return (
                            <tr key={coupon._id} className="transition hover:bg-stone-50/70">
                                <td className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onCopy(coupon.code)}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                        title="Copy coupon code"
                                    >
                                        <span className="font-extrabold tracking-[0.08em] text-slate-950">
                                            {coupon.code}
                                        </span>
                                        <Copy size={13} className="text-slate-400 transition group-hover:text-amber-700" />
                                    </button>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm font-extrabold text-slate-900">
                                        <Percent size={14} className="text-amber-700" />
                                        {describeDiscount(coupon)}
                                    </div>
                                </td>

                                <td className="px-5 py-4 font-semibold text-slate-600">
                                    {formatCurrency(coupon.minOrderAmount)}
                                </td>

                                <td className="px-5 py-4">
                                    <UsageMeter coupon={coupon} />
                                </td>

                                <td className="px-5 py-4">
                                    <DateRange coupon={coupon} />
                                </td>

                                <td className="px-5 py-4">
                                    <StatusBadge status={status} />
                                </td>

                                <td className="px-5 py-4">
                                    <ActionGroup coupon={coupon} onEdit={onEdit} onDelete={onDelete} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
            {coupons.map((coupon) => (
                <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    status={getCouponStatus(coupon)}
                    onCopy={onCopy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    </div>
);

const CouponCard = ({
    coupon,
    status,
    onCopy,
    onEdit,
    onDelete
}: {
    coupon: Coupon;
    status: CouponStatus;
    onCopy: (code: string) => void;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
}) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <button
                type="button"
                onClick={() => onCopy(coupon.code)}
                className="min-w-0 rounded-xl border border-slate-200 bg-[#fbf6ed] px-3 py-2 text-left transition hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
                <span className="block break-all text-lg font-extrabold tracking-[0.08em] text-slate-950">
                    {coupon.code}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Copy size={12} /> Tap to copy
                </span>
            </button>
            <StatusBadge status={status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <InfoTile label="Discount" value={describeDiscount(coupon)} icon={<Percent size={14} />} />
            <InfoTile label="Minimum" value={formatCurrency(coupon.minOrderAmount)} icon={<WalletCards size={14} />} />
        </div>

        <div className="mt-4 rounded-xl bg-[#fbf6ed] p-3">
            <UsageMeter coupon={coupon} />
            <div className="mt-3">
                <DateRange coupon={coupon} />
            </div>
        </div>

        <div className="mt-4">
            <ActionGroup coupon={coupon} onEdit={onEdit} onDelete={onDelete} mobile />
        </div>
    </article>
);

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => (
    <div className="min-w-0 border-slate-200 px-4 py-4 odd:border-r sm:border-r sm:last:border-r-0 md:px-5">
        <div className="flex items-center gap-2 text-slate-500">
            {icon}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.1em]">{label}</p>
        </div>
        <p className="mt-1.5 text-xl font-extrabold tabular-nums text-slate-950">{value}</p>
    </div>
);

const EmptyState = ({
    title,
    copy,
    actionLabel,
    onAction
}: {
    title: string;
    copy: string;
    actionLabel: string;
    onAction: () => void;
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-[#fbf6ed] text-slate-500">
            <TicketPercent size={24} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{copy}</p>
        <button
            type="button"
            onClick={onAction}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#251917] px-5 text-sm font-bold text-white transition hover:bg-[#3a2825] focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
            <Plus size={16} />
            {actionLabel}
        </button>
    </div>
);

const LoadingPanel = () => (
    <div aria-label="Loading coupons" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="min-h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm motion-reduce:animate-none"
            >
                <div className="flex justify-between gap-4">
                    <div className="h-10 w-32 rounded-xl bg-stone-200" />
                    <div className="h-8 w-20 rounded-lg bg-stone-100" />
                </div>
                <div className="mt-6 h-5 w-3/5 rounded bg-stone-200" />
                <div className="mt-3 h-4 w-full rounded bg-stone-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-stone-100" />
                <div className="mt-8 h-12 rounded-xl bg-stone-100" />
            </div>
        ))}
    </div>
);

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => (
    <div>
        <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
);

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
}) => (
    <div className="min-w-0 rounded-2xl bg-[#fbf6ed] p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
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
                className={`h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                    icon ? 'pl-11 pr-4' : 'px-4'
                } ${mono ? 'tracking-[0.08em]' : ''}`}
            />
        </div>
    </div>
);

const NumberBlock = ({
    label,
    helper,
    value,
    onChange,
    integer
}: {
    label: string;
    helper?: string;
    value: number;
    onChange: (value: number) => void;
    integer?: boolean;
}) => (
    <div className="min-w-0 rounded-2xl bg-[#fbf6ed] p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
        <input
            type="number"
            min="0"
            step={integer ? '1' : '0.01'}
            value={value}
            onChange={(e) =>
                onChange(integer ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)
            }
            className="h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold tabular-nums text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
        {helper && <p className="mt-2 text-xs font-semibold text-slate-500">{helper}</p>}
    </div>
);

const DateBlock = ({
    label,
    value,
    onChange
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) => (
    <div className="min-w-0 rounded-2xl bg-[#fbf6ed] p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
        <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <CalendarDays size={16} />
            </span>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
        </div>
    </div>
);

const PremiumSelect = ({
    label,
    value,
    onChange,
    options,
    icon,
    compact
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: ReactNode;
    compact?: boolean;
}) => (
    <div className={compact ? 'grid gap-1.5' : 'min-w-0 rounded-2xl bg-[#fbf6ed] p-4'}>
        <label className={`${compact ? 'px-1 text-[11px] uppercase tracking-[0.1em] text-slate-500' : 'mb-2 text-sm text-slate-800'} flex items-center gap-1.5 font-bold`}>
            {compact && icon}
            {label}
        </label>
        <div className="relative">
            {!compact && icon && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                    !compact && icon ? 'pl-11 pr-10' : 'px-4 pr-10'
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

const TableHeader = ({
    children,
    align = 'left'
}: {
    children: ReactNode;
    align?: 'left' | 'right';
}) => (
    <th className={`px-5 py-4 ${align === 'right' ? 'text-right' : 'text-left'} text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500`}>
        {children}
    </th>
);

const UsageMeter = ({ coupon }: { coupon: Coupon }) => {
    const used = Number(coupon.usedCount || 0);
    const limit = Number(coupon.maxUses || 0);
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    return (
        <div className="min-w-[160px]">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                <span>{used} used</span>
                <span>{limit > 0 ? `${limit} limit` : 'Unlimited'}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                    className="h-full rounded-full bg-[#39533b]"
                    style={{ width: limit > 0 ? `${percent}%` : '0%' }}
                />
            </div>
        </div>
    );
};

const DateRange = ({ coupon }: { coupon: Coupon }) => (
    <div className="text-xs font-semibold leading-5 text-slate-500">
        <div>From {coupon.validFrom ? formatDate(coupon.validFrom) : 'Immediately'}</div>
        <div>Until {coupon.validUntil ? formatDate(coupon.validUntil) : 'No end date'}</div>
    </div>
);

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
            label: 'Used up',
            className: 'border-amber-200 bg-amber-50 text-amber-700'
        }
    };

    const config = map[status];

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${config.className}`}>
            {config.label}
        </span>
    );
};

const ActionGroup = ({
    coupon,
    onEdit,
    onDelete,
    mobile
}: {
    coupon: Coupon;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
    mobile?: boolean;
}) => (
    <div className={`flex items-center gap-2 ${mobile ? 'grid grid-cols-2' : 'justify-end'}`}>
        <button
            type="button"
            onClick={() => onEdit(coupon)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
            <Pencil size={14} />
            Edit
        </button>

        <button
            type="button"
            onClick={() => onDelete(coupon._id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
        >
            <Trash2 size={14} />
            Delete
        </button>
    </div>
);

const InfoTile = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string;
    icon: ReactNode;
}) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {icon}
            {label}
        </p>
        <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
    </div>
);

const PreviewLine = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
        <span>{label}</span>
        <span className="text-right font-extrabold text-slate-800">{value}</span>
    </div>
);

const describeDiscount = (coupon: Pick<CouponForm, 'discountType' | 'discountValue'>) => {
    if (coupon.discountType === 'percentage') return `${Number(coupon.discountValue || 0)}%`;
    return formatCurrency(coupon.discountValue);
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(Number(value || 0));
};

const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};
