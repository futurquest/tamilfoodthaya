import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Users, MapPin } from 'lucide-react';
import { getCateringOrders, updateCateringOrderStatus } from '../../hooks/useApi';
import { toast } from 'react-hot-toast';

interface CateringOrder {
    _id: string;
    packageName: string;
    selections: { categoryName: string; selectedItems: { itemName: string; choiceName?: string; price: number }[] }[];
    guests: number;
    eventDate: string;
    eventLocation: string;
    pricePerPerson: number;
    totalPrice: number;
    customerInfo: { name: string; email: string; phone: string; notes?: string };
    status: string;
    paymentStatus: string;
    createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'preparing', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
    pending: 'text-yellow-700 bg-yellow-50',
    reviewing: 'text-blue-700 bg-blue-50',
    quoted: 'text-indigo-700 bg-indigo-50',
    confirmed: 'text-green-700 bg-green-50',
    paid: 'text-emerald-700 bg-emerald-50',
    preparing: 'text-purple-700 bg-purple-50',
    completed: 'text-gray-700 bg-gray-50',
    cancelled: 'text-red-700 bg-red-50',
};

export const ManageCateringOrders = () => {
    const [orders, setOrders] = useState<CateringOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getCateringOrders();
            setOrders(response.data || []);
        } catch { toast.error('Failed to load catering orders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateCateringOrderStatus(id, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch { toast.error('Failed to update status'); }
    };

    const filteredOrders = orders.filter(o => {
        if (filterStatus && o.status !== filterStatus) return false;
        if (search) {
            const s = search.toLowerCase();
            return o.customerInfo.name.toLowerCase().includes(s) ||
                o.packageName.toLowerCase().includes(s) ||
                o._id.toLowerCase().includes(s);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Catering Orders</h2>
                <span className="text-sm text-gray-400">{orders.length} total orders</span>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by customer name, package, or order ID..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border rounded-md outline-none">
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            <Button variant="outline"><Filter size={18} /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {loading ? (
                <p className="text-gray-400 text-center py-12">Loading...</p>
            ) : filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-400">
                        <p className="text-lg font-bold mb-2">No catering orders found</p>
                        <p className="text-sm">Orders will appear here when customers place catering orders.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <Card key={order._id}>
                            <CardContent className="p-6">
                                {/* Order Header */}
                                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs text-gray-400 font-mono">#{order._id.slice(-6)}</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] || 'text-gray-500 bg-gray-100'}`}>
                                                {order.status}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold">{order.customerInfo.name}</h3>
                                        <div className="flex gap-5 mt-1 text-sm text-gray-500 flex-wrap">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.eventDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {order.guests} guests</span>
                                            {order.eventLocation && <span className="flex items-center gap-1"><MapPin size={14} /> {order.eventLocation}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <div className="text-sm text-gray-400">{order.packageName}</div>
                                            <div className="text-xl font-bold text-tamil-maroon">€{order.totalPrice.toFixed(2)}</div>
                                            <div className="text-[10px] text-gray-400">€{order.pricePerPerson.toFixed(2)} p.p.</div>
                                        </div>
                                        {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order._id && (
                                    <div className="mt-6 border-t pt-4 space-y-4">
                                        {/* Customer Info */}
                                        <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Email</label><p className="text-sm">{order.customerInfo.email}</p></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label><p className="text-sm">{order.customerInfo.phone}</p></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Notes</label><p className="text-sm">{order.customerInfo.notes || '—'}</p></div>
                                        </div>

                                        {/* Selections */}
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Selections</h4>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {order.selections.map((sel, i) => (
                                                    <div key={i} className="bg-gray-50 p-3 rounded-md">
                                                        <h5 className="font-bold text-sm mb-2">{sel.categoryName}</h5>
                                                        <ul className="space-y-1">
                                                            {sel.selectedItems.map((item, j) => (
                                                                <li key={j} className="flex justify-between text-sm">
                                                                    <span>{item.itemName}{item.choiceName && <span className="text-gray-400 text-xs ml-1">({item.choiceName})</span>}</span>
                                                                    <span className="text-gray-500">€{item.price.toFixed(2)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Update */}
                                        <div className="flex items-center gap-3 pt-2 border-t">
                                            <span className="text-sm font-bold text-gray-500">Update Status:</span>
                                            <div className="flex gap-2 flex-wrap">
                                                {STATUS_OPTIONS.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleStatusUpdate(order._id, s)}
                                                        disabled={order.status === s}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all
                                                            ${order.status === s ? 'bg-tamil-maroon text-white' : 'bg-gray-100 text-gray-500 hover:bg-tamil-maroon/10 hover:text-tamil-maroon'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-400 text-right">
                                            Ordered on {new Date(order.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
