import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, Calendar, ArrowRight, UserPlus, Info } from 'lucide-react';
import { getLeads, updateLeadStatus } from '../../hooks/useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

export const ManageLeads = () => {
    const queryClient = useQueryClient();
    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead status updated!');
        },
        onError: () => toast.error('Failed to update status')
    });

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

    // Categorize Leads
    const leadsArray = leads?.data || [];
    const openLeads = leadsArray.filter((l: any) => l.status === 'OPEN');
    const inProgressLeads = leadsArray.filter((l: any) => l.status === 'IN_PROGRESS');
    const completedLeads = leadsArray.filter((l: any) => l.status === 'COMPLETED');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-tamil-charcoal">Lead Management</h2>
                    <p className="text-gray-500">Track and convert your catering and contact inquiries.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold flex gap-4">
                    <span className="text-red-600">{openLeads.length} Open</span>
                    <span className="text-amber-500">{inProgressLeads.length} In Progress</span>
                    <span className="text-emerald-600">{completedLeads.length} Closed</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Column: OPEN */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b-2 border-red-500 pb-2">
                        <h4 className="font-bold text-gray-800 uppercase tracking-widest text-sm">Nieuw (Open)</h4>
                        <span className="bg-gray-200 text-xs font-bold py-0.5 px-2 rounded-full">{openLeads.length}</span>
                    </div>
                    {openLeads.map((lead: any) => (
                        <LeadCard key={lead._id} lead={lead} onStatusUpdate={(s) => updateStatusMutation.mutate({ id: lead._id, status: s })} />
                    ))}
                    {openLeads.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-4">No open leads.</p>}
                </div>

                {/* Column: IN PROGRESS */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-2">
                        <h4 className="font-bold text-gray-800 uppercase tracking-widest text-sm">In Behandeling</h4>
                        <span className="bg-gray-200 text-xs font-bold py-0.5 px-2 rounded-full">{inProgressLeads.length}</span>
                    </div>
                    {inProgressLeads.map((lead: any) => (
                        <LeadCard key={lead._id} lead={lead} onStatusUpdate={(s) => updateStatusMutation.mutate({ id: lead._id, status: s })} />
                    ))}
                    {inProgressLeads.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-4">No deals in progress.</p>}
                </div>

                {/* Column: COMPLETED */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b-2 border-emerald-500 pb-2">
                        <h4 className="font-bold text-gray-800 uppercase tracking-widest text-sm">Afgerond</h4>
                        <span className="bg-gray-200 text-xs font-bold py-0.5 px-2 rounded-full">{completedLeads.length}</span>
                    </div>
                    {completedLeads.map((lead: any) => (
                        <LeadCard key={lead._id} lead={lead} onStatusUpdate={(s) => updateStatusMutation.mutate({ id: lead._id, status: s })} />
                    ))}
                    {completedLeads.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-4">No finished deals yet.</p>}
                </div>
            </div>
        </div>
    );
};

const LeadCard = ({ lead, onStatusUpdate }: { lead: any; onStatusUpdate: (status: string) => void }) => {
    // Styling tags based on source
    let sourceBadge = 'bg-gray-100 text-gray-600';
    let sourceText = lead.utmSource || 'Website Form';
    if (lead.utmSource?.includes('Meta') || lead.utmSource?.includes('Facebook')) {
        sourceBadge = 'bg-blue-100 text-blue-700';
    } else if (lead.package) {
        sourceBadge = 'bg-tamil-maroon/10 text-tamil-maroon';
        sourceText = 'Catering Quote';
    }

    // Determine the next step dynamically
    const isNew = lead.status === 'OPEN';
    const isContactForm = !lead.package && !lead.eventDate;

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${isNew ? 'border-l-red-500' : lead.status === 'IN_PROGRESS' ? 'border-l-amber-500' : 'border-l-emerald-500 opacity-60'}`}>
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-tamil-charcoal flex items-center gap-2">
                        {isContactForm ? <UserPlus size={16} className="text-blue-500" /> : <Calendar size={16} className="text-tamil-maroon" />}
                        {lead.name}
                    </h5>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${sourceBadge}`}>
                        {sourceText}
                    </span>
                </div>

                <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a></span>
                    <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a></span>
                </div>

                {/* Sub Metadata (If it's a catering quote rather than generic contact) */}
                {!isContactForm && (
                    <div className="bg-gray-50 rounded p-3 mb-4 text-xs grid grid-cols-2 gap-2 text-gray-700">
                        <div>
                            <span className="text-gray-400 uppercase font-bold block mb-0.5 text-[9px]">Event Datum</span>
                            <span className="font-bold">{new Date(lead.eventDate).toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 uppercase font-bold block mb-0.5 text-[9px]">Gasten</span>
                            <span className="font-bold">{lead.guests} pers.</span>
                        </div>
                        <div className="col-span-2 mt-1">
                            <span className="text-gray-400 uppercase font-bold block mb-0.5 text-[9px]">Interesse Type</span>
                            <span className="font-bold">{lead.package}</span>
                        </div>
                    </div>
                )}

                {/* Generic Messages (If provided) */}
                {lead.message && (
                    <div className="bg-blue-50/50 rounded p-3 mb-4 text-sm text-gray-700 italic border-l-2 border-blue-200">
                        <span className="flex items-center gap-1 font-bold not-italic text-xs text-blue-400 mb-1"><Info size={12} /> Message:</span>
                        "{lead.message.length > 80 ? `${lead.message.substring(0, 80)}...` : lead.message}"
                    </div>
                )}

                {/* Actions Grid */}
                <div className="flex gap-2">
                    {lead.status === 'OPEN' && (
                        <Button className="flex-1 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onStatusUpdate('IN_PROGRESS')}>
                            Start Contact
                        </Button>
                    )}
                    {lead.status === 'IN_PROGRESS' && (
                        <Button className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => onStatusUpdate('COMPLETED')}>
                            Deal Completed
                        </Button>
                    )}
                    {lead.status !== 'COMPLETED' && (
                        <Button variant="outline" className="h-8 w-8 p-0 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onStatusUpdate('COMPLETED')} title="Zonder Succes Afsluiten">
                            <ArrowRight size={14} />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
