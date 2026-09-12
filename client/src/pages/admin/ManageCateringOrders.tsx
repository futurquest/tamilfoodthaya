import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    ClipboardList,
    FileText,
    LayoutGrid,
    List,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
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

type ViewMode = 'grid' | 'list';

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
        dotClass: string;
    }
> = {
    pending: {
        label: 'Pending',
        chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
        dotClass: 'bg-amber-500'
    },
    reviewing: {
        label: 'Reviewing',
        chipClass: 'border-blue-200 bg-blue-50 text-blue-700',
        dotClass: 'bg-blue-500'
    },
    quoted: {
        label: 'Quoted',
        chipClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        dotClass: 'bg-indigo-500'
    },
    confirmed: {
        label: 'Confirmed',
        chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dotClass: 'bg-emerald-500'
    },
    paid: {
        label: 'Paid',
        chipClass: 'border-green-200 bg-green-50 text-green-700',
        dotClass: 'bg-green-500'
    },
    preparing: {
        label: 'Preparing',
        chipClass: 'border-purple-200 bg-purple-50 text-purple-700',
        dotClass: 'bg-purple-500'
    },
    completed: {
        label: 'Completed',
        chipClass: 'border-slate-200 bg-stone-50 text-slate-700',
        dotClass: 'bg-slate-500'
    },
    cancelled: {
        label: 'Cancelled',
        chipClass: 'border-red-200 bg-red-50 text-red-700',
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
    const [loadError, setLoadError] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setLoadError(false);
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
            setLoadError(true);
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
            toast.error('Failed to update status');
        } finally {
            setUpdatingOrderId(null);
            setOpenDropdown(null);
        }
    };

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return orders.filter((order) => {
            if (filterStatus && order.status !== filterStatus) return false;
            if (!query) return true;

            return [
                order.customerInfo?.name,
                order.customerInfo?.email,
                order.customerInfo?.phone,
                order.packageName,
                order.eventLocation,
                order._id,
                order.status,
                order.paymentStatus,
                formatDate(order.eventDate)
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [orders, filterStatus, search]);

    const stats = useMemo(() => {
        const total = orders.length;
        const reviewQueue = orders.filter((order) =>
            ['pending', 'reviewing', 'quoted'].includes(order.status)
        ).length;
        const confirmed = orders.filter((order) =>
            ['confirmed', 'paid', 'preparing'].includes(order.status)
        ).length;
        const completed = orders.filter((order) => order.status === 'completed').length;
        const revenue = orders.reduce(
            (sum, order) => sum + Number(order.totalPrice || 0),
            0
        );

        return { total, reviewQueue, confirmed, completed, revenue };
    }, [orders]);

    const statusCounts = useMemo(() => {
        return STATUS_OPTIONS.reduce<Record<string, number>>((acc, status) => {
            acc[status] = orders.filter((order) => order.status === status).length;
            return acc;
        }, {});
    }, [orders]);

    const nextEvent = useMemo(() => {
        return [...orders]
            .filter((order) => order.status !== 'cancelled' && order.status !== 'completed')
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0] || null;
    }, [orders]);

    const clearFilters = () => {
        setFilterStatus('');
        setSearch('');
    };

    const hasActiveFilters = Boolean(filterStatus || search.trim());

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#2f211f] bg-[#1d1216] text-white shadow-[0_28px_80px_rgba(37,25,23,0.24)]">
                    <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
                        <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8a23a]/30 bg-[#d8a23a]/15 px-3 py-1.5 text-xs font-extrabold text-[#f4d38b]">
                                <ClipboardList size={13} />
                                Catering operations
                            </span>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 className="admin-package-hero-title max-w-[760px] text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-[1.03]">
                                    Every catering order, ready for service.
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white">
                                    <UtensilsCrossed size={13} />
                                    {viewMode === 'grid' ? 'Grid view' : 'List view'}
                                </span>
                            </div>
                            <p className="admin-package-hero-copy mt-4 max-w-2xl text-sm font-semibold leading-6">
                                Review bookings, customer selections, event details, payment state and kitchen progress with the same clarity as the package workspace.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setFilterStatus('pending')}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8a23a] bg-gradient-to-br from-[#d8a23a] to-[#8a2e1d] px-5 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[#d8a23a]/20"
                                >
                                    <Calendar size={16} />
                                    Review pending orders
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-extrabold text-white transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
                                >
                                    {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
                                    Switch to {viewMode === 'grid' ? 'list' : 'grid'}
                                </button>
                            </div>
                        </div>

                        <div className="grid min-w-0 gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <MetricCard label="Orders" value={stats.total} icon={<ClipboardList size={16} />} tone="dark" />
                                <MetricCard label="Review" value={stats.reviewQueue} icon={<Calendar size={16} />} tone="dark" />
                                <MetricCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 size={16} />} tone="dark" />
                                <MetricCard label="Revenue" value={formatCompactCurrency(stats.revenue)} icon={<CircleDollarSign size={16} />} tone="dark" />
                            </div>
                            <NextEventPanel order={nextEvent} />
                        </div>
                    </div>
                </section>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(280px,1fr)_auto] xl:items-end">
                        <label className="relative block min-w-0">
                            <span className="sr-only">Search catering orders</span>
                            <Search
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customer, email, phone, package, location or order ID"
                                className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </label>

                        <div className="min-w-0 sm:w-[180px]">
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    <div className="mt-3 min-w-0 border-t border-slate-100 pt-3">
                        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
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

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <SlidersHorizontal size={13} />
                            Showing {filteredOrders.length} of {orders.length} catering orders
                        </span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            >
                                <RotateCcw size={13} />
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {loadError && !loading && (
                    <ErrorState onRetry={fetchOrders} />
                )}

                {loading ? (
                    <LoadingPanel />
                ) : filteredOrders.length === 0 ? (
                    <EmptyState
                        title="No catering orders match this view"
                        text={
                            orders.length === 0
                                ? 'New catering bookings will appear here once customers place event orders.'
                                : 'Clear the search or choose another status to review more bookings.'
                        }
                    />
                ) : viewMode === 'grid' ? (
                    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                        {filteredOrders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                expanded={expandedOrder === order._id}
                                updating={updatingOrderId === order._id}
                                dropdownOpen={openDropdown === `status-${order._id}`}
                                onToggleExpand={() =>
                                    setExpandedOrder((current) =>
                                        current === order._id ? null : order._id
                                    )
                                }
                                onToggleDropdown={() =>
                                    setOpenDropdown((current) =>
                                        current === `status-${order._id}` ? null : `status-${order._id}`
                                    )
                                }
                                onStatusUpdate={(status) => handleStatusUpdate(order._id, status)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[1040px] text-sm">
                                <thead className="border-b border-slate-200 bg-[#fbf6ed]">
                                    <tr>
                                        <TableHeader>Order</TableHeader>
                                        <TableHeader>Customer</TableHeader>
                                        <TableHeader>Event</TableHeader>
                                        <TableHeader>Total</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader align="right">Action</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map((order) => (
                                        <OrderRow
                                            key={order._id}
                                            order={order}
                                            expanded={expandedOrder === order._id}
                                            updating={updatingOrderId === order._id}
                                            dropdownOpen={openDropdown === `status-${order._id}`}
                                            onToggleExpand={() =>
                                                setExpandedOrder((current) =>
                                                    current === order._id ? null : order._id
                                                )
                                            }
                                            onToggleDropdown={() =>
                                                setOpenDropdown((current) =>
                                                    current === `status-${order._id}` ? null : `status-${order._id}`
                                                )
                                            }
                                            onStatusUpdate={(status) => handleStatusUpdate(order._id, status)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 p-3 lg:hidden">
                            {filteredOrders.map((order) => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    expanded={expandedOrder === order._id}
                                    updating={updatingOrderId === order._id}
                                    dropdownOpen={openDropdown === `status-${order._id}`}
                                    onToggleExpand={() =>
                                        setExpandedOrder((current) =>
                                            current === order._id ? null : order._id
                                        )
                                    }
                                    onToggleDropdown={() =>
                                        setOpenDropdown((current) =>
                                            current === `status-${order._id}` ? null : `status-${order._id}`
                                        )
                                    }
                                    onStatusUpdate={(status) => handleStatusUpdate(order._id, status)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderCard = ({
    order,
    expanded,
    updating,
    dropdownOpen,
    onToggleExpand,
    onToggleDropdown,
    onStatusUpdate
}: {
    order: CateringOrder;
    expanded: boolean;
    updating: boolean;
    dropdownOpen: boolean;
    onToggleExpand: () => void;
    onToggleDropdown: () => void;
    onStatusUpdate: (status: string) => void;
}) => (
    <article className="min-w-0 overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
        <OrderSummary order={order} expanded={expanded} onToggleExpand={onToggleExpand} />

        {expanded && (
            <OrderDetails
                order={order}
                updating={updating}
                dropdownOpen={dropdownOpen}
                onToggleDropdown={onToggleDropdown}
                onStatusUpdate={onStatusUpdate}
            />
        )}
    </article>
);

const OrderRow = ({
    order,
    expanded,
    updating,
    dropdownOpen,
    onToggleExpand,
    onToggleDropdown,
    onStatusUpdate
}: {
    order: CateringOrder;
    expanded: boolean;
    updating: boolean;
    dropdownOpen: boolean;
    onToggleExpand: () => void;
    onToggleDropdown: () => void;
    onStatusUpdate: (status: string) => void;
}) => (
    <>
        <tr className="transition hover:bg-stone-50/70">
            <td className="px-5 py-4">
                <p className="font-extrabold text-slate-950">{order.packageName || 'No package'}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{formatOrderId(order._id)}</p>
            </td>
            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">{order.customerInfo?.name || 'Unknown customer'}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerInfo?.email || 'No email'}</p>
            </td>
            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">{formatDate(order.eventDate)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.guests || 0} guests</p>
            </td>
            <td className="px-5 py-4 font-extrabold text-slate-950">{formatCurrency(order.totalPrice)}</td>
            <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status} />
                    <PaymentBadge status={order.paymentStatus} />
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    >
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        {expanded ? 'Close' : 'Details'}
                    </button>
                </div>
            </td>
        </tr>
        {expanded && (
            <tr>
                <td colSpan={6} className="bg-[#fbf6ed] px-5 py-5">
                    <OrderDetails
                        order={order}
                        updating={updating}
                        dropdownOpen={dropdownOpen}
                        onToggleDropdown={onToggleDropdown}
                        onStatusUpdate={onStatusUpdate}
                    />
                </td>
            </tr>
        )}
    </>
);

const OrderSummary = ({
    order,
    expanded,
    onToggleExpand
}: {
    order: CateringOrder;
    expanded: boolean;
    onToggleExpand: () => void;
}) => (
    <button type="button" className="w-full text-left" onClick={onToggleExpand}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-slate-500">
                        {formatOrderId(order._id)}
                    </span>
                    <StatusBadge status={order.status} />
                    <PaymentBadge status={order.paymentStatus} />
                </div>

                <h3 className="break-words text-lg font-extrabold text-slate-950">
                    {order.customerInfo?.name || 'Unknown customer'}
                </h3>
                <p className="mt-1 break-words text-sm font-semibold text-slate-500">
                    {order.packageName || 'No package name'}
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <MiniStat icon={<Calendar size={14} />} label="Event" value={formatDate(order.eventDate)} />
                    <MiniStat icon={<Users size={14} />} label="Guests" value={`${order.guests || 0} guests`} />
                    <MiniStat icon={<CircleDollarSign size={14} />} label="Total" value={formatCurrency(order.totalPrice)} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fbf6ed] px-4 py-3 lg:min-w-[160px] lg:flex-col lg:items-start">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    {expanded ? 'Hide details' : 'View details'}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </div>
        </div>
    </button>
);

const OrderDetails = ({
    order,
    updating,
    dropdownOpen,
    onToggleDropdown,
    onStatusUpdate
}: {
    order: CateringOrder;
    updating: boolean;
    dropdownOpen: boolean;
    onToggleDropdown: () => void;
    onStatusUpdate: (status: string) => void;
}) => (
    <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard icon={<Mail size={14} />} label="Email" value={order.customerInfo?.email || '-'} />
            <InfoCard icon={<Phone size={14} />} label="Phone" value={order.customerInfo?.phone || '-'} />
            <InfoCard icon={<Calendar size={14} />} label="Created" value={formatDateTime(order.createdAt)} />
            <InfoCard icon={<MapPin size={14} />} label="Location" value={order.eventLocation || '-'} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#fbf6ed] p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
                <FileText size={14} />
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em]">
                    Customer notes
                </p>
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-700">
                {order.customerInfo?.notes || 'No notes provided.'}
            </p>
        </div>

        <div>
            <div className="mb-3">
                <h4 className="text-base font-extrabold text-slate-950">Package selections</h4>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Selected dishes grouped by package category.
                </p>
            </div>

            {!order.selections?.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#fbf6ed] px-4 py-8 text-center text-sm font-semibold text-slate-400">
                    No selections recorded for this order.
                </div>
            ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                    {order.selections.map((selection, index) => (
                        <div
                            key={`${selection.categoryName}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                            <h5 className="break-words text-sm font-extrabold text-slate-950">
                                {selection.categoryName}
                            </h5>
                            <div className="mt-3 space-y-2">
                                {selection.selectedItems?.map((item, itemIndex) => (
                                    <div
                                        key={`${item.itemName}-${itemIndex}`}
                                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-[#fbf6ed] px-3 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="break-words text-sm font-bold text-slate-950">
                                                {item.itemName}
                                            </p>
                                            {item.choiceName && (
                                                <p className="mt-1 break-words text-xs font-semibold text-slate-500">
                                                    Choice: {item.choiceName}
                                                </p>
                                            )}
                                        </div>
                                        <span className="shrink-0 text-sm font-extrabold text-slate-700">
                                            {formatCurrency(item.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="relative z-40 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm font-extrabold text-slate-950">Update order status</p>
                <p className="text-xs font-semibold text-slate-500">
                    Move the booking through review, payment and kitchen preparation.
                </p>
            </div>
            <StatusDropdown
                value={order.status}
                isOpen={dropdownOpen}
                disabled={updating}
                onToggle={onToggleDropdown}
                onSelect={onStatusUpdate}
            />
        </div>
    </div>
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
    <div className={`min-w-0 rounded-2xl px-4 py-3 shadow-sm ${
        tone === 'dark'
            ? 'border border-white/10 bg-white/10 text-white'
            : 'border border-slate-200 bg-white'
    }`}>
        <div className={`flex items-center gap-2 ${tone === 'dark' ? 'text-[#d8c7ad]' : 'text-slate-500'}`}>
            {icon}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className={`mt-2 truncate text-2xl font-extrabold tabular-nums ${tone === 'dark' ? 'text-white' : 'text-slate-950'}`}>{value}</p>
    </div>
);

const NextEventPanel = ({ order }: { order: CateringOrder | null }) => {
    if (!order) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d8c7ad]">Next event</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#efe2d0]">
                    Upcoming confirmed catering events will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d8c7ad]">Next event</p>
                    <p className="mt-2 truncate text-lg font-extrabold text-white">
                        {order.customerInfo?.name || order.packageName || 'Catering booking'}
                    </p>
                </div>
                <span className="inline-flex shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
                    {formatStatus(order.status)}
                </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                <DarkMiniStat label="Date" value={formatDate(order.eventDate)} />
                <DarkMiniStat label="Guests" value={String(order.guests || 0)} />
                <DarkMiniStat label="Value" value={formatCompactCurrency(order.totalPrice)} />
            </div>
        </div>
    );
};

const DarkMiniStat = ({ label, value }: { label: string; value: string }) => (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d8c7ad]">{label}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-white">{value}</p>
    </div>
);

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
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
            active
                ? 'border-[#251917] bg-[#251917] text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50'
        }`}
    >
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-amber-300' : dotClass || 'bg-slate-300'}`} />
        <span className="whitespace-nowrap">{label}</span>
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/15' : 'bg-stone-100'}`}>
            {count}
        </span>
    </button>
);

const ViewToggle = ({
    value,
    onChange
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
}) => (
    <div className="grid gap-1.5">
        <span className="px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">View</span>
        <div className="grid h-11 grid-cols-2 rounded-xl bg-stone-100 p-1">
            <ViewButton
                active={value === 'grid'}
                label="Grid"
                icon={<LayoutGrid size={15} />}
                onClick={() => onChange('grid')}
            />
            <ViewButton
                active={value === 'list'}
                label="List"
                icon={<List size={15} />}
                onClick={() => onChange('list')}
            />
        </div>
    </div>
);

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

const InfoCard = ({
    icon,
    label,
    value
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-slate-500">
            {icon}
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em]">{label}</p>
        </div>
        <p className="mt-2 break-words text-sm font-bold text-slate-950">{value}</p>
    </div>
);

const MiniStat = ({
    icon,
    label,
    value
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) => (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-[#fbf6ed] px-3 py-2">
        <div className="flex items-center gap-1.5 text-slate-500">
            {icon}
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.1em]">{label}</p>
        </div>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-950">{value}</p>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] ${statusMeta[status]?.chipClass || 'border-slate-200 bg-stone-50 text-slate-700'}`}>
        {formatStatus(status)}
    </span>
);

const PaymentBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] ${paymentStyles[status] || 'border-slate-200 bg-stone-50 text-slate-700'}`}>
        {formatStatus(status)}
    </span>
);

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
}) => (
    <div className="relative z-50 w-full overflow-visible md:w-[240px]" onClick={(event) => event.stopPropagation()}>
        <button
            type="button"
            disabled={disabled}
            onClick={onToggle}
            className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${statusMeta[value]?.chipClass || 'border-slate-200 bg-stone-50 text-slate-700'}`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusMeta[value]?.dotClass || 'bg-slate-400'}`} />
                <span className="truncate">{disabled ? 'Updating...' : formatStatus(value)}</span>
            </span>
            <ChevronDown size={16} className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
            <div className="absolute bottom-[56px] right-0 z-[100] max-h-[360px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                {STATUS_OPTIONS.map((status) => (
                    <DropdownOption
                        key={status}
                        label={formatStatus(status)}
                        active={value === status}
                        dotClass={statusMeta[status]?.dotClass}
                        onClick={() => onSelect(status)}
                    />
                ))}
            </div>
        )}
    </div>
);

const DropdownOption = ({
    label,
    active,
    dotClass,
    onClick
}: {
    label: string;
    active: boolean;
    dotClass?: string;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-stone-50 ${active ? 'bg-stone-50 text-slate-950' : 'text-slate-700'}`}
    >
        <span className="flex min-w-0 items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass || 'bg-slate-400'}`} />
            <span className="truncate">{label}</span>
        </span>
        {active && <Check size={15} className="shrink-0 text-slate-500" />}
    </button>
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

const LoadingPanel = () => (
    <div aria-label="Loading catering orders" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="min-h-[250px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm motion-reduce:animate-none"
            >
                <div className="flex justify-between gap-4">
                    <div className="h-9 w-32 rounded-xl bg-stone-200" />
                    <div className="h-8 w-24 rounded-lg bg-stone-100" />
                </div>
                <div className="mt-6 h-5 w-3/5 rounded bg-stone-200" />
                <div className="mt-3 h-4 w-full rounded bg-stone-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-stone-100" />
                <div className="mt-8 h-14 rounded-xl bg-stone-100" />
            </div>
        ))}
    </div>
);

const EmptyState = ({ title, text }: { title: string; text: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-[#fbf6ed] text-slate-500">
            <UtensilsCrossed size={22} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{text}</p>
    </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
        <div>
            <p>Catering orders could not be loaded.</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-extrabold underline decoration-red-300 underline-offset-4"
            >
                Try again
            </button>
        </div>
    </div>
);

const formatOrderId = (value?: string) => {
    if (!value) return '#------';
    return `#${String(value).slice(-6).toUpperCase()}`;
};

const formatStatus = (value?: string) => {
    if (!value) return '-';
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (value?: number) =>
    new Intl.NumberFormat('en-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(Number(value || 0));

const formatCompactCurrency = (value?: number) =>
    new Intl.NumberFormat('en-NL', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(Number(value || 0));

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
