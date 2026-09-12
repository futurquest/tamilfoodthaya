import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ChefHat,
    ClipboardList,
    Euro,
    MessageSquare,
    PackagePlus,
    TrendingUp,
    Users,
    UtensilsCrossed
} from 'lucide-react';

const kpis = [
    {
        label: 'Revenue',
        value: 'EUR 4,250',
        detail: '+12% vs previous month',
        icon: Euro,
        tone: 'brass'
    },
    {
        label: 'New Leads',
        value: '28',
        detail: '8 enquiries today',
        icon: Users,
        tone: 'leaf'
    },
    {
        label: 'Catering Orders',
        value: '14',
        detail: '5 need review',
        icon: ClipboardList,
        tone: 'spice'
    },
    {
        label: 'Conversion',
        value: '3.8%',
        detail: '+0.5% this week',
        icon: TrendingUp,
        tone: 'ink'
    }
] as const;

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

const revenueTrend = [
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 58 },
    { label: 'Wed', value: 48 },
    { label: 'Thu', value: 74 },
    { label: 'Fri', value: 92 },
    { label: 'Sat', value: 86 },
    { label: 'Sun', value: 64 }
] as const;

const operations = [
    {
        label: 'Pending quotes',
        value: '5',
        detail: 'Send follow-up before 17:00',
        icon: MessageSquare
    },
    {
        label: 'Confirmed events',
        value: '9',
        detail: 'Kitchen prep lists ready',
        icon: ChefHat
    },
    {
        label: 'Upcoming dates',
        value: '3',
        detail: 'This week',
        icon: Calendar
    }
] as const;

const leads = [
    {
        name: 'Sarah Miller',
        event: 'Wedding',
        date: '15 Aug 2026',
        guests: '150',
        status: 'New',
        statusTone: 'brass'
    },
    {
        name: 'Robert Janssen',
        event: 'Corporate event',
        date: '12 Sep 2025',
        guests: '60',
        status: 'New',
        statusTone: 'brass'
    },
    {
        name: 'Anjali Kumar',
        event: 'Birthday',
        date: '28 Jan 2025',
        guests: '25',
        status: 'In review',
        statusTone: 'leaf'
    }
] as const;

export const Dashboard = () => {
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
                                Monitor catering demand, daily revenue, customer enquiries and
                                priority admin work from one calm, fast-moving control center.
                            </p>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 xl:w-[520px]">
                            {quickActions.map((action) => (
                                <QuickAction key={action.path} {...action} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((stat) => (
                        <MetricCard key={stat.label} {...stat} />
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Sales Trend
                                </h2>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                                    Weekly order value movement for quick commercial readout.
                                </p>
                            </div>

                            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                                <TrendingUp size={14} />
                                Healthy demand
                            </span>
                        </div>

                        <div className="mt-6 flex h-64 items-end gap-3 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4">
                            {revenueTrend.map((day) => (
                                <div key={day.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                                    <div className="flex flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-xl bg-gradient-to-t from-[#8a2e1d] via-[#b46f24] to-[#d8a23a] shadow-sm"
                                            style={{ height: `${day.value}%` }}
                                            aria-label={`${day.label}: ${day.value}%`}
                                        />
                                    </div>
                                    <span className="text-center text-[11px] font-bold text-slate-500">
                                        {day.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Today&apos;s Priorities
                                </h2>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                                    Work that needs attention before service planning.
                                </p>
                            </div>
                            <CheckCircle2 className="text-emerald-700" size={22} />
                        </div>

                        <div className="mt-5 grid gap-3">
                            {operations.map((item) => (
                                <OperationItem key={item.label} {...item} />
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
                                New and active enquiries that may convert into orders.
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
                        {leads.map((lead) => (
                            <LeadRow key={`${lead.name}-${lead.date}`} lead={lead} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    detail,
    tone,
    icon: Icon
}: {
    label: string;
    value: string;
    detail: string;
    tone: 'brass' | 'leaf' | 'spice' | 'ink';
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

    return (
        <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${toneMap.line}`} />
            <div className="flex items-start justify-between gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneMap.icon}`}>
                    <Icon size={18} />
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-stone-50 text-slate-400">
                    <ArrowRight size={14} />
                </span>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-[30px] font-extrabold leading-none text-slate-900">
                {value}
            </p>
            <p className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${toneMap.text}`}>
                <TrendingUp size={13} />
                {detail}
            </p>
        </article>
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
            className="group min-w-[13.5rem] rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left shadow-sm transition hover:border-amber-200 hover:bg-amber-50 sm:min-w-0"
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
    icon: Icon
}: {
    label: string;
    value: string;
    detail: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-slate-700">
                <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                        {label}
                    </p>
                    <span className="text-xl font-extrabold text-slate-900">{value}</span>
                </div>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                    {detail}
                </p>
            </div>
        </div>
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
        statusTone: 'brass' | 'leaf';
    };
}) => {
    const statusClass =
        lead.statusTone === 'brass'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700';

    return (
        <div className="grid gap-3 px-5 py-4 transition hover:bg-stone-50/70 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6">
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
        </div>
    );
};
