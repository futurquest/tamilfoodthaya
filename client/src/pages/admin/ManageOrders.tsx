import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Download, ExternalLink, RefreshCcw, Clock } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../hooks/useApi';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
    pending: 'text-yellow-700 bg-yellow-50',
    paid: 'text-green-700 bg-green-50',
    preparing: 'text-blue-700 bg-blue-50',
    ready: 'text-purple-700 bg-purple-50',
    completed: 'text-gray-700 bg-gray-50',
    cancelled: 'text-red-700 bg-red-50',
};

export const ManageOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getOrders();
            setOrders(response.data || []);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateOrderStatus(id, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filterStatus && o.status !== filterStatus) return false;
        if (search) {
            const s = search.toLowerCase();
            return o.customerInfo.name.toLowerCase().includes(s) || o._id.toLowerCase().includes(s);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Bestellingen Overzicht</h2>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={fetchOrders} disabled={loading}>
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by ID or customer..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border rounded-md outline-none"
                            >
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            <Button variant="outline"><Filter size={18} /></Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Customer</th>
                                    <th className="px-6 py-4 text-left">Items</th>
                                    <th className="px-6 py-4 text-left">Total</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y relative">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-20 text-center text-gray-400">Loading orders...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={6} className="py-20 text-center text-gray-400">No orders found.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{order.customerInfo.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase flex items-center gap-1 mt-1">
                                                    <Clock size={10} /> {new Date(order.pickupTime).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                                                {order.items.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-tamil-maroon">€ {order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-tamil-maroon hover:underline font-bold text-xs flex items-center gap-1 justify-end ml-auto">
                                                    Details <ExternalLink size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
