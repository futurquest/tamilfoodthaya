import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, api } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Mail, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';

// Format helper
const formatDateHelper = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const ViewMessages = () => {
    const queryClient = useQueryClient();

    const { data: messages, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: getMessages
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/messages/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Gemarkeerd als gelezen');
        },
        onError: () => toast.error('Actie mislukt')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/messages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Bericht verwijderd');
        },
        onError: () => toast.error('Verwijderen mislukt')
    });

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-tamil-charcoal mb-6">Ingebonden Berichten</h1>

            <div className="space-y-4">
                {messages?.map((msg: any) => (
                    <Card key={msg._id} className={msg.read ? 'opacity-70' : 'border-l-4 border-l-tamil-maroon'}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.read ? 'bg-gray-200 text-gray-500' : 'bg-tamil-maroon/10 text-tamil-maroon'}`}>
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{msg.name}</h3>
                                        <p className="text-sm text-gray-500">{msg.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">{formatDateHelper(msg.createdAt)}</span>
                                    {!msg.read && (
                                        <div className="mt-1">
                                            <span className="text-xs bg-tamil-gold/20 text-tamil-gold px-2 py-0.5 rounded-full font-bold">Nieuw</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 bg-gray-50 p-4 rounded mb-4">{msg.message}</p>

                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteMutation.mutate(msg._id)}
                                    disabled={deleteMutation.isPending}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </Button>
                                {!msg.read && (
                                    <Button
                                        size="sm"
                                        onClick={() => markReadMutation.mutate(msg._id)}
                                        disabled={markReadMutation.isPending}
                                    >
                                        <CheckCircle size={16} className="mr-2" /> Markeer als gelezen
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {messages?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Geen berichten gevonden.
                    </div>
                )}
            </div>
        </div>
    );
};
