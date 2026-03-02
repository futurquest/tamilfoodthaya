import { useState, useEffect } from 'react';
import { getUserDashboard, requestCateringChange, clearNotification } from '../../hooks/useApi';
import { Container } from '../../components/ui/Container';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertCircle, CheckCircle, Save, Clock, History, ExternalLink, Calendar, Users, MapPin, X, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SEO } from '../../components/SEO';

export const UserDashboard = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [changeNotes, setChangeNotes] = useState('');
    const [submittingChange, setSubmittingChange] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const loadData = async () => {
        try {
            const data = await getUserDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRequestChange = (orderId: string) => {
        setActiveOrderId(orderId);
        setChangeNotes('');
        setShowChangeModal(true);
    };

    const submitChangeRequest = async () => {
        if (!activeOrderId || !changeNotes.trim()) return;

        setSubmittingChange(true);
        try {
            await requestCateringChange(activeOrderId, changeNotes);
            toast.success('Change request submitted successfully!');
            setShowChangeModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmittingChange(false);
        }
    };

    const handleClearNotification = async (notificationId: string) => {
        try {
            await clearNotification(notificationId);
            toast.success('Notification cleared!');
            loadData(); // Reload dashboard to reflect the change
        } catch (error) {
            console.error('Failed to clear notification:', error);
            toast.error('Failed to clear notification');
        }
    };

    if (loading) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-dark-400 animate-pulse font-medium">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    const { active, history, recentNotifications } = dashboardData;

    return (
        <div className="bg-dark-950 min-h-screen text-white">
            <SEO title="My Dashboard" description="Manage your Tamil Food Thaya bookings and orders." />

            <PageHeader
                title="My Dashboard"
                subtitle="Manage your active catering bookings, order history, and stay updated with real-time notifications."
            />

            <Container className="-mt-12 relative z-10 pb-24">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="admin-card border-l-4 border-l-amber-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                        <Clock className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider">Pending/Review</p>
                                        <h3 className="text-3xl font-extrabold mt-1">
                                            {(active?.catering?.filter((o: any) => ['pending', 'reviewing', 'quoted'].includes(o.status)).length || 0) +
                                                (active?.regular?.filter((o: any) => ['pending'].includes(o.status)).length || 0)}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-dark-400 mt-4 flex items-center gap-1.5">
                                    <AlertCircle size={12} /> Requires attention or quote
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="admin-card border-l-4 border-l-blue-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                        <Save className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider">In Progress</p>
                                        <h3 className="text-3xl font-extrabold mt-1">
                                            {(active?.catering?.filter((o: any) => ['confirmed', 'paid', 'preparing'].includes(o.status)).length || 0) +
                                                (active?.regular?.filter((o: any) => ['paid', 'preparing', 'ready'].includes(o.status)).length || 0)}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-dark-400 mt-4 flex items-center gap-1.5">
                                    <Clock size={12} /> Confirmed & being prepared
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="admin-card border-l-4 border-l-green-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                        <CheckCircle className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider">Completed</p>
                                        <h3 className="text-3xl font-extrabold mt-1">
                                            {(history?.catering?.length || 0) + (history?.regular?.length || 0)}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-dark-400 mt-4 flex items-center gap-1.5">
                                    <History size={12} /> Delivered & finalized orders
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Active Bookings */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <h2 className="text-2xl font-extrabold flex items-center gap-3">
                                    <Clock className="text-primary-500" />
                                    Manage My Orders
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'pending', 'confirmed', 'paid', 'preparing', 'completed'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setStatusFilter(f)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${statusFilter === f
                                                ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                                : 'bg-dark-800 text-dark-400 border-dark-700 hover:border-dark-600'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Consolidated List rendering based on filter */}
                                {[...(active?.regular || []), ...(active?.catering || []), ...(history?.regular || []), ...(history?.catering || [])]
                                    .filter(o => statusFilter === 'all' || o.status === statusFilter)
                                    .sort((a, b) => new Date(b.createdAt || b.eventDate).getTime() - new Date(a.createdAt || a.eventDate).getTime())
                                    .map((order: any, idx: number) => {
                                        const isCatering = 'packageName' in order;
                                        return (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }} key={order._id}>
                                                <Card className={`admin-card overflow-hidden group border-l-4 ${isCatering ? 'border-primary-500' : 'border-blue-500'}`}>
                                                    <CardContent className="p-0">
                                                        <div className="p-6">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                                                            {isCatering ? order.packageName : `Food Order #${order._id.slice(-6).toUpperCase()}`}
                                                                        </h3>
                                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isCatering ? 'bg-primary-500/10 text-primary-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                            {isCatering ? 'Catering' : 'Regular'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-sm text-dark-400">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Calendar size={14} className="text-primary-500" />
                                                                            {new Date(isCatering ? order.eventDate : order.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                        {isCatering && <div className="flex items-center gap-1.5"><Users size={14} className="text-primary-500" /> {order.guests} Guests</div>}
                                                                        {isCatering && order.eventLocation && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <MapPin size={14} className="text-primary-500" />
                                                                                {order.eventLocation}
                                                                            </div>
                                                                        )}
                                                                        {!isCatering && <div className="flex items-center gap-1.5"><Package size={14} className="text-primary-500" /> {order.items.length} Items</div>}
                                                                    </div>
                                                                </div>
                                                                {isCatering ? (
                                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border self-start md:self-center
                                                                            ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                            order.status === 'reviewing' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                                                order.status === 'quoted' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                                                    order.status === 'confirmed' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                                                                                        order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                                            order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                                                order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                                                    order.status === 'ready' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                                                                        'bg-dark-800 text-dark-400 border-dark-700'}`}>
                                                                        {order.status}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-right">
                                                                        <p className="text-lg font-extrabold text-white">€{order.totalAmount.toFixed(2)}</p>
                                                                        <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-block
                                                                                ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                                order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                                    order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                                        order.status === 'ready' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                                                            order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                                                'bg-dark-800 text-dark-400 border-dark-700'}`}>
                                                                            {order.status}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {isCatering && (
                                                                <div className="bg-dark-950/50 rounded-xl p-5 border border-dark-800 mb-6">
                                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        {order.selections.flatMap((cat: any) =>
                                                                            cat.selectedItems.map((item: any, iIdx: number) => (
                                                                                <li key={iIdx} className="text-sm text-dark-300 flex items-start gap-2.5">
                                                                                    <CheckCircle size={14} className="text-primary-500 shrink-0 mt-0.5" />
                                                                                    <span className="font-medium text-white">{item.itemName}</span>
                                                                                </li>
                                                                            ))
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-dark-800 pt-5 mt-auto">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Amount</p>
                                                                    <p className="text-xl font-extrabold text-white mt-0.5 group-hover:text-primary-400 transition-colors">
                                                                        €{(isCatering ? order.totalPrice : order.totalAmount).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {isCatering && (
                                                                        <Button variant="outline" size="sm" className="border-dark-700 hover:border-primary-500 hover:text-primary-500" onClick={() => handleRequestChange(order._id)}>
                                                                            Request Changes
                                                                        </Button>
                                                                    )}
                                                                    <Link to={`/${isCatering ? 'catering' : 'menu'}`}>
                                                                        <Button variant="secondary" size="sm" className="bg-dark-800 border-dark-700 hover:bg-dark-700">
                                                                            Order Similar
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}

                                {(statusFilter === 'all' ?
                                    ((active?.catering?.length || 0) + (active?.regular?.length || 0) + (history?.catering?.length || 0) + (history?.regular?.length || 0)) === 0 :
                                    [...(active?.regular || []), ...(active?.catering || []), ...(history?.regular || []), ...(history?.catering || [])].filter(o => o.status === statusFilter).length === 0
                                ) && (
                                        <div className="flex flex-col items-center justify-center py-20 bg-dark-900/50 border border-dashed border-dark-700 rounded-2xl">
                                            <Package size={48} className="text-dark-700 mb-4" />
                                            <p className="text-dark-500 font-medium">No orders found with status "{statusFilter}".</p>
                                        </div>
                                    )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Notifications */}
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="admin-card sticky top-24 border-t-4 border-t-tamil-maroon">
                                <CardContent className="p-6">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold mb-1">
                                        <AlertCircle className="text-tamil-maroon" size={20} />
                                        Notifications
                                    </h3>
                                    <p className="text-xs text-dark-500 mb-6">Recent status updates & communications</p>

                                    {recentNotifications?.length === 0 ? (
                                        <div className="text-center py-10">
                                            <AlertCircle size={32} className="text-dark-800 mx-auto mb-2" />
                                            <p className="text-xs text-dark-600 font-medium italic">No recent notifications</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {recentNotifications.map((note: any) => (
                                                <div key={note._id} className="relative pl-6 pb-2 border-l border-dark-800 last:border-0 last:pb-0">
                                                    <div className="absolute top-0 left-[-4px] w-2 h-2 rounded-full bg-primary-500" />
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {note.type === 'email' ? <Mail size={12} className="text-primary-500" /> : <MessageSquare size={12} className="text-green-500" />}
                                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                                {note.type === 'email' ? 'Email Sent' : 'WhatsApp Msg'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-dark-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                            <button
                                                                onClick={() => handleClearNotification(note._id)}
                                                                className="w-5 h-5 rounded-full bg-dark-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                                                title="Clear notification"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-dark-400 bg-dark-950/80 p-3 rounded-lg border border-dark-800 leading-relaxed">
                                                        Update for order <span className="text-primary-400">...{note.referenceId?.toString().slice(-6)}</span>
                                                        <br />
                                                        <span className="mt-2 block opacity-80">Message successfully delivered to your primary contact.</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <Card className="admin-card bg-primary-500/5 border-primary-500/20">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ExternalLink size={20} className="text-primary-500" />
                                </div>
                                <h4 className="font-bold text-white mb-2 text-sm">Need Help?</h4>
                                <p className="text-xs text-dark-400 leading-relaxed mb-4">Need to cancel or make urgent changes? Our support team is here to help.</p>
                                <Link to="/contact">
                                    <Button variant="outline" size="sm" className="w-full border-dark-700 hover:text-primary-500">Contact Support</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>

            {/* Change Request Modal */}
            <AnimatePresence>
                {showChangeModal && (
                    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowChangeModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="admin-modal max-w-lg w-full p-8 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Save className="text-primary-500" size={32} />
                            </div>

                            <h3 className="text-2xl font-extrabold mb-2 text-white">Request Modifications</h3>
                            <p className="text-sm text-dark-400 mb-8 leading-relaxed">
                                Describe the changes you'd like to make to order <span className="text-primary-500 font-mono">#{activeOrderId?.slice(-8).toUpperCase()}</span>.
                                <br />
                                <span className="text-[10px] text-amber-500 font-bold uppercase mt-2 block">⚠️ Note: Major changes require 10 days notice.</span>
                            </p>

                            <div className="mb-8">
                                <label className="admin-label">Change Details</label>
                                <textarea
                                    className="admin-input min-h-[160px] resize-none"
                                    placeholder="e.g. We'd like to increase the guest count to 60 and add an extra dessert category..."
                                    value={changeNotes}
                                    onChange={(e) => setChangeNotes(e.target.value)}
                                />
                                <p className="text-[10px] text-dark-500 mt-2 italic">Please be specific to help us process your request faster.</p>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 border-dark-700 h-12" onClick={() => setShowChangeModal(false)}>Discard</Button>
                                <Button
                                    variant="primary"
                                    onClick={submitChangeRequest}
                                    disabled={!changeNotes.trim() || submittingChange}
                                    className="flex-1 h-12 gap-2"
                                >
                                    {submittingChange ? 'Processing...' : 'Send Request'}
                                    {!submittingChange && <Save size={18} />}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

