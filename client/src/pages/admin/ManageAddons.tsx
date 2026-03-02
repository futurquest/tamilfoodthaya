import { useState, useEffect } from 'react';
import { api } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Music, Flower2, Wine, Baby, Camera, Sparkles } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    entertainment: <Music size={18} />,
    decoration: <Flower2 size={18} />,
    service: <Wine size={18} />,
    extra_time: <Baby size={18} />,
    other: <Camera size={18} />,
};

const CATEGORY_COLORS: Record<string, string> = {
    entertainment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    decoration: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    service: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    extra_time: 'bg-green-500/20 text-green-400 border-green-500/30',
    other: 'bg-dark-600/50 text-dark-300 border-dark-600',
};

const EMPTY_FORM = {
    name: '',
    nameTranslations: { nl: '', en: '', ta: '' },
    description: '',
    descriptionTranslations: { nl: '', en: '', ta: '' },
    price: 0,
    pricingType: 'fixed' as 'fixed' | 'per_person',
    category: 'decoration' as 'decoration' | 'entertainment' | 'service' | 'extra_time' | 'other'
};

type PricingType = 'fixed' | 'per_person';
type CategoryType = 'decoration' | 'entertainment' | 'service' | 'extra_time' | 'other';
type AddonForm = {
    name: string;
    nameTranslations?: { nl: string; en: string; ta: string; };
    description: string;
    descriptionTranslations?: { nl: string; en: string; ta: string; };
    price: number;
    pricingType: PricingType;
    category: CategoryType;
};

interface Addon extends AddonForm { _id: string; }

// Preset add-ons for quick creation
const PRESETS: Array<Partial<AddonForm> & { icon: React.ReactNode }> = [
    { name: 'DJ & Music', description: 'Professional DJ with full sound system and lighting for 4 hours.', price: 350, pricingType: 'fixed', category: 'entertainment', icon: <Music size={16} /> },
    { name: 'Flower Decoration', description: 'Elegant floral arrangements for tables and entrance.', price: 200, pricingType: 'fixed', category: 'decoration', icon: <Flower2 size={16} /> },
    { name: 'Welcome Drinks', description: 'Mocktail / juice welcome drinks for all guests on arrival.', price: 8, pricingType: 'per_person', category: 'service', icon: <Wine size={16} /> },
    { name: "Kids' Menu", description: "Specially prepared mild dishes for children under 12.", price: 12, pricingType: 'per_person', category: 'service', icon: <Baby size={16} /> },
    { name: 'Photographer', description: 'Professional event photographer for up to 5 hours.', price: 450, pricingType: 'fixed', category: 'other', icon: <Camera size={16} /> },
];

export const ManageAddons = () => {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<AddonForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);

    const load = () => api.get('/addons').then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setAddons(data);
    }).catch(() => setAddons([])).finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const openNew = (preset?: Partial<AddonForm>) => {
        setEditing(null);
        setForm({ ...EMPTY_FORM, ...preset });
        setShowForm(true);
    };
    const openEdit = (addon: Addon) => {
        setEditing(addon._id);
        setForm({
            name: addon.name,
            nameTranslations: {
                nl: addon.nameTranslations?.nl || addon.name || '',
                en: addon.nameTranslations?.en || '',
                ta: addon.nameTranslations?.ta || ''
            },
            description: addon.description,
            descriptionTranslations: {
                nl: addon.descriptionTranslations?.nl || addon.description || '',
                en: addon.descriptionTranslations?.en || '',
                ta: addon.descriptionTranslations?.ta || ''
            },
            price: addon.price,
            pricingType: addon.pricingType,
            category: addon.category
        });
        setShowForm(true);
    };
    const handleSave = async () => {
        try {
            if (editing) await api.put(`/addons/${editing}`, form);
            else await api.post('/addons', form);
            toast.success(editing ? 'Add-on updated' : 'Add-on created');
            setShowForm(false); setEditing(null); setForm(EMPTY_FORM); load();
        } catch { toast.error('Failed to save'); }
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this add-on?')) return;
        try { await api.delete(`/addons/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
    };

    return (
        <div className="animate-fadeIn space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles size={22} className="text-primary-400" /> Event Add-ons</h1>
                    <p className="text-dark-400 text-sm mt-1">Manage optional extras guests can add to their catering package.</p>
                </div>
                <button onClick={() => openNew()} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
                    <Plus size={16} /> New Add-on
                </button>
            </div>

            {/* Quick presets */}
            {addons.length === 0 && !loading && (
                <div className="admin-card">
                    <h3 className="text-white font-semibold mb-1">Quick Presets</h3>
                    <p className="text-dark-400 text-sm mb-4">Click to add common add-ons instantly.</p>
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map(p => (
                            <button key={p.name} onClick={() => openNew(p)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-600 text-dark-300 hover:border-primary-500 hover:text-primary-400 transition-all text-sm">
                                {p.icon} {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="text-center py-16 text-dark-500">Loading…</div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addons.map(addon => (
                        <div key={addon._id} className="admin-card group">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[addon.category] || CATEGORY_COLORS.other}`}>
                                    {CATEGORY_ICONS[addon.category]} {addon.category}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(addon)} className="text-primary-400 hover:text-primary-300 transition-colors"><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(addon._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-white mb-1">{addon.nameTranslations?.nl || addon.name}</h3>
                            <p className="text-dark-400 text-xs leading-relaxed mb-3">{addon.descriptionTranslations?.nl || addon.description}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-gold-400 font-bold text-lg">€{addon.price}</span>
                                <span className="text-dark-500 text-xs">{addon.pricingType === 'per_person' ? '/ per person' : 'fixed'}</span>
                            </div>
                        </div>
                    ))}
                    {addons.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-dark-500">No add-ons yet. Click <strong>New Add-on</strong> to get started.</div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="admin-modal p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-5">{editing ? 'Edit' : 'New'} Add-on</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="admin-label">Name (NL)</label>
                                    <input value={form.nameTranslations?.nl || ''} onChange={e => setForm(p => ({ ...p, nameTranslations: { ...(p.nameTranslations || { nl: '', en: '', ta: '' }), nl: e.target.value } }))} className="admin-input" placeholder="Dutch name" />
                                </div>
                                <div>
                                    <label className="admin-label">Name (EN)</label>
                                    <input value={form.nameTranslations?.en || ''} onChange={e => setForm(p => ({ ...p, nameTranslations: { ...(p.nameTranslations || { nl: '', en: '', ta: '' }), en: e.target.value } }))} className="admin-input" placeholder="English name" />
                                </div>
                                <div>
                                    <label className="admin-label">Name (TA)</label>
                                    <input value={form.nameTranslations?.ta || ''} onChange={e => setForm(p => ({ ...p, nameTranslations: { ...(p.nameTranslations || { nl: '', en: '', ta: '' }), ta: e.target.value } }))} className="admin-input" placeholder="Tamil name" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="admin-label">Description (NL)</label>
                                    <textarea value={form.descriptionTranslations?.nl || ''} onChange={e => setForm(p => ({ ...p, descriptionTranslations: { ...(p.descriptionTranslations || { nl: '', en: '', ta: '' }), nl: e.target.value } }))} className="admin-input h-20 resize-none" placeholder="Dutch description" />
                                </div>
                                <div>
                                    <label className="admin-label">Description (EN)</label>
                                    <textarea value={form.descriptionTranslations?.en || ''} onChange={e => setForm(p => ({ ...p, descriptionTranslations: { ...(p.descriptionTranslations || { nl: '', en: '', ta: '' }), en: e.target.value } }))} className="admin-input h-20 resize-none" placeholder="English description" />
                                </div>
                                <div>
                                    <label className="admin-label">Description (TA)</label>
                                    <textarea value={form.descriptionTranslations?.ta || ''} onChange={e => setForm(p => ({ ...p, descriptionTranslations: { ...(p.descriptionTranslations || { nl: '', en: '', ta: '' }), ta: e.target.value } }))} className="admin-input h-20 resize-none" placeholder="Tamil description" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Price (€)</label>
                                    <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="admin-input" min="0" />
                                </div>
                                <div>
                                    <label className="admin-label">Pricing Type</label>
                                    <select value={form.pricingType} onChange={e => setForm(p => ({ ...p, pricingType: e.target.value as any }))} className="admin-input">
                                        <option value="fixed">Fixed Price</option>
                                        <option value="per_person">Per Person</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Category</label>
                                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className="admin-input">
                                    <option value="decoration">🌸 Decoration</option>
                                    <option value="entertainment">🎵 Entertainment</option>
                                    <option value="service">🥂 Service</option>
                                    <option value="extra_time">⏰ Extra Time</option>
                                    <option value="other">📦 Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="btn-primary flex-1">Save Add-on</button>
                            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
