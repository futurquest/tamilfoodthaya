import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2,
    Clock3,
    Filter,
    Inbox,
    LayoutList,
    Mail,
    MessageSquare,
    PanelLeft,
    Phone,
    Search,
    Trash2,
    UserCircle
} from 'lucide-react';
import { getMessages, api } from '../../hooks/useApi';
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
type ViewMode = 'inbox' | 'list';

const filterConfig: Record<FilterType, { label: string; title: string; helper: string }> = {
    ALL: {
        label: 'All',
        title: 'All messages',
        helper: 'Every website message in one operational inbox.'
    },
    UNREAD: {
        label: 'Unread',
        title: 'Unread messages',
        helper: 'New customer enquiries that still need attention.'
    },
    READ: {
        label: 'Read',
        title: 'Read messages',
        helper: 'Messages already reviewed by the team.'
    }
};

const fmt = (d: string) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return 'Date not set';

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const ViewMessages = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const {
        data: raw,
        isLoading,
        isError
    } = useQuery({
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
            toast.success('Message marked as read');
        },
        onError: () => toast.error('Could not mark the message as read')
    });

    const deleteMsg = useMutation({
        mutationFn: (id: string) => api.delete(`/messages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success('Message deleted');
        },
        onError: () => toast.error('Could not delete the message')
    });

    const unreadCount = messages.filter((msg) => !msg.read).length;
    const readCount = messages.filter((msg) => msg.read).length;

    const filteredMessages = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return messages.filter((msg) => {
            if (filter === 'UNREAD' && msg.read) return false;
            if (filter === 'READ' && !msg.read) return false;
            if (!query) return true;

            return [msg.name, msg.email, msg.phone, msg.message]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [messages, filter, searchTerm]);

    const selectedMessage = useMemo(() => {
        return (
            filteredMessages.find((msg) => msg._id === selectedId) ??
            filteredMessages[0] ??
            null
        );
    }, [filteredMessages, selectedId]);

    useEffect(() => {
        if (!filteredMessages.length) {
            setSelectedId(null);
            return;
        }

        if (!selectedId || !filteredMessages.some((msg) => msg._id === selectedId)) {
            setSelectedId(filteredMessages[0]._id);
        }
    }, [filteredMessages, selectedId]);

    if (isLoading) {
        return (
            <div className="admin-loading-state">
                <Spinner size="lg" />
                <p>Loading customer messages...</p>
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
                            Messages could not be loaded
                        </h1>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-red-600">
                            Refresh the page or check the API connection before replying to customer enquiries.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    Customer Message Inbox
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <MessageSquare size={13} />
                                    {viewMode === 'inbox' ? 'Inbox view' : 'List view'}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                Review website enquiries, spot unread messages quickly and keep customer follow-up moving.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[430px]">
                            <MetricCard label="Total" value={messages.length} icon={<Inbox size={16} />} />
                            <MetricCard label="Unread" value={unreadCount} icon={<Mail size={16} />} />
                            <MetricCard label="Read" value={readCount} icon={<CheckCircle2 size={16} />} />
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
                                placeholder="Search name, email, phone or message..."
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                            <MessageTabs
                                value={filter}
                                counts={{
                                    ALL: messages.length,
                                    UNREAD: unreadCount,
                                    READ: readCount
                                }}
                                onChange={setFilter}
                            />
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={12} />
                            Showing {filteredMessages.length} of {messages.length} messages
                        </span>
                        {(searchTerm || filter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilter('ALL');
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </section>

                {viewMode === 'inbox' ? (
                    <InboxWorkspace
                        filter={filter}
                        messages={filteredMessages}
                        selectedMessage={selectedMessage}
                        selectedId={selectedId}
                        busy={markRead.isPending || deleteMsg.isPending}
                        onSelect={setSelectedId}
                        onMarkRead={(id) => markRead.mutate(id)}
                        onDelete={(id) => deleteMsg.mutate(id)}
                    />
                ) : (
                    <MessageListView
                        messages={filteredMessages}
                        busy={markRead.isPending || deleteMsg.isPending}
                        onMarkRead={(id) => markRead.mutate(id)}
                        onDelete={(id) => deleteMsg.mutate(id)}
                    />
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
    );
};

const MessageTabs = ({
    value,
    counts,
    onChange
}: {
    value: FilterType;
    counts: Record<FilterType, number>;
    onChange: (value: FilterType) => void;
}) => {
    const tabs: FilterType[] = ['ALL', 'UNREAD', 'READ'];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Filter size={13} />
                Status
            </span>
            <div className="flex max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {tabs.map((tab) => {
                    const active = value === tab;

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => onChange(tab)}
                            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {filterConfig[tab].label}
                            <span
                                className={`rounded-lg px-1.5 py-0.5 text-[10px] ${
                                    active ? 'bg-amber-50 text-amber-800' : 'bg-white text-slate-500'
                                }`}
                            >
                                {counts[tab]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ViewToggle = ({
    value,
    onChange
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
}) => {
    const options: { value: ViewMode; label: string; icon: ReactNode }[] = [
        { value: 'inbox', label: 'Inbox', icon: <PanelLeft size={14} /> },
        { value: 'list', label: 'List', icon: <LayoutList size={14} /> }
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

const InboxWorkspace = ({
    filter,
    messages,
    selectedMessage,
    selectedId,
    busy,
    onSelect,
    onMarkRead,
    onDelete
}: {
    filter: FilterType;
    messages: MessageItem[];
    selectedMessage: MessageItem | null;
    selectedId: string | null;
    busy: boolean;
    onSelect: (id: string) => void;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_42%,#f8fafc_100%)] p-3 shadow-sm">
            <WorkspaceHeader
                title={filterConfig[filter].title}
                text={filterConfig[filter].helper}
                badge={`${messages.length} message${messages.length === 1 ? '' : 's'}`}
            />

            {messages.length === 0 ? (
                <EmptyState
                    title="No matching messages"
                    text="Adjust search or filters to find the customer message you need."
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
                    <div className="grid gap-2 lg:max-h-[68vh] lg:overflow-y-auto lg:pr-1">
                        {messages.map((message) => (
                            <MessagePreviewCard
                                key={message._id}
                                message={message}
                                active={selectedId === message._id}
                                onClick={() => onSelect(message._id)}
                            />
                        ))}
                    </div>

                    <MessageDetail
                        message={selectedMessage}
                        busy={busy}
                        onMarkRead={onMarkRead}
                        onDelete={onDelete}
                    />
                </div>
            )}
        </section>
    );
};

const WorkspaceHeader = ({
    title,
    text,
    badge
}: {
    title: string;
    text: string;
    badge: string;
}) => {
    return (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    {title}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-slate-700">
                    {text}
                </p>
            </div>
            <span className="hidden shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-800 sm:inline-flex">
                {badge}
            </span>
        </div>
    );
};

const MessagePreviewCard = ({
    message,
    active,
    onClick
}: {
    message: MessageItem;
    active: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
                active
                    ? 'border-amber-300 bg-white shadow-md'
                    : 'border-slate-200 bg-white/80 hover:border-amber-200 hover:bg-white'
            }`}
        >
            <div className="flex items-start gap-3">
                <Avatar name={message.name} unread={!message.read} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                            {message.name || 'Unnamed customer'}
                        </p>
                        <MessageBadge read={message.read} />
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">
                        {message.email || 'No email address'}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                        {truncateText(message.message, 96)}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock3 size={12} />
                        {fmt(message.createdAt)}
                    </p>
                </div>
            </div>
        </button>
    );
};

const MessageDetail = ({
    message,
    busy,
    onMarkRead,
    onDelete
}: {
    message: MessageItem | null;
    busy: boolean;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    if (!message) {
        return (
            <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-4 text-center">
                <div>
                    <Inbox className="mx-auto text-slate-400" size={26} />
                    <p className="mt-3 text-sm font-extrabold text-slate-800">
                        Select a message
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                        Choose a customer message from the inbox to read it here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={message.name} unread={!message.read} large />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900">
                                {message.name || 'Unnamed customer'}
                            </h2>
                            <MessageBadge read={message.read} />
                        </div>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Clock3 size={13} />
                            {fmt(message.createdAt)}
                        </p>
                    </div>
                </div>

                <MessageActions
                    message={message}
                    busy={busy}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                <ContactBlock icon={<Mail size={15} />} label="Email" value={message.email || 'No email'} href={message.email ? `mailto:${message.email}` : undefined} />
                <ContactBlock icon={<Phone size={15} />} label="Phone" value={message.phone || 'No phone'} href={message.phone ? `tel:${message.phone}` : undefined} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <MessageSquare size={13} />
                    Customer message
                </p>
                <p className="whitespace-pre-wrap text-[15px] font-semibold leading-7 text-slate-700">
                    {message.message}
                </p>
            </div>
        </article>
    );
};

const MessageListView = ({
    messages,
    busy,
    onMarkRead,
    onDelete
}: {
    messages: MessageItem[];
    busy: boolean;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <WorkspaceHeader
                title="List workspace"
                text="Scan matching messages in one dense operational view."
                badge={`${messages.length} message${messages.length === 1 ? '' : 's'}`}
            />

            {messages.length === 0 ? (
                <EmptyState
                    title="No matching messages"
                    text="Adjust search or filters to find the customer message you need."
                />
            ) : (
                <>
                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                            <thead className="bg-stone-50">
                                <tr>
                                    {['Customer', 'Status', 'Message', 'Received', 'Contact', 'Action'].map((heading) => (
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
                                {messages.map((message) => (
                                    <MessageListRow
                                        key={message._id}
                                        message={message}
                                        busy={busy}
                                        onMarkRead={onMarkRead}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 lg:hidden">
                        {messages.map((message) => (
                            <MessageMobileCard
                                key={message._id}
                                message={message}
                                busy={busy}
                                onMarkRead={onMarkRead}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

const MessageListRow = ({
    message,
    busy,
    onMarkRead,
    onDelete
}: {
    message: MessageItem;
    busy: boolean;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <tr className="transition hover:bg-amber-50/50">
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={message.name} unread={!message.read} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                            {message.name || 'Unnamed customer'}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-500">
                            {message.email || 'No email address'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <MessageBadge read={message.read} />
            </td>
            <td className="max-w-[300px] border-b border-slate-100 px-4 py-4 text-sm font-semibold leading-6 text-slate-600">
                {truncateText(message.message, 92)}
            </td>
            <td className="border-b border-slate-100 px-4 py-4 text-sm font-bold text-slate-700">
                {fmt(message.createdAt)}
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="grid gap-1">
                    <ContactLink icon={<Mail size={14} />} value={message.email || 'No email'} href={message.email ? `mailto:${message.email}` : undefined} />
                    <ContactLink icon={<Phone size={14} />} value={message.phone || 'No phone'} href={message.phone ? `tel:${message.phone}` : undefined} />
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <MessageActions message={message} busy={busy} onMarkRead={onMarkRead} onDelete={onDelete} compact />
            </td>
        </tr>
    );
};

const MessageMobileCard = ({
    message,
    busy,
    onMarkRead,
    onDelete
}: {
    message: MessageItem;
    busy: boolean;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <MessageBadge read={message.read} />
                    <h3 className="mt-3 truncate text-base font-extrabold text-slate-900">
                        {message.name || 'Unnamed customer'}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                        {fmt(message.createdAt)}
                    </p>
                </div>
                <Avatar name={message.name} unread={!message.read} />
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                {truncateText(message.message, 140)}
            </p>

            <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-3 py-3">
                <ContactLink icon={<Mail size={14} />} value={message.email || 'No email'} href={message.email ? `mailto:${message.email}` : undefined} />
                <ContactLink icon={<Phone size={14} />} value={message.phone || 'No phone'} href={message.phone ? `tel:${message.phone}` : undefined} />
            </div>

            <div className="mt-4">
                <MessageActions message={message} busy={busy} onMarkRead={onMarkRead} onDelete={onDelete} />
            </div>
        </article>
    );
};

const Avatar = ({
    name,
    unread,
    large = false
}: {
    name: string;
    unread: boolean;
    large?: boolean;
}) => {
    return (
        <div
            className={`grid shrink-0 place-items-center rounded-2xl text-sm font-extrabold shadow-sm ${
                unread
                    ? 'bg-gradient-to-br from-[#d8a23a] to-[#8a2e1d] text-white'
                    : 'border border-slate-200 bg-stone-50 text-slate-500'
            } ${large ? 'h-12 w-12' : 'h-10 w-10'}`}
        >
            {name ? name.charAt(0).toUpperCase() : <UserCircle size={18} />}
        </div>
    );
};

const MessageBadge = ({ read }: { read?: boolean }) => {
    return read ? (
        <span className="inline-flex rounded-xl border border-slate-200 bg-stone-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-600">
            Read
        </span>
    ) : (
        <span className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-amber-800">
            Unread
        </span>
    );
};

const MessageActions = ({
    message,
    busy,
    onMarkRead,
    onDelete,
    compact = false
}: {
    message: MessageItem;
    busy: boolean;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    compact?: boolean;
}) => {
    return (
        <div className={`flex flex-wrap gap-2 ${compact ? '' : 'md:justify-end'}`}>
            {!message.read && (
                <button
                    type="button"
                    onClick={() => onMarkRead(message._id)}
                    disabled={busy}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCircle2 size={14} />
                    Mark read
                </button>
            )}

            <button
                type="button"
                onClick={() => onDelete(message._id)}
                disabled={busy}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
    );
};

const ContactBlock = ({
    icon,
    label,
    value,
    href
}: {
    icon: ReactNode;
    label: string;
    value: string;
    href?: string;
}) => {
    const content = (
        <>
            <span className="text-slate-400">{icon}</span>
            <span className="min-w-0 truncate text-sm font-extrabold text-slate-800">
                {value}
            </span>
        </>
    );

    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            {href ? (
                <a href={href} className="flex min-w-0 items-center gap-2 hover:text-amber-800">
                    {content}
                </a>
            ) : (
                <div className="flex min-w-0 items-center gap-2">{content}</div>
            )}
        </div>
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

const EmptyState = ({ title, text }: { title: string; text: string }) => {
    return (
        <div className="grid min-h-[260px] place-items-center rounded-[22px] border border-dashed border-slate-200 bg-stone-50 px-4 text-center">
            <div>
                <Inbox className="mx-auto text-slate-400" size={26} />
                <p className="mt-3 text-sm font-extrabold text-slate-800">{title}</p>
                <p className="mx-auto mt-1 max-w-[17rem] text-xs font-medium leading-5 text-slate-500">
                    {text}
                </p>
            </div>
        </div>
    );
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};
