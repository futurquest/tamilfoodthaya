import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import {
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    ClipboardList,
    FileText,
    Filter,
    LayoutGrid,
    List,
    Mail,
    MapPin,
    Phone,
    Search,
    SlidersHorizontal,
    Users,
    UtensilsCrossed
} from 'lucide-react';
import {
    getCateringOrders,
    updateCateringOrderStatus
} from '../../hooks/useApi';
import { toast } from 'react-hot-toast';

interface CateringOrder {
    _id: string;
    packageName: string;
    selections: {
        categoryName: string;
        selectedItems: {
            itemName: string;
            choiceName?: string;
            price: number;
        }[];
    }[];
    guests: number;
    eventDate: string;
    eventLocation: string;
    pricePerPerson: number;
    totalPrice: number;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
    };
    status: string;
    paymentStatus: string;
    createdAt: string;
}

const STATUS_OPTIONS = [
    'pending',
    'reviewing',
    'quoted',
    'confirmed',
    'paid',
    'preparing',
    'completed',
    'cancelled'
] as const;

const statusMeta: Record<
    string,
    {
        label: string;
        chipClass: string;
        menuClass: string;
        dotClass: string;
    }
> = {
    pending: {
        label: 'Pending',
        chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
        menuClass: 'hover:bg-amber-50',
        dotClass: 'bg-amber-500'
    },
    reviewing: {
        label: 'Reviewing',
        chipClass: 'border-blue-200 bg-blue-50 text-blue-700',
        menuClass: 'hover:bg-blue-50',
        dotClass: 'bg-blue-500'
    },
    quoted: {
        label: 'Quoted',
        chipClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        menuClass: 'hover:bg-indigo-50',
        dotClass: 'bg-indigo-500'
    },
    confirmed: {
        label: 'Confirmed',
        chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        menuClass: 'hover:bg-emerald-50',
        dotClass: 'bg-emerald-500'
    },
    paid: {
        label: 'Paid',
        chipClass: 'border-green-200 bg-green-50 text-green-700',
        menuClass: 'hover:bg-green-50',
        dotClass: 'bg-green-500'
    },
    preparing: {
        label: 'Preparing',
        chipClass: 'border-purple-200 bg-purple-50 text-purple-700',
        menuClass: 'hover:bg-purple-50',
        dotClass: 'bg-purple-500'
    },
    completed: {
        label: 'Completed',
        chipClass: 'border-slate-200 bg-stone-50 text-slate-700',
        menuClass: 'hover:bg-stone-50',
        dotClass: 'bg-slate-500'
    },
    cancelled: {
        label: 'Cancelled',
        chipClass: 'border-red-200 bg-red-50 text-red-700',
        menuClass: 'hover:bg-red-50',
        dotClass: 'bg-red-500'
    }
};

const paymentStyles: Record<string, string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    unpaid: 'border-orange-200 bg-orange-50 text-orange-700',
    failed: 'border-red-200 bg-red-50 text-red-700'
};

export const ManageCateringOrders = () => {
    const [orders, setOrders] = useState<CateringOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getCateringOrders();
            const normalized = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                ? response.data
                : [];
            setOrders(normalized);
        } catch {
            toast.error('Failed to load catering orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const closeDropdowns = () => setOpenDropdown(null);
        document.addEventListener('click', closeDropdowns);
        return () => document.removeEventListener('click', closeDropdowns);
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const current = orders.find((order) => order._id === id);
        if (!current || current.status === newStatus) return;

        try {
            setUpdatingOrderId(id);
            await updateCateringOrderStatus(id, newStatus);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order._id === id ? { ...order, status: newStatus } : order
                )
            );

            toast.success(`Order status updated to ${formatStatus(newStatus)}`);
        } catch {
            toast.error('Failed to update status. Please try again.');
        } finally {
            setUpdatingOrderId(null);
            setOpenDropdown(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (filterStatus && order.status !== filterStatus) return false;

            if (search.trim()) {
                const s = search.toLowerCase();
                return (
                    order.customerInfo?.name?.toLowerCase().includes(s) ||
                    order.customerInfo?.email?.toLowerCase().includes(s) ||
                    order.customerInfo?.phone?.toLowerCase().includes(s) ||
                    order.packageName?.toLowerCase().includes(s) ||
                    order._id?.toLowerCase().includes(s)
                );
            }

            return true;
        });
    }, [orders, filterStatus, search]);

    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((o) => o.status === 'pending').length;
        const confirmed = orders.filter(
            (o) => o.status === 'confirmed' || o.status === 'paid'
        ).length;
        const revenue = orders.reduce(
            (sum, order) => sum + Number(order.totalPrice || 0),
            0
        );

        return { total, pending, confirmed, revenue };
    }, [orders]);

    const statusCounts = useMemo(() => {
        return STATUS_OPTIONS.reduce<Record<string, number>>((acc, status) => {
            acc[status] = orders.filter((order) => order.status === status).length;
            return acc;
        }, {});
    }, [orders]);

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <div className="overflow-hidden rounded-[28px] bg-[#24140f] text-white shadow-[0_24px_70px_rgba(36,20,15,0.18)]">
                    <div className="relative px-5 py-6 md:px-7">
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.28),transparent_42%)]" />
                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-2xl">
                                <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-[#fff8ed] md:text-[32px]">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f59e0b] text-[#24140f]">
                                        <UtensilsCrossed size={23} />
                                    </span>
                                    Catering Orders
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-[#f8e8cf]/75 md:text-[15px]">
                                    Manage event bookings, customer selections, payment state
                                    and kitchen progress from one focused operations view.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[500px]">
                                <MetricCard
                                    label="Orders"
                                    value={stats.total}
                                    icon={<ClipboardList size={16} />}
                                    tone="dark"
                                />
                                <MetricCard
                                    label="Pending"
                                    value={stats.pending}
                                    icon={<Calendar size={16} />}
                                    tone="dark"
                                />
                                <MetricCard
                                    label="Confirmed"
                                    value={stats.confirmed}
                                    icon={<CheckCircle2 size={16} />}
                                    tone="dark"
                                />
                                <MetricCard
                                    label="Revenue"
                                    value={`€ ${stats.revenue.toFixed(2)}`}
                                    icon={<CircleDollarSign size={16} />}
                                    tone="dark"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <StatusTab
                            label="All orders"
                            count={orders.length}
                            active={filterStatus === ''}
                            onClick={() => setFilterStatus('')}
                        />
                        {STATUS_OPTIONS.map((status) => (
                            <StatusTab
                                key={status}
                                label={statusMeta[status]?.label || formatStatus(status)}
                                count={statusCounts[status] || 0}
                                active={filterStatus === status}
                                dotClass={statusMeta[status]?.dotClass}
                                onClick={() => setFilterStatus(status)}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customer, email, phone, package or order ID"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <FilterDropdown
                                value={filterStatus}
                                isOpen={openDropdown === 'filter-status'}
                                onToggle={() =>
                                    setOpenDropdown((prev) =>
                                        prev === 'filter-status' ? null : 'filter-status'
                                    )
                                }
                                onSelect={(value) => {
                                    setFilterStatus(value);
                                    setOpenDropdown(null);
                                }}
                            />

                            <div className="grid h-12 grid-cols-2 rounded-2xl border border-slate-200 bg-stone-50 p-1">
                                <ViewButton
                                    active={viewMode === 'grid'}
                                    label="Grid"
                                    icon={<LayoutGrid size={16} />}
                                    onClick={() => setViewMode('grid')}
                                />
                                <ViewButton
                                    active={viewMode === 'list'}
                                    label="List"
                                    icon={<List size={16} />}
                                    onClick={() => setViewMode('list')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <SlidersHorizontal size={14} className="text-slate-400" />
                        Showing {filteredOrders.length} of {orders.length} catering orders
                        {filterStatus ? ` in ${formatStatus(filterStatus)}` : ''}
                    </div>
                </div>

                {loading ? (
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">
                                Loading catering orders...
                            </p>
                        </CardContent>
                    </Card>
                ) : filteredOrders.length === 0 ? (
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-400">
                                <UtensilsCrossed size={20} />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No catering orders match this view
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Clear the search or choose another status to review more bookings.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid gap-4 xl:grid-cols-2'
                                : 'space-y-3'
                        }
                    >
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrder === order._id;
                            const paymentClass =
                                paymentStyles[order.paymentStatus] ||
                                'border-slate-200 bg-stone-50 text-slate-700';

                            return (
                                <Card
                                    key={order._id}
                                    className="overflow-visible rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
                                >
                                    <CardContent className="overflow-visible p-5 md:p-6">
                                        <button
                                            type="button"
                                            className="w-full text-left"
                                            onClick={() =>
                                                setExpandedOrder(
                                                    isExpanded ? null : order._id
                                                )
                                            }
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.18em] text-slate-500">
                                                            #{String(order._id).slice(-6).toUpperCase()}
                                                        </span>

                                                        <span
                                                            className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                                                statusMeta[order.status]?.chipClass ||
                                                                'border-slate-200 bg-stone-50 text-slate-700'
                                                            }`}
                                                        >
                                                            {formatStatus(order.status)}
                                                        </span>

                                                        <span
                                                            className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${paymentClass}`}
                                                        >
                                                            {formatStatus(order.paymentStatus)}
                                                        </span>
                                                    </div>

                                                    <h3 className="break-words text-[18px] font-semibold text-slate-900">
                                                        {order.customerInfo?.name || 'Unknown Customer'}
                                                    </h3>

                                                    <p className="mt-1 break-words text-sm text-slate-500">
                                                        {order.packageName || 'No package name'}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5">
                                                            <Calendar size={14} />
                                                            {formatDate(order.eventDate)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5">
                                                            <Users size={14} />
                                                            {order.guests || 0} guests
                                                        </span>
                                                        {order.eventLocation && (
                                                            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5">
                                                                <MapPin size={14} className="shrink-0" />
                                                                <span className="truncate">
                                                                    {order.eventLocation}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4 lg:justify-end">
                                                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-left lg:text-right">
                                                        <p className="text-sm text-slate-400">
                                                            Total
                                                        </p>
                                                        <p className="text-2xl font-semibold text-slate-900">
                                                            € {Number(order.totalPrice || 0).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            € {Number(order.pricePerPerson || 0).toFixed(2)} p.p.
                                                        </p>
                                                    </div>

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                                                        {isExpanded ? (
                                                            <ChevronUp size={18} />
                                                        ) : (
                                                            <ChevronDown size={18} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-6 space-y-5 overflow-visible border-t border-slate-200 pt-5">
                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                    <InfoCard
                                                        icon={<Mail size={14} />}
                                                        label="Email"
                                                        value={order.customerInfo?.email || '-'}
                                                    />
                                                    <InfoCard
                                                        icon={<Phone size={14} />}
                                                        label="Phone"
                                                        value={order.customerInfo?.phone || '-'}
                                                    />
                                                    <InfoCard
                                                        icon={<Calendar size={14} />}
                                                        label="Created"
                                                        value={formatDateTime(order.createdAt)}
                                                    />
                                                    <InfoCard
                                                        icon={<MapPin size={14} />}
                                                        label="Event Location"
                                                        value={order.eventLocation || '-'}
                                                    />
                                                </div>

                                                <div className="rounded-[22px] border border-slate-200 bg-stone-50 p-4">
                                                    <div className="mb-2 flex items-center gap-2 text-slate-400">
                                                        <FileText size={14} />
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                                                            Customer Notes
                                                        </p>
                                                    </div>
                                                    <p className="text-sm leading-6 text-slate-700">
                                                        {order.customerInfo?.notes || 'No notes provided.'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="mb-3">
                                                        <h4 className="text-sm font-semibold text-slate-900">
                                                            Package selections
                                                        </h4>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            Selected dishes grouped by package category.
                                                        </p>
                                                    </div>

                                                    {!order.selections?.length ? (
                                                        <div className="rounded-[22px] border border-dashed border-slate-200 bg-stone-50 px-4 py-8 text-center text-sm text-slate-400">
                                                            No selections recorded for this order.
                                                        </div>
                                                    ) : (
                                                        <div className="grid gap-4 xl:grid-cols-2">
                                                            {order.selections.map((selection, i) => (
                                                                <div
                                                                    key={`${selection.categoryName}-${i}`}
                                                                    className="rounded-[22px] border border-slate-200 bg-white p-4"
                                                                >
                                                                    <h5 className="break-words text-sm font-semibold text-slate-900">
                                                                        {selection.categoryName}
                                                                    </h5>

                                                                    <div className="mt-3 space-y-2">
                                                                        {selection.selectedItems?.map(
                                                                            (item, j) => (
                                                                                <div
                                                                                    key={`${item.itemName}-${j}`}
                                                                                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-3"
                                                                                >
                                                                                    <div className="min-w-0">
                                                                                        <p className="break-words text-sm font-medium text-slate-900">
                                                                                            {item.itemName}
                                                                                        </p>
                                                                                        {item.choiceName && (
                                                                                            <p className="mt-1 break-words text-xs text-slate-500">
                                                                                                Choice: {item.choiceName}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>

                                                                                    <span className="shrink-0 text-sm font-semibold text-slate-700">
                                                                                        € {Number(item.price || 0).toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative z-40 flex flex-col gap-3 overflow-visible border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            Update order status
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Move the booking through review, payment and kitchen preparation.
                                                        </p>
                                                    </div>

                                                    <StatusDropdown
                                                        value={order.status}
                                                        isOpen={openDropdown === `status-${order._id}`}
                                                        disabled={updatingOrderId === order._id}
                                                        onToggle={() =>
                                                            setOpenDropdown((prev) =>
                                                                prev === `status-${order._id}`
                                                                    ? null
                                                                    : `status-${order._id}`
                                                            )
                                                        }
                                                        onSelect={(value) =>
                                                            handleStatusUpdate(order._id, value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
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
    value,
    icon,
    tone = 'light'
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
    tone?: 'light' | 'dark';
}) => {
    const dark = tone === 'dark';

    return (
        <div
            className={
                dark
                    ? 'rounded-2xl border border-white/12 bg-white/8 px-4 py-3 shadow-[0_14px_35px_rgba(0,0,0,0.14)] backdrop-blur'
                    : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm'
            }
        >
            <div
                className={`flex items-center gap-2 ${
                    dark ? 'text-[#f8e8cf]/65' : 'text-slate-400'
                }`}
            >
                {icon}
                <p className="text-[11px] font-medium uppercase tracking-[0.14em]">
                    {label}
                </p>
            </div>
            <p className={`mt-2 text-xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {value}
            </p>
        </div>
    );
};

const StatusTab = ({
    label,
    count,
    active,
    dotClass,
    onClick
}: {
    label: string;
    count: number;
    active: boolean;
    dotClass?: string;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
                active
                    ? 'border-[#24140f] bg-[#24140f] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-stone-50'
            }`}
        >
            <span
                className={`h-2 w-2 rounded-full ${
                    active ? 'bg-amber-400' : dotClass || 'bg-slate-300'
                }`}
            />
            <span className="whitespace-nowrap">{label}</span>
            <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? 'bg-white/14 text-white' : 'bg-stone-100 text-slate-500'
                }`}
            >
                {count}
            </span>
        </button>
    );
};

const ViewButton = ({
    active,
    label,
    icon,
    onClick
}: {
    active: boolean;
    label: string;
    icon: ReactNode;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-w-[88px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
            }`}
        >
            {icon}
            {label}
        </button>
    );
};

const InfoCard = ({
    icon,
    label,
    value
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) => {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 break-words text-sm font-medium text-slate-900">{value}</p>
        </div>
    );
};

const FilterDropdown = ({
    value,
    isOpen,
    onToggle,
    onSelect
}: {
    value: string;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
}) => {
    const currentLabel = value ? formatStatus(value) : 'All statuses';

    return (
        <div className="relative z-50 sm:w-[220px]" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={onToggle}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-amber-100"
            >
                <span className="flex min-w-0 items-center gap-2">
                    <Filter size={16} className="shrink-0 text-slate-400" />
                    <span className="truncate">{currentLabel}</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[56px] z-[90] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                    <DropdownOption
                        label="All statuses"
                        active={value === ''}
                        dotClass="bg-slate-400"
                        onClick={() => onSelect('')}
                    />
                    {STATUS_OPTIONS.map((status) => (
                        <DropdownOption
                            key={status}
                            label={formatStatus(status)}
                            active={value === status}
                            dotClass={statusMeta[status]?.dotClass}
                            optionClass={statusMeta[status]?.menuClass}
                            onClick={() => onSelect(status)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const StatusDropdown = ({
    value,
    isOpen,
    disabled,
    onToggle,
    onSelect
}: {
    value: string;
    isOpen: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
}) => {
    const current = statusMeta[value];

    return (
        <div
            className="relative z-50 w-full overflow-visible md:w-[240px]"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={onToggle}
                className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    current?.chipClass || 'border-slate-200 bg-stone-50 text-slate-700'
                }`}
            >
                <span className="flex min-w-0 items-center gap-2">
                    <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                            current?.dotClass || 'bg-slate-400'
                        }`}
                    />
                    <span className="truncate">
                        {disabled ? 'Updating...' : formatStatus(value)}
                    </span>
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && !disabled && (
                <div className="absolute right-0 top-[56px] z-[100] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                    {STATUS_OPTIONS.map((status) => (
                        <DropdownOption
                            key={status}
                            label={statusMeta[status]?.label || formatStatus(status)}
                            active={value === status}
                            dotClass={statusMeta[status]?.dotClass}
                            optionClass={statusMeta[status]?.menuClass}
                            onClick={() => onSelect(status)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DropdownOption = ({
    label,
    active,
    dotClass,
    optionClass,
    onClick
}: {
    label: string;
    active: boolean;
    dotClass?: string;
    optionClass?: string;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                optionClass || 'hover:bg-stone-50'
            } ${active ? 'bg-stone-50 text-slate-900' : 'text-slate-700'}`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass || 'bg-slate-400'}`} />
                <span className="truncate">{label}</span>
            </span>
            {active && <Check size={15} className="shrink-0 text-slate-500" />}
        </button>
    );
};

const formatStatus = (value?: string) => {
    if (!value) return '-';
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const formatDateTime = (value?: string) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
