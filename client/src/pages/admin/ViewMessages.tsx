import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, api } from '../../hooks/useApi';
import { Mail, CheckCircle, Trash2, MessageSquare, Inbox } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const ViewMessages = () => {
    const queryClient = useQueryClient();

    const { data: raw, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: getMessages
    });

    // API returns { data: [...], total, page, limit } — normalise
    const messages: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

    const markRead = useMutation({
        mutationFn: (id: string) => api.patch(`/messages/${id}/read`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages'] }); toast.success('Marked as read'); },
        onError: () => toast.error('Action failed'),
    });

    const deleteMsg = useMutation({
        mutationFn: (id: string) => api.delete(`/messages/${id}`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages'] }); toast.success('Deleted'); },
        onError: () => toast.error('Delete failed'),
    });

    return (
        <div className="animate-fadeIn space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Inbox size={22} className="text-primary-400" /> Messages
                </h1>
                <p className="text-dark-400 text-sm mt-1">Contact form submissions from your website.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16"><Spinner /></div>
            ) : messages.length === 0 ? (
                <div className="admin-card text-center py-16 text-dark-500">
                    <MessageSquare size={36} className="mx-auto mb-3 text-dark-700" />
                    <p className="font-semibold">No messages yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg: any) => (
                        <div
                            key={msg._id}
                            className={`admin-card transition-all ${!msg.read ? 'border-l-4 border-l-primary-500' : 'opacity-75'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Avatar + info */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.read ? 'bg-primary-500/15 text-primary-400' : 'bg-dark-700 text-dark-400'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white text-sm">{msg.name}</h3>
                                            {!msg.read && <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-bold">New</span>}
                                        </div>
                                        <p className="text-xs text-dark-400">{msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-dark-500 flex-shrink-0">{fmt(msg.createdAt)}</span>
                            </div>

                            <p className="mt-3 text-dark-300 text-sm leading-relaxed bg-dark-900/50 rounded-xl p-4">
                                {msg.message}
                            </p>

                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    onClick={() => deleteMsg.mutate(msg._id)}
                                    disabled={deleteMsg.isPending}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                                {!msg.read && (
                                    <button
                                        onClick={() => markRead.mutate(msg._id)}
                                        disabled={markRead.isPending}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-500/10 transition-all"
                                    >
                                        <CheckCircle size={13} /> Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
