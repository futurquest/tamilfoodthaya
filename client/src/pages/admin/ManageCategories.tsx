import { useMemo, useState } from 'react';
import { useMenu, createCategory, updateCategory, deleteCategory } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, X, LayoutGrid, Soup, Coffee } from 'lucide-react';
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
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const { register, handleSubmit, reset } = useForm<CategoryForm>();

    const categoryList = Array.isArray(categories.data) ? categories.data : [];

    const stats = useMemo(() => {
        const total = categoryList.length;
        const food = categoryList.filter((item: any) => item.type === 'food').length;
        const beverage = categoryList.filter((item: any) => item.type === 'beverage').length;

        return { total, food, beverage };
    }, [categoryList]);

    const closeModal = () => {
        setIsEditing(false);
        setEditingCategory(null);
        reset({
            name: '',
            nameTranslations: { nl: '', en: '', ta: '' },
            order: 0,
            type: 'food'
        });
    };

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
            name: category.name || '',
            nameTranslations: {
                nl: category.nameTranslations?.nl || category.name || '',
                en: category.nameTranslations?.en || '',
                ta: category.nameTranslations?.ta || ''
            },
            order: category.order ?? 0,
            type: category.type || 'food'
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`${t('admin.common.delete')}?`)) return;

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
            const payload = {
                ...data,
                name: data.nameTranslations?.nl?.trim() || data.name || ''
            };

            if (editingCategory) {
                await updateCategory(editingCategory._id, payload);
                toast.success(t('admin.common.save'));
            } else {
                await createCategory(payload);
                toast.success(t('admin.common.save'));
            }

            queryClient.invalidateQueries({ queryKey: ['categories'] });
            closeModal();
        } catch (error) {
            console.error('Failed to save category:', error);
            toast.error(t('admin.common.save'));
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1080px] space-y-5">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                <LayoutGrid size={24} className="text-slate-900" />
                                {t('admin.categories.title')}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Organize your menu structure with a clean category management view.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="grid grid-cols-3 gap-3">
                                <MetricCard label="Total" value={stats.total} />
                                <MetricCard label="Food" value={stats.food} />
                                <MetricCard label="Drink" value={stats.beverage} />
                            </div>

                            <Button
                                onClick={handleCreate}
                                className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                <Plus size={16} className="mr-2" />
                                {t('admin.categories.addCategory')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {categories.isLoading ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 shadow-sm">
                        <div className="flex justify-center">
                            <Spinner />
                        </div>
                    </div>
                ) : categoryList.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
                            <LayoutGrid size={22} className="text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No categories found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Create your first category to start organizing the menu.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categoryList.map((category: any) => {
                            const isFood = category.type === 'food';

                            return (
                                <Card
                                    key={category._id}
                                    className="rounded-[26px] border border-slate-200 bg-white shadow-sm"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                                                            isFood
                                                                ? 'border-slate-200 bg-stone-50 text-slate-700'
                                                                : 'border-slate-200 bg-stone-50 text-slate-700'
                                                        }`}
                                                    >
                                                        {isFood ? <Soup size={18} /> : <Coffee size={18} />}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-[16px] font-semibold text-slate-900">
                                                                {category.nameTranslations?.nl || category.name}
                                                            </h3>

                                                            <span className="rounded-full border border-slate-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                                {category.type || 'food'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                                            <LangPill label="NL" value={category.nameTranslations?.nl || category.name || '-'} />
                                                            <LangPill label="EN" value={category.nameTranslations?.en || '-'} />
                                                            <LangPill label="TA" value={category.nameTranslations?.ta || '-'} />
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                                                                Order: {category.order ?? 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 md:justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(category)}
                                                    className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:border-slate-300 hover:bg-stone-50"
                                                >
                                                    <Pencil size={15} className="mr-2" />
                                                    {t('admin.common.edit')}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(category._id)}
                                                    className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={15} className="mr-2" />
                                                    {t('admin.common.delete')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
                        <div className="w-full max-w-2xl rounded-[30px] border border-slate-200 bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        Category
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                        {editingCategory ? t('admin.common.edit') : t('admin.common.add')}
                                    </h2>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <InputBlock
                                        label="Dutch (NL)"
                                        placeholder="Dutch name"
                                        register={register('nameTranslations.nl', { required: true })}
                                    />
                                    <InputBlock
                                        label="English (EN)"
                                        placeholder="English name"
                                        register={register('nameTranslations.en')}
                                    />
                                    <InputBlock
                                        label="Tamil (TA)"
                                        placeholder="Tamil name"
                                        register={register('nameTranslations.ta')}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            {t('admin.common.status')}
                                        </label>
                                        <input
                                            type="number"
                                            {...register('order', { valueAsNumber: true })}
                                            placeholder="0"
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            {t('admin.categories.type')}
                                        </label>
                                        <select
                                            {...register('type')}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                                        >
                                            <option value="food">{t('admin.categories.food')}</option>
                                            <option value="beverage">{t('admin.categories.beverage')}</option>
                                        </select>
                                    </div>
                                </div>

                                <input type="hidden" {...register('name')} />

                                <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                        className="h-10 rounded-full border-slate-200 bg-white px-5 text-slate-700 hover:bg-stone-50"
                                    >
                                        {t('admin.common.cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-10 rounded-full border border-slate-900 bg-slate-900 px-5 text-white hover:bg-slate-800"
                                    >
                                        {t('admin.common.save')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value
}: {
    label: string;
    value: string | number;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
    );
};

const LangPill = ({
    label,
    value
}: {
    label: string;
    value: string;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-slate-800">{value}</p>
        </div>
    );
};

const InputBlock = ({
    label,
    placeholder,
    register
}: {
    label: string;
    placeholder: string;
    register: any;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                {...register}
                placeholder={placeholder}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
};