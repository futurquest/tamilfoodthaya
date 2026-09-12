import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ChefHat,
    ClipboardList,
    Euro,
    Inbox,
    MessageSquare,
    PackagePlus,
    TrendingUp,
    Users,
    UtensilsCrossed
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCateringOrders, getLeads } from '../../hooks/useApi';

type Lead = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    utmSource?: string;
    package?: string;
    eventDate?: string;
    guests?: number;
    message?: string;
    createdAt?: string;
};

type CateringOrder = {
    _id: string;
    packageName: string;
    guests: number;
    eventDate: string;
    eventLocation?: string;
    pricePerPerson: number;
    totalPrice: number;
    status: string;
    paymentStatus: string;
    createdAt?: string;
};

const REVIEW_STATES = ['pending', 'reviewing', 'quoted'];
const BOOKED_STATES = ['confirmed', 'paid', 'preparing', 'completed'];
const ACTIVE_BOOKING_STATES = ['confirmed', 'paid', 'preparing'];

const formatEuro = (value: number) =>
    new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);

const toNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const toTimestamp = (value?: string): number => {
    const t = value ? Date.parse(value) : NaN;
    return Number.isFinite(t) ? t : 0;
};

const formatLeadDate = (value?: string): string => {
    const t = value ? Date.parse(value) : NaN;
    if (!Number.isFinite(t)) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(t));
};

const startOfWeek = () => {
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
};

const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const leadStatusTone = (status: string): 'brass' | 'leaf' | 'ink' => {
    if (status === 'OPEN') return 'brass';
    if (status === 'IN_PROGRESS') return 'leaf';
    return 'ink';
};

const leadStatusLabel = (status: string): string => {
    if (status === 'OPEN') return 'New';
    if (status === 'IN_PROGRESS') return 'In review';
    return 'Completed';
};

const quickActions = [
    {
        label: 'Review leads',
        description: 'Prioritize new catering enquiries',
        path: '/admin/leads',
        icon: Users
    },
    {
        label: 'Manage menu',
        description: 'Update dishes, prices and availability',
        path: '/admin/menu',
        icon: UtensilsCrossed
    },
    {
        label: 'Create package',
        description: 'Build or refine catering offers',
        path: '/admin/catering-packages',
        icon: PackagePlus
    }
] as const;

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const Dashboard = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [orders, setOrders] = useState<CateringOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setLoading(true);
                setLoadError(false);
                const [leadsResponse, ordersResponse] = await Promise.all([
                    getLeads(),
                    getCateringOrders()
                ]);
                const leadsData = Array.isArray(leadsResponse)
                    ? leadsResponse
                    : Array.isArray(leadsResponse?.data)
                    ? leadsResponse.data
                    : [];
                const ordersData = Array.isArray(ordersResponse)
                    ? ordersResponse
                    : Array.isArray(ordersResponse?.data)
                    ? ordersResponse.data
                    : [];
                if (active) {
                    setLeads(leadsData);
                    setOrders(ordersData);
                }
            } catch {
                if (active) setLoadError(true);
                toast.error('Could not load dashboard figures');
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const kpis = useMemo(() => {
        const totalLeads = leads.length;
        const newLeads = leads.filter((lead) => lead.status === 'OPEN').length;
        const inProgress = leads.filter((lead) => lead.status === 'IN_PROGRESS').length;
        const completedLeads = leads.filter((lead) => lead.status === 'COMPLETED').length;
        const conversionRate =
            totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

        const activeOrders = orders.filter((order) => order.status !== 'cancelled');
        const totalOrders = activeOrders.length;
        const reviewCount = orders.filter((order) => REVIEW_STATES.includes(order.status)).length;
        const bookedOrders = orders.filter((order) => BOOKED_STATES.includes(order.status));
        const bookedValue = bookedOrders.reduce((sum, order) => sum + Math.max(toNumber(order.totalPrice), 0), 0);
        const activeBookings = orders.filter((order) =>
            ACTIVE_BOOKING_STATES.includes(order.status)
        ).length;

        return {
            revenue: formatEuro(bookedValue),
            revenueDetail: `${activeBookings} active ${activeBookings === 1 ? 'booking' : 'bookings'}`,
            newLeads: String(newLeads),
            newLeadsDetail: `${inProgress} in progress`,
            orders: String(totalOrders),
            ordersDetail: `${reviewCount} need review`,
            conversion: `${conversionRate}%`,
            conversionDetail: `${completedLeads} of ${totalLeads} leads completed`
        };
    }, [leads, orders]);

    const operations = useMemo(() => {
        const reviewCount = orders.filter((order) => REVIEW_STATES.includes(order.status)).length;
        const activeBookings = orders.filter((order) =>
            ACTIVE_BOOKING_STATES.includes(order.status)
        ).length;
        const today = startOfToday().getTime();
        const upcoming = orders.filter((order) => {
            if (['cancelled', 'completed'].includes(order.status)) return false;
            const t = order.eventDate ? Date.parse(order.eventDate) : NaN;
            return Number.isFinite(t) && t >= today;
        }).length;

        return [
            {
                label: 'Pending quotes',
                value: String(reviewCount),
                detail: 'Awaiting your quote or confirmation',
                icon: MessageSquare
            },
            {
                label: 'Confirmed events',
                value: String(activeBookings),
                detail: 'Booked into the calendar',
                icon: ChefHat
            },
            {
                label: 'Upcoming dates',
                value: String(upcoming),
                detail: 'Active events still to come',
                icon: Calendar
            }
        ] as const;
    }, [orders]);

    const weekTotals = useMemo(() => {
        const weekStart = startOfWeek().getTime();
        const totals = new Array(7).fill(0);
        orders.forEach((order) => {
            if (!BOOKED_STATES.includes(order.status)) return;
            const t = order.createdAt ? Date.parse(order.createdAt) : NaN;
            if (!Number.isFinite(t) || t < weekStart) return;
            const index = (new Date(t).getDay() + 6) % 7;
            totals[index] += Math.max(toNumber(order.totalPrice), 0);
        });
        return totals;
    }, [orders]);

    const bookedThisWeek = useMemo(() => weekTotals.reduce((sum, value) => sum + value, 0), [weekTotals]);
    const maxDayValue = (useMemo(() => Math.max(...weekTotals), [weekTotals])) || 0;

    const recentLeads = useMemo(() => {
        return [...leads]
            .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
            .slice(0, 5)
            .map((lead) => ({
                key: lead._id,
                name: lead.name || '—',
                event: lead.package || 'Enquiry',
                date: formatLeadDate(lead.eventDate),
                guests: lead.guests != null ? String(Math.round(Math.max(toNumber(lead.guests), 0))) : '—',
                status: leadStatusLabel(lead.status),
                statusTone: leadStatusTone(lead.status)
            }));
    }, [leads]);

    const hasLeads = leads.length > 0;
    const hasOthers = orders.length > 0;

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                Restaurant Operations
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                Booked catering value, enquiries and priority admin work — computed
                                live from your records.
                            </p>
                        </div>

                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:w-[520px]">
                            {quickActions.map((action) => (
                                <QuickAction key={action.path} {...action} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Booked Revenue"
                        value={loading ? '…' : loadError ? '—' : kpis.revenue}
                        detail={loading || loadError ? 'Up to date figures' : kpis.revenueDetail}
                        icon={Euro}
                        tone="brass"
                        to="/admin/catering-orders"
                    />
                    <MetricCard
                        label="New Leads"
                        value={loading ? '…' : loadError ? '—' : kpis.newLeads}
                        detail={loading || loadError ? 'Up to date figures' : kpis.newLeadsDetail}
                        icon={Users}
                        tone="leaf"
                        to="/admin/leads"
                    />
                    <MetricCard
                        label="Catering Orders"
                        value={loading ? '…' : loadError ? '—' : kpis.orders}
                        detail={loading || loadError ? 'Up to date figures' : kpis.ordersDetail}
                        icon={ClipboardList}
                        tone="spice"
                        to="/admin/catering-orders"
                    />
                    <MetricCard
                        label="Lead Conversion"
                        value={loading ? '…' : loadError ? '—' : kpis.conversion}
                        detail={loading || loadError ? 'Up to date figures' : kpis.conversionDetail}
                        icon={TrendingUp}
                        tone="ink"
                        to="/admin/leads"
                    />
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Sales Trend
                                </h2>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                                    Booked catering value recorded this week, per day.
                                </p>
                            </div>

                            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                                <TrendingUp size={14} />
                                {loading ? '…' : `${bookedThisWeek > 0 ? bookedThisWeek : 0} booked this week`}
                            </span>
                        </div>

                        <div className="relative mt-6 flex h-64 items-end gap-3 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4">
                            {weekTotals.map((value, index) => {
                                const height = maxDayValue > 0 ? Math.round((value / maxDayValue) * 100) : 0;
                                return (
                                    <div key={WEEK_LABELS[index]} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                                        <div className="flex flex-1 items-end">
                                            <div
                                                className="w-full rounded-t-xl bg-gradient-to-t from-[#8a2e1d] via-[#b46f24] to-[#d8a23a] shadow-sm"
                                                style={{ height: `${height}%` }}
                                                aria-label={`${WEEK_LABELS[index]}: ${formatEuro(value)}`}
                                                title={`${WEEK_LABELS[index]}: ${formatEuro(value)}`}
                                            />
                                        </div>
                                        <span className="text-center text-[11px] font-bold text-slate-500">
                                            {WEEK_LABELS[index]}
                                        </span>
                                    </div>
                                );
                            })}
                            {maxDayValue === 0 && !loading && (
                                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                                    <p className="text-xs font-semibold text-slate-400">
                                        No bookings recorded this week yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Today&apos;s Priorities
                                </h2>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                                    Counted from your live orders — updates yourself as statuses change.
                                </p>
                            </div>
                            <CheckCircle2 className="text-emerald-700" size={22} />
                        </div>

                        <div className="mt-5 grid gap-3">
                            {operations.map((item) => (
                                <OperationItem
                                    key={item.label}
                                    label={item.label}
                                    value={loading ? '…' : loadError ? '—' : item.value}
                                    detail={item.detail}
                                    icon={item.icon}
                                    to="/admin/catering-orders"
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Recent Catering Leads
                            </h2>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Latest enquiries from your pipeline, newest first.
                            </p>
                        </div>

                        <Link
                            to="/admin/leads"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
                        >
                            View pipeline
                            <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <p className="px-5 py-6 text-sm font-medium text-slate-500">Loading enquiries…</p>
                        ) : hasLeads ? (
                            recentLeads.map((lead) => <LeadRow key={lead.key} lead={lead} />)
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-100 text-slate-400">
                                    <Inbox size={18} />
                                </span>
                                <p className="text-sm font-semibold text-slate-600">No enquiries yet</p>
                                <p className="text-xs font-medium text-slate-400">
                                    New leads from the contact form appear here automatically.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {!hasLeads && !hasOthers && !loading && (
                    <p className="sr-only">Dashboard figures are calculated from live records.</p>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    detail,
    tone,
    to,
    icon: Icon
}: {
    label: string;
    value: string;
    detail: string;
    tone: 'brass' | 'leaf' | 'spice' | 'ink';
    to?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    const toneMap = {
        brass: {
            icon: 'bg-amber-50 text-amber-700',
            line: 'from-[#d8a23a] to-[#8a2e1d]',
            text: 'text-amber-700'
        },
        leaf: {
            icon: 'bg-emerald-50 text-emerald-700',
            line: 'from-[#39533b] to-[#c9972b]',
            text: 'text-emerald-700'
        },
        spice: {
            icon: 'bg-red-50 text-red-700',
            line: 'from-[#8a2e1d] to-[#c9972b]',
            text: 'text-red-700'
        },
        ink: {
            icon: 'bg-stone-100 text-slate-900',
            line: 'from-[#251917] to-[#8a2e1d]',
            text: 'text-slate-700'
        }
    }[tone];

    const inner = (
        <>
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${toneMap.line}`} />
            <div className="flex items-start justify-between gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneMap.icon}`}>
                    <Icon size={18} />
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-stone-50 text-slate-400 transition group-hover:bg-amber-50 group-hover:text-amber-800">
                    <ArrowRight size={14} />
                </span>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 break-words text-2xl font-extrabold leading-tight tabular-nums text-slate-900 md:text-[30px]">
                {value}
            </p>
            <p className={`mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold ${toneMap.text}`}>
                <TrendingUp size={13} />
                {detail}
            </p>
        </>
    );

    const cardClass =
        'relative block overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition group hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_16px_40px_rgba(37,25,23,0.10)] focus-visible:outline-2 focus-visible:outline-amber-500';

    return to ? (
        <Link to={to} className={cardClass}>
            {inner}
        </Link>
    ) : (
        <article className={cardClass}>{inner}</article>
    );
};

const QuickAction = ({
    label,
    description,
    path,
    icon: Icon
}: {
    label: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    return (
        <Link
            to={path}
            className="group min-w-0 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left shadow-sm transition hover:border-amber-200 hover:bg-amber-50"
        >
            <div className="flex items-center justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-slate-700 transition group-hover:bg-white group-hover:text-amber-800">
                    <Icon size={16} />
                </span>
                <ArrowRight size={15} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-amber-800" />
            </div>
            <p className="mt-3 text-sm font-extrabold text-slate-900">{label}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                {description}
            </p>
        </Link>
    );
};

const OperationItem = ({
    label,
    value,
    detail,
    to,
    icon: Icon
}: {
    label: string;
    value: string;
    detail: string;
    to?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    const inner = (
        <>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-slate-700 transition group-hover:bg-amber-50 group-hover:text-amber-800">
                <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-extrabold text-slate-900">
                        {label}
                    </p>
                    <span className="shrink-0 whitespace-nowrap text-xl font-extrabold text-slate-900">{value}</span>
                </div>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                    {detail}
                </p>
            </div>
        </>
    );

    const itemClass =
        'group flex items-center gap-4 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/60 hover:shadow-[0_12px_32px_rgba(37,25,23,0.08)] focus-visible:outline-2 focus-visible:outline-amber-500';

    return to ? (
        <Link to={to} className={itemClass}>
            {inner}
        </Link>
    ) : (
        <div className={itemClass}>{inner}</div>
    );
};

const LeadRow = ({
    lead
}: {
    lead: {
        name: string;
        event: string;
        date: string;
        guests: string;
        status: string;
        statusTone: 'brass' | 'leaf' | 'ink';
    };
}) => {
    const statusClass =
        lead.statusTone === 'brass'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : lead.statusTone === 'leaf'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-stone-50 text-slate-700';

    return (
        <Link
            to="/admin/leads"
            className="group grid gap-3 px-5 py-4 transition hover:bg-amber-50/40 focus-visible:outline-2 focus-visible:outline-amber-500 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-100 bg-amber-50 text-sm font-extrabold text-amber-700">
                    {lead.name.charAt(0)}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold text-slate-900">
                        {lead.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {lead.event}
                        </span>
                        <span>{lead.date}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                    <Users size={14} className="text-slate-400" />
                    {lead.guests} guests
                </span>
                <span
                    className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] ${statusClass}`}
                >
                    {lead.status}
                </span>
            </div>
        </Link>
    );
};