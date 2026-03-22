import { useEffect, useState, type DragEvent } from 'react';
import {
    Mail,
    Phone,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    GripVertical,
    ArrowRight
} from 'lucide-react';
import { getLeads, updateLeadStatus } from '../../hooks/useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

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

const statusConfig: Record<
    LeadStatus,
    {
        title: string;
        subtitle: string;
        dotClass: string;
        badgeClass: string;
    }
> = {
    OPEN: {
        title: 'New',
        subtitle: 'Fresh enquiries',
        dotClass: 'bg-slate-900',
        badgeClass: 'bg-slate-900 text-white'
    },
    IN_PROGRESS: {
        title: 'In Progress',
        subtitle: 'Ongoing conversations',
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
    },
    COMPLETED: {
        title: 'Completed',
        subtitle: 'Closed enquiries',
        dotClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
};

export const ManageLeads = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads
    });

    const [localLeads, setLocalLeads] = useState<Lead[]>([]);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [activeDropStatus, setActiveDropStatus] = useState<LeadStatus | null>(null);

    const leadsFromApi: Lead[] = Array.isArray(data?.data) ? data.data : [];

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
            toast.success('Lead updated');
        },
        onError: (_error, variables) => {
            setLocalLeads((current) =>
                current.map((lead) =>
                    lead._id === variables.id
                        ? { ...lead, status: variables.previousStatus }
                        : lead
                )
            );
            toast.error('Failed to update lead');
        }
    });

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

    const onDragStart = (e: DragEvent<HTMLDivElement>, leadId: string) => {
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

    const groupedLeads = {
        OPEN: localLeads.filter((lead) => lead.status === 'OPEN'),
        IN_PROGRESS: localLeads.filter((lead) => lead.status === 'IN_PROGRESS'),
        COMPLETED: localLeads.filter((lead) => lead.status === 'COMPLETED')
    };

    const totalLeads = localLeads.length;
    const conversionRate =
        totalLeads > 0
            ? Math.round((groupedLeads.COMPLETED.length / totalLeads) * 100)
            : 0;

    if (isLoading) {
        return (
            <div className="flex min-h-[55vh] items-center justify-center bg-stone-50">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1180px] space-y-5">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                Lead Pipeline
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                A minimal overview of incoming enquiries with quick actions and
                                drag-and-drop movement across stages.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MetricCard label="Total" value={totalLeads} />
                            <MetricCard label="New" value={groupedLeads.OPEN.length} />
                            <MetricCard
                                label="Active"
                                value={groupedLeads.IN_PROGRESS.length}
                            />
                            <MetricCard label="Closed" value={`${conversionRate}%`} />
                        </div>
                    </div>
                </div>

                {/* Board */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <BoardColumn
                        status="OPEN"
                        leads={groupedLeads.OPEN}
                        activeDropStatus={activeDropStatus}
                        draggedLeadId={draggedLeadId}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => draggedLeadId && setActiveDropStatus('OPEN')}
                        onDrop={() => onDropColumn('OPEN')}
                    >
                        {groupedLeads.OPEN.length > 0 ? (
                            groupedLeads.OPEN.map((lead) => (
                                <LeadCard
                                    key={lead._id}
                                    lead={lead}
                                    isDragging={draggedLeadId === lead._id}
                                    busy={updateStatusMutation.isPending}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onMove={moveLead}
                                />
                            ))
                        ) : (
                            <EmptyState text="No new leads" />
                        )}
                    </BoardColumn>

                    <BoardColumn
                        status="IN_PROGRESS"
                        leads={groupedLeads.IN_PROGRESS}
                        activeDropStatus={activeDropStatus}
                        draggedLeadId={draggedLeadId}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() =>
                            draggedLeadId && setActiveDropStatus('IN_PROGRESS')
                        }
                        onDrop={() => onDropColumn('IN_PROGRESS')}
                    >
                        {groupedLeads.IN_PROGRESS.length > 0 ? (
                            groupedLeads.IN_PROGRESS.map((lead) => (
                                <LeadCard
                                    key={lead._id}
                                    lead={lead}
                                    isDragging={draggedLeadId === lead._id}
                                    busy={updateStatusMutation.isPending}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onMove={moveLead}
                                />
                            ))
                        ) : (
                            <EmptyState text="Nothing in progress" />
                        )}
                    </BoardColumn>

                    <BoardColumn
                        status="COMPLETED"
                        leads={groupedLeads.COMPLETED}
                        activeDropStatus={activeDropStatus}
                        draggedLeadId={draggedLeadId}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => draggedLeadId && setActiveDropStatus('COMPLETED')}
                        onDrop={() => onDropColumn('COMPLETED')}
                    >
                        {groupedLeads.COMPLETED.length > 0 ? (
                            groupedLeads.COMPLETED.map((lead) => (
                                <LeadCard
                                    key={lead._id}
                                    lead={lead}
                                    isDragging={draggedLeadId === lead._id}
                                    busy={updateStatusMutation.isPending}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onMove={moveLead}
                                />
                            ))
                        ) : (
                            <EmptyState text="No completed leads" />
                        )}
                    </BoardColumn>
                </div>
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

const BoardColumn = ({
    status,
    leads,
    activeDropStatus,
    draggedLeadId,
    children,
    onDragOver,
    onDragEnter,
    onDrop
}: {
    status: LeadStatus;
    leads: Lead[];
    activeDropStatus: LeadStatus | null;
    draggedLeadId: string | null;
    children: React.ReactNode;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDrop: () => void;
}) => {
    const config = statusConfig[status];
    const isActive = activeDropStatus === status && draggedLeadId;

    return (
        <div
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            className={`rounded-[26px] border bg-white p-3 shadow-sm transition-all ${
                isActive
                    ? 'border-slate-400 ring-2 ring-slate-200'
                    : 'border-slate-200'
            }`}
        >
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            {config.title}
                        </h3>
                        <p className="text-xs text-slate-500">{config.subtitle}</p>
                    </div>
                </div>

                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {leads.length}
                </span>
            </div>

            <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">{children}</div>
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
    onDragStart: (e: DragEvent<HTMLDivElement>, leadId: string) => void;
    onDragEnd: () => void;
    onMove: (leadId: string, nextStatus: LeadStatus) => void;
}) => {
    const status = statusConfig[lead.status];
    const isCatering = Boolean(lead.package || lead.eventDate);
    const sourceLabel = isCatering ? 'Catering' : lead.utmSource || 'Website';

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead._id)}
            onDragEnd={onDragEnd}
            className={`cursor-grab rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition ${
                isDragging ? 'scale-[0.98] opacity-60' : 'hover:border-slate-300'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <GripVertical size={15} className="text-slate-300" />
                        <h4 className="truncate text-[15px] font-semibold text-slate-900">
                            {lead.name}
                        </h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{sourceLabel}</p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badgeClass}`}>
                    {status.title}
                </span>
            </div>

            <div className="mt-4 space-y-2">
                <InfoRow icon={<Mail size={14} />} value={lead.email} />
                <InfoRow icon={<Phone size={14} />} value={lead.phone} />
                {lead.eventDate && (
                    <InfoRow
                        icon={<CalendarDays size={14} />}
                        value={formatDate(lead.eventDate)}
                    />
                )}
            </div>

            {(lead.package || lead.guests) && (
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-stone-50 p-3">
                    <MiniMeta label="Package" value={lead.package || '-'} />
                    <MiniMeta
                        label="Guests"
                        value={lead.guests ? `${lead.guests}` : '-'}
                    />
                </div>
            )}

            {lead.message && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Message
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                        {truncateText(lead.message, 110)}
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <CircleDot size={12} />
                    Drag to move
                </div>

                <div className="flex items-center gap-2">
                    {lead.status === 'OPEN' && (
                        <button
                            disabled={busy}
                            onClick={() => onMove(lead._id, 'IN_PROGRESS')}
                            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Start
                            <ArrowRight size={14} />
                        </button>
                    )}

                    {lead.status === 'IN_PROGRESS' && (
                        <button
                            disabled={busy}
                            onClick={() => onMove(lead._id, 'COMPLETED')}
                            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                            Complete
                            <CheckCircle2 size={14} />
                        </button>
                    )}

                    {lead.status === 'COMPLETED' && (
                        <div className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-stone-50 px-3 text-sm font-medium text-slate-600">
                            <CheckCircle2 size={14} />
                            Done
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({
    icon,
    value
}: {
    icon: React.ReactNode;
    value: string;
}) => {
    return (
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-slate-400">{icon}</span>
            <span className="truncate">{value}</span>
        </div>
    );
};

const MiniMeta = ({
    label,
    value
}: {
    label: string;
    value: string;
}) => {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
        </div>
    );
};

const EmptyState = ({ text }: { text: string }) => {
    return (
        <div className="flex min-h-[180px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-stone-50 px-4 text-center">
            <p className="text-sm text-slate-400">{text}</p>
        </div>
    );
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};