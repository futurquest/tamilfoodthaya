import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useFeedback } from '../../context/FeedbackContext';
import { SEO } from '../../components/SEO';

export const UserDashboard = () => {
    const { t } = useTranslation();
    const { show } = useFeedback();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [changeNotes, setChangeNotes] = useState('');
    const [submittingChange, setSubmittingChange] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const loadData = async () => {
        setLoadError(false);
        setLoading(true);
        try {
            const data = await getUserDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error(error);
            setLoadError(true);
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
            setShowChangeModal(false);
            show({ type: 'success', message: t('dashboard.toast.changeSubmitted') });
            loadData();
        } catch (error: any) {
            show({ type: 'error', message: error.response?.data?.message || t('dashboard.toast.changeFailed') });
        } finally {
            setSubmittingChange(false);
        }
    };

    const handleClearNotification = async (notificationId: string) => {
        try {
            await clearNotification(notificationId);
            show({ type: 'success', message: t('dashboard.toast.notifCleared') });
            loadData();
        } catch (error) {
            console.error('Failed to clear notification:', error);
            show({ type: 'error', message: t('dashboard.toast.notifClearFailed') });
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

    const STATUS_TONES: Record<string, string> = {
        pending: 'wait',
        reviewing: 'wait',
        quoted: 'wait',
        confirmed: 'live',
        paid: 'live',
        preparing: 'live',
        ready: 'live',
        completed: 'done',
    };

    const getStatusBadgeClass = (status: string) =>
        `dash-status dash-status--${STATUS_TONES[status] || 'done'}`;

    const getTypeBadgeClass = () => 'dash-type-chip';

    if (loadError) return <div className="user-dashboard-font dashboard-error container" role="alert"><h1>{t('dashboard.loadErrorTitle')}</h1><p>{t('dashboard.loadErrorText')}</p><button className="btn-primary" onClick={loadData}>{t('dashboard.tryAgain')}</button></div>;

    if (loading) {
        return (
            <div className="user-dashboard-font min-h-screen pt-32 pb-24 flex items-center justify-center" style={{ background: 'var(--brand-surface)' }}>
                <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
                    <div className="h-12 w-12 rounded-full border-4 animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)', borderTopColor: 'var(--brand-accent)' }} />
                    <p className="font-medium" style={{ color: 'var(--brand-text-muted)' }}>{t('dashboard.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard-font min-h-screen" style={{ background: 'var(--brand-surface)', color: 'var(--brand-text)' }}>
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
                .dash-card {
                    background: var(--brand-surface-ivory);
                    border-color: var(--brand-outline);
                }
                .dash-order-row {
                    background: color-mix(in srgb, var(--brand-surface-dim) 60%, transparent);
                    border-color: var(--brand-outline);
                }
                .dash-order-row:hover {
                    background: var(--brand-surface-ivory);
                    border-color: color-mix(in srgb, var(--brand-accent) 45%, transparent);
                }
                .dash-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    border-radius: 999px;
                    border: 1px solid;
                    padding: 0.32rem 0.75rem;
                    font-size: 0.655rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                .dash-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    opacity: 0.85;
                }
                .dash-status--wait {
                    border-color: color-mix(in srgb, var(--brand-warning) 38%, transparent);
                    background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
                    color: var(--brand-warning-deep);
                }
                .dash-status--live {
                    border-color: color-mix(in srgb, var(--brand-primary) 38%, transparent);
                    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
                    color: var(--brand-primary);
                }
                .dash-status--done {
                    border-color: var(--brand-outline);
                    background: color-mix(in srgb, var(--brand-surface-deep) 45%, transparent);
                    color: var(--brand-text-muted);
                }
                .dash-type-chip {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    border: 1px solid var(--brand-outline);
                    padding: 0.3rem 0.65rem;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--brand-text-muted);
                    background: color-mix(in srgb, var(--brand-surface-warm) 55%, transparent);
                }
                .dash-notif-email { background: color-mix(in srgb, var(--brand-accent) 16%, transparent); color: var(--brand-accent); }
                .dash-notif-msg { background: color-mix(in srgb, var(--brand-primary) 16%, transparent); color: var(--brand-primary); }
                .dash-modal-overlay {
                    background: color-mix(in srgb, var(--brand-night) 55%, transparent);
                }
                .dash-modal {
                    background: var(--brand-surface-ivory);
                    border-color: var(--brand-outline);
                }
                .dash-textarea {
                    background: var(--brand-surface-dim);
                    border-color: var(--brand-outline);
                    color: var(--brand-text);
                }
                .dash-textarea:focus {
                    border-color: var(--brand-accent);
                    background: var(--brand-surface-ivory);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-accent) 14%, transparent);
                }
                .dash-notif-card {
                    background: var(--brand-surface-dim);
                    border-color: var(--brand-outline);
                }
                .dash-help-card {
                    background: linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 8%, var(--brand-surface-ivory)), var(--brand-surface-ivory));
                    border-color: color-mix(in srgb, var(--brand-accent) 35%, transparent);
                }
                .dash-stat-icon-pending { background: color-mix(in srgb, var(--brand-accent) 18%, transparent); color: var(--brand-accent); }
                .dash-stat-icon-complete { background: color-mix(in srgb, var(--brand-text) 12%, transparent); color: var(--brand-text-muted); }
                .dash-stat-icon-value { background: color-mix(in srgb, var(--brand-accent) 18%, transparent); color: var(--brand-accent); }
                :lang(ta) .dash-manage-orders-title {
                    font-size: 1.15rem !important;
                    line-height: 1.4 !important;
                }
            `}</style>
            <SEO title={t('dashboard.seoTitle')} description={t('dashboard.seoDescription')} />

            <PageHeader
                title={t('dashboard.title')}
                subtitle={t('dashboard.subtitle')}
            />

            <Container className="-mt-10 relative z-10 pb-24">
                <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-text-muted)' }}>
                                            {t('dashboard.stat.pending')}
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--brand-text)' }}>{pendingCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl dash-stat-icon-pending">
                                        <Clock size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-text-muted)' }}>
                                            {t('dashboard.stat.inProgress')}
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--brand-text)' }}>{progressCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl dash-stat-icon-progress">
                                        <Save size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-text-muted)' }}>
                                            {t('dashboard.stat.completed')}
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--brand-text)' }}>{completedCount}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl dash-stat-icon-complete">
                                        <CheckCircle size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="h-full rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-text-muted)' }}>
                                            {t('dashboard.stat.totalValue')}
                                        </p>
                                        <h3 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--brand-text)' }}>
                                            €{totalSpent.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl dash-stat-icon-value">
                                        <Euro size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6 md:p-8">
                                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="dash-manage-orders-title flex items-center gap-3 text-2xl font-extrabold" style={{ color: 'var(--brand-text)' }}>
                                            <Clock style={{ color: 'var(--brand-accent)' }} />
                                            {t('dashboard.manageOrders')}
                                        </h2>
                                        <p className="mt-2 text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                                            {t('dashboard.manageOrdersSub')}
                                        </p>
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        aria-label={t('dashboard.filterLabel')}
                                        className="cursor-pointer rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors"
                                        style={{
                                            backgroundColor: 'var(--brand-surface-ivory)',
                                            borderColor: 'var(--brand-outline)',
                                            color: 'var(--brand-text)',
                                            outline: 'none',
                                        }}
                                    >
                                        {['all', 'pending', 'confirmed', 'paid', 'preparing', 'completed'].map((f) => (
                                            <option key={f} value={f}>
                                                {f === 'all' ? t('dashboard.filter.all') : t(`dashboard.status.${f}`)}
                                            </option>
                                        ))}
                                    </select>
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
                                                <div className="rounded-2xl border p-5 transition-all dash-order-row">
                                                    <div className="flex flex-col gap-5">
                                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                            <div className="min-w-0">
                                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-xl font-bold" style={{ color: 'var(--brand-text)' }}>
{isCatering
                                            ? order.packageName
                                            : t('dashboard.foodOrder', { id: order._id.slice(-6).toUpperCase() })}
                                                                    </h3>

                                                                    <span
                                                                        className={getTypeBadgeClass()}
                                                                    >
                                                                        {isCatering ? t('dashboard.type.catering') : t('dashboard.type.regular')}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar size={14} style={{ color: 'var(--brand-accent)' }} />
                                                                        {displayDate}
                                                                    </div>

                                                                    {isCatering && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Users size={14} style={{ color: 'var(--brand-accent)' }} />
                                                                            {t('dashboard.guests', { count: order.guests })}
                                                                        </div>
                                                                    )}

                                                                    {isCatering && order.eventLocation && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <MapPin size={14} style={{ color: 'var(--brand-accent)' }} />
                                                                            {order.eventLocation}
                                                                        </div>
                                                                    )}

                                                                    {!isCatering && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Package size={14} style={{ color: 'var(--brand-accent)' }} />
                                                                            {t('dashboard.items', { count: order.items?.length || 0 })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-start gap-2 md:items-end">
                                                                <p className="text-2xl font-extrabold" style={{ color: 'var(--brand-text)' }}>
                                                                    €{Number(total || 0).toFixed(2)}
                                                                </p>
                                                                <span
                                                                    className={getStatusBadgeClass(
                                                                        order.status
                                                                    )}
                                                                >
<span className="dash-status-dot" />
                                    {String(t(`dashboard.status.${order.status}`, { defaultValue: order.status }))}
                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--brand-outline)' }}>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--brand-text-muted)' }}>
                                                                <Calendar size={13} className="mr-1.5 inline" style={{ color: 'var(--brand-accent)' }} />
                                                                {displayDate}
                                                            </p>

                                                            <div className="flex flex-wrap gap-3">
                                                                {isCatering && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleRequestChange(order._id)}
                                                                    >
                                                                        {t('dashboard.requestChanges')}
                                                                    </Button>
                                                                )}

                                                                <Link to={`/${isCatering ? 'catering' : 'menu'}`}>
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                    >
                                                                        {t('dashboard.orderSimilar')}
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
                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: 'var(--brand-outline)', background: 'color-mix(in srgb, var(--brand-surface-dim) 60%, transparent)' }}>
                                            <Package size={48} className="mb-4" style={{ color: 'var(--brand-outline-dark)' }} />
                                            <p className="max-w-sm font-medium" style={{ color: 'var(--brand-text-muted)' }}>
                                                {statusFilter === 'all'
                                                    ? t('dashboard.noOrders')
                                                    : t('dashboard.noOrdersForFilter', { status: t(`dashboard.status.${statusFilter}`) })}
                                            </p>
                                            {statusFilter === 'all' && (
                                                <Link to="/menu" className="mt-5">
                                                    <Button variant="outline" size="sm">{t('dashboard.browseMenu')}</Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-24 rounded-2xl dash-card shadow-sm">
                            <CardContent className="p-6">
                                <div className="mb-6">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold" style={{ color: 'var(--brand-text)' }}>
                                        <AlertCircle style={{ color: 'var(--brand-accent)' }} size={20} />
                                        {t('dashboard.notifications')}
                                    </h3>
                                    <p className="mt-1 text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                                        {t('dashboard.notificationsSub')}
                                    </p>
                                </div>

                                {recentNotifications.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: 'var(--brand-outline)', background: 'color-mix(in srgb, var(--brand-surface-dim) 60%, transparent)' }}>
                                        <AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--brand-outline-dark)' }} />
                                        <p className="text-sm italic" style={{ color: 'var(--brand-text-muted)' }}>{t('dashboard.noNotifications')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentNotifications.map((note: any) => (
                                            <div
                                                key={note._id}
                                                className="rounded-2xl border p-4 dash-notif-card"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                                note.type === 'email'
                                                                    ? 'dash-notif-email'
                                                                    : 'dash-notif-msg'
                                                            }`}
                                                        >
                                                            {note.type === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--brand-text)' }}>
                                                                {note.type === 'email' ? t('dashboard.notifEmail') : t('dashboard.notifWhatsapp')}
                                                            </p>
                                                            <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>
                                                                {new Date(note.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleClearNotification(note._id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-500"
                                                        style={{ color: 'var(--brand-text-muted)' }}
                                                        title={t('dashboard.clearNotif')}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
                                                    {t('dashboard.updateForOrderLabel')}{' '}
                                                    <span className="font-semibold" style={{ color: 'var(--brand-accent)' }}>
                                                        ...{note.referenceId?.toString().slice(-6)}
                                                    </span>
                                                </p>
                                                <p className="mt-2 text-xs" style={{ color: 'var(--brand-text-muted)' }}>
                                                    {t('dashboard.notifDelivered')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm dash-help-card">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-accent) 18%, transparent)', color: 'var(--brand-accent)' }}>
                                    <ExternalLink size={22} />
                                </div>
                                <h4 className="text-base font-bold" style={{ color: 'var(--brand-text)' }}>{t('dashboard.needHelp')}</h4>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
                                    {t('dashboard.needHelpText')}
                                </p>
                                <Link to="/contact#inquiry">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-5 w-full"
                                    >
                                        {t('dashboard.contactSupport')}
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm dash-modal-overlay"
                        onClick={() => setShowChangeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            className="relative w-full max-w-xl rounded-2xl border p-8 shadow-2xl dash-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-accent) 18%, transparent)', color: 'var(--brand-accent)' }}>
                                <Save size={30} />
                            </div>

                            <h3 className="mb-2 text-2xl font-extrabold" style={{ color: 'var(--brand-text)' }}>{t('dashboard.modalTitle')}</h3>
                            <p className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
                                {t('dashboard.modalBody', { id: `#${activeOrderId?.slice(-8).toUpperCase()}` })}
                            </p>

                            <div className="mb-8">
                                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>
                                    {t('dashboard.changeDetails')}
                                </label>
                                <textarea
                                    className="min-h-[160px] w-full rounded-2xl border px-4 py-3 text-sm outline-none dash-textarea"
                                    placeholder={t('dashboard.changePlaceholder')}
                                    value={changeNotes}
                                    onChange={(e) => setChangeNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="h-12 flex-1"
                                    onClick={() => setShowChangeModal(false)}
                                >
                                    {t('dashboard.discard')}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={submitChangeRequest}
                                    disabled={!changeNotes.trim() || submittingChange}
                                    className="h-12 flex-1 gap-2"
                                >
                                    {submittingChange ? t('dashboard.processing') : t('dashboard.send')}
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
