import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    ArrowRight,
    CheckCircle2,
    CircleDot,
    Columns3,
    Clock3,
    Filter,
    GripVertical,
    Inbox,
    List,
    Mail,
    MessageSquare,
    MoreHorizontal,
    Phone,
    Search,
    Sparkles,
    Tag,
    Users
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getLeads, updateLeadStatus } from '../../hooks/useApi';
import { MetricCard, WorkspaceHeader, FilterSelect } from '../../components/AdminUI';


type LeadStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

type Lead = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: LeadStatus;
    utmSource?: string;
    package?: string;
    eventDate?: string;
    guests?: number;
    message?: string;
};

const getStatusConfig = (
    t: TFunction
): Record<
    LeadStatus,
    {
        title: string;
        subtitle: string;
        helper: string;
        accentClass: string;
        dotClass: string;
        badgeClass: string;
        activeClass: string;
    }
> => ({
    OPEN: {
        title: t('admin.leads.new', 'New'),
        subtitle: t('admin.leads.freshEnquiries', 'Fresh enquiries'),
        helper: t('admin.leads.openHelper', 'Qualify and respond quickly'),
        accentClass: 'from-amber-400 to-orange-700',
        dotClass: 'bg-amber-500',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        activeClass: 'border-amber-300 ring-4 ring-amber-100'
    },
    IN_PROGRESS: {
        title: t('admin.leads.inProgress', 'In Progress'),
        subtitle: t('admin.leads.activeConversations', 'Active conversations'),
        helper: t('admin.leads.quoteOrFollowUp', 'Needs quote or follow-up'),
        accentClass: 'from-(--brand-leaf) to-(--brand-accent)',
        dotClass: 'bg-(--brand-leaf)',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        activeClass: 'border-emerald-300 ring-4 ring-emerald-100'
    },
    COMPLETED: {
        title: t('admin.leads.completed', 'Completed'),
        subtitle: t('admin.leads.closedEnquiries', 'Closed enquiries'),
        helper: t('admin.leads.convertedOrArchived', 'Converted or archived'),
        accentClass: 'from-slate-700 to-stone-400',
        dotClass: 'bg-slate-700',
        badgeClass: 'border-slate-200 bg-stone-50 text-slate-700',
        activeClass: 'border-slate-300 ring-4 ring-slate-100'
    }
});

const statusOrder: LeadStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED'];

const useIsMinWidth = (query: string) => {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = () => setMatches(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
};

export const ManageLeads = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const statusConfig = getStatusConfig(t);
    const [localLeads, setLocalLeads] = useState<Lead[]>([]);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [activeDropStatus, setActiveDropStatus] = useState<LeadStatus | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const canShowBoard = useIsMinWidth('(min-width: 1024px)');
    const activeViewMode = canShowBoard ? viewMode : 'list';

    const { data, isLoading, isError } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads
    });

    const leadsFromApi: Lead[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

    useEffect(() => {
        setLocalLeads(leadsFromApi);
    }, [leadsFromApi]);

    const updateStatusMutation = useMutation({
        mutationFn: ({
            id,
            status
        }: {
            id: string;
            status: LeadStatus;
            previousStatus: LeadStatus;
        }) => updateLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success(t('admin.leads.leadStatusUpdated', 'Lead status updated'));
        },
        onError: (_error, variables) => {
            setLocalLeads((current) =>
                current.map((lead) =>
                    lead._id === variables.id
                        ? { ...lead, status: variables.previousStatus }
                        : lead
                )
            );
            toast.error(t('admin.leads.updateLeadFailed', 'Could not update the lead. Please try again.'));
        }
    });

    const sources = useMemo(() => {
        const unique = new Set(
            localLeads.map((lead) => getLeadSource(lead)).filter(Boolean)
        );
        return ['ALL', ...Array.from(unique)];
    }, [localLeads]);

    const filteredLeads = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return localLeads.filter((lead) => {
            if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;

            const source = getLeadSource(lead);
            if (sourceFilter !== 'ALL' && source !== sourceFilter) return false;

            if (!query) return true;

            return [
                lead.name,
                lead.email,
                lead.phone,
                lead.package,
                lead.message,
                source
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [localLeads, searchTerm, sourceFilter, statusFilter]);

    const groupedLeads = useMemo(
        () => ({
            OPEN: filteredLeads.filter((lead) => lead.status === 'OPEN'),
            IN_PROGRESS: filteredLeads.filter((lead) => lead.status === 'IN_PROGRESS'),
            COMPLETED: filteredLeads.filter((lead) => lead.status === 'COMPLETED')
        }),
        [filteredLeads]
    );
    const visibleStatuses = statusFilter === 'ALL' ? statusOrder : [statusFilter];

    const totalLeads = localLeads.length;
    const newLeads = localLeads.filter((lead) => lead.status === 'OPEN').length;
    const activeLeads = localLeads.filter((lead) => lead.status === 'IN_PROGRESS').length;
    const completedLeads = localLeads.filter((lead) => lead.status === 'COMPLETED').length;
    const conversionRate =
        totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

    const moveLead = (leadId: string, nextStatus: LeadStatus) => {
        const currentLead = localLeads.find((lead) => lead._id === leadId);
        if (!currentLead || currentLead.status === nextStatus) return;

        const previousStatus = currentLead.status;

        setLocalLeads((current) =>
            current.map((lead) =>
                lead._id === leadId ? { ...lead, status: nextStatus } : lead
            )
        );

        updateStatusMutation.mutate({
            id: leadId,
            status: nextStatus,
            previousStatus
        });
    };

    const onDragStart = (e: DragEvent<HTMLElement>, leadId: string) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', leadId);
    };

    const onDragEnd = () => {
        setDraggedLeadId(null);
        setActiveDropStatus(null);
    };

    const onDropColumn = (status: LeadStatus) => {
        if (!draggedLeadId) return;
        moveLead(draggedLeadId, status);
        setDraggedLeadId(null);
        setActiveDropStatus(null);
    };

    if (isLoading) {
        return (
            <div className="admin-page">
                <div className="admin-page-container max-w-[1180px]">
                    <div className="space-y-4">
                        <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                            <div className="flex flex-wrap items-end justify-between gap-5">
                                <div className="space-y-3">
                                    <div className="admin-skeleton h-3 w-24" />
                                    <div className="admin-skeleton h-8 w-64" />
                                    <div className="admin-skeleton h-4 w-72" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="admin-skeleton h-20 w-28" />
                                    ))}
                                </div>
                            </div>
                        </section>
                        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
                            <div className="grid grid-cols-3 gap-4">
                                {[0, 1, 2].map((column) => (
                                    <div key={column} className="space-y-3">
                                        <div className="admin-skeleton h-20" />
                                        <div className="admin-skeleton h-44" />
                                        <div className="admin-skeleton h-44" />
                                        <div className="admin-skeleton h-44" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="admin-page">
                <div className="admin-page-container max-w-[1180px]">
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-12 text-center">
                        <Inbox className="mx-auto text-red-700" size={28} />
                        <h1 className="mt-4 text-2xl font-extrabold text-red-700">
                            {t('admin.leads.loadFailed', 'Leads could not be loaded')}
                        </h1>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-red-600">
                            {t(
                                'admin.leads.loadFailedHint',
                                'Refresh the page or check the API connection before following up with new catering enquiries.'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.leads.leads', 'Leads')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    {t('admin.leads.boardTitle', 'Catering Lead Board')}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <Sparkles size={13} />
                                    {activeViewMode === 'board'
                                        ? t('admin.leads.boardView', 'Board view')
                                        : t('admin.leads.listView', 'List view')}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t(
                                    'admin.leads.boardSubtitle',
                                    'A polished sales board for qualifying catering enquiries, contacting customers, tracking sources and moving work forward.'
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 xl:w-[560px]">
                            <MetricCard label={t('admin.leads.total', 'Total')} value={totalLeads} icon={<Inbox size={16} />} />
                            <MetricCard label={t('admin.leads.new', 'New')} value={newLeads} icon={<Users size={16} />} />
                            <MetricCard label={t('admin.leads.active', 'Active')} value={activeLeads} icon={<MessageSquare size={16} />} />
                            <MetricCard label={t('admin.leads.closed', 'Closed')} value={`${conversionRate}%`} icon={<CheckCircle2 size={16} />} />
                        </div>
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
                        <label className="relative block">
                            <Search
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={t(
                                    'admin.leads.searchPlaceholder',
                                    'Search name, email, phone, package, message or source...'
                                )}
                                aria-label={t('admin.leads.searchLeads', 'Search leads')}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="grid gap-3 min-[480px]:grid-cols-2 xl:flex xl:items-end xl:gap-3">
                            <StatusSelect
                                value={statusFilter}
                                counts={{
                                    ALL: totalLeads,
                                    OPEN: newLeads,
                                    IN_PROGRESS: activeLeads,
                                    COMPLETED: completedLeads
                                }}
                                onChange={setStatusFilter}
                            />

                            <FilterSelect
                                    label={t('admin.leads.source', 'Source')}
                                    value={sourceFilter}
                                    onChange={setSourceFilter}
                                    options={sources.map((source) => ({
                                        value: source,
                                        label:
                                            source === 'ALL'
                                                ? t('admin.leads.allSources', 'All sources')
                                                : source
                                    }))}
                                />

                            {canShowBoard && <ViewToggle value={viewMode} onChange={setViewMode} />}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                <CircleDot size={12} />
                                {t('admin.leads.countSummary', 'Showing {{shown}} of {{total}} leads', {
                                    shown: filteredLeads.length,
                                    total: totalLeads
                                })}
                            </span>
                            {(searchTerm ||
                                sourceFilter !== 'ALL' ||
                                statusFilter !== 'ALL') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSourceFilter('ALL');
                                        setStatusFilter('ALL');
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                                >
                                    {t('admin.leads.clearFilters', 'Clear filters')}
                                </button>
                            )}
                    </div>
                </section>

                {activeViewMode === 'board' ? (
                    <section className="max-w-full overflow-x-auto rounded-[28px] border border-[color:var(--brand-outline)] bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-surface-ivory)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
                        <WorkspaceHeader
                            title={
                                statusFilter === 'ALL'
                                    ? 'Sales workspace'
                                    : `${statusConfig[statusFilter].title} workspace`
                            }
                            text={
                                statusFilter === 'ALL'
                                    ? 'Drag leads between stages or use the card action to move the enquiry forward.'
                                    : `Only ${statusConfig[statusFilter].title.toLowerCase()} leads are shown in this focused view.`
                            }
                            badge={
                                statusFilter === 'ALL'
                                    ? `${statusOrder.length} stages`
                                    : `${filteredLeads.length} lead${filteredLeads.length === 1 ? '' : 's'}`
                            }
                        />

                        <div
                            className={`grid gap-4 ${
                                visibleStatuses.length === 1
                                    ? 'min-w-0'
                                    : 'min-w-0 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                            }`}
                        >
                            {visibleStatuses.map((status) => (
                                <BoardColumn
                                    key={status}
                                    status={status}
                                    leads={groupedLeads[status]}
                                    focused={visibleStatuses.length === 1}
                                    activeDropStatus={activeDropStatus}
                                    draggedLeadId={draggedLeadId}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDragEnter={() => draggedLeadId && setActiveDropStatus(status)}
                                    onDrop={() => onDropColumn(status)}
                                >
                                    {groupedLeads[status].length > 0 ? (
                                        <div
                                            className={
                                                visibleStatuses.length === 1
                                                    ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3'
                                                    : 'space-y-3'
                                            }
                                        >
                                            {groupedLeads[status].map((lead) => (
                                                <LeadCard
                                                    key={lead._id}
                                                    lead={lead}
                                                    isDragging={draggedLeadId === lead._id}
                                                    busy={updateStatusMutation.isPending}
                                                    onDragStart={onDragStart}
                                                    onDragEnd={onDragEnd}
                                                    onMove={moveLead}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            title={
                                                filteredLeads.length === 0
                                                    ? 'No matching leads'
                                                    : `No ${statusConfig[status].title.toLowerCase()} leads`
                                            }
                                            text={
                                                filteredLeads.length === 0
                                                    ? 'Adjust search or filters to find the enquiry you need.'
                                                    : statusConfig[status].helper
                                            }
                                        />
                                    )}
                                </BoardColumn>
                            ))}
                        </div>
                    </section>
                ) : (
                    <LeadListView
                        leads={filteredLeads}
                        busy={updateStatusMutation.isPending}
                        onMove={moveLead}
                    />
                )}
            </div>
        </div>
    );
};const ViewToggle = ({
    value,
    onChange
}: {
    value: 'board' | 'list';
    onChange: (value: 'board' | 'list') => void;
}) => {
    const options: { value: 'board' | 'list'; label: string; icon: ReactNode }[] = [
        { value: 'board', label: 'Board', icon: <Columns3 size={14} /> },
        { value: 'list', label: 'List', icon: <List size={14} /> }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                View
            </span>
            <div className="flex rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {options.map((option) => {
                    const active = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
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
const StatusSelect = ({
    value,
    counts,
    onChange
}: {
    value: 'ALL' | LeadStatus;
    counts: Record<'ALL' | LeadStatus, number>;
    onChange: (value: 'ALL' | LeadStatus) => void;
}) => {
    const options: { value: 'ALL' | LeadStatus; label: string }[] = [
        { value: 'ALL', label: 'All' },
        { value: 'OPEN', label: 'New' },
        { value: 'IN_PROGRESS', label: 'Progress' },
        { value: 'COMPLETED', label: 'Done' }
    ];

    return (
        <label className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Filter size={13} />
                Status
            </span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value as 'ALL' | LeadStatus)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label} ({counts[option.value]})
                    </option>
                ))}
            </select>
        </label>
    );
};

const BoardColumn = ({
    status,
    leads,
    focused = false,
    activeDropStatus,
    draggedLeadId,
    children,
    onDragOver,
    onDragEnter,
    onDrop
}: {
    status: LeadStatus;
    leads: Lead[];
    focused?: boolean;
    activeDropStatus: LeadStatus | null;
    draggedLeadId: string | null;
    children: ReactNode;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDrop: () => void;
}) => {
    const { t } = useTranslation();
    const statusConfig = getStatusConfig(t);
    const config = statusConfig[status];
    const isActive = activeDropStatus === status && Boolean(draggedLeadId);

    return (
        <div
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            className={`relative overflow-hidden rounded-[26px] border bg-white/60 p-3 shadow-sm transition-all ${
                isActive ? config.activeClass : 'border-slate-200'
            } ${focused ? 'min-h-[520px]' : 'min-h-[620px]'}`}
        >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.accentClass}`} />
            <div className="mb-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${config.dotClass} shadow-sm`} />
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                {config.title}
                            </h2>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-700">
                        {leads.length}
                    </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                    {config.helper}
                </p>
            </div>

            <div className="space-y-3 xl:max-h-[68vh] xl:overflow-y-auto xl:pr-1">
                {children}
            </div>
        </div>
    );
};

const LeadCard = ({
    lead,
    isDragging,
    busy,
    onDragStart,
    onDragEnd,
    onMove
}: {
    lead: Lead;
    isDragging: boolean;
    busy: boolean;
    onDragStart: (event: DragEvent<HTMLElement>, leadId: string) => void;
    onDragEnd: () => void;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    const { t } = useTranslation();
    const statusConfig = getStatusConfig(t);
    const status = statusConfig[lead.status];
    const sourceLabel = getLeadSource(lead);
    const nextStatus =
        lead.status === 'OPEN'
            ? 'IN_PROGRESS'
            : lead.status === 'IN_PROGRESS'
            ? 'COMPLETED'
            : null;

    return (
        <article
            draggable
            onDragStart={(event) => onDragStart(event, lead._id)}
            onDragEnd={onDragEnd}
            className={`group cursor-grab rounded-[22px] border border-slate-200 bg-white p-3.5 shadow-sm transition ${
                isDragging
                    ? 'scale-[0.98] opacity-60'
                    : 'hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_var(--brand-slate-a10)]'
            }`}
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${status.badgeClass}`}>
                    {status.title}
                </span>
                <div className="flex items-center gap-1 text-slate-300">
                    <GripVertical size={15} />
                    <MoreHorizontal size={16} />
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-sm font-extrabold text-white shadow-sm">
                    {(lead.name || 'L').charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-extrabold text-slate-900">
                        {lead.name || 'Unnamed lead'}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-amber-800">
                            <Tag size={11} />
                            {sourceLabel}
                        </span>
                        {lead.eventDate && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                <Clock3 size={11} />
                                {formatDate(lead.eventDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-(--brand-surface-ivory) px-3 py-3">
                <ContactLink
                    icon={<Mail size={14} />}
                    value={lead.email || 'No email'}
                    href={lead.email ? `mailto:${lead.email}` : undefined}
                />
                <ContactLink
                    icon={<Phone size={14} />}
                    value={lead.phone || 'No phone'}
                    href={lead.phone ? `tel:${lead.phone}` : undefined}
                />
            </div>

            {(lead.package || lead.guests) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniMeta label="Package" value={lead.package || '-'} />
                    <MiniMeta label="Guests" value={lead.guests ? `${lead.guests}` : '-'} />
                </div>
            )}

            {lead.message && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        <MessageSquare size={12} />
                        Customer note
                    </p>
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                        {truncateText(lead.message, 130)}
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <CircleDot size={12} />
                    Drag card
                </div>

                {nextStatus ? (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onMove(lead._id, nextStatus)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {nextStatus === 'IN_PROGRESS' ? 'Start' : 'Done'}
                        {nextStatus === 'COMPLETED' ? (
                            <CheckCircle2 size={14} />
                        ) : (
                            <ArrowRight size={14} />
                        )}
                    </button>
                ) : (
                    <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-stone-50 px-3 text-xs font-extrabold text-slate-600">
                        <CheckCircle2 size={14} />
                        Complete
                    </span>
                )}
            </div>
        </article>
    );
};

const LeadListView = ({
    leads,
    busy,
    onMove
}: {
    leads: Lead[];
    busy: boolean;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <WorkspaceHeader
                title="List workspace"
                text="Scan every matching lead in one dense view with quick contact and status actions."
                badge={`${leads.length} lead${leads.length === 1 ? '' : 's'}`}
            />

            {leads.length === 0 ? (
                <EmptyState
                    title="No matching leads"
                    text="Adjust search or filters to find the enquiry you need."
                />
            ) : (
                <>
                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                        <table className="w-full min-w-[940px] border-separate border-spacing-0 text-left">
                            <thead className="bg-stone-50">
                                <tr>
                                    {['Lead', 'Status', 'Event', 'Package', 'Contact', 'Action'].map((heading) => (
                                        <th
                                            key={heading}
                                            className="border-b border-slate-200 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <LeadListRow
                                        key={lead._id}
                                        lead={lead}
                                        busy={busy}
                                        onMove={onMove}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 lg:hidden">
                        {leads.map((lead) => (
                            <LeadListMobileCard
                                key={lead._id}
                                lead={lead}
                                busy={busy}
                                onMove={onMove}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

const LeadListRow = ({
    lead,
    busy,
    onMove
}: {
    lead: Lead;
    busy: boolean;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    const { t } = useTranslation();
    const statusConfig = getStatusConfig(t);
    const status = statusConfig[lead.status];
    const nextStatus = getNextStatus(lead.status);

    return (
        <tr className="transition hover:bg-amber-50/50">
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-sm font-extrabold text-white shadow-sm">
                        {(lead.name || 'L').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                            {lead.name || 'Unnamed lead'}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-500">
                            {truncateText(lead.message || 'No customer note yet', 72)}
                        </p>
                    </div>
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <span className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${status.badgeClass}`}>
                    {status.title}
                </span>
            </td>
            <td className="border-b border-slate-100 px-4 py-4 text-sm font-bold text-slate-700">
                {lead.eventDate ? formatDate(lead.eventDate) : 'Not set'}
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <p className="text-sm font-extrabold text-slate-900">
                    {lead.package || '-'}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                    {lead.guests ? `${lead.guests} guests` : 'Guest count not set'}
                </p>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="grid gap-1">
                    <ContactLink
                        icon={<Mail size={14} />}
                        value={lead.email || 'No email'}
                        href={lead.email ? `mailto:${lead.email}` : undefined}
                    />
                    <ContactLink
                        icon={<Phone size={14} />}
                        value={lead.phone || 'No phone'}
                        href={lead.phone ? `tel:${lead.phone}` : undefined}
                    />
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <StatusAction lead={lead} nextStatus={nextStatus} busy={busy} onMove={onMove} />
            </td>
        </tr>
    );
};

const LeadListMobileCard = ({
    lead,
    busy,
    onMove
}: {
    lead: Lead;
    busy: boolean;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    const { t } = useTranslation();
    const statusConfig = getStatusConfig(t);
    const status = statusConfig[lead.status];
    const nextStatus = getNextStatus(lead.status);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${status.badgeClass}`}>
                        {status.title}
                    </span>
                    <h3 className="mt-3 truncate text-base font-extrabold text-slate-900">
                        {lead.name || 'Unnamed lead'}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                        {lead.eventDate ? formatDate(lead.eventDate) : 'Event date not set'}
                    </p>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-sm font-extrabold text-white shadow-sm">
                    {(lead.name || 'L').charAt(0).toUpperCase()}
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMeta label="Package" value={lead.package || '-'} />
                <MiniMeta label="Guests" value={lead.guests ? `${lead.guests}` : '-'} />
            </div>

            <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-(--brand-surface-ivory) px-3 py-3">
                <ContactLink
                    icon={<Mail size={14} />}
                    value={lead.email || 'No email'}
                    href={lead.email ? `mailto:${lead.email}` : undefined}
                />
                <ContactLink
                    icon={<Phone size={14} />}
                    value={lead.phone || 'No phone'}
                    href={lead.phone ? `tel:${lead.phone}` : undefined}
                />
            </div>

            {lead.message && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    {truncateText(lead.message, 120)}
                </p>
            )}

            <div className="mt-4">
                <StatusAction lead={lead} nextStatus={nextStatus} busy={busy} onMove={onMove} />
            </div>
        </article>
    );
};

const StatusAction = ({
    lead,
    nextStatus,
    busy,
    onMove
}: {
    lead: Lead;
    nextStatus: LeadStatus | null;
    busy: boolean;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    if (!nextStatus) {
        return (
            <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-stone-50 px-3 text-xs font-extrabold text-slate-600">
                <CheckCircle2 size={14} />
                Complete
            </span>
        );
    }

    return (
        <button
            type="button"
            disabled={busy}
            onClick={() => onMove(lead._id, nextStatus)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {nextStatus === 'IN_PROGRESS' ? 'Start' : 'Done'}
            {nextStatus === 'COMPLETED' ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
        </button>
    );
};

const ContactLink = ({
    icon,
    value,
    href
}: {
    icon: ReactNode;
    value: string;
    href?: string;
}) => {
    const content = (
        <>
            <span className="text-slate-400">{icon}</span>
            <span className="truncate">{value}</span>
        </>
    );

    if (!href) {
        return (
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500">
                {content}
            </div>
        );
    }

    return (
        <a
            href={href}
            className="flex min-w-0 items-center gap-2 rounded-xl text-sm font-bold text-slate-700 transition hover:text-amber-800"
        >
            {content}
        </a>
    );
};

const MiniMeta = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-extrabold text-slate-800">
                {value}
            </p>
        </div>
    );
};

const EmptyState = ({ title, text }: { title: string; text: string }) => {
    return (
        <div className="grid min-h-[210px] place-items-center rounded-[22px] border border-dashed border-slate-200 bg-stone-50 px-4 text-center">
            <div>
                <Inbox className="mx-auto text-slate-400" size={24} />
                <p className="mt-3 text-sm font-extrabold text-slate-800">{title}</p>
                <p className="mx-auto mt-1 max-w-[15rem] text-xs font-medium leading-5 text-slate-500">
                    {text}
                </p>
            </div>
        </div>
    );
};

const getLeadSource = (lead: Lead) => {
    if (lead.package || lead.eventDate || lead.guests) return 'Catering';
    return lead.utmSource || 'Website';
};

const getNextStatus = (status: LeadStatus): LeadStatus | null => {
    if (status === 'OPEN') return 'IN_PROGRESS';
    if (status === 'IN_PROGRESS') return 'COMPLETED';
    return null;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Date not set';

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};
