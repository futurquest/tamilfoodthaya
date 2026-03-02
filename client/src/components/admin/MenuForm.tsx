import { useForm } from 'react-hook-form';
import { useMenu } from '../../hooks/useApi';
import { Button } from '../ui/Button';
import { X, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface MenuFormProps {
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData?: any;
}

export const MenuForm = ({ onClose, onSubmit, initialData }: MenuFormProps) => {
    const { t } = useTranslation();
    const { categories } = useMenu();
    const defaultValues = initialData ? {
        ...initialData,
        nameTranslations: {
            nl: initialData.nameTranslations?.nl || initialData.name || '',
            en: initialData.nameTranslations?.en || '',
            ta: initialData.nameTranslations?.ta || ''
        },
        descriptionTranslations: {
            nl: initialData.descriptionTranslations?.nl || initialData.description || '',
            en: initialData.descriptionTranslations?.en || '',
            ta: initialData.descriptionTranslations?.ta || ''
        }
    } : {
        available: true,
        stockCount: 0,
        spiceLevel: 0
    };

    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues
    });

    const [choices, setChoices] = useState<{ name: string, priceModifier: number }[]>(initialData?.choices || []);

    const handleFormSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('categoryId', data.categoryId);
        formData.append('stockCount', data.stockCount);
        formData.append('spiceLevel', data.spiceLevel);
        formData.append('available', data.available);
        formData.append('choices', JSON.stringify(choices));
        formData.append('nameTranslations', JSON.stringify(data.nameTranslations));
        formData.append('descriptionTranslations', JSON.stringify(data.descriptionTranslations));

        if (data.image && data.image[0]) {
            formData.append('image', data.image[0]);
        }

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold">{initialData ? t('admin.menu.editItem') : t('admin.menu.addItem')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold mb-1">{t('admin.menu.itemName')} (NL)</label>
                                <input {...register('nameTranslations.nl', { required: true })} className="w-full p-2 border rounded" placeholder="Dutch name" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">{t('admin.menu.itemName')} (EN)</label>
                                <input {...register('nameTranslations.en')} className="w-full p-2 border rounded" placeholder="English name" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">{t('admin.menu.itemName')} (TA)</label>
                                <input {...register('nameTranslations.ta')} className="w-full p-2 border rounded" placeholder="Tamil name" />
                            </div>
                            {/* Fallback original Name field - hidden or kept for legacy if needed. We'll reuse nl as main name for DB required constraint */}
                            <input type="hidden" {...register('name')} value="Will Be Replaced by Backend or Legacy" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">{t('admin.menu.category')}</label>
                            <select {...register('categoryId', { required: true })} className="w-full p-2 border rounded">
                                <option value="">{t('admin.menu.category')}</option>
                                {categories.data?.map((cat: any) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <Link to="/admin/categories" className="text-xs text-tamil-maroon hover:underline mt-1 flex items-center gap-1" onClick={onClose}>
                                <ExternalLink size={10} /> {t('admin.menu.manageCategories')}
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold mb-1">{t('admin.menu.description')} (Translations)</label>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Dutch (NL)</label>
                                <textarea {...register('descriptionTranslations.nl')} className="w-full p-2 border rounded h-24" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">English (EN)</label>
                                <textarea {...register('descriptionTranslations.en')} className="w-full p-2 border rounded h-24" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Tamil (TA)</label>
                                <textarea {...register('descriptionTranslations.ta')} className="w-full p-2 border rounded h-24" />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-1">{t('admin.menu.price')}</label>
                            <input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Voorraad</label>
                            <input type="number" {...register('stockCount', { valueAsNumber: true })} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Pittigheid (0-3)</label>
                            <select {...register('spiceLevel', { valueAsNumber: true })} className="w-full p-2 border rounded">
                                <option value="0">Geen (0)</option>
                                <option value="1">Mild (1)</option>
                                <option value="2">Pittig (2)</option>
                                <option value="3">Zeer Pittig (3)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">{t('admin.menu.image')}</label>
                        <input type="file" {...register('image')} accept="image/*" className="w-full p-2 border rounded" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold">Keuzes / Variaties (Optioneel)</label>
                            <Button type="button" variant="outline" size="sm" onClick={() => setChoices([...choices, { name: '', priceModifier: 0 }])} className="gap-2">
                                <Plus size={14} /> Keuze toevoegen
                            </Button>
                        </div>
                        {choices.length > 0 && (
                            <div className="space-y-2 bg-gray-50 p-4 rounded-md border">
                                {choices.map((choice, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={choice.name}
                                            onChange={e => {
                                                const newChoices = [...choices];
                                                newChoices[idx].name = e.target.value;
                                                setChoices(newChoices);
                                            }}
                                            placeholder="Naam (bijv. Kip, Lam)"
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold">+€</span>
                                            <input
                                                type="number"
                                                step="0.50"
                                                value={choice.priceModifier}
                                                onChange={e => {
                                                    const newChoices = [...choices];
                                                    newChoices[idx].priceModifier = parseFloat(e.target.value) || 0;
                                                    setChoices(newChoices);
                                                }}
                                                className="w-24 p-2 border rounded text-sm"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setChoices(choices.filter((_, i) => i !== idx))}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...register('available')} id="available" className="w-4 h-4" />
                        <label htmlFor="available" className="text-sm font-bold">{t('admin.menu.available')}</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" type="button" onClick={onClose}>{t('admin.common.cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('admin.common.loading') : t('admin.common.save')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
