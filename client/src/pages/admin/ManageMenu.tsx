import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    Box,
    CheckCircle2,
    ChevronDown,
    Euro,
    Eye,
    EyeOff,
    FileText,
    Filter,
    Flame,
    Grid3X3,
    ImagePlus,
    Layers3,
    Leaf,
    List,
    Package,
    Pencil,
    Plus,
    Search,
    Soup,
    Trash2,
    X
} from 'lucide-react';
import {
    useMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

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

type MenuItem = {
    _id: string;
    name?: string;
    description?: string;
    price?: number;
    stockCount?: number;
    categoryId?: string | { _id?: string; name?: string; nameTranslations?: { nl?: string; en?: string; ta?: string } };
    available?: boolean;
    isVeg?: boolean;
    spiceLevel?: number;
    image?: string;
};

type CategoryItem = {
    _id: string;
    name?: string;
    nameTranslations?: { nl?: string; en?: string; ta?: string };
};

type ViewMode = 'grid' | 'list';
type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'HIDDEN';
type DietFilter = 'ALL' | 'VEG' | 'NON_VEG';

type MenuFormProps = {
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void> | void;
    initialData?: MenuItem | null;
};

const availabilityConfig: Record<AvailabilityFilter, { label: string }> = {
    ALL: { label: 'All' },
    AVAILABLE: { label: 'Available' },
    HIDDEN: { label: 'Hidden' }
};

export const ManageMenu = () => {
    const { menuItems, categories } = useMenu();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL');
    const [dietFilter, setDietFilter] = useState<DietFilter>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const menuList: MenuItem[] = useMemo(() => {
        if (Array.isArray(menuItems.data)) return menuItems.data;
        if (Array.isArray(menuItems.data?.data)) return menuItems.data.data;
        return [];
    }, [menuItems.data]);

    const categoryList: CategoryItem[] = useMemo(() => {
        if (Array.isArray(categories.data)) return categories.data;
        if (Array.isArray(categories.data?.data)) return categories.data.data;
        return [];
    }, [categories.data]);

    const categoryMap = useMemo(() => {
        return new Map(
            categoryList.map((category) => [
                category._id,
                category.nameTranslations?.nl || category.name || 'Untitled category'
            ])
        );
    }, [categoryList]);

    const stats = useMemo(() => {
        const total = menuList.length;
        const available = menuList.filter((item) => item.available).length;
        const hidden = total - available;
        const lowStock = menuList.filter((item) => Number(item.stockCount ?? 0) <= 5).length;

        return { total, available, hidden, lowStock };
    }, [menuList]);

    const filteredItems = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return menuList.filter((item) => {
            const categoryId = getCategoryId(item);
            const categoryName = getCategoryName(item, categoryMap);

            if (categoryFilter !== 'ALL' && categoryId !== categoryFilter) return false;
            if (availabilityFilter === 'AVAILABLE' && !item.available) return false;
            if (availabilityFilter === 'HIDDEN' && item.available) return false;
            if (dietFilter === 'VEG' && !item.isVeg) return false;
            if (dietFilter === 'NON_VEG' && item.isVeg) return false;
            if (!query) return true;

            return [
                item.name,
                item.description,
                categoryName,
                String(item.price ?? 0),
                String(item.stockCount ?? 0)
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [menuList, searchTerm, categoryFilter, availabilityFilter, dietFilter, categoryMap]);

    const closeModal = () => {
        setIsEditing(false);
        setEditingItem(null);
    };

    useEffect(() => {
        if (!isEditing) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsEditing(false);
                setEditingItem(null);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isEditing]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsEditing(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsEditing(true);
    };

    const requestDelete = (id: string) => {
        const target = menuList.find((item) => item._id === id) ?? null;
        setDeleteTarget(target);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await deleteMenuItem(deleteTarget._id);
            toast.success('Menu item deleted');
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        } catch {
            toast.error('Could not delete menu item');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
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
            toast.error('Could not save menu item');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Menu items
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    Menu Item Workspace
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <Soup size={13} />
                                    {viewMode === 'grid' ? 'Grid view' : 'List view'}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                Manage dishes, pricing, images, dietary details, stock and menu visibility in one polished workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] xl:max-w-[540px] 2xl:max-w-[720px]">
                            <MetricCard label="Total" value={stats.total} icon={<Package size={16} />} />
                            <MetricCard label="Visible" value={stats.available} icon={<Eye size={16} />} />
                            <MetricCard label="Hidden" value={stats.hidden} icon={<EyeOff size={16} />} />
                            <MetricCard label="Low stock" value={stats.lowStock} icon={<Box size={16} />} />
                            <Button
                                onClick={handleCreate}
                                className="h-full min-h-16 rounded-2xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
                            >
                                <Plus size={16} className="mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
                        <label className="relative block">
                            <Search
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search dish name, description, category, price or stock..."
                                aria-label="Search menu items"
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                            <FilterSelect
                                label="Category"
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    { value: 'ALL', label: 'All categories' },
                                    ...categoryList.map((category) => ({
                                        value: category._id,
                                        label: category.nameTranslations?.nl || category.name || 'Untitled category'
                                    }))
                                ]}
                            />
                            <AvailabilityTabs
                                value={availabilityFilter}
                                counts={{
                                    ALL: stats.total,
                                    AVAILABLE: stats.available,
                                    HIDDEN: stats.hidden
                                }}
                                onChange={setAvailabilityFilter}
                            />
                            <DietTabs value={dietFilter} onChange={setDietFilter} />
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={12} />
                            Showing {filteredItems.length} of {menuList.length} menu items
                        </span>
                        {(searchTerm ||
                            categoryFilter !== 'ALL' ||
                            availabilityFilter !== 'ALL' ||
                            dietFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('ALL');
                                    setAvailabilityFilter('ALL');
                                    setDietFilter('ALL');
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </section>

                {menuItems.isLoading ? (
                    <LoadingPanel />
                ) : menuItems.isError ? (
                    <ErrorPanel />
                ) : filteredItems.length === 0 ? (
                    <EmptyState
                        title={menuList.length === 0 ? 'No menu items yet' : 'No matching menu items'}
                        text={
                            menuList.length === 0
                                ? 'Create the first dish to start building the customer-facing menu.'
                                : 'Adjust search or filters to find the dish you need.'
                        }
                        action={menuList.length === 0 ? handleCreate : undefined}
                    />
                ) : viewMode === 'grid' ? (
                    <MenuGrid
                        items={filteredItems}
                        categoryMap={categoryMap}
                        onEdit={handleEdit}
                        onDelete={requestDelete}
                    />
                ) : (
                    <MenuList
                        items={filteredItems}
                        categoryMap={categoryMap}
                        onEdit={handleEdit}
                        onDelete={requestDelete}
                    />
                )}

                {isEditing && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={editingItem ? 'Edit menu item' : 'Create menu item'}
                        className="fixed inset-0 z-[100] flex overflow-y-auto bg-black/35 p-4 backdrop-blur-[2px]"
                    >
                        <div className="m-auto w-full max-w-5xl">
                            <MenuForm
                                onClose={closeModal}
                                onSubmit={handleSubmit}
                                initialData={editingItem}
                            />
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    open={Boolean(deleteTarget)}
                    title="Delete menu item"
                    message={
                        deleteTarget
                            ? `Delete "${deleteTarget.name || 'this menu item'}"? Customers will no longer see it.`
                            : ''
                    }
                    busy={deleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-(--brand-stone)">
            {icon}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-2 truncate text-2xl font-extrabold tabular-nums text-white">{value}</p>
    </div>
);

const FilterSelect = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) => (
    <label className="grid gap-1.5 xl:w-[210px]">
        <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <Filter size={13} />
            {label}
        </span>
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </label>
);

const AvailabilityTabs = ({
    value,
    counts,
    onChange
}: {
    value: AvailabilityFilter;
    counts: Record<AvailabilityFilter, number>;
    onChange: (value: AvailabilityFilter) => void;
}) => {
    const tabs: AvailabilityFilter[] = ['ALL', 'AVAILABLE', 'HIDDEN'];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Eye size={13} />
                Visibility
            </span>
            <div className="flex max-w-full flex-wrap rounded-2xl border border-slate-200 bg-stone-50 p-1 admin-tab-strip">
                {tabs.map((tab) => {
                    const active = value === tab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => onChange(tab)}
                            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {availabilityConfig[tab].label}
                            <span className={`rounded-lg px-1.5 py-0.5 text-[10px] ${active ? 'bg-amber-50 text-amber-800' : 'bg-white text-slate-500'}`}>
                                {counts[tab]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const DietTabs = ({
    value,
    onChange
}: {
    value: DietFilter;
    onChange: (value: DietFilter) => void;
}) => {
    const tabs: { value: DietFilter; label: string }[] = [
        { value: 'ALL', label: 'All' },
        { value: 'VEG', label: 'Veg' },
        { value: 'NON_VEG', label: 'Non-veg' }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Leaf size={13} />
                Diet
            </span>
            <div className="flex max-w-full flex-wrap rounded-2xl border border-slate-200 bg-stone-50 p-1 admin-tab-strip">
                {tabs.map((tab) => {
                    const active = value === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={`inline-flex h-9 shrink-0 rounded-xl px-3 text-xs font-extrabold transition ${
                                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ViewToggle = ({
    value,
    onChange
}: {
    value: ViewMode;
    onChange: (value: ViewMode) => void;
}) => {
    const options: { value: ViewMode; label: string; icon: ReactNode }[] = [
        { value: 'grid', label: 'Grid', icon: <Grid3X3 size={14} /> },
        { value: 'list', label: 'List', icon: <List size={14} /> }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                View
            </span>
            <div className="flex rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {options.map((option) => {
                    const active = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MenuGrid = ({
    items,
    categoryMap,
    onEdit,
    onDelete
}: {
    items: MenuItem[];
    categoryMap: Map<string, string>;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-white)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
        <WorkspaceHeader
            title="Menu board"
            text="Review dish photography, pricing, stock, dietary flags and visibility in a visual workspace."
            badge={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
                <MenuCard
                    key={item._id}
                    item={item}
                    categoryMap={categoryMap}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    </section>
);

const MenuCard = ({
    item,
    categoryMap,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    categoryMap: Map<string, string>;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => (
    <article className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_var(--brand-slate-a10)]">
        <div className="relative aspect-[4/3] bg-stone-50">
            <img
                src={item.image || '/placeholder-food.jpg'}
                alt={item.name || 'Menu item'}
                onError={(event) => {
                    event.currentTarget.src = '/hero-catering.jpg';
                }}
                className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <VisibilityBadge available={Boolean(item.available)} />
                {item.isVeg && <DietBadge />}
            </div>
            <span className="absolute bottom-3 right-3 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-slate-900 shadow-sm">
                {formatPrice(item.price)}
            </span>
        </div>

        <div className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-extrabold text-slate-900">
                        {item.name || 'Untitled item'}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                        {item.description || 'No description added yet.'}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniMeta label="Category" value={getCategoryName(item, categoryMap)} />
                <MiniMeta label="Stock" value={`${item.stockCount ?? 0}`} />
                <MiniMeta label="Spice" value={getSpiceLabel(item.spiceLevel)} />
                <MiniMeta label="Diet" value={item.isVeg ? 'Vegetarian' : 'Regular'} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                    <CheckCircle2 size={13} />
                    Stock {item.stockCount ?? 0}
                </span>
                <MenuActions item={item} onEdit={onEdit} onDelete={onDelete} />
            </div>
        </div>
    </article>
);

const MenuList = ({
    items,
    categoryMap,
    onEdit,
    onDelete
}: {
    items: MenuItem[];
    categoryMap: Map<string, string>;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => (
    <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
        <WorkspaceHeader
            title="List workspace"
            text="Scan prices, category, stock and menu visibility in one dense table."
            badge={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
        />

        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
            <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                <thead className="bg-stone-50">
                    <tr>
                        {['Item', 'Category', 'Price', 'Stock', 'Visibility', 'Diet', 'Action'].map((heading) => (
                            <th
                                key={heading}
                                className="border-b border-slate-200 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <MenuRow
                            key={item._id}
                            item={item}
                            categoryMap={categoryMap}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>

        <div className="grid gap-3 lg:hidden">
            {items.map((item) => (
                <MenuCard
                    key={item._id}
                    item={item}
                    categoryMap={categoryMap}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    </section>
);

const MenuRow = ({
    item,
    categoryMap,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    categoryMap: Map<string, string>;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => (
    <tr className="transition hover:bg-amber-50/50">
        <td className="border-b border-slate-100 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name || 'Menu item'}
                    onError={(event) => {
                        event.currentTarget.src = '/hero-catering.jpg';
                    }}
                    className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                        {item.name || 'Untitled item'}
                    </p>
                    <p className="mt-1 max-w-[280px] truncate text-xs font-bold text-slate-500">
                        {item.description || 'No description added yet.'}
                    </p>
                </div>
            </div>
        </td>
        <td className="border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">
            {getCategoryName(item, categoryMap)}
        </td>
        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">
            {formatPrice(item.price)}
        </td>
        <td className="border-b border-slate-100 px-4 py-4">
            <StockBadge count={item.stockCount ?? 0} />
        </td>
        <td className="border-b border-slate-100 px-4 py-4">
            <VisibilityBadge available={Boolean(item.available)} />
        </td>
        <td className="border-b border-slate-100 px-4 py-4">
            {item.isVeg ? <DietBadge /> : <span className="text-xs font-bold text-slate-500">Regular</span>}
        </td>
        <td className="border-b border-slate-100 px-4 py-4">
            <MenuActions item={item} onEdit={onEdit} onDelete={onDelete} />
        </td>
    </tr>
);

const WorkspaceHeader = ({
    title,
    text,
    badge
}: {
    title: string;
    text: string;
    badge: string;
}) => (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {title}
            </p>
            <p className="mt-1 text-sm font-bold leading-5 text-slate-700">{text}</p>
        </div>
        <span className="hidden shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-800 sm:inline-flex">
            {badge}
        </span>
    </div>
);

const MenuActions = ({
    item,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => (
    <div className="flex flex-wrap justify-end gap-2">
        <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
        >
            <Pencil size={14} />
            Edit
        </button>
        <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
            <Trash2 size={14} />
            Delete
        </button>
    </div>
);

export const MenuForm = ({ onClose, onSubmit, initialData }: MenuFormProps) => {
    const { categories } = useMenu();
    const [preview, setPreview] = useState<string>(isValidImageUrl(initialData?.image) ? initialData?.image || '' : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const firstField = panelRef.current?.querySelector<HTMLElement>(
            'input, select, textarea, button'
        );
        firstField?.focus();
    }, []);

    const categoryList: CategoryItem[] = useMemo(() => {
        if (Array.isArray(categories.data)) return categories.data;
        if (Array.isArray(categories.data?.data)) return categories.data.data;
        return [];
    }, [categories.data]);

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
                categoryId: getCategoryId(initialData),
                available: Boolean(initialData.available),
                isVeg: Boolean(initialData.isVeg),
                spiceLevel: Number(initialData.spiceLevel || 0),
                image: null
            });
            setPreview(isValidImageUrl(initialData.image) ? initialData.image || '' : '');
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
        <div
            ref={panelRef}
            className="w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
        >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        {initialData ? 'Edit menu item' : 'Create menu item'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        Keep customer-facing dishes accurate, appetizing and easy to order.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close menu item editor"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit(submitForm)} className="max-h-[85vh] overflow-y-auto px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <SectionTitle title="Dish information" subtitle="Name, description, pricing and placement" />

                        <InputField
                            label="Item name"
                            placeholder="Eg. Chicken Kottu"
                            icon={<Package size={16} />}
                            error={errors.name?.message}
                            registration={register('name', { required: 'Item name is required' })}
                        />

                        <TextAreaField
                            label="Description"
                            placeholder="Write a short customer-facing description..."
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
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Price cannot be negative' }
                                })}
                            />
                            <InputField
                                label="Stock count"
                                type="number"
                                placeholder="0"
                                icon={<Box size={16} />}
                                error={errors.stockCount?.message}
                                registration={register('stockCount', {
                                    required: 'Stock count is required',
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Stock count cannot be negative' }
                                })}
                            />
                        </div>

                        <PremiumSelect
                            label="Category"
                            icon={<Layers3 size={16} />}
                            error={errors.categoryId?.message}
                            registration={register('categoryId', { required: 'Please select a category' })}
                        >
                            <option value="">Select category</option>
                            {categoryList.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.nameTranslations?.nl || category.name || 'Untitled category'}
                                </option>
                            ))}
                        </PremiumSelect>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <PremiumSelect
                                label="Spice level"
                                icon={<Flame size={16} />}
                                registration={register('spiceLevel', { valueAsNumber: true })}
                            >
                                <option value="0">0 - None</option>
                                <option value="1">1 - Mild</option>
                                <option value="2">2 - Medium</option>
                                <option value="3">3 - Hot</option>
                                <option value="4">4 - Extra hot</option>
                            </PremiumSelect>

                            <ToggleControl
                                title="Vegetarian"
                                text="Mark this item as vegetarian"
                                icon={<Leaf size={16} />}
                                checked={isVeg}
                                onClick={() => setValue('isVeg', !isVeg)}
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <SectionTitle title="Image and status" subtitle="Photography, visibility and quick review" />

                        <div className="rounded-[26px] border border-slate-200 bg-(--brand-surface-ivory) p-4">
                            <p className="mb-3 text-sm font-extrabold text-slate-700">Image preview</p>
                            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-64 w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.src = '/hero-catering.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-slate-400">
                                        <ImagePlus size={28} />
                                        <p className="text-sm font-semibold">No image selected</p>
                                    </div>
                                )}
                            </div>

                            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-stone-50">
                                <ImagePlus size={16} />
                                Upload image
                                <input type="file" accept="image/*" className="hidden" {...register('image')} />
                            </label>
                        </div>

                        <ToggleControl
                            title={available ? 'Visible in menu' : 'Hidden from menu'}
                            text="Control whether customers can order this item"
                            icon={available ? <Eye size={16} /> : <EyeOff size={16} />}
                            checked={available}
                            dark
                            onClick={() => setValue('available', !available)}
                        />

                        <div className="rounded-[26px] border border-slate-200 bg-(--brand-surface-ivory) p-4">
                            <p className="text-sm font-extrabold text-slate-700">Quick summary</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <SummaryRow label="Name" value={watch('name') || '-'} />
                                <SummaryRow label="Price" value={formatPrice(watch('price'))} />
                                <SummaryRow label="Stock" value={`${watch('stockCount') || 0}`} />
                                <SummaryRow label="Spice" value={getSpiceLabel(spiceLevel)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-stone-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : initialData ? 'Save changes' : 'Create item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ToggleControl = ({
    title,
    text,
    icon,
    checked,
    dark = false,
    onClick
}: {
    title: string;
    text: string;
    icon: ReactNode;
    checked: boolean;
    dark?: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex min-h-[74px] w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
            checked && dark
                ? 'border-slate-900 bg-slate-900 text-white'
                : checked
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
        }`}
    >
        <div className="flex items-center gap-3 text-left">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${checked && dark ? 'bg-white text-slate-900' : 'bg-stone-100 text-slate-500'}`}>
                {icon}
            </span>
            <span>
                <span className="block text-sm font-extrabold">{title}</span>
                <span className={`mt-1 block text-xs font-semibold ${checked && dark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {text}
                </span>
            </span>
        </div>
        <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? 'bg-(--brand-leaf)' : 'bg-slate-300'}`}>
            <span className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>
    </button>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
    </div>
);

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
    icon: ReactNode;
    error?: string;
    registration: UseFormRegisterReturn;
    type?: string;
    placeholder?: string;
    step?: string;
}) => (
    <div>
        <label className="mb-2 block text-sm font-extrabold text-slate-700">{label}</label>
        <div
            className={`flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition ${
                error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
            }`}
        >
            <span className="text-slate-400">{icon}</span>
            <input
                type={type}
                step={step}
                placeholder={placeholder}
                {...registration}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
        </div>
        {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
);

const TextAreaField = ({
    label,
    icon,
    error,
    registration,
    placeholder
}: {
    label: string;
    icon: ReactNode;
    error?: string;
    registration: UseFormRegisterReturn;
    placeholder?: string;
}) => (
    <div>
        <label className="mb-2 block text-sm font-extrabold text-slate-700">{label}</label>
        <div
            className={`rounded-2xl border bg-white px-4 py-3 transition ${
                error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
            }`}
        >
            <div className="mb-2 flex items-center gap-3 text-slate-400">{icon}</div>
            <textarea
                rows={5}
                placeholder={placeholder}
                {...registration}
                className="w-full resize-none bg-transparent text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400"
            />
        </div>
        {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
);

const PremiumSelect = ({
    label,
    icon,
    error,
    registration,
    children
}: {
    label: string;
    icon: ReactNode;
    error?: string;
    registration: UseFormRegisterReturn;
    children: ReactNode;
}) => (
    <div>
        <label className="mb-2 block text-sm font-extrabold text-slate-700">{label}</label>
        <div
            className={`relative flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition ${
                error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100'
            }`}
        >
            <span className="shrink-0 text-slate-400">{icon}</span>
            <select
                {...registration}
                className="h-full w-full appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-900 outline-none"
            >
                {children}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 text-slate-400" />
        </div>
        {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
        <span>{label}</span>
        <span className="truncate font-extrabold text-slate-900">{value}</span>
    </div>
);

const MiniMeta = ({ label, value }: { label: string; value: string }) => (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-800">{value}</p>
    </div>
);

const VisibilityBadge = ({ available }: { available: boolean }) =>
    available ? (
        <span className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">
            Available
        </span>
    ) : (
        <span className="inline-flex rounded-xl border border-slate-200 bg-stone-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-600">
            Hidden
        </span>
    );

const DietBadge = () => (
    <span className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">
        Veg
    </span>
);

const StockBadge = ({ count }: { count: number }) => (
    <span
        className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
            count <= 0
                ? 'border-red-200 bg-red-50 text-red-700'
                : count <= 5
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
    >
        {count <= 0 ? 'Out' : count <= 5 ? `Low ${count}` : `${count} in stock`}
    </span>
);

const LoadingPanel = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
                >
                    <div className="admin-skeleton aspect-[4/3] rounded-none" />
                    <div className="p-4">
                        <div className="space-y-2">
                            <div className="admin-skeleton h-4 w-3/4" />
                            <div className="admin-skeleton h-3 w-full" />
                            <div className="admin-skeleton h-3 w-2/3" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="admin-skeleton h-10" />
                            <div className="admin-skeleton h-10" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ErrorPanel = () => (
    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-14 text-center shadow-sm">
        <Package className="mx-auto text-red-700" size={28} />
        <h2 className="mt-4 text-xl font-extrabold text-red-700">Menu items could not be loaded</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-red-600">
            Refresh the page or check the API connection before changing dishes.
        </p>
    </div>
);

const EmptyState = ({
    title,
    text,
    action
}: {
    title: string;
    text: string;
    action?: () => void;
}) => (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
            <Package size={22} className="text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{text}</p>
        {action && (
            <Button
                onClick={action}
                className="mt-5 h-10 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
            >
                <Plus size={16} className="mr-2" />
                Add item
            </Button>
        )}
    </div>
);

const getCategoryId = (item: MenuItem) => {
    if (typeof item.categoryId === 'object') return item.categoryId?._id || '';
    return item.categoryId || '';
};

const getCategoryName = (item: MenuItem, categoryMap: Map<string, string>) => {
    if (typeof item.categoryId === 'object') {
        return item.categoryId.nameTranslations?.nl || item.categoryId.name || 'Unassigned';
    }
    return categoryMap.get(item.categoryId || '') || 'Unassigned';
};

const formatPrice = (price?: number) => `€ ${Number(price || 0).toFixed(2)}`;

const isValidImageUrl = (url?: string) =>
    !!url && (/^(https?:|data:image\/|blob:)/.test(url)) && !url.startsWith('/');

const getSpiceLabel = (level?: number) => {
    const spice = Number(level || 0);
    if (spice <= 0) return 'None';
    if (spice === 1) return 'Mild';
    if (spice === 2) return 'Medium';
    if (spice === 3) return 'Hot';
    return 'Extra hot';
};
