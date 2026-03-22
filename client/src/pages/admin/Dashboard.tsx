import {
    Users,
    Euro,
    TrendingUp,
    ArrowUpRight,
    ChevronRight,
    Calendar,
    UserCheck,
    Sparkles
} from 'lucide-react';

const stats = [
    {
        label: 'Totale Omzet',
        value: '€ 4.250,00',
        detail: '+12% t.o.v. vorige maand',
        icon: Euro,
        tone: 'amber'
    },
    {
        label: 'Nieuwe Leads',
        value: '28',
        detail: '8 vandaag',
        icon: Users,
        tone: 'blue'
    },
    {
        label: 'Conversie Rate',
        value: '3.8%',
        detail: '+0.5% deze week',
        icon: TrendingUp,
        tone: 'emerald'
    }
] as const;

const leads = [
    {
        name: 'Sarah Miller',
        event: 'Bruiloft',
        date: '15 Aug 2026',
        guests: '150',
        status: 'Nieuw',
        statusTone: 'amber'
    },
    {
        name: 'Robert Janssen',
        event: 'Bedrijfsfeest',
        date: '12 Sep 2025',
        guests: '60',
        status: 'Nieuw',
        statusTone: 'amber'
    },
    {
        name: 'Anjali Kumar',
        event: 'Verjaardag',
        date: '28 Jan 2025',
        guests: '25',
        status: 'In Behandeling',
        statusTone: 'blue'
    }
] as const;

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1080px] space-y-5">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                <Sparkles size={24} className="text-slate-900" />
                                Overzicht
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Een helder overzicht van omzet, leads en recente cateringaanvragen.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <MetricCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    detail={stat.detail}
                                    tone={stat.tone}
                                    icon={stat.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leads */}
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Leads
                                </p>
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Catering Leads <span className="text-slate-400">(Nieuw)</span>
                            </h2>
                        </div>

                        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50">
                            Bekijk alles
                            <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {leads.map((lead) => (
                            <LeadRow key={`${lead.name}-${lead.date}`} lead={lead} />
                        ))}
                    </div>
                </div>
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
    tone: 'amber' | 'blue' | 'emerald';
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    const toneMap = {
        amber: {
            iconWrap: 'bg-amber-50 text-amber-600',
            accent: 'bg-amber-500',
            detail: 'text-amber-700'
        },
        blue: {
            iconWrap: 'bg-blue-50 text-blue-600',
            accent: 'bg-blue-500',
            detail: 'text-blue-700'
        },
        emerald: {
            iconWrap: 'bg-emerald-50 text-emerald-600',
            accent: 'bg-emerald-500',
            detail: 'text-emerald-700'
        }
    };

    const styles = toneMap[tone];

    return (
        <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`absolute left-0 right-0 top-0 h-[3px] ${styles.accent}`} />

            <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
                    <Icon size={18} />
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-stone-50 text-slate-400">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-slate-900">
                {value}
            </p>

            <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${styles.detail}`}>
                <TrendingUp size={12} />
                <span>{detail}</span>
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
        statusTone: 'amber' | 'blue';
    };
}) => {
    const statusClass =
        lead.statusTone === 'amber'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-blue-200 bg-blue-50 text-blue-700';

    return (
        <div className="flex flex-col gap-3 px-5 py-4 transition hover:bg-stone-50/70 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 text-sm font-semibold text-amber-700">
                    {lead.name.charAt(0)}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-slate-900">
                        {lead.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        <span>
                            {lead.event} · {lead.date}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <UserCheck size={14} className="text-slate-400" />
                    <span>{lead.guests} gasten</span>
                </div>

                <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClass}`}
                >
                    {lead.status}
                </span>
            </div>
        </div>
    );
};