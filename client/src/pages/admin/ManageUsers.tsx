import { useMemo, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    User as UserIcon,
    Mail,
    Phone,
    Pencil,
    Trash2,
    X,
    Check,
    ShieldCheck,
    Users,
    UserCog,
    BadgeCheck,
    ChevronDown
} from 'lucide-react';
import {
    getAdminUsers,
    updateAdminUser,
    deleteAdminUser
} from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

type UserRole = 'user' | 'staff' | 'admin';

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

export const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: getAdminUsers
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
            updateAdminUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User updated successfully');
            setEditingUser(null);
        },
        onError: () => toast.error('Failed to update user')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted');
        },
        onError: () => toast.error('Failed to delete user')
    });

    const rawUsers = usersQuery.data as any;
    const userList: AdminUser[] = Array.isArray(rawUsers)
        ? rawUsers
        : Array.isArray(rawUsers?.data)
        ? rawUsers.data
        : [];

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) return userList;

        return userList.filter((user) => {
            const name = user.name?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            const username = user.username?.toLowerCase() || '';
            const phone = user.phone?.toLowerCase() || '';

            return (
                name.includes(term) ||
                email.includes(term) ||
                username.includes(term) ||
                phone.includes(term)
            );
        });
    }, [userList, searchTerm]);

    const stats = useMemo(() => {
        const total = userList.length;
        const admins = userList.filter((u) => u.role === 'admin').length;
        const staff = userList.filter((u) => u.role === 'staff').length;
        const verified = userList.filter((u) => u.isVerified).length;

        return { total, admins, staff, verified };
    }, [userList]);

    const handleDelete = (id: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this user? This action cannot be undone.'
            )
        ) {
            deleteMutation.mutate(id);
        }
    };

    if (usersQuery.isLoading) {
        return (
            <div className="flex min-h-[55vh] items-center justify-center bg-stone-50">
                <Spinner />
            </div>
        );
    }

    if (usersQuery.isError) {
        return (
            <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
                <div className="mx-auto max-w-[1080px]">
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center">
                        <h3 className="text-lg font-semibold text-red-700">
                            Failed to load users
                        </h3>
                        <p className="mt-2 text-sm text-red-600">
                            Please refresh and try again.
                        </p>
                    </div>
                </div>
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
                                <Users size={24} className="text-slate-900" />
                                User Management
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                View and manage registered user accounts, roles and verification status.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MetricCard
                                label="Users"
                                value={stats.total}
                                icon={<Users size={16} />}
                            />
                            <MetricCard
                                label="Admins"
                                value={stats.admins}
                                icon={<ShieldCheck size={16} />}
                            />
                            <MetricCard
                                label="Staff"
                                value={stats.staff}
                                icon={<UserCog size={16} />}
                            />
                            <MetricCard
                                label="Verified"
                                value={stats.verified}
                                icon={<BadgeCheck size={16} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search by name, username, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                </div>

                {/* Table */}
                <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-0">
                        <div className="max-h-[68vh] overflow-x-auto overflow-y-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Joined
                                        </th>
                                        <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-20 text-center"
                                            >
                                                <div className="mx-auto max-w-sm">
                                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-400">
                                                        <Users size={20} />
                                                    </div>
                                                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                                        No users found
                                                    </h3>
                                                    <p className="mt-2 text-sm text-slate-500">
                                                        Try changing the search term.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="transition hover:bg-stone-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50 text-slate-600">
                                                            <UserIcon size={18} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-[15px] font-semibold text-slate-900">
                                                                {user.name || 'No Name'}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                @{user.username || 'no-username'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Mail
                                                                size={12}
                                                                className="text-slate-400"
                                                            />
                                                            <span>{user.email || 'No email'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Phone
                                                                size={12}
                                                                className="text-slate-400"
                                                            />
                                                            <span>{user.phone || 'No phone'}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <RoleBadge role={user.role} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    {user.isVerified ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                                            <Check size={13} />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                                                            <X size={13} />
                                                            Unverified
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {formatDate(user.createdAt)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-stone-50"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            disabled={deleteMutation.isPending}
                                                            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Modal */}
                {editingUser && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
                        onClick={() => setEditingUser(null)}
                    >
                        <div
                            className="w-full max-w-xl rounded-[30px] border border-slate-200 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        User Editor
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                        Edit User
                                    </h2>
                                </div>

                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
                                <div className="space-y-6">
                                    <div>
                                        <SectionTitle
                                            title="Account"
                                            subtitle="Update basic account details and permissions."
                                        />

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <InputBlock
                                                label="Name"
                                                value={editingUser.name || ''}
                                                onChange={(value) =>
                                                    setEditingUser({
                                                        ...editingUser,
                                                        name: value
                                                    })
                                                }
                                                placeholder="Full name"
                                                icon={<UserIcon size={16} />}
                                            />

                                            <InputBlock
                                                label="Phone"
                                                value={editingUser.phone || ''}
                                                onChange={(value) =>
                                                    setEditingUser({
                                                        ...editingUser,
                                                        phone: value
                                                    })
                                                }
                                                placeholder="Phone number"
                                                icon={<Phone size={16} />}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <PremiumSelect
                                                label="Role"
                                                value={editingUser.role}
                                                onChange={(value) =>
                                                    setEditingUser({
                                                        ...editingUser,
                                                        role: value as UserRole
                                                    })
                                                }
                                                options={[
                                                    { value: 'user', label: 'User' },
                                                    { value: 'staff', label: 'Staff' },
                                                    { value: 'admin', label: 'Admin' }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionTitle
                                            title="Verification"
                                            subtitle="Control email verification status."
                                        />

                                        <div className="mt-4">
                                            <ToggleCard
                                                title={
                                                    editingUser.isVerified
                                                        ? 'Email Verified'
                                                        : 'Email Not Verified'
                                                }
                                                description="Toggle whether this user’s email is marked as verified."
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

                                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateMutation.mutate({
                                                id: editingUser._id,
                                                data: {
                                                    role: editingUser.role,
                                                    name: editingUser.name,
                                                    phone: editingUser.phone,
                                                    isVerified: editingUser.isVerified
                                                }
                                            })
                                        }
                                        disabled={updateMutation.isPending}
                                        className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {updateMutation.isPending
                                            ? 'Saving...'
                                            : 'Save Changes'}
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
                <p className="text-[11px] font-medium uppercase tracking-[0.18em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
        </div>
    );
};

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
};

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
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`h-11 w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 ${
                        icon ? 'pl-11 pr-4' : 'px-4'
                    }`}
                />
            </div>
        </div>
    );
};

const PremiumSelect = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
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
};

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
}) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                checked
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
            }`}
        >
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p
                    className={`mt-1 text-xs leading-5 ${
                        checked ? 'text-slate-300' : 'text-slate-500'
                    }`}
                >
                    {description}
                </p>
            </div>

            <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    checked ? 'bg-white text-slate-900' : 'bg-stone-100 text-slate-500'
                }`}
            >
                <Check size={16} />
            </div>
        </button>
    );
};

const RoleBadge = ({ role }: { role: UserRole }) => {
    const styles: Record<UserRole, string> = {
        admin: 'border-red-200 bg-red-50 text-red-700',
        staff: 'border-amber-200 bg-amber-50 text-amber-700',
        user: 'border-slate-200 bg-stone-50 text-slate-700'
    };

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${styles[role]}`}
        >
            {role}
        </span>
    );
};

const formatDate = (value?: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};