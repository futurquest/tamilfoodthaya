import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { getCateringPackages, createCateringPackage, updateCateringPackage, deleteCateringPackage } from '../../hooks/useApi';
import { toast } from 'react-hot-toast';

interface Item {
    menuItem: any; // ID or populated object
}

interface Category {
    name: string;
    description: string;
    minSelect: number;
    maxSelect: number;
    items: Item[];
}

interface Package {
    _id?: string;
    name: string;
    description: string;
    basePrice: number;
    minGuests: number;
    maxGuests: number;
    categories: Category[];
    available: boolean;
    sortOrder: number;
}

const emptyItem: Item = { menuItem: '' };
const emptyCategory: Category = { name: '', description: '', minSelect: 1, maxSelect: 1, items: [{ ...emptyItem }] };
const emptyPackage: Package = {
    name: '', description: '', basePrice: 0, minGuests: 20, maxGuests: 500,
    categories: [], available: true, sortOrder: 0,
};

import { useMenu } from '../../hooks/useApi';

export const ManageCateringPackages = () => {
    const { menuItems } = useMenu();
    const [packages, setPackages] = useState<Package[]>([]);
    const [editing, setEditing] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await getCateringPackages();
            setPackages(data);
        } catch { toast.error('Failed to load packages'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleSave = async () => {
        if (!editing) return;
        try {
            if (editing._id) {
                await updateCateringPackage(editing._id, editing);
                toast.success('Package updated');
            } else {
                await createCateringPackage(editing);
                toast.success('Package created');
            }
            setEditing(null);
            fetchPackages();
        } catch { toast.error('Failed to save package'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this package?')) return;
        try {
            await deleteCateringPackage(id);
            toast.success('Package deleted');
            fetchPackages();
        } catch { toast.error('Failed to delete package'); }
    };

    const toggleCat = (idx: number) => setExpandedCats(prev => ({ ...prev, [idx]: !prev[idx] }));

    // --- Category / Item / Choice helpers ---
    const updateField = (field: string, value: any) => {
        if (!editing) return;
        setEditing({ ...editing, [field]: value });
    };

    const addCategory = () => {
        if (!editing) return;
        setEditing({ ...editing, categories: [...editing.categories, { ...emptyCategory, items: [{ ...emptyItem }] }] });
        setExpandedCats(prev => ({ ...prev, [editing.categories.length]: true }));
    };

    const updateCategory = (catIdx: number, field: string, value: any) => {
        if (!editing) return;
        const cats = [...editing.categories];
        cats[catIdx] = { ...cats[catIdx], [field]: value };
        setEditing({ ...editing, categories: cats });
    };

    const removeCategory = (catIdx: number) => {
        if (!editing) return;
        setEditing({ ...editing, categories: editing.categories.filter((_, i) => i !== catIdx) });
    };

    const addItem = (catIdx: number) => {
        if (!editing) return;
        const cats = [...editing.categories];
        cats[catIdx] = { ...cats[catIdx], items: [...cats[catIdx].items, { ...emptyItem }] };
        setEditing({ ...editing, categories: cats });
    };

    const updateItem = (catIdx: number, itemIdx: number, field: string, value: any) => {
        if (!editing) return;
        const cats = [...editing.categories];
        const items = [...cats[catIdx].items];
        items[itemIdx] = { ...items[itemIdx], [field]: value };
        cats[catIdx] = { ...cats[catIdx], items };
        setEditing({ ...editing, categories: cats });
    };

    const removeItem = (catIdx: number, itemIdx: number) => {
        if (!editing) return;
        const cats = [...editing.categories];
        cats[catIdx] = { ...cats[catIdx], items: cats[catIdx].items.filter((_, i) => i !== itemIdx) };
        setEditing({ ...editing, categories: cats });
    };

    if (editing) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{editing._id ? 'Edit Package' : 'New Package'}</h2>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setEditing(null)} className="gap-2"><X size={18} />Cancel</Button>
                        <Button onClick={handleSave} className="gap-2"><Save size={18} />Save</Button>
                    </div>
                </div>

                {/* Package basic info */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Package Info</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name</label>
                                <input value={editing.name} onChange={e => updateField('name', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" placeholder="e.g. Gold Package" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Base Price (€ p.p.)</label>
                                <input type="number" step="0.50" value={editing.basePrice} onChange={e => updateField('basePrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                            <textarea value={editing.description} onChange={e => updateField('description', e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none min-h-[80px]" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Min Guests</label>
                                <input type="number" value={editing.minGuests} onChange={e => updateField('minGuests', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Max Guests</label>
                                <input type="number" value={editing.maxGuests} onChange={e => updateField('maxGuests', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sort Order</label>
                                <input type="number" value={editing.sortOrder} onChange={e => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editing.available} onChange={e => updateField('available', e.target.checked)}
                                className="w-4 h-4 rounded accent-tamil-maroon" />
                            <span className="text-sm font-medium">Available for customers</span>
                        </label>
                    </CardContent>
                </Card>

                {/* Categories */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Categories</h3>
                        <Button variant="outline" onClick={addCategory} className="gap-2"><Plus size={18} />Add Category</Button>
                    </div>

                    {editing.categories.map((cat, catIdx) => (
                        <Card key={catIdx}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCat(catIdx)}>
                                    <div className="flex items-center gap-3">
                                        {expandedCats[catIdx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        <span className="font-bold">{cat.name || `Category ${catIdx + 1}`}</span>
                                        <span className="text-xs text-gray-400">{cat.items.length} item(s) · select {cat.minSelect}-{cat.maxSelect}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeCategory(catIdx); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </div>

                                {expandedCats[catIdx] && (
                                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-tamil-gold/30">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category Name</label>
                                                <input value={cat.name} onChange={e => updateCategory(catIdx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none text-sm" placeholder="e.g. Main Course" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Min Select</label>
                                                    <input type="number" value={cat.minSelect} onChange={e => updateCategory(catIdx, 'minSelect', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Max Select</label>
                                                    <input type="number" value={cat.maxSelect} onChange={e => updateCategory(catIdx, 'maxSelect', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                                            <input value={cat.description} onChange={e => updateCategory(catIdx, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none text-sm" />
                                        </div>

                                        {/* Items in this category */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-bold text-gray-600 uppercase">Items</h4>
                                                <button onClick={() => addItem(catIdx)} className="text-tamil-maroon text-xs font-bold flex items-center gap-1 hover:underline">
                                                    <Plus size={14} />Add Item
                                                </button>
                                            </div>

                                            {cat.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="bg-gray-50 rounded-md p-3 space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-grow">
                                                            <select
                                                                value={typeof item.menuItem === 'object' && item.menuItem ? item.menuItem._id : item.menuItem || ''}
                                                                onChange={e => updateItem(catIdx, itemIdx, 'menuItem', e.target.value)}
                                                                className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-tamil-maroon outline-none"
                                                            >
                                                                <option value="">Select Menu Item</option>
                                                                {menuItems.data?.map((mi: any) => (
                                                                    <option key={mi._id} value={mi._id}>{mi.name} - €{mi.price?.toFixed(2)}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <button onClick={() => removeItem(catIdx, itemIdx)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Catering Packages</h2>
                <Button onClick={() => { setEditing({ ...emptyPackage, categories: [] }); setExpandedCats({}); }} className="gap-2">
                    <Plus size={18} />New Package
                </Button>
            </div>

            {loading ? (
                <p className="text-gray-400 text-center py-12">Loading...</p>
            ) : packages.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-400">
                        <p className="text-lg font-bold mb-2">No packages yet</p>
                        <p className="text-sm">Create your first catering package to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {packages.map((pkg) => (
                        <Card key={pkg._id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{pkg.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pkg.available ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                                                {pkg.available ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                                        <div className="flex gap-6 mt-3 text-sm text-gray-500">
                                            <span><strong className="text-tamil-maroon">€{pkg.basePrice.toFixed(2)}</strong> per person</span>
                                            <span>{pkg.minGuests}–{pkg.maxGuests || '∞'} guests</span>
                                            <span>{pkg.categories.length} categories</span>
                                            <span>{pkg.categories.reduce((acc, c) => acc + c.items.length, 0)} items total</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => { setEditing({ ...pkg }); setExpandedCats({}); }} className="gap-2"><Edit2 size={16} />Edit</Button>
                                        <Button variant="outline" onClick={() => handleDelete(pkg._id!)} className="gap-2 text-red-500 border-red-200 hover:bg-red-50"><Trash2 size={16} /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
