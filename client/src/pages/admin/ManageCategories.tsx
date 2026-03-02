import { useState } from 'react';
import { useMenu, createCategory, updateCategory, deleteCategory } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

type CategoryForm = {
    name: string;
    nameTranslations?: {
        nl: string;
        en: string;
        ta: string;
    };
    order?: number;
    type?: string;
};

export const ManageCategories = () => {
    const { t } = useTranslation();
    const { categories } = useMenu();
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset } = useForm<CategoryForm>();

    const handleCreate = () => {
        setEditingCategory(null);
        reset({
            name: '',
            nameTranslations: { nl: '', en: '', ta: '' },
            order: 0,
            type: 'food'
        });
        setIsEditing(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            nameTranslations: {
                nl: category.nameTranslations?.nl || category.name || '',
                en: category.nameTranslations?.en || '',
                ta: category.nameTranslations?.ta || ''
            },
            order: category.order,
            type: category.type || 'food'
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.common.delete') + '?')) return;
        try {
            await deleteCategory(id);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success(t('admin.common.delete'));
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error(t('admin.common.delete'));
        }
    };

    const onSubmit = async (data: CategoryForm) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, data);
                toast.success(t('admin.common.save'));
            } else {
                await createCategory(data);
                toast.success(t('admin.common.save'));
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsEditing(false);
            reset();
        } catch (error) {
            console.error('Failed to save category:', error);
            toast.error(t('admin.common.save'));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-tamil-charcoal">{t('admin.categories.title')}</h1>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus size={16} /> {t('admin.categories.addCategory')}
                </Button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">{editingCategory ? t('admin.common.edit') : t('admin.common.add')}</h2>
                                <Button variant="ghost" onClick={() => setIsEditing(false)}><X size={20} /></Button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium mb-1">{t('admin.categories.categoryName')} (Translations)</label>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Dutch (NL)</label>
                                        <input
                                            {...register('nameTranslations.nl', { required: true })}
                                            className="w-full border p-2 rounded"
                                            placeholder="Dutch name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">English (EN)</label>
                                        <input
                                            {...register('nameTranslations.en')}
                                            className="w-full border p-2 rounded"
                                            placeholder="English name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Tamil (TA)</label>
                                        <input
                                            {...register('nameTranslations.ta')}
                                            className="w-full border p-2 rounded"
                                            placeholder="Tamil name"
                                        />
                                    </div>
                                    {/* Hidden fallback name field for legacy requirements */}
                                    <input type="hidden" {...register('name')} value="Will Be Replaced by Backend or Legacy" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.common.status')}</label>
                                    <input
                                        type="number"
                                        {...register('order', { valueAsNumber: true })}
                                        className="w-full border p-2 rounded"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('admin.categories.type')}</label>
                                    <select
                                        {...register('type')}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="food">{t('admin.categories.food')}</option>
                                        <option value="beverage">{t('admin.categories.beverage')}</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>{t('admin.common.cancel')}</Button>
                                    <Button type="submit">{t('admin.common.save')}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-4">
                {categories.isLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                    categories.data?.map((category: any) => (
                        <Card key={category._id} className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-bold text-lg">{category.nameTranslations?.nl || category.name}</h3>
                                <p className="text-sm text-gray-500">Order: {category.order} | {t('admin.categories.type')}: {category.type}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                                    <Pencil size={16} />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(category._id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
