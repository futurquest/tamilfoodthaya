import { useState, useEffect, useMemo } from 'react';
import { getUserDashboard, requestCateringChange, clearNotification } from '../../hooks/useApi';
import { Container } from '../../components/ui/Container';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    AlertCircle,
    CheckCircle,
    Save,
    Clock,
    ExternalLink,
    Calendar,
    Users,
    MapPin,
    X,
    Mail,
    MessageSquare,
    Euro,
} from 'lucide-react';
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
            loadData();
        } catch (error) {
            console.error('Failed to clear notification:', error);
            toast.error('Failed to clear notification');
        }
    };

    const active = dashboardData?.active || {};
    const history = dashboardData?.history || {};
    const recentNotifications = dashboardData?.recentNotifications || [];

    const allOrders = useMemo(() => {
        return [
            ...(active?.regular || []),
            ...(active?.catering || []),
            ...(history?.regular || []),
            ...(history?.catering || []),
        ];
    }, [active, history]);

    const filteredOrders = useMemo(() => {
        return allOrders
            .filter((o: any) => statusFilter === 'all' || o.status === statusFilter)
            .sort(
                (a: any, b: any) =>
                    new Date(b.createdAt || b.eventDate).getTime() -
                    new Date(a.createdAt || a.eventDate).getTime()
            );
    }, [allOrders, statusFilter]);

    const pendingCount =
        (active?.catering?.filter((o: any) => ['pending', 'reviewing', 'quoted'].includes(o.status)).length || 0) +
        (active?.regular?.filter((o: any) => ['pending'].includes(o.status)).length || 0);

    const progressCount =
        (active?.catering?.filter((o: any) => ['confirmed', 'paid', 'preparing'].includes(o.status)).length || 0) +
        (active?.regular?.filter((o: any) => ['paid', 'preparing', 'ready'].includes(o.status)).length || 0);

    const completedCount = (history?.catering?.length || 0) + (history?.regular?.length || 0);

    const totalSpent = useMemo(() => {
        return allOrders.reduce((sum: number, order: any) => {
            const isCatering = 'packageName' in order;
            return sum + Number(isCatering ? order.totalPrice || 0 : order.totalAmount || 0);
        }, 0);
    }, [allOrders]);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'reviewing':
                return 'bg-violet-50 text-violet-700 border-violet-200';
            case 'quoted':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'confirmed':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'preparing':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ready':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTypeBadgeClass = (isCatering: boolean) => {
        return isCatering
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-blue-50 text-blue-700 border-blue-200';
    };

    if (loading) {
        return (
            <div className="user-dashboard-font min-h-screen bg-slate-50 pt-32 pb-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                    <p className="font-medium text-slate-500">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard-font min-h-screen bg-slate-50 text-slate-900">
            <style>{`
                .user-dashboard-font,
                .user-dashboard-font .ph-root,
                .user-dashboard-font .ph-eyebrow,
                .user-dashboard-font .ph-title,
                .user-dashboard-font .ph-sub,
                .user-dashboard-font h1,
                .user-dashboard-font h2,
                .user-dashboard-font h3,
                .user-dashboard-font h4 {
                    font-family: var(--font-sans) !important;
                }
            `}</style>
            <SEO title="My Dashboard" description="Manage your Tamil Food Thaya bookings and orders." />

            <PageHeader
                title="My Dashboard"
                subtitle="Manage your active catering bookings, order history, and recent notifications in one place."
            />

            <Container className="-mt-10 relative z-10 pb-24">
                <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Pending / Review
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900">{pendingCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                        <Clock size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            In Progress
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900">{progressCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                        <Save size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Completed
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900">{completedCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                                        <CheckCircle size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Total Value
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                                            €{totalSpent.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                        <Euro size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6 md:p-8">
                                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-slate-900">
                                            <Clock className="text-amber-500" />
                                            Manage My Orders
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Track current orders, view past bookings, and request changes.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'pending', 'confirmed', 'paid', 'preparing', 'completed'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setStatusFilter(f)}
                                                className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                                                    statusFilter === f
                                                        ? 'border-amber-500 bg-amber-500 text-white'
                                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                                }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {filteredOrders.map((order: any, idx: number) => {
                                        const isCatering = 'packageName' in order;
                                        const total = isCatering ? order.totalPrice : order.totalAmount;
                                        const displayDate = new Date(
                                            isCatering ? order.eventDate : order.createdAt
                                        ).toLocaleDateString();

                                        return (
                                            <motion.div
                                                key={order._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                            >
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-all hover:border-amber-200 hover:bg-white hover:shadow-md">
                                                    <div className="flex flex-col gap-5">
                                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                            <div className="min-w-0">
                                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-xl font-bold text-slate-900">
                                                                        {isCatering
                                                                            ? order.packageName
                                                                            : `Food Order #${order._id.slice(-6).toUpperCase()}`}
                                                                    </h3>

                                                                    <span
                                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${getTypeBadgeClass(
                                                                            isCatering
                                                                        )}`}
                                                                    >
                                                                        {isCatering ? 'Catering' : 'Regular'}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar size={14} className="text-amber-500" />
                                                                        {displayDate}
                                                                    </div>

                                                                    {isCatering && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Users size={14} className="text-amber-500" />
                                                                            {order.guests} Guests
                                                                        </div>
                                                                    )}

                                                                    {isCatering && order.eventLocation && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <MapPin size={14} className="text-amber-500" />
                                                                            {order.eventLocation}
                                                                        </div>
                                                                    )}

                                                                    {!isCatering && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Package size={14} className="text-amber-500" />
                                                                            {order.items?.length || 0} Items
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-start gap-2 md:items-end">
                                                                <p className="text-2xl font-extrabold text-slate-900">
                                                                    €{Number(total || 0).toFixed(2)}
                                                                </p>
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${getStatusBadgeClass(
                                                                        order.status
                                                                    )}`}
                                                                >
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                                                    Total Amount
                                                                </p>
                                                                <p className="mt-1 text-xl font-extrabold text-slate-900">
                                                                    €{Number(total || 0).toFixed(2)}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap gap-3">
                                                                {isCatering && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="border-slate-300 bg-white hover:border-amber-500 hover:text-amber-600"
                                                                        onClick={() => handleRequestChange(order._id)}
                                                                    >
                                                                        Request Changes
                                                                    </Button>
                                                                )}

                                                                <Link to={`/${isCatering ? 'catering' : 'menu'}`}>
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="bg-slate-900 text-white hover:bg-slate-800"
                                                                    >
                                                                        Order Similar
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {filteredOrders.length === 0 && (
                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20">
                                            <Package size={48} className="mb-4 text-slate-300" />
                                            <p className="font-medium text-slate-500">
                                                No orders found with status "{statusFilter}".
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-24 rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="mb-6">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                                        <AlertCircle className="text-amber-500" size={20} />
                                        Notifications
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Recent updates and communications
                                    </p>
                                </div>

                                {recentNotifications.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                                        <AlertCircle size={32} className="mx-auto mb-3 text-slate-300" />
                                        <p className="text-sm italic text-slate-500">No recent notifications</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentNotifications.map((note: any) => (
                                            <div
                                                key={note._id}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                                note.type === 'email'
                                                                    ? 'bg-amber-100 text-amber-600'
                                                                    : 'bg-green-100 text-green-600'
                                                            }`}
                                                        >
                                                            {note.type === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                                                                {note.type === 'email' ? 'Email Sent' : 'WhatsApp Msg'}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {new Date(note.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleClearNotification(note._id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                        title="Clear notification"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <p className="text-sm leading-relaxed text-slate-600">
                                                    Update for order{' '}
                                                    <span className="font-semibold text-amber-600">
                                                        ...{note.referenceId?.toString().slice(-6)}
                                                    </span>
                                                </p>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Message successfully delivered to your primary contact.
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                    <ExternalLink size={22} />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Need Help?</h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Need to cancel or make urgent changes? Our support team is here to help.
                                </p>
                                <Link to="/contact#inquiry">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-5 w-full border-slate-300 bg-white hover:border-amber-500 hover:text-amber-600"
                                    >
                                        Contact Support
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>

            <AnimatePresence>
                {showChangeModal && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
                        onClick={() => setShowChangeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                <Save size={30} />
                            </div>

                            <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Request Modifications</h3>
                            <p className="mb-8 text-sm leading-relaxed text-slate-600">
                                Describe the changes you'd like to make to order{' '}
                                <span className="font-mono font-semibold text-amber-600">
                                    #{activeOrderId?.slice(-8).toUpperCase()}
                                </span>
                                .
                            </p>

                            <div className="mb-8">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Change Details
                                </label>
                                <textarea
                                    className="min-h-[160px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                                    placeholder="e.g. We'd like to increase the guest count to 60 and add an extra dessert category..."
                                    value={changeNotes}
                                    onChange={(e) => setChangeNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="h-12 flex-1 border-slate-300 bg-white hover:bg-slate-50"
                                    onClick={() => setShowChangeModal(false)}
                                >
                                    Discard
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={submitChangeRequest}
                                    disabled={!changeNotes.trim() || submittingChange}
                                    className="h-12 flex-1 gap-2 bg-amber-500 text-white hover:bg-amber-600"
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