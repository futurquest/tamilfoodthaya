import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, User as UserIcon, Mail, Phone,
    Edit2, Trash2, X, Check
} from 'lucide-react';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';

export const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: getAdminUsers
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminUser(id, data),
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

    const filteredUsers = users?.filter((user: any) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                    <p className="text-dark-400">View and manage registered user accounts and permissions.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                </div>
            </div>

            <Card className="bg-dark-900 border-dark-800">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-dark-800 text-dark-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {filteredUsers.map((user: any) => (
                                <tr key={user._id} className="text-sm text-dark-200 hover:bg-dark-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center text-primary-400">
                                                <UserIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{user.name || 'No Name'}</p>
                                                <p className="text-xs text-dark-500">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Mail size={12} className="text-dark-500" />
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Phone size={12} className="text-dark-500" />
                                                <span>{user.phone || 'No phone'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${user.role === 'admin'
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                            : user.role === 'staff'
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                : 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.isVerified ? (
                                                <span className="flex items-center gap-1 text-emerald-500 text-xs">
                                                    <Check size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-dark-500 text-xs italic">
                                                    <X size={12} /> Unverified
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-dark-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-dark-500">
                            No users found matching your criteria.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-dark-900 border-dark-800 shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Edit User</h3>
                                <button onClick={() => setEditingUser(null)} className="text-dark-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        value={editingUser.phone || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isVerified"
                                        checked={editingUser.isVerified}
                                        onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                                        className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-primary-500 focus:ring-primary-500/50"
                                    />
                                    <label htmlFor="isVerified" className="text-sm text-dark-300">Email Verified</label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                                    onClick={() => updateMutation.mutate({
                                        id: editingUser._id,
                                        data: {
                                            role: editingUser.role,
                                            name: editingUser.name,
                                            phone: editingUser.phone,
                                            isVerified: editingUser.isVerified
                                        }
                                    })}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
