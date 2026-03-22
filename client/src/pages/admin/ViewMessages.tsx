import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, api } from '../../hooks/useApi';
import {
    Mail,
    CheckCircle2,
    Trash2,
    MessageSquare,
    Inbox,
    Phone,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';

type MessageItem = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    read?: boolean;
    createdAt: string;
};

type FilterType = 'ALL' | 'UNREAD' | 'READ';

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

export const ViewMessages = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FilterType>('ALL');

    const { data: raw, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: getMessages
    });

    const messages: MessageItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

    const markRead = useMutation({
        mutationFn: (id: string) => api.patch(`/messages/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Marked as read');
        },
        onError: () => toast.error('Action failed')
    });

    const deleteMsg = useMutation({
        mutationFn: (id: string) => api.delete(`/messages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Deleted');
        },
        onError: () => toast.error('Delete failed')
    });

    const unreadCount = messages.filter((msg) => !msg.read).length;
    const readCount = messages.filter((msg) => msg.read).length;

    const filteredMessages = useMemo(() => {
        if (filter === 'UNREAD') return messages.filter((msg) => !msg.read);
        if (filter === 'READ') return messages.filter((msg) => msg.read);
        return messages;
    }, [messages, filter]);

    if (isLoading) {
        return (
            <div className="flex min-h-[55vh] items-center justify-center bg-stone-50">
                <Spinner />
            </div>
        );
    }

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
                                <Inbox size={24} className="text-slate-900" />
                                Messages
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Contact form submissions from your website in a clean, minimal inbox view.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <MetricCard label="Total" value={messages.length} />
                            <MetricCard label="Unread" value={unreadCount} />
                            <MetricCard label="Read" value={readCount} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Filter size={16} className="text-slate-400" />
                            Filter messages
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <FilterButton
                                active={filter === 'ALL'}
                                onClick={() => setFilter('ALL')}
                                label={`All (${messages.length})`}
                            />
                            <FilterButton
                                active={filter === 'UNREAD'}
                                onClick={() => setFilter('UNREAD')}
                                label={`Unread (${unreadCount})`}
                            />
                            <FilterButton
                                active={filter === 'READ'}
                                onClick={() => setFilter('READ')}
                                label={`Read (${readCount})`}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {filteredMessages.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
                            <MessageSquare size={22} className="text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No messages found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            There are no messages in this filter right now.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`rounded-[26px] border bg-white p-5 shadow-sm transition-all ${
                                    !msg.read
                                        ? 'border-slate-300'
                                        : 'border-slate-200'
                                }`}
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    {/* Left side */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                                                    !msg.read
                                                        ? 'border-slate-300 bg-slate-900 text-white'
                                                        : 'border-slate-200 bg-stone-50 text-slate-500'
                                                }`}
                                            >
                                                <Mail size={18} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-[15px] font-semibold text-slate-900">
                                                        {msg.name}
                                                    </h3>

                                                    {!msg.read && (
                                                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                                                            New
                                                        </span>
                                                    )}

                                                    {msg.read && (
                                                        <span className="rounded-full border border-slate-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                            Read
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-slate-400" />
                                                        <span className="truncate">{msg.email}</span>
                                                    </div>

                                                    {msg.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-slate-400" />
                                                            <span>{msg.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-stone-50 p-4">
                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                Message
                                            </p>
                                            <p className="text-sm leading-7 text-slate-700">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right side */}
                                    <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[170px] md:items-end">
                                        <span className="text-xs text-slate-400">
                                            {fmt(msg.createdAt)}
                                        </span>

                                        <div className="flex flex-wrap gap-2 md:justify-end">
                                            {!msg.read && (
                                                <button
                                                    onClick={() => markRead.mutate(msg._id)}
                                                    disabled={markRead.isPending}
                                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={15} />
                                                    Mark read
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteMsg.mutate(msg._id)}
                                                disabled={deleteMsg.isPending}
                                                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

const FilterButton = ({
    active,
    onClick,
    label
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                active
                    ? 'border border-slate-900 bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50'
            }`}
        >
            {label}
        </button>
    );
};