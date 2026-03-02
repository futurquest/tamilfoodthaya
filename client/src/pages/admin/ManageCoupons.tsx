import { useState, useEffect } from 'react';
import { api } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

const EMPTY_FORM = { code: '', discountType: 'percentage' as const, discountValue: 10, minOrderAmount: 0, maxUses: 0, validFrom: '', validUntil: '' };
type CouponForm = typeof EMPTY_FORM;
interface Coupon extends CouponForm { _id: string; usedCount: number; }

export const ManageCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);

    const load = () => api.get('/coupons').then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setCoupons(data);
    }).catch(() => setCoupons([])).finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
    const openEdit = (c: Coupon) => {
        setEditing(c._id);
        setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount || 0, maxUses: c.maxUses || 0, validFrom: c.validFrom?.split('T')[0] || '', validUntil: c.validUntil?.split('T')[0] || '' });
        setShowForm(true);
    };
    const handleSave = async () => {
        if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
        try {
            if (editing) await api.put(`/coupons/${editing}`, form);
            else await api.post('/coupons', form);
            toast.success(editing ? 'Coupon updated' : 'Coupon created');
            setShowForm(false); setEditing(null); setForm(EMPTY_FORM); load();
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save'); }
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this coupon?')) return;
        try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
    };

    const isExpired = (c: Coupon) => c.validUntil ? new Date(c.validUntil) < new Date() : false;

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Tag size={22} className="text-primary-400" /> Discount Coupons</h1>
                    <p className="text-dark-400 text-sm mt-1">Create and manage discount codes for customers.</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
                    <Plus size={16} /> New Coupon
                </button>
            </div>

            {/* Table */}
            <div className="admin-card overflow-x-auto">
                {loading ? (
                    <div className="text-center py-16 text-dark-500">Loading…</div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-16 text-dark-500">No coupons yet. Click <strong>New Coupon</strong> to create one.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Code</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Discount</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Min Order</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Uses</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Valid Until</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-dark-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c._id} className="border-b border-dark-800 hover:bg-dark-800/40 transition-colors">
                                    <td className="py-3.5 px-4">
                                        <span className="font-mono font-bold text-white bg-dark-700 px-2 py-1 rounded-lg text-xs tracking-widest">{c.code}</span>
                                    </td>
                                    <td className="py-3.5 px-4 text-gold-400 font-bold">
                                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `€${c.discountValue}`}
                                    </td>
                                    <td className="py-3.5 px-4 text-dark-300">€{c.minOrderAmount || 0}</td>
                                    <td className="py-3.5 px-4 text-dark-300">{c.usedCount || 0} / {c.maxUses || '∞'}</td>
                                    <td className="py-3.5 px-4 text-dark-400 text-xs">{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</td>
                                    <td className="py-3.5 px-4">
                                        {isExpired(c)
                                            ? <span className="badge badge-nonveg">Expired</span>
                                            : <span className="badge badge-veg">Active</span>}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="flex gap-3">
                                            <button onClick={() => openEdit(c)} className="text-primary-400 hover:text-primary-300 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="admin-modal p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-5">{editing ? 'Edit' : 'New'} Coupon</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="admin-label">Coupon Code</label>
                                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="admin-input font-mono tracking-widest" placeholder="SAVE20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Discount Type</label>
                                    <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))} className="admin-input">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">Value ({form.discountType === 'percentage' ? '%' : '€'})</label>
                                    <input type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} className="admin-input" min="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Min Order Amount (€)</label>
                                    <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: parseFloat(e.target.value) || 0 }))} className="admin-input" min="0" />
                                </div>
                                <div>
                                    <label className="admin-label">Max Uses (0 = unlimited)</label>
                                    <input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))} className="admin-input" min="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Valid From</label>
                                    <input type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} className="admin-input" />
                                </div>
                                <div>
                                    <label className="admin-label">Valid Until</label>
                                    <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} className="admin-input" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="btn-primary flex-1">Save Coupon</button>
                            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
