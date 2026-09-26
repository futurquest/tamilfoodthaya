import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
import { MetricCard, SectionTitle, WorkspaceHeader, FilterSelect } from '../../components/AdminUI';

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

const availabilityTabKeys: Record<AvailabilityFilter, string> = {
    ALL: 'admin.menu.all',
    AVAILABLE: 'admin.menu.available',
    HIDDEN: 'admin.menu.hidden'
};

export const ManageMenu = () => {
    const { menuItems, categories } = useMenu();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

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
                category.nameTranslations?.nl || category.name || t('admin.menu.untitledCategory', 'Untitled category')
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
            const categoryName = getCategoryName(item, categoryMap, t);

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
            toast.success(t('admin.menu.deletedToast', 'Menu item deleted'));
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        } catch {
            toast.error(t('admin.menu.deleteError', 'Could not delete menu item'));
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleSubmit = async (data: FormData) => {
        try {
            if (editingItem?._id) {
                await updateMenuItem(editingItem._id, data);
                toast.success(t('admin.menu.updatedToast', 'Menu item updated'));
            } else {
                await createMenuItem(data);
                toast.success(t('admin.menu.createdToast', 'Menu item created'));
            }

            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            closeModal();
        } catch {
            toast.error(t('admin.menu.saveError', 'Could not save menu item'));
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.menu.eyebrow', 'Menu items')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    {t('admin.menu.workspaceTitle', 'Menu Item Workspace')}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <Soup size={13} />
                                    {viewMode === 'grid' ? t('admin.menu.gridView', 'Grid view') : t('admin.menu.listView', 'List view')}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t('admin.menu.workspaceText', 'Manage dishes, pricing, images, dietary details, stock and menu visibility in one polished workspace.')}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] xl:max-w-[540px] 2xl:max-w-[720px]">
                            <MetricCard label={t('admin.menu.total', 'Total')} value={stats.total} icon={<Package size={16} />} />
                            <MetricCard label={t('admin.menu.visible', 'Visible')} value={stats.available} icon={<Eye size={16} />} />
                            <MetricCard label={t('admin.menu.hidden', 'Hidden')} value={stats.hidden} icon={<EyeOff size={16} />} />
                            <MetricCard label={t('admin.menu.lowStock', 'Low stock')} value={stats.lowStock} icon={<Box size={16} />} />
                            <Button
                                onClick={handleCreate}
                                className="h-full min-h-16 rounded-2xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
                            >
                                <Plus size={16} className="mr-2" />
                                {t('admin.menu.addCta', 'Add Item')}
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
                                placeholder={t('admin.menu.searchPlaceholder', 'Search dish name, description, category, price or stock...')}
                                aria-label={t('admin.menu.searchAria', 'Search menu items')}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                            <FilterSelect
                                label={t('admin.menu.category', 'Category')}
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    { value: 'ALL', label: t('admin.menu.allCategories', 'All categories') },
                                    ...categoryList.map((category) => ({
                                        value: category._id,
                                        label: category.nameTranslations?.nl || category.name || t('admin.menu.untitledCategory', 'Untitled category')
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
                            {t('admin.menu.showing', 'Showing {{count}} of {{total}} menu items', {
                                count: filteredItems.length,
                                total: menuList.length
                            })}
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
                                {t('admin.menu.clearFilters', 'Clear filters')}
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
                        title={menuList.length === 0 ? t('admin.menu.noItemsYet', 'No menu items yet') : t('admin.menu.noMatches', 'No matching menu items')}
                        text={
                            menuList.length === 0
                                ? t('admin.menu.emptyTextCreate', 'Create the first dish to start building the customer-facing menu.')
                                : t('admin.menu.emptyTextFilter', 'Adjust search or filters to find the dish you need.')
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
                        aria-label={editingItem ? t('admin.menu.editHeading', 'Edit menu item') : t('admin.menu.createHeading', 'Create menu item')}
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
                    title={t('admin.menu.deleteTitle', 'Delete menu item')}
                    message={
                        deleteTarget
                            ? t('admin.menu.deleteMessage', 'Delete "{{name}}"? Customers will no longer see it.', {
                                  name: deleteTarget.name || t('admin.menu.thisMenuItem', 'this menu item')
                              })
                            : ''
                    }
                    busy={deleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    );
};const AvailabilityTabs = ({
    value,
    counts,
    onChange
}: {
    value: AvailabilityFilter;
    counts: Record<AvailabilityFilter, number>;
    onChange: (value: AvailabilityFilter) => void;
}) => {
    const { t } = useTranslation();
    const tabs: AvailabilityFilter[] = ['ALL', 'AVAILABLE', 'HIDDEN'];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Eye size={13} />
                {t('admin.menu.visibility', 'Visibility')}
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
                            {t(availabilityTabKeys[tab], availabilityConfig[tab].label)}
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
    const { t } = useTranslation();
    const tabs: { value: DietFilter; label: string }[] = [
        { value: 'ALL', label: t('admin.menu.all', 'All') },
        { value: 'VEG', label: t('admin.menu.veg', 'Veg') },
        { value: 'NON_VEG', label: t('admin.menu.nonVeg', 'Non-veg') }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Leaf size={13} />
                {t('admin.menu.diet', 'Diet')}
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
    const { t } = useTranslation();
    const options: { value: ViewMode; label: string; icon: ReactNode }[] = [
        { value: 'grid', label: t('admin.menu.grid', 'Grid'), icon: <Grid3X3 size={14} /> },
        { value: 'list', label: t('admin.menu.list', 'List'), icon: <List size={14} /> }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {t('admin.menu.view', 'View')}
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
}) => {
    const { t } = useTranslation();

    return (
        <section className="rounded-[28px] border border-[color:var(--brand-outline)] bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-surface-ivory)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
            <WorkspaceHeader
                title={t('admin.menu.boardTitle', 'Menu board')}
                text={t('admin.menu.boardText', 'Review dish photography, pricing, stock, dietary flags and visibility in a visual workspace.')}
                badge={t('admin.menu.itemCount', { count: items.length, defaultValue_one: '{{count}} item', defaultValue_other: '{{count}} items' })}
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
};

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
}) => {
    const { t } = useTranslation();

    return (
        <article className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_var(--brand-slate-a10)]">
            <div className="relative aspect-[4/3] bg-stone-50">
                <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name || t('admin.menu.menuItem', 'Menu item')}
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
                            {item.name || t('admin.menu.untitledItem', 'Untitled item')}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                            {item.description || t('admin.menu.noDescription', 'No description added yet.')}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniMeta label={t('admin.menu.category', 'Category')} value={getCategoryName(item, categoryMap, t)} />
                    <MiniMeta label={t('admin.menu.stock', 'Stock')} value={`${item.stockCount ?? 0}`} />
                    <MiniMeta label={t('admin.menu.spice', 'Spice')} value={getSpiceLabel(t, item.spiceLevel)} />
                    <MiniMeta label={t('admin.menu.diet', 'Diet')} value={item.isVeg ? t('admin.menu.vegetarian', 'Vegetarian') : t('admin.menu.regular', 'Regular')} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                        <CheckCircle2 size={13} />
                        {t('admin.menu.stockValue', 'Stock {{count}}', { count: item.stockCount ?? 0 })}
                    </span>
                    <MenuActions item={item} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </article>
    );
};

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
}) => {
    const { t } = useTranslation();
    const headings = [
        t('admin.menu.itemHeader', 'Item'),
        t('admin.menu.category', 'Category'),
        t('admin.menu.price', 'Price'),
        t('admin.menu.stock', 'Stock'),
        t('admin.menu.visibility', 'Visibility'),
        t('admin.menu.diet', 'Diet'),
        t('admin.menu.action', 'Action')
    ];

    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <WorkspaceHeader
                title={t('admin.menu.listTitle', 'List workspace')}
                text={t('admin.menu.listText', 'Scan prices, category, stock and menu visibility in one dense table.')}
                badge={t('admin.menu.itemCount', { count: items.length, defaultValue_one: '{{count}} item', defaultValue_other: '{{count}} items' })}
            />

            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                    <thead className="bg-stone-50">
                        <tr>
                            {headings.map((heading) => (
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
};

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
}) => {
    const { t } = useTranslation();

    return (
        <tr className="transition hover:bg-amber-50/50">
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name || t('admin.menu.menuItem', 'Menu item')}
                        onError={(event) => {
                            event.currentTarget.src = '/hero-catering.jpg';
                        }}
                        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                            {item.name || t('admin.menu.untitledItem', 'Untitled item')}
                        </p>
                        <p className="mt-1 max-w-[280px] truncate text-xs font-bold text-slate-500">
                            {item.description || t('admin.menu.noDescription', 'No description added yet.')}
                        </p>
                    </div>
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">
                {getCategoryName(item, categoryMap, t)}
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
                {item.isVeg ? <DietBadge /> : <span className="text-xs font-bold text-slate-500">{t('admin.menu.regular', 'Regular')}</span>}
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <MenuActions item={item} onEdit={onEdit} onDelete={onDelete} />
            </td>
        </tr>
    );
};
const MenuActions = ({
    item,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap justify-end gap-2">
            <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
            >
                <Pencil size={14} />
                {t('admin.common.edit', 'Edit')}
            </button>
            <button
                type="button"
                onClick={() => onDelete(item._id)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
                <Trash2 size={14} />
                {t('admin.common.delete', 'Delete')}
            </button>
        </div>
    );
};

export const MenuForm = ({ onClose, onSubmit, initialData }: MenuFormProps) => {
    const { t } = useTranslation();
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
                        {initialData ? t('admin.menu.editHeading', 'Edit menu item') : t('admin.menu.createHeading', 'Create menu item')}
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {t('admin.menu.formSubtitle', 'Keep customer-facing dishes accurate, appetizing and easy to order.')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('admin.menu.closeEditorAria', 'Close menu item editor')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit(submitForm)} className="max-h-[85vh] overflow-y-auto px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <SectionTitle title={t('admin.menu.sectionInfo', 'Dish information')} subtitle={t('admin.menu.sectionInfoSub', 'Name, description, pricing and placement')} />

                        <InputField
                            label={t('admin.menu.itemName', 'Item Name')}
                            placeholder={t('admin.menu.namePlaceholder', 'Eg. Chicken Kottu')}
                            icon={<Package size={16} />}
                            error={errors.name?.message}
                            registration={register('name', { required: t('admin.menu.nameRequired', 'Item name is required') })}
                        />

                        <TextAreaField
                            label={t('admin.menu.description', 'Description')}
                            placeholder={t('admin.menu.descriptionPlaceholder', 'Write a short customer-facing description...')}
                            icon={<FileText size={16} />}
                            error={errors.description?.message}
                            registration={register('description')}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                                label={t('admin.menu.price', 'Price')}
                                type="number"
                                step="0.01"
                                placeholder={t('admin.menu.pricePlaceholder', '0.00')}
                                icon={<Euro size={16} />}
                                error={errors.price?.message}
                                registration={register('price', {
                                    required: t('admin.menu.priceRequired', 'Price is required'),
                                    valueAsNumber: true,
                                    min: { value: 0, message: t('admin.menu.priceNegative', 'Price cannot be negative') }
                                })}
                            />
                            <InputField
                                label={t('admin.menu.stockCountLabel', 'Stock count')}
                                type="number"
                                placeholder={t('admin.menu.stockPlaceholder', '0')}
                                icon={<Box size={16} />}
                                error={errors.stockCount?.message}
                                registration={register('stockCount', {
                                    required: t('admin.menu.stockRequired', 'Stock count is required'),
                                    valueAsNumber: true,
                                    min: { value: 0, message: t('admin.menu.stockNegative', 'Stock count cannot be negative') }
                                })}
                            />
                        </div>

                        <PremiumSelect
                            label={t('admin.menu.category', 'Category')}
                            icon={<Layers3 size={16} />}
                            error={errors.categoryId?.message}
                            registration={register('categoryId', { required: t('admin.menu.categoryRequired', 'Please select a category') })}
                        >
                            <option value="">{t('admin.menu.selectCategory', 'Select category')}</option>
                            {categoryList.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.nameTranslations?.nl || category.name || t('admin.menu.untitledCategory', 'Untitled category')}
                                </option>
                            ))}
                        </PremiumSelect>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <PremiumSelect
                                label={t('admin.menu.spiceLevel', 'Spice Level')}
                                icon={<Flame size={16} />}
                                registration={register('spiceLevel', { valueAsNumber: true })}
                            >
                                <option value="0">{t('admin.menu.spiceOptionNone', '0 - None')}</option>
                                <option value="1">{t('admin.menu.spiceOptionMild', '1 - Mild')}</option>
                                <option value="2">{t('admin.menu.spiceOptionMedium', '2 - Medium')}</option>
                                <option value="3">{t('admin.menu.spiceOptionHot', '3 - Hot')}</option>
                                <option value="4">{t('admin.menu.spiceOptionExtraHot', '4 - Extra hot')}</option>
                            </PremiumSelect>

                            <ToggleControl
                                title={t('admin.menu.vegetarian', 'Vegetarian')}
                                text={t('admin.menu.vegetarianText', 'Mark this item as vegetarian')}
                                icon={<Leaf size={16} />}
                                checked={isVeg}
                                onClick={() => setValue('isVeg', !isVeg)}
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <SectionTitle title={t('admin.menu.sectionImage', 'Image and status')} subtitle={t('admin.menu.sectionImageSub', 'Photography, visibility and quick review')} />

                        <div className="rounded-[26px] border border-slate-200 bg-(--brand-surface-ivory) p-4">
                            <p className="mb-3 text-sm font-extrabold text-slate-700">{t('admin.menu.imagePreview', 'Image preview')}</p>
                            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt={t('admin.menu.previewAlt', 'Preview')}
                                        className="h-64 w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.src = '/hero-catering.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-slate-400">
                                        <ImagePlus size={28} />
                                        <p className="text-sm font-semibold">{t('admin.menu.noImage', 'No image selected')}</p>
                                    </div>
                                )}
                            </div>

                            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-stone-50">
                                <ImagePlus size={16} />
                                {t('admin.menu.uploadImage', 'Upload image')}
                                <input type="file" accept="image/*" className="hidden" {...register('image')} />
                            </label>
                        </div>

                        <ToggleControl
                            title={available ? t('admin.menu.visibleInMenu', 'Visible in menu') : t('admin.menu.hiddenFromMenu', 'Hidden from menu')}
                            text={t('admin.menu.visibilityText', 'Control whether customers can order this item')}
                            icon={available ? <Eye size={16} /> : <EyeOff size={16} />}
                            checked={available}
                            dark
                            onClick={() => setValue('available', !available)}
                        />

                        <div className="rounded-[26px] border border-slate-200 bg-(--brand-surface-ivory) p-4">
                            <p className="text-sm font-extrabold text-slate-700">{t('admin.menu.quickSummary', 'Quick summary')}</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <SummaryRow label={t('admin.common.name', 'Name')} value={watch('name') || '-'} />
                                <SummaryRow label={t('admin.menu.price', 'Price')} value={formatPrice(watch('price'))} />
                                <SummaryRow label={t('admin.menu.stock', 'Stock')} value={`${watch('stockCount') || 0}`} />
                                <SummaryRow label={t('admin.menu.spice', 'Spice')} value={getSpiceLabel(t, spiceLevel)} />
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
                        {t('admin.common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        {isSubmitting ? t('admin.menu.saving', 'Saving...') : initialData ? t('admin.menu.saveChanges', 'Save changes') : t('admin.menu.createItem', 'Create item')}
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

const VisibilityBadge = ({ available }: { available: boolean }) => {
    const { t } = useTranslation();

    return available ? (
        <span className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">
            {t('admin.menu.available', 'Available')}
        </span>
    ) : (
        <span className="inline-flex rounded-xl border border-slate-200 bg-stone-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-600">
            {t('admin.menu.hidden', 'Hidden')}
        </span>
    );
};

const DietBadge = () => {
    const { t } = useTranslation();

    return (
        <span className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">
            {t('admin.menu.veg', 'Veg')}
        </span>
    );
};

const StockBadge = ({ count }: { count: number }) => {
    const { t } = useTranslation();

    return (
        <span
            className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                count <= 0
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : count <= 5
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
        >
            {count <= 0
                ? t('admin.menu.stockOut', 'Out')
                : count <= 5
                ? t('admin.menu.stockLow', 'Low {{count}}', { count })
                : t('admin.menu.stockIn', '{{count}} in stock', { count })}
        </span>
    );
};

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

const ErrorPanel = () => {
    const { t } = useTranslation();

    return (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-14 text-center shadow-sm">
            <Package className="mx-auto text-red-700" size={28} />
            <h2 className="mt-4 text-xl font-extrabold text-red-700">{t('admin.menu.loadError', 'Menu items could not be loaded')}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-red-600">
                {t('admin.menu.loadErrorText', 'Refresh the page or check the API connection before changing dishes.')}
            </p>
        </div>
    );
};

const EmptyState = ({
    title,
    text,
    action
}: {
    title: string;
    text: string;
    action?: () => void;
}) => {
    const { t } = useTranslation();

    return (
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
                    {t('admin.menu.emptyAdd', 'Add item')}
                </Button>
            )}
        </div>
    );
};

const getCategoryId = (item: MenuItem) => {
    if (typeof item.categoryId === 'object') return item.categoryId?._id || '';
    return item.categoryId || '';
};

const getCategoryName = (item: MenuItem, categoryMap: Map<string, string>, t: TFunction) => {
    if (typeof item.categoryId === 'object') {
        return item.categoryId.nameTranslations?.nl || item.categoryId.name || t('admin.menu.unassigned', 'Unassigned');
    }
    return categoryMap.get(item.categoryId || '') || t('admin.menu.unassigned', 'Unassigned');
};

const formatPrice = (price?: number) => `€ ${Number(price || 0).toFixed(2)}`;

const isValidImageUrl = (url?: string) =>
    !!url && (/^(https?:|data:image\/|blob:)/.test(url)) && !url.startsWith('/');

const getSpiceLabel = (t: TFunction, level?: number) => {
    const spice = Number(level || 0);
    if (spice <= 0) return t('admin.menu.spiceNone', 'None');
    if (spice === 1) return t('admin.menu.spiceMild', 'Mild');
    if (spice === 2) return t('admin.menu.spiceMedium', 'Medium');
    if (spice === 3) return t('admin.menu.spiceHot', 'Hot');
    return t('admin.menu.spiceExtraHot', 'Extra hot');
};
