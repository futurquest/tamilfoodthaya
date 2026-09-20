import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    BadgeCheck,
    CalendarDays,
    Check,
    ChevronDown,
    Filter,
    Mail,
    Pencil,
    Phone,
    RotateCcw,
    Search,
    ShieldCheck,
    Trash2,
    User as UserIcon,
    UserCheck,
    UserCog,
    Users,
    X
} from 'lucide-react';
import {
    deleteAdminUser,
    getAdminUsers,
    updateAdminUser
} from '../../hooks/useApi';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

type UserRole = 'user' | 'staff' | 'admin';
type RoleFilter = 'all' | UserRole;
type VerificationFilter = 'all' | 'verified' | 'unverified';

type AdminUser = {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    role: UserRole;
    isVerified?: boolean;
    createdAt?: string;
};

const ROLE_VALUES: Array<{ value: RoleFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'admin.users.roles.all' },
    { value: 'admin', labelKey: 'admin.users.roles.admin' },
    { value: 'staff', labelKey: 'admin.users.roles.staff' },
    { value: 'user', labelKey: 'admin.users.roles.user' }
];

export const ManageUsers = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [verificationFilter, setVerificationFilter] =
        useState<VerificationFilter>('all');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formError, setFormError] = useState('');

    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: getAdminUsers
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
            updateAdminUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success(t('admin.users.updatedToast', 'User updated'));
            setEditingUser(null);
            setFormError('');
        },
        onError: () => {
            setFormError(t('admin.users.updateFailed', 'The user could not be updated. Check the details and try again.'));
            toast.error(t('admin.users.updateFailedToast', 'Failed to update user'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success(t('admin.users.deleteToast', 'User deleted'));
        },
        onError: () => toast.error(t('admin.users.deleteFailedToast', 'Failed to delete user'))
    });

    const rawUsers = usersQuery.data as any;
    const userList: AdminUser[] = Array.isArray(rawUsers)
        ? rawUsers
        : Array.isArray(rawUsers?.data)
        ? rawUsers.data
        : [];

    const stats = useMemo(() => {
        const total = userList.length;
        const admins = userList.filter((user) => user.role === 'admin').length;
        const staff = userList.filter((user) => user.role === 'staff').length;
        const customers = userList.filter((user) => user.role === 'user').length;
        const verified = userList.filter((user) => user.isVerified).length;

        return { total, admins, staff, customers, verified };
    }, [userList]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return userList.filter((user) => {
            if (roleFilter !== 'all' && user.role !== roleFilter) return false;
            if (verificationFilter === 'verified' && !user.isVerified) return false;
            if (verificationFilter === 'unverified' && user.isVerified) return false;
            if (!query) return true;

            return [
                user.name,
                user.username,
                user.email,
                user.phone,
                user.role,
                user.isVerified ? 'verified' : 'unverified',
                user.createdAt ? formatDate(user.createdAt, t) : ''
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [roleFilter, searchTerm, userList, verificationFilter]);

    const hasActiveFilters =
        Boolean(searchTerm.trim()) ||
        roleFilter !== 'all' ||
        verificationFilter !== 'all';

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setVerificationFilter('all');
    };

    const openEdit = (user: AdminUser) => {
        setEditingUser(user);
        setFormError('');
    };

    const handleDelete = (user: AdminUser) => {
        const label = user.name || user.username || user.email || t('admin.users.unnamedUser', 'Unnamed user');

        if (
            window.confirm(
                t('admin.users.confirmDelete', 'Delete {{label}}? This removes the account and cannot be undone.', { label })
            )
        ) {
            deleteMutation.mutate(user._id);
        }
    };

    const handleSave = () => {
        if (!editingUser) return;

        if (!editingUser.name?.trim()) {
            setFormError(t('admin.users.nameRequired', 'Enter a name before saving this account.'));
            return;
        }

        updateMutation.mutate({
            id: editingUser._id,
            data: {
                role: editingUser.role,
                name: editingUser.name,
                phone: editingUser.phone,
                isVerified: editingUser.isVerified
            }
        });
    };

    if (usersQuery.isLoading) {
        return (
            <div className="admin-loading-state">
                <Spinner size="lg" />
                <p>{t('admin.users.loading', 'Loading users...')}</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.users.eyebrow', 'Users')}
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                {t('admin.users.title', 'User Management')}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t('admin.users.subtitle', 'Review customer accounts, staff access, verification status and admin permissions from one controlled workspace.')}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-(--brand-stone)">
                                <ShieldCheck size={13} />
                                {t('admin.users.directoryHealth', 'Directory health')}
                            </p>
                            <p className="mt-1 truncate text-sm font-extrabold text-white">
                                {t('admin.users.directoryHealthValue', '{{verified}} of {{total}} verified', { verified: stats.verified, total: stats.total })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-5">
                        <MetricCard label={t('admin.users.metricUsers', 'Users')} value={stats.total} icon={<Users size={15} />} />
                        <MetricCard label={t('admin.users.metricAdmins', 'Admins')} value={stats.admins} icon={<ShieldCheck size={15} />} />
                        <MetricCard label={t('admin.users.metricStaff', 'Staff')} value={stats.staff} icon={<UserCog size={15} />} />
                        <MetricCard label={t('admin.users.metricCustomers', 'Customers')} value={stats.customers} icon={<UserIcon size={15} />} />
                        <MetricCard label={t('admin.users.metricVerified', 'Verified')} value={stats.verified} icon={<BadgeCheck size={15} />} />
                    </div>
                </section>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(280px,1fr)_auto] xl:items-end">
                        <label className="relative block min-w-0">
                            <span className="sr-only">{t('admin.users.searchAria', 'Search users')}</span>
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('admin.users.searchPlaceholder', 'Search name, username, email, phone or role')}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </label>

                        <div className="grid min-w-0 gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
                            <PremiumSelect
                                compact
                                label={t('admin.users.roleLabel', 'Role')}
                                value={roleFilter}
                                onChange={(value) => setRoleFilter(value as RoleFilter)}
                                options={ROLE_VALUES.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
                                icon={<UserCog size={16} />}
                            />

                            <div className="grid min-w-0 gap-1.5">
                                <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                    <BadgeCheck size={13} /> {t('admin.users.verificationLabel', 'Verification')}
                                </span>
                                <div className="grid h-11 grid-cols-3 rounded-xl bg-stone-100 p-1">
                                    {([
                                        ['all', t('admin.users.tabAll', 'All')],
                                        ['verified', t('admin.users.tabVerified', 'Verified')],
                                        ['unverified', t('admin.users.tabOpen', 'Open')]
                                    ] as Array<[VerificationFilter, string]>).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setVerificationFilter(value)}
                                            aria-pressed={verificationFilter === value}
                                            className={`rounded-lg px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                                                verificationFilter === value
                                                    ? 'bg-white text-slate-950 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-1 pt-3 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={13} /> {t('admin.users.showing', 'Showing {{shown}} of {{total}} users', { shown: filteredUsers.length, total: userList.length })}
                        </span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            >
                                <RotateCcw size={13} /> {t('admin.users.clearFilters', 'Clear filters')}
                            </button>
                        )}
                    </div>
                </div>

                {usersQuery.isError ? (
                    <ErrorState onRetry={() => usersQuery.refetch()} />
                ) : userList.length === 0 ? (
                    <EmptyState
                        title={t('admin.users.emptyTitle', 'No users yet')}
                        copy={t('admin.users.emptyCopy', 'Registered customers and staff accounts will appear here once they are created.')}
                    />
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        title={t('admin.users.noMatchTitle', 'No matching users')}
                        copy={t('admin.users.noMatchCopy', 'Adjust the search or filters to find the account you need.')}
                        actionLabel={t('admin.users.clearFilters', 'Clear filters')}
                        onAction={clearFilters}
                    />
                ) : (
                    <UserResults
                        users={filteredUsers}
                        deletePending={deleteMutation.isPending}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}

                {editingUser && (
                    <div
                        className="fixed inset-0 z-[100] flex overflow-y-auto bg-black/35 p-4 backdrop-blur-[2px]"
                        onClick={() => setEditingUser(null)}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="user-editor-title"
                            className="m-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                                <div className="min-w-0">
                                    <h2 id="user-editor-title" className="text-xl font-extrabold text-slate-950">
                                        {t('admin.users.editTitle', 'Edit user')}
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        {t('admin.users.editSubtitle', 'Update account details, role and verification state.')}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    aria-label={t('admin.users.closeEditor', 'Close user editor')}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="max-h-[82vh] overflow-y-auto px-5 py-6 sm:px-6">
                                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                                    <div className="min-w-0 space-y-6">
                                        <div>
                                            <SectionTitle
                                                title={t('admin.users.accountTitle', 'Account details')}
                                                subtitle={t('admin.users.accountSubtitle', 'Keep operational contact details accurate for orders and support.')}
                                            />

                                            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                                                <InputBlock
                                                    label={t('admin.users.nameLabel', 'Name')}
                                                    value={editingUser.name || ''}
                                                    onChange={(value) =>
                                                        setEditingUser({
                                                            ...editingUser,
                                                            name: value
                                                        })
                                                    }
                                                    placeholder={t('admin.users.namePlaceholder', 'Full name')}
                                                    icon={<UserIcon size={16} />}
                                                />

                                                <InputBlock
                                                    label={t('admin.users.phoneLabel', 'Phone')}
                                                    value={editingUser.phone || ''}
                                                    onChange={(value) =>
                                                        setEditingUser({
                                                            ...editingUser,
                                                            phone: value
                                                        })
                                                    }
                                                    placeholder={t('admin.users.phonePlaceholder', 'Phone number')}
                                                    icon={<Phone size={16} />}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <SectionTitle
                                                title={t('admin.users.permissionsTitle', 'Permissions')}
                                                subtitle={t('admin.users.permissionsSubtitle', 'Choose the access level this account should have.')}
                                            />

                                            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                                                <PremiumSelect
                                                    label={t('admin.users.roleLabel', 'Role')}
                                                    value={editingUser.role}
                                                    onChange={(value) =>
                                                        setEditingUser({
                                                            ...editingUser,
                                                            role: value as UserRole
                                                        })
                                                    }
                                                    options={[
                                                        { value: 'user', label: t('admin.users.roleCustomer', 'Customer') },
                                                        { value: 'staff', label: t('admin.users.roleStaff', 'Staff') },
                                                        { value: 'admin', label: t('admin.users.roleAdmin', 'Admin') }
                                                    ]}
                                                    icon={<ShieldCheck size={16} />}
                                                />

                                                <ToggleCard
                                                    title={
                                                        editingUser.isVerified
                                                            ? t('admin.users.emailVerified', 'Email verified')
                                                            : t('admin.users.emailNotVerified', 'Email not verified')
                                                    }
                                                    description={t('admin.users.emailVerifiedDesc', 'Controls whether the account is marked as verified.')}
                                                    checked={Boolean(editingUser.isVerified)}
                                                    onChange={(checked) =>
                                                        setEditingUser({
                                                            ...editingUser,
                                                            isVerified: checked
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-(--brand-surface-dim) p-4">
                                        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                                            <UserCheck size={17} className="text-amber-700" />
                                            {t('admin.users.accountPreview', 'Account preview')}
                                        </div>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <Avatar user={editingUser} large />
                                            <p className="mt-3 truncate text-lg font-extrabold text-slate-950">
                                                {getDisplayName(editingUser)}
                                            </p>
                                            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                                                @{editingUser.username || t('admin.users.noUsername', 'no-username')}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <RoleBadge role={editingUser.role} />
                                                <VerificationBadge verified={Boolean(editingUser.isVerified)} />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3 text-xs font-semibold text-slate-500">
                                            <PreviewLine label={t('admin.users.emailLabel', 'Email')} value={editingUser.email || t('admin.users.noEmail', 'No email')} />
                                            <PreviewLine label={t('admin.users.phoneLabel', 'Phone')} value={editingUser.phone || t('admin.users.noPhone', 'No phone')} />
                                            <PreviewLine label={t('admin.users.joinedLabel', 'Joined')} value={formatDate(editingUser.createdAt, t)} />
                                        </div>
                                    </div>
                                </div>

                                {formError && (
                                    <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 pb-1 pt-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                    >
                                        {t('admin.users.cancel', 'Cancel')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                        className="h-11 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updateMutation.isPending ? t('admin.users.saving', 'Saving...') : t('admin.users.saveChanges', 'Save changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserResults = ({
    users,
    deletePending,
    onEdit,
    onDelete
}: {
    users: AdminUser[];
    deletePending: boolean;
    onEdit: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}) => {
    const { t } = useTranslation();
    return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[920px] text-sm">
                <thead className="border-b border-slate-200 bg-(--brand-surface-dim)">
                    <tr>
                        <TableHeader>{t('admin.users.tableUser', 'User')}</TableHeader>
                        <TableHeader>{t('admin.users.tableContact', 'Contact')}</TableHeader>
                        <TableHeader>{t('admin.users.tableRole', 'Role')}</TableHeader>
                        <TableHeader>{t('admin.users.tableStatus', 'Status')}</TableHeader>
                        <TableHeader>{t('admin.users.tableJoined', 'Joined')}</TableHeader>
                        <TableHeader align="right">{t('admin.users.tableActions', 'Actions')}</TableHeader>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user._id} className="transition hover:bg-stone-50/70">
                            <td className="px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar user={user} />
                                    <div className="min-w-0">
                                        <p className="truncate text-[15px] font-extrabold text-slate-950">
                                            {getDisplayName(user, t)}
                                        </p>
                                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                                            @{user.username || t('admin.users.noUsername', 'no-username')}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <ContactBlock user={user} />
                            </td>

                            <td className="px-5 py-4">
                                <RoleBadge role={user.role} />
                            </td>

                            <td className="px-5 py-4">
                                <VerificationBadge verified={Boolean(user.isVerified)} />
                            </td>

                            <td className="px-5 py-4 font-semibold text-slate-600">
                                {formatDate(user.createdAt, t)}
                            </td>

                            <td className="px-5 py-4">
                                <ActionGroup
                                    user={user}
                                    deletePending={deletePending}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 xl:hidden">
            {users.map((user) => (
                <UserCard
                    key={user._id}
                    user={user}
                    deletePending={deletePending}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    </div>
    );
};

const UserCard = ({
    user,
    deletePending,
    onEdit,
    onDelete
}: {
    user: AdminUser;
    deletePending: boolean;
    onEdit: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}) => {
    const { t } = useTranslation();
    return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar user={user} />
                <div className="min-w-0">
                    <p className="mt-3 truncate text-lg font-extrabold text-slate-950">
                        {getDisplayName(user, t)}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        @{user.username || t('admin.users.noUsername', 'no-username')}
                    </p>
                </div>
            </div>
            <VerificationBadge verified={Boolean(user.isVerified)} />
        </div>

        <div className="mt-4 rounded-xl bg-(--brand-surface-dim) p-3">
            <ContactBlock user={user} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <InfoTile label={t('admin.users.roleLabel', 'Role')} value={formatRole(user.role, t)} icon={<ShieldCheck size={14} />} />
            <InfoTile label={t('admin.users.joinedLabel', 'Joined')} value={formatDate(user.createdAt, t)} icon={<CalendarDays size={14} />} />
        </div>

        <div className="mt-4">
            <ActionGroup
                user={user}
                deletePending={deletePending}
                onEdit={onEdit}
                onDelete={onDelete}
                mobile
            />
        </div>
    </article>
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
}) => (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-(--brand-stone)">
            {icon}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-2 truncate text-2xl font-extrabold tabular-nums text-white">{value}</p>
    </div>
);

const EmptyState = ({
    title,
    copy,
    actionLabel,
    onAction
}: {
    title: string;
    copy: string;
    actionLabel?: string;
    onAction?: () => void;
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-(--brand-surface-dim) text-slate-500">
            <Users size={24} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{copy}</p>
        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100"
            >
                <RotateCcw size={16} />
                {actionLabel}
            </button>
        )}
    </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
    const { t } = useTranslation();
    return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
            <p>{t('admin.users.loadErrorTitle', 'Users could not be loaded.')}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-extrabold underline decoration-red-300 underline-offset-4"
            >
                {t('admin.users.loadErrorRetry', 'Try again')}
            </button>
        </div>
    </div>
    );
};

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => (
    <div>
        <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
);

const InputBlock = ({
    label,
    value,
    onChange,
    placeholder,
    icon
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: ReactNode;
}) => (
    <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
        <div className="relative">
            {icon && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
            )}
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                    icon ? 'pl-11 pr-4' : 'px-4'
                }`}
            />
        </div>
    </div>
);

const PremiumSelect = ({
    label,
    value,
    onChange,
    options,
    icon,
    compact
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: ReactNode;
    compact?: boolean;
}) => (
    <div className={compact ? 'grid gap-1.5' : 'min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4'}>
        <label className={`${compact ? 'px-1 text-[11px] uppercase tracking-[0.1em] text-slate-500' : 'mb-2 text-sm text-slate-800'} flex items-center gap-1.5 font-bold`}>
            {compact && icon}
            {label}
        </label>
        <div className="relative">
            {!compact && icon && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
            )}
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                    !compact && icon ? 'pl-11 pr-10' : 'px-4 pr-10'
                }`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    </div>
);

const ToggleCard = ({
    title,
    description,
    checked,
    onChange
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex min-h-[124px] w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-amber-100 ${
            checked
                ? 'border-(--brand-text) bg-(--brand-text) text-white'
                : 'border-slate-200 bg-(--brand-surface-dim) text-slate-700 hover:bg-amber-50'
        }`}
    >
        <div className="min-w-0">
            <p className="text-sm font-extrabold">{title}</p>
            <p className={`mt-1 text-xs font-semibold leading-5 ${checked ? 'text-stone-200' : 'text-slate-500'}`}>
                {description}
            </p>
        </div>

        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${checked ? 'bg-white text-slate-900' : 'bg-white text-slate-500'}`}>
            <Check size={16} />
        </span>
    </button>
);

const TableHeader = ({
    children,
    align = 'left'
}: {
    children: ReactNode;
    align?: 'left' | 'right';
}) => (
    <th className={`px-5 py-4 ${align === 'right' ? 'text-right' : 'text-left'} text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500`}>
        {children}
    </th>
);

const ActionGroup = ({
    user,
    deletePending,
    onEdit,
    onDelete,
    mobile
}: {
    user: AdminUser;
    deletePending: boolean;
    onEdit: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
    mobile?: boolean;
}) => {
    const { t } = useTranslation();
    return (
    <div className={`flex items-center gap-2 ${mobile ? 'grid grid-cols-2' : 'justify-end'}`}>
        <button
            type="button"
            onClick={() => onEdit(user)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
            <Pencil size={14} />
            {t('admin.users.editLabel', 'Edit')}
        </button>

        <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={deletePending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Trash2 size={14} />
            {t('admin.users.deleteLabel', 'Delete')}
        </button>
    </div>
    );
};

const ContactBlock = ({ user }: { user: AdminUser }) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-1.5 text-xs font-semibold text-slate-600">
        <div className="flex min-w-0 items-center gap-2">
            <Mail size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{user.email || t('admin.users.noEmail', 'No email')}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
            <Phone size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{user.phone || t('admin.users.noPhone', 'No phone')}</span>
        </div>
    </div>
    );
};

const Avatar = ({ user, large }: { user: AdminUser; large?: boolean }) => {
    const { t } = useTranslation();
    const initial = getDisplayName(user, t).charAt(0).toUpperCase();

    return (
        <div className={`${large ? 'h-14 w-14 text-lg' : 'h-11 w-11 text-sm'} flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-(--brand-surface-dim) font-extrabold text-slate-700`}>
            {initial || 'U'}
        </div>
    );
};

const RoleBadge = ({ role }: { role: UserRole }) => {
    const { t } = useTranslation();
    const styles: Record<UserRole, string> = {
        admin: 'border-red-200 bg-red-50 text-red-700',
        staff: 'border-amber-200 bg-amber-50 text-amber-700',
        user: 'border-slate-200 bg-stone-50 text-slate-700'
    };

    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] ${styles[role]}`}>
            {formatRole(role, t)}
        </span>
    );
};

const VerificationBadge = ({ verified }: { verified: boolean }) => {
    const { t } = useTranslation();
    return (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${
            verified
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-stone-50 text-slate-500'
        }`}
    >
        {verified ? <Check size={13} /> : <X size={13} />}
        {verified ? t('admin.users.statusVerified', 'Verified') : t('admin.users.statusOpen', 'Open')}
    </span>
    );
};

const InfoTile = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string;
    icon: ReactNode;
}) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {icon}
            {label}
        </p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-950">{value}</p>
    </div>
);

const PreviewLine = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
        <span>{label}</span>
        <span className="min-w-0 truncate text-right font-extrabold text-slate-800">{value}</span>
    </div>
);

const getDisplayName = (user: AdminUser, t?: TFunction) => {
    return user.name || user.username || user.email || (t ? t('admin.users.unnamedUser', 'Unnamed user') : 'Unnamed user');
};

const formatRole = (role: UserRole, t?: TFunction) => {
    if (role === 'user') return t ? t('admin.users.roleCustomer', 'Customer') : 'Customer';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const formatDate = (value?: string, t?: TFunction) => {
    if (!value) return t ? t('admin.users.notRecorded', 'Not recorded') : 'Not recorded';

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};
