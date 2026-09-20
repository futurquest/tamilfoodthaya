import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Filter,
    Inbox,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Trash2,
    UserCircle
} from 'lucide-react';
import { getMessages, api } from '../../hooks/useApi';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

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

type FilterLabels = {
    labelKey: string;
    labelDefault: string;
    titleKey: string;
    titleDefault: string;
    helperKey: string;
    helperDefault: string;
};

const filterConfig: Record<FilterType, FilterLabels> = {
    ALL: {
        labelKey: 'admin.messages.filterAll',
        labelDefault: 'All',
        titleKey: 'admin.messages.filterAllTitle',
        titleDefault: 'All messages',
        helperKey: 'admin.messages.filterAllHelper',
        helperDefault: 'Every website message in one operational inbox.'
    },
    UNREAD: {
        labelKey: 'admin.messages.unread',
        labelDefault: 'Unread',
        titleKey: 'admin.messages.filterUnreadTitle',
        titleDefault: 'Unread messages',
        helperKey: 'admin.messages.filterUnreadHelper',
        helperDefault: 'New customer enquiries that still need attention.'
    },
    READ: {
        labelKey: 'admin.messages.read',
        labelDefault: 'Read',
        titleKey: 'admin.messages.filterReadTitle',
        titleDefault: 'Read messages',
        helperKey: 'admin.messages.filterReadHelper',
        helperDefault: 'Messages already reviewed by the team.'
    }
};

const fmt = (d: string, invalidLabel: string) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return invalidLabel;

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const ViewMessages = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<MessageItem | null>(null);

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
            toast.success(t('admin.messages.markedAsRead', 'Message marked as read'));
        },
        onError: () => toast.error(t('admin.messages.markAsReadFailed', 'Could not mark the message as read'))
    });

    const deleteMsg = useMutation({
        mutationFn: (id: string) => api.delete(`/messages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success(t('admin.messages.deleted', 'Message deleted'));
        },
        onError: () => toast.error(t('admin.messages.deleteFailed', 'Could not delete the message'))
    });

    const requestDelete = (id: string) => {
        const target = messages.find((message) => message._id === id) ?? null;
        setPendingDelete(target);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        deleteMsg.mutate(pendingDelete._id);
        setPendingDelete(null);
    };

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
        return filteredMessages.find((msg) => msg._id === selectedId) ?? null;
    }, [filteredMessages, selectedId]);

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
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="admin-skeleton h-20 w-28" />
                                    ))}
                                </div>
                            </div>
                        </section>
                        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                                <div className="space-y-3">
                                    <div className="admin-skeleton h-24" />
                                    <div className="admin-skeleton h-24" />
                                    <div className="admin-skeleton h-24" />
                                </div>
                                <div className="hidden space-y-3 lg:block">
                                    <div className="admin-skeleton h-64" />
                                    <div className="admin-skeleton h-28" />
                                </div>
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
                            {t('admin.messages.loadFailedTitle', 'Messages could not be loaded')}
                        </h1>
                        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-red-600">
                            {t('admin.messages.loadFailedSubtitle', 'Refresh the page or check the API connection before replying to customer enquiries.')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.messages.eyebrow', 'Messages')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    {t('admin.messages.inboxTitle', 'Customer Message Inbox')}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <MessageSquare size={13} />
                                    {t('admin.messages.inbox', 'Inbox')}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t('admin.messages.subtitle', 'Review website enquiries, spot unread messages quickly and keep customer follow-up moving.')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[430px]">
                            <MetricCard label={t('admin.messages.total', 'Total')} value={messages.length} icon={<Inbox size={16} />} />
                            <MetricCard label={t('admin.messages.unread', 'Unread')} value={unreadCount} icon={<Mail size={16} />} />
                            <MetricCard label={t('admin.messages.read', 'Read')} value={readCount} icon={<CheckCircle2 size={16} />} />
                        </div>
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
                    <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
                        <label className="relative block min-w-0 max-w-[16rem]">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={15}
                            />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={t('admin.messages.searchMessages', 'Search messages')}
                                aria-label={t('admin.messages.searchMessages', 'Search messages')}
                                className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="grid min-w-0 gap-3 sm:max-w-[240px]">
                            <FilterSelect
                                label={t('admin.common.status', 'Status')}
                                icon={<Filter size={13} />}
                                value={filter}
                                counts={{
                                    ALL: messages.length,
                                    UNREAD: unreadCount,
                                    READ: readCount
                                }}
                                onChange={setFilter}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={12} />
                            {t('admin.messages.showingCount', 'Showing {{visible}} of {{total}} messages', { visible: filteredMessages.length, total: messages.length })}
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
                                {t('admin.messages.clearFilters', 'Clear filters')}
                            </button>
                        )}
                    </div>
                </section>

                <InboxWorkspace
                        filter={filter}
                        messages={filteredMessages}
                        selectedMessage={selectedMessage}
                        selectedId={selectedId}
                        detailOpen={detailOpen}
                        busy={markRead.isPending || deleteMsg.isPending}
                        onOpen={(id) => {
                            setSelectedId(id);
                            setDetailOpen(true);
                        }}
                        onBack={() => setDetailOpen(false)}
                        onMarkRead={(id) => markRead.mutate(id)}
                        onDelete={requestDelete}
                    />

                <ConfirmDialog
                    open={Boolean(pendingDelete)}
                    title={t('admin.messages.deleteMessage', 'Delete message')}
                    message={
                        pendingDelete
                            ? t('admin.messages.deleteMessageBody', 'Delete the message from {{name}}? This cannot be undone.', {
                                  name: pendingDelete.name || t('admin.messages.thisCustomer', 'this customer')
                              })
                            : ''
                    }
                    busy={deleteMsg.isPending}
                    onCancel={() => setPendingDelete(null)}
                    onConfirm={confirmDelete}
                />
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
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-(--brand-stone)">
                {icon}
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 truncate text-2xl font-extrabold tabular-nums text-white">{value}</p>
        </div>
    );
};

const FilterSelect = ({
    label,
    icon,
    value,
    counts,
    onChange
}: {
    label: string;
    icon: ReactNode;
    value: FilterType;
    counts: Record<FilterType, number>;
    onChange: (value: FilterType) => void;
}) => {
    const { t } = useTranslation();
    const options: FilterType[] = ['ALL', 'UNREAD', 'READ'];

    return (
        <div className="grid min-w-0 gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {icon}
                {label}
            </span>
            <div className="relative min-w-0">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as FilterType)}
                    aria-label={label}
                    className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-sm font-bold text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {t(filterConfig[opt].labelKey, filterConfig[opt].labelDefault)} ({counts[opt]})
                        </option>
                    ))}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
};

const InboxWorkspace = ({
    filter,
    messages,
    selectedMessage,
    selectedId,
    detailOpen,
    busy,
    onOpen,
    onBack,
    onMarkRead,
    onDelete
}: {
    filter: FilterType;
    messages: MessageItem[];
    selectedMessage: MessageItem | null;
    selectedId: string | null;
    detailOpen: boolean;
    busy: boolean;
    onOpen: (id: string) => void;
    onBack: () => void;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();

    return (
        <section className="rounded-[28px] border border-[color:var(--brand-outline)] bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-surface-ivory)_42%,var(--brand-slate-soft)_100%)] p-2.5 shadow-sm sm:p-3">
            <WorkspaceHeader
                title={t(filterConfig[filter].titleKey, filterConfig[filter].titleDefault)}
                text={t(filterConfig[filter].helperKey, filterConfig[filter].helperDefault)}
                badge={t('admin.messages.messageCount', '{{count}} messages', { count: messages.length })}
            />

            {messages.length === 0 ? (
                <EmptyState
                    title={t('admin.messages.noMatching', 'No matching messages')}
                    text={t('admin.messages.noMatchingText', 'Adjust search or filters to find the customer message you need.')}
                />
            ) : detailOpen ? (
                <MessageDetail
                    message={selectedMessage}
                    fullscreen
                    busy={busy}
                    onBack={onBack}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                />
            ) : (
                <div className="grid gap-2">
                    {messages.map((message) => (
                        <MessagePreviewCard
                            key={message._id}
                            message={message}
                            active={selectedId === message._id}
                            onClick={() => onOpen(message._id)}
                        />
                    ))}
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
        <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur sm:px-4 sm:py-3">
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
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-2xl border p-3.5 text-left shadow-sm transition sm:p-4 ${
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
                            {message.name || t('admin.messages.unnamedCustomer', 'Unnamed customer')}
                        </p>
                        <MessageBadge read={message.read} />
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">
                        {message.email || t('admin.messages.noEmailAddress', 'No email address')}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                        {truncateText(message.message, 96)}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock3 size={12} />
                        {fmt(message.createdAt, t('admin.messages.dateNotSet', 'Date not set'))}
                    </p>
                </div>
            </div>
        </button>
    );
};

const MessageDetail = ({
    message,
    fullscreen = false,
    busy,
    onBack,
    onMarkRead,
    onDelete
}: {
    message: MessageItem | null;
    fullscreen?: boolean;
    busy: boolean;
    onBack: () => void;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();

    if (!message) {
        return (
            <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-4 text-center">
                <div>
                    <Inbox className="mx-auto text-slate-400" size={26} />
                    <p className="mt-3 text-sm font-extrabold text-slate-800">
                        {t('admin.messages.selectMessage', 'Select a message')}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                        {t('admin.messages.selectMessageText', 'Choose a customer message from the inbox to read it here.')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {fullscreen && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:bg-stone-50"
                    >
                        <ArrowLeft size={14} />
                        {t('admin.messages.backToInbox', 'Back to inbox')}
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={message.name} unread={!message.read} large />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900">
                                {message.name || t('admin.messages.unnamedCustomer', 'Unnamed customer')}
                            </h2>
                            <MessageBadge read={message.read} />
                        </div>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Clock3 size={13} />
                            {fmt(message.createdAt, t('admin.messages.dateNotSet', 'Date not set'))}
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
                <ContactBlock icon={<Mail size={15} />} label={t('admin.common.email', 'Email')} value={message.email || t('admin.messages.noEmail', 'No email')} href={message.email ? `mailto:${message.email}` : undefined} />
                <ContactBlock icon={<Phone size={15} />} label={t('admin.common.phone', 'Phone')} value={message.phone || t('admin.messages.noPhone', 'No phone')} href={message.phone ? `tel:${message.phone}` : undefined} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-(--brand-surface-ivory) p-5">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <MessageSquare size={13} />
                    {t('admin.messages.customerMessageLabel', 'Customer message')}
                </p>
                <p className="whitespace-pre-wrap text-[15px] font-semibold leading-7 text-slate-700">
                    {message.message}
                </p>
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
                    ? 'bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-white'
                    : 'border border-slate-200 bg-stone-50 text-slate-500'
            } ${large ? 'h-12 w-12' : 'h-10 w-10'}`}
        >
            {name ? name.charAt(0).toUpperCase() : <UserCircle size={18} />}
        </div>
    );
};

const MessageBadge = ({ read }: { read?: boolean }) => {
    const { t } = useTranslation();

    return read ? (
        <span className="inline-flex rounded-xl border border-slate-200 bg-stone-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-600">
            {t('admin.messages.read', 'Read')}
        </span>
    ) : (
        <span className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-amber-800">
            {t('admin.messages.unread', 'Unread')}
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
    const { t } = useTranslation();

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
                    {t('admin.messages.markReadAction', 'Mark read')}
                </button>
            )}

            <button
                type="button"
                onClick={() => onDelete(message._id)}
                disabled={busy}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Trash2 size={14} />
                {t('admin.common.delete', 'Delete')}
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
