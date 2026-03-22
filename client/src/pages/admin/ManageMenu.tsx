import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    useMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import {
    X,
    ImagePlus,
    ChevronDown,
    Package,
    Euro,
    Layers3,
    FileText,
    Box,
    Check,
    Leaf,
    Flame
} from 'lucide-react';

type MenuFormValues = {
    name: string;
    description: string;
    price: number;
    stockCount: number;
    categoryId: string;
    available: boolean;
    isVeg: boolean;
    spiceLevel: number;
    image: FileList | null;
};

type MenuFormProps = {
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void> | void;
    initialData?: any | null;
};

export const ManageMenu = () => {
    const { menuItems, categories } = useMenu();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const menuList = useMemo(
        () => (Array.isArray(menuItems.data) ? menuItems.data : []),
        [menuItems.data]
    );

    const categoryList = useMemo(
        () => (Array.isArray(categories.data) ? categories.data : []),
        [categories.data]
    );

    const categoryMap = useMemo(() => {
        return new Map(categoryList.map((category: any) => [category._id, category.name]));
    }, [categoryList]);

    const closeModal = () => {
        setIsEditing(false);
        setEditingItem(null);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsEditing(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this menu item?')) return;

        try {
            await deleteMenuItem(id);
            toast.success('Menu item deleted');
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        } catch {
            toast.error('Failed to delete menu item');
        }
    };

    const handleSubmit = async (data: FormData) => {
        try {
            if (editingItem?._id) {
                await updateMenuItem(editingItem._id, data);
                toast.success('Menu item updated');
            } else {
                await createMenuItem(data);
                toast.success('Menu item created');
            }

            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            closeModal();
        } catch {
            toast.error('Failed to save menu item');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-[1080px] space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                Manage Menu
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Create, update and organize menu items.
                            </p>
                        </div>

                        <Button
                            onClick={handleCreate}
                            className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Add Menu Item
                        </Button>
                    </div>
                </div>

                {menuItems.isLoading ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 shadow-sm">
                        <div className="flex justify-center">
                            <Spinner />
                        </div>
                    </div>
                ) : menuList.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">No menu items found</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Add your first menu item to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {menuList.map((item: any) => (
                            <Card
                                key={item._id}
                                className="rounded-[26px] border border-slate-200 bg-white shadow-sm"
                            >
                                <CardContent className="p-5">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={item.image || '/placeholder-food.jpg'}
                                                    alt={item.name}
                                                    className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                                                />

                                                <div className="min-w-0">
                                                    <h3 className="text-[16px] font-semibold text-slate-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {item.description || 'No description'}
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                                                            Category: {categoryMap.get(item.categoryId?._id || item.categoryId) || 'N/A'}
                                                        </span>
                                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                                                            Stock: {item.stockCount ?? 0}
                                                        </span>
                                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                                                            {item.available ? 'Available' : 'Hidden'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:justify-end">
                                            <span className="mr-2 text-lg font-semibold text-slate-900">
                                                € {Number(item.price || 0).toFixed(2)}
                                            </span>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(item)}
                                                className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:border-slate-300 hover:bg-stone-50"
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(item._id)}
                                                className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
                        <div className="w-full max-w-5xl">
                            <MenuForm
                                onClose={closeModal}
                                onSubmit={handleSubmit}
                                initialData={editingItem}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const MenuForm = ({
    onClose,
    onSubmit,
    initialData
}: MenuFormProps) => {
    const { categories } = useMenu();
    const [preview, setPreview] = useState<string>(initialData?.image || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoryList = useMemo(
        () => (Array.isArray(categories.data) ? categories.data : []),
        [categories.data]
    );

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<MenuFormValues>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            stockCount: 0,
            categoryId: '',
            available: true,
            isVeg: false,
            spiceLevel: 0,
            image: null
        }
    });

    const watchedImage = watch('image');
    const available = watch('available');
    const isVeg = watch('isVeg');
    const spiceLevel = watch('spiceLevel');

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name || '',
                description: initialData.description || '',
                price: Number(initialData.price || 0),
                stockCount: Number(initialData.stockCount || 0),
                categoryId:
                    initialData.categoryId?._id ||
                    initialData.categoryId ||
                    '',
                available: Boolean(initialData.available),
                isVeg: Boolean(initialData.isVeg),
                spiceLevel: Number(initialData.spiceLevel || 0),
                image: null
            });

            setPreview(initialData.image || '');
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
                stockCount: 0,
                categoryId: '',
                available: true,
                isVeg: false,
                spiceLevel: 0,
                image: null
            });
            setPreview('');
        }
    }, [initialData, reset]);

    useEffect(() => {
        const file = watchedImage?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [watchedImage]);

    const submitForm = async (values: MenuFormValues) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description || '');
            formData.append('price', String(values.price));
            formData.append('stockCount', String(values.stockCount));
            formData.append('categoryId', values.categoryId);
            formData.append('available', String(values.available));
            formData.append('isVeg', String(values.isVeg));
            formData.append('spiceLevel', String(values.spiceLevel));

            if (values.image?.[0]) {
                formData.append('image', values.image[0]);
            }

            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full rounded-[30px] border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Menu Editor
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                        {initialData ? 'Edit Menu Item' : 'Create Menu Item'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Clean editor for product details, pricing, stock and category.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                >
                    <X size={18} />
                </button>
            </div>

            <form
                onSubmit={handleSubmit(submitForm)}
                className="max-h-[85vh] overflow-y-auto px-6 py-6"
            >
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    {/* Left */}
                    <div className="space-y-5">
                        <SectionTitle
                            title="Basic Information"
                            subtitle="Main content shown in the menu"
                        />

                        <InputField
                            label="Item Name"
                            placeholder="Eg. Chicken Kottu"
                            icon={<Package size={16} />}
                            error={errors.name?.message}
                            registration={register('name', {
                                required: 'Item name is required'
                            })}
                        />

                        <TextAreaField
                            label="Description"
                            placeholder="Write a short description for this item..."
                            icon={<FileText size={16} />}
                            error={errors.description?.message}
                            registration={register('description')}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                                label="Price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                icon={<Euro size={16} />}
                                error={errors.price?.message}
                                registration={register('price', {
                                    required: 'Price is required',
                                    valueAsNumber: true
                                })}
                            />

                            <InputField
                                label="Stock Count"
                                type="number"
                                placeholder="0"
                                icon={<Box size={16} />}
                                error={errors.stockCount?.message}
                                registration={register('stockCount', {
                                    required: 'Stock count is required',
                                    valueAsNumber: true
                                })}
                            />
                        </div>

                        <PremiumSelect
                            label="Category"
                            icon={<Layers3 size={16} />}
                            value={watch('categoryId')}
                            error={errors.categoryId?.message}
                            registration={register('categoryId', {
                                required: 'Please select a category'
                            })}
                        >
                            <option value="">Select category</option>
                            {categoryList.map((category: any) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </PremiumSelect>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <PremiumSelect
                                label="Spice Level"
                                icon={<Flame size={16} />}
                                value={String(spiceLevel)}
                                registration={register('spiceLevel', {
                                    valueAsNumber: true
                                })}
                            >
                                <option value="0">0 - None</option>
                                <option value="1">1 - Mild</option>
                                <option value="2">2 - Medium</option>
                                <option value="3">3 - Hot</option>
                                <option value="4">4 - Extra Hot</option>
                            </PremiumSelect>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Item Type
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setValue('isVeg', !isVeg)}
                                    className={`flex h-[52px] w-full items-center justify-between rounded-2xl border px-4 transition ${
                                        isVeg
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-slate-200 bg-white hover:bg-stone-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                                isVeg
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-stone-100 text-slate-500'
                                            }`}
                                        >
                                            <Leaf size={16} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-slate-900">
                                                Vegetarian
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Mark this item as veg
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                                            isVeg ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`h-4 w-4 rounded-full bg-white transition ${
                                                isVeg ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="space-y-5">
                        <SectionTitle
                            title="Image & Status"
                            subtitle="Product preview and visibility"
                        />

                        <div className="rounded-[26px] border border-slate-200 bg-stone-50 p-4">
                            <p className="mb-3 text-sm font-medium text-slate-700">
                                Image Preview
                            </p>

                            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-64 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-slate-400">
                                        <ImagePlus size={28} />
                                        <p className="text-sm">No image selected</p>
                                    </div>
                                )}
                            </div>

                            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-stone-50">
                                <ImagePlus size={16} />
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    {...register('image')}
                                />
                            </label>
                        </div>

                        <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-sm font-medium text-slate-700">
                                Visibility
                            </p>

                            <button
                                type="button"
                                onClick={() => setValue('available', !available)}
                                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 transition ${
                                    available
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
                                }`}
                            >
                                <div className="text-left">
                                    <p className="text-sm font-semibold">
                                        {available ? 'Visible in menu' : 'Hidden from menu'}
                                    </p>
                                    <p
                                        className={`mt-1 text-xs ${
                                            available ? 'text-slate-300' : 'text-slate-500'
                                        }`}
                                    >
                                        Toggle whether customers can see this item
                                    </p>
                                </div>

                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                        available
                                            ? 'bg-white text-slate-900'
                                            : 'bg-stone-100 text-slate-500'
                                    }`}
                                >
                                    <Check size={16} />
                                </div>
                            </button>
                        </div>

                        <div className="rounded-[26px] border border-slate-200 bg-stone-50 p-4">
                            <p className="text-sm font-medium text-slate-700">
                                Quick Summary
                            </p>

                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                                    <span>Name</span>
                                    <span className="font-medium text-slate-900">
                                        {watch('name') || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                                    <span>Price</span>
                                    <span className="font-medium text-slate-900">
                                        € {Number(watch('price') || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                                    <span>Stock</span>
                                    <span className="font-medium text-slate-900">
                                        {watch('stockCount') || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-stone-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : initialData
                            ? 'Save Changes'
                            : 'Create Item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
};

const InputField = ({
    label,
    icon,
    error,
    registration,
    type = 'text',
    placeholder,
    step
}: {
    label: string;
    icon: React.ReactNode;
    error?: string;
    registration: any;
    type?: string;
    placeholder?: string;
    step?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div
                className={`flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition ${
                    error
                        ? 'border-red-300 ring-2 ring-red-50'
                        : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
                }`}
            >
                <span className="text-slate-400">{icon}</span>
                <input
                    type={type}
                    step={step}
                    placeholder={placeholder}
                    {...registration}
                    className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};

const TextAreaField = ({
    label,
    icon,
    error,
    registration,
    placeholder
}: {
    label: string;
    icon: React.ReactNode;
    error?: string;
    registration: any;
    placeholder?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div
                className={`rounded-2xl border bg-white px-4 py-3 transition ${
                    error
                        ? 'border-red-300 ring-2 ring-red-50'
                        : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
                }`}
            >
                <div className="mb-2 flex items-center gap-3 text-slate-400">
                    {icon}
                </div>
                <textarea
                    rows={5}
                    placeholder={placeholder}
                    {...registration}
                    className="w-full resize-none bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
                />
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};

const PremiumSelect = ({
    label,
    icon,
    error,
    registration,
    children,
    value
}: {
    label: string;
    icon: React.ReactNode;
    error?: string;
    registration: any;
    children: React.ReactNode;
    value?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div
                className={`relative flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition ${
                    error
                        ? 'border-red-300 ring-2 ring-red-50'
                        : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
                }`}
            >
                <span className="shrink-0 text-slate-400">{icon}</span>

                <select
                    {...registration}
                    defaultValue={value}
                    className="h-full w-full appearance-none bg-transparent pr-8 text-sm text-slate-900 outline-none"
                >
                    {children}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 text-slate-400"
                />
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};