import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Mail,
    Phone,
    Calendar,
    ArrowRight,
    UserPlus,
    Info,
    CheckCircle2,
    Clock3,
    CircleDot
} from 'lucide-react';
import { getLeads, updateLeadStatus } from '../../hooks/useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { MetricCard } from '../../components/AdminUI';

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

export const ManageLeads = () => {
    const queryClient = useQueryClient();

    const {
        data: leads,
        isLoading,
        isError
    } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
            updateLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const leadsArray: Lead[] = Array.isArray(leads?.data) ? leads.data : [];
    const openLeads = leadsArray.filter((lead) => lead.status === 'OPEN');
    const inProgressLeads = leadsArray.filter(
        (lead) => lead.status === 'IN_PROGRESS'
    );
    const completedLeads = leadsArray.filter(
        (lead) => lead.status === 'COMPLETED'
    );

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
                <h3 className="text-lg font-semibold text-red-700">
                    Failed to load leads
                </h3>
                <p className="mt-2 text-sm text-red-600">
                    Please refresh and try again.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Dashboard
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                            Lead Management
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Track and convert your catering and contact inquiries.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard
                            label="Open"
                            value={openLeads.length}
                            icon={<CircleDot size={16} />}
                        />
                        <MetricCard
                            label="In Progress"
                            value={inProgressLeads.length}
                            icon={<Clock3 size={16} />}
                        />
                        <MetricCard
                            label="Closed"
                            value={completedLeads.length}
                            icon={<CheckCircle2 size={16} />}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <LeadColumn
                    title="Nieuw (Open)"
                    count={openLeads.length}
                    borderClass="border-red-500"
                    emptyText="No open leads."
                >
                    {openLeads.map((lead) => (
                        <LeadCard
                            key={lead._id}
                            lead={lead}
                            isPending={updateStatusMutation.isPending}
                            onStatusUpdate={(status) =>
                                updateStatusMutation.mutate({
                                    id: lead._id,
                                    status
                                })
                            }
                        />
                    ))}
                </LeadColumn>

                <LeadColumn
                    title="In Behandeling"
                    count={inProgressLeads.length}
                    borderClass="border-amber-500"
                    emptyText="No deals in progress."
                >
                    {inProgressLeads.map((lead) => (
                        <LeadCard
                            key={lead._id}
                            lead={lead}
                            isPending={updateStatusMutation.isPending}
                            onStatusUpdate={(status) =>
                                updateStatusMutation.mutate({
                                    id: lead._id,
                                    status
                                })
                            }
                        />
                    ))}
                </LeadColumn>

                <LeadColumn
                    title="Afgerond"
                    count={completedLeads.length}
                    borderClass="border-emerald-500"
                    emptyText="No finished deals yet."
                >
                    {completedLeads.map((lead) => (
                        <LeadCard
                            key={lead._id}
                            lead={lead}
                            isPending={updateStatusMutation.isPending}
                            onStatusUpdate={(status) =>
                                updateStatusMutation.mutate({
                                    id: lead._id,
                                    status
                                })
                            }
                        />
                    ))}
                </LeadColumn>
            </div>
        </div>
    );
};

const LeadColumn = ({
    title,
    count,
    borderClass,
    emptyText,
    children
}: {
    title: string;
    count: number;
    borderClass: string;
    emptyText: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-2 border-b-2 pb-2 ${borderClass}`}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                    {title}
                </h4>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {count}
                </span>
            </div>

            {count > 0 ? (
                children
            ) : (
                <p className="mt-4 text-center text-sm italic text-slate-400">
                    {emptyText}
                </p>
            )}
        </div>
    );
};

const LeadCard = ({
    lead,
    onStatusUpdate,
    isPending
}: {
    lead: Lead;
    onStatusUpdate: (status: LeadStatus) => void;
    isPending: boolean;
}) => {
    const source = (lead.utmSource || '').toLowerCase();
    const isNew = lead.status === 'OPEN';
    const isContactForm = !lead.package && !lead.eventDate;

    let sourceBadge = 'bg-slate-100 text-slate-600';
    let sourceText = lead.utmSource || 'Website Form';

    if (source.includes('meta') || source.includes('facebook')) {
        sourceBadge = 'bg-blue-100 text-blue-700';
    } else if (source.includes('instagram')) {
        sourceBadge = 'bg-purple-100 text-purple-700';
    } else if (lead.package) {
        sourceBadge = 'bg-rose-100 text-rose-700';
        sourceText = 'Catering Quote';
    }

    const cardBorderClass = isNew
        ? 'border-l-red-500'
        : lead.status === 'IN_PROGRESS'
        ? 'border-l-amber-500'
        : 'border-l-emerald-500 opacity-80';

    return (
        <Card
            className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${cardBorderClass}`}
        >
            <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <h5 className="flex items-center gap-2 font-bold text-slate-900">
                        {isContactForm ? (
                            <UserPlus size={16} className="text-blue-500" />
                        ) : (
                            <Calendar size={16} className="text-rose-600" />
                        )}
                        <span className="truncate">{lead.name}</span>
                    </h5>

                    <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceBadge}`}
                    >
                        {sourceText}
                    </span>
                </div>

                <div className="mb-4 space-y-1 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">
                            {lead.email}
                        </a>
                    </span>

                    <span className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <a href={`tel:${lead.phone}`} className="hover:underline">
                            {lead.phone}
                        </a>
                    </span>
                </div>

                {!isContactForm && (
                    <div className="mb-4 grid grid-cols-2 gap-2 rounded bg-slate-50 p-3 text-xs text-slate-700">
                        <div>
                            <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">
                                Event Datum
                            </span>
                            <span className="font-bold">
                                {lead.eventDate
                                    ? new Date(lead.eventDate).toLocaleDateString('nl-NL')
                                    : '-'}
                            </span>
                        </div>

                        <div>
                            <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">
                                Gasten
                            </span>
                            <span className="font-bold">
                                {lead.guests ? `${lead.guests} pers.` : '-'}
                            </span>
                        </div>

                        <div className="col-span-2 mt-1">
                            <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">
                                Interesse Type
                            </span>
                            <span className="font-bold">{lead.package || '-'}</span>
                        </div>
                    </div>
                )}

                {lead.message && (
                    <div className="mb-4 rounded border-l-2 border-blue-200 bg-blue-50/50 p-3 text-sm italic text-slate-700">
                        <span className="mb-1 flex items-center gap-1 text-xs font-bold not-italic text-blue-500">
                            <Info size={12} />
                            Message:
                        </span>
                        "{lead.message.length > 80
                            ? `${lead.message.substring(0, 80)}...`
                            : lead.message}"
                    </div>
                )}

                <div className="flex gap-2">
                    {lead.status === 'OPEN' && (
                        <Button
                            disabled={isPending}
                            className="h-8 flex-1 bg-amber-500 text-xs text-white hover:bg-amber-600 disabled:opacity-50"
                            onClick={() => onStatusUpdate('IN_PROGRESS')}
                        >
                            Start Contact
                        </Button>
                    )}

                    {lead.status === 'IN_PROGRESS' && (
                        <Button
                            disabled={isPending}
                            className="h-8 flex-1 bg-emerald-500 text-xs text-white hover:bg-emerald-600 disabled:opacity-50"
                            onClick={() => onStatusUpdate('COMPLETED')}
                        >
                            Deal Completed
                        </Button>
                    )}

                    {lead.status !== 'COMPLETED' && (
                        <Button
                            disabled={isPending}
                            variant="outline"
                            className="h-8 w-8 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            onClick={() => onStatusUpdate('COMPLETED')}
                            title="Zonder Succes Afsluiten"
                        >
                            <ArrowRight size={14} />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
