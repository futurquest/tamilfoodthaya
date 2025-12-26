import { useForm } from 'react-hook-form';
import { useMenu } from '../../hooks/useApi';
import { Button } from '../ui/Button';
import { X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MenuFormProps {
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData?: any;
}

export const MenuForm = ({ onClose, onSubmit, initialData }: MenuFormProps) => {
    const { t } = useTranslation();
    const { categories } = useMenu();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            available: true,
            stockCount: 0,
            spiceLevel: 0
        }
    });

    const handleFormSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('categoryId', data.categoryId);
        formData.append('stockCount', data.stockCount);
        formData.append('spiceLevel', data.spiceLevel);
        formData.append('available', data.available);

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
                        <div>
                            <label className="block text-sm font-bold mb-1">{t('admin.menu.itemName')}</label>
                            <input {...register('name', { required: true })} className="w-full p-2 border rounded" />
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

                    <div>
                        <label className="block text-sm font-bold mb-1">{t('admin.menu.description')}</label>
                        <textarea {...register('description')} className="w-full p-2 border rounded h-24" />
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
