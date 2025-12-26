import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, Calendar, ArrowRight } from 'lucide-react';

import { getLeads, updateLeadStatus } from '../../hooks/useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ManageLeads = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success(t('admin.leads.statusUpdated'));
        },
        onError: () => toast.error(t('admin.leads.updateFailed'))
    });

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('admin.leads.title')}</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <div className="p-6 border-b">
                        <h4 className="font-bold text-tamil-maroon uppercase tracking-widest text-xs">{t('admin.leads.requests')} ({leads?.length || 0})</h4>
                    </div>
                    <CardContent className="divide-y p-0">
                        {leads?.map((lead: any) => (
                            <LeadDetail
                                key={lead._id}
                                id={lead._id}
                                name={lead.name}
                                email={lead.email}
                                phone={lead.phone}
                                date={lead.eventDate}
                                guests={lead.guests}
                                type={lead.package || t('admin.leads.noPackage')}
                                source={lead.utmSource || 'Website'}
                                status={lead.status}
                                onStatusUpdate={(status: string) => updateStatusMutation.mutate({ id: lead._id, status })}
                                isPending={lead.status === 'OPEN'}
                            />
                        ))}
                        {leads?.length === 0 && (
                            <div className="p-8 text-center text-gray-500">{t('admin.leads.noRequests')}</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const LeadDetail = ({ id, name, email, phone, date, guests, type, source, status, onStatusUpdate, isPending }: any) => {
    const { t } = useTranslation();

    return (
        <div className={`p-8 hover:bg-gray-50 transition-colors ${isPending ? 'border-l-4 border-tamil-maroon' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h5 className="text-xl font-bold text-tamil-charcoal flex items-center gap-2">
                        {name}
                        {isPending && <span className="w-2 h-2 rounded-full bg-tamil-maroon animate-pulse" />}
                    </h5>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={14} /> {email}</span>
                        <span className="flex items-center gap-1"><Phone size={14} /> {phone}</span>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${source === 'Meta Ads' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    Via {source}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50/50 p-4 rounded-lg border border-dashed border-gray-200">
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Datum</div>
                    <div className="font-bold flex items-center gap-2"><Calendar size={14} className="text-tamil-maroon" /> {date}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Personen</div>
                    <div className="font-bold flex items-center gap-2"><ArrowRight size={14} className="text-tamil-maroon" /> {guests}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Type</div>
                    <div className="font-bold">{type}</div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button className="flex-grow" onClick={() => onStatusUpdate && onStatusUpdate('IN_PROGRESS')}>
                    Bekijk Details
                </Button>
                <Button variant="outline" onClick={() => onStatusUpdate && onStatusUpdate('COMPLETED')}>
                    Markeer als Opgevolgd
                </Button>
            </div>
        </div>
    );
};
