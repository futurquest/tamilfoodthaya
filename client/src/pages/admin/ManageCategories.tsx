import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2,
    Coffee,
    Filter,
    Grid3X3,
    Languages,
    LayoutGrid,
    List,
    Pencil,
    Plus,
    Search,
    Soup,
    Trash2,
    X
} from 'lucide-react';
import { useMenu, createCategory, updateCategory, deleteCategory } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MetricCard, WorkspaceHeader } from '../../components/AdminUI';

type CategoryType = 'food' | 'beverage';
type TypeFilter = 'ALL' | CategoryType;
type ViewMode = 'grid' | 'list';

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

type CategoryItem = {
    _id: string;
    name?: string;
    nameTranslations?: {
        nl?: string;
        en?: string;
        ta?: string;
    };
    order?: number;
    type?: CategoryType | string;
};

const typeConfig: Record<CategoryType, { labelKey: string; helperKey: string; icon: ReactNode; badgeClass: string }> = {
    food: {
        labelKey: 'admin.categories.typeFood',
        helperKey: 'admin.categories.typeFoodHelper',
        icon: <Soup size={16} />,
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    },
    beverage: {
        labelKey: 'admin.categories.typeBeverage',
        helperKey: 'admin.categories.typeBeverageHelper',
        icon: <Coffee size={16} />,
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-800'
    }
};

export const ManageCategories = () => {
    const { t } = useTranslation();
    const { categories } = useMenu();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const { register, handleSubmit, reset } = useForm<CategoryForm>({
        defaultValues: {
            name: '',
            nameTranslations: { nl: '', en: '', ta: '' },
            order: 0,
            type: 'food'
        }
    });

    const categoryList: CategoryItem[] = Array.isArray(categories.data)
        ? categories.data
        : Array.isArray(categories.data?.data)
        ? categories.data.data
        : [];

    const stats = useMemo(() => {
        const total = categoryList.length;
        const food = categoryList.filter((item) => getCategoryType(item) === 'food').length;
        const beverage = categoryList.filter((item) => getCategoryType(item) === 'beverage').length;

        return { total, food, beverage };
    }, [categoryList]);

    const filteredCategories = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return [...categoryList]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .filter((category) => {
                const categoryType = getCategoryType(category);
                if (typeFilter !== 'ALL' && categoryType !== typeFilter) return false;
                if (!query) return true;

                return [
                    getDisplayName(category),
                    category.nameTranslations?.nl,
                    category.nameTranslations?.en,
                    category.nameTranslations?.ta,
                    category.type,
                    String(category.order ?? 0)
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));
            });
    }, [categoryList, searchTerm, typeFilter]);

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

    const handleEdit = (category: CategoryItem) => {
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

    const requestDelete = (id: string) => {
        const target = categoryList.find((category) => category._id === id) ?? null;
        setDeleteTarget(target);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await deleteCategory(deleteTarget._id);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success(t('admin.categories.deletedToast', 'Category deleted'));
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error(t('admin.categories.deleteErrorToast', 'Could not delete category'));
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
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
                toast.success(t('admin.categories.updatedToast', 'Category updated'));
            } else {
                await createCategory(payload);
                toast.success(t('admin.categories.createdToast', 'Category created'));
            }

            queryClient.invalidateQueries({ queryKey: ['categories'] });
            closeModal();
        } catch (error) {
            console.error('Failed to save category:', error);
            toast.error(t('admin.categories.saveErrorToast', 'Could not save category'));
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {t('admin.categories.eyebrow', 'Categories')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                    {t('admin.categories.workspaceTitle', 'Menu Category Workspace')}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                                    <LayoutGrid size={13} />
                                    {viewMode === 'grid' ? t('admin.categories.gridView', 'Grid view') : t('admin.categories.listView', 'List view')}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                {t('admin.categories.subtitle', 'Organize food and drink sections, review multilingual labels and keep the public menu easy to browse.')}
                            </p>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] xl:w-[620px]">
                            <MetricCard label={t('admin.categories.metricTotal', 'Total')} value={stats.total} icon={<LayoutGrid size={16} />} />
                            <MetricCard label={t('admin.categories.metricFood', 'Food')} value={stats.food} icon={<Soup size={16} />} />
                            <MetricCard label={t('admin.categories.metricBeverage', 'Drinks')} value={stats.beverage} icon={<Coffee size={16} />} />
                            <Button
                                onClick={handleCreate}
                                className="h-full min-h-16 rounded-2xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
                            >
                                <Plus size={16} className="mr-2" />
                                {t('admin.categories.addCategory')}
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
                                placeholder={t('admin.categories.searchPlaceholder', 'Search category name, translation, type or display order...')}
                                aria-label={t('admin.categories.searchAria', 'Search categories')}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                            <TypeTabs
                                value={typeFilter}
                                counts={{
                                    ALL: stats.total,
                                    food: stats.food,
                                    beverage: stats.beverage
                                }}
                                onChange={setTypeFilter}
                            />
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Filter size={12} />
                            {t('admin.categories.showing', 'Showing {{shown}} of {{total}} categories', { shown: filteredCategories.length, total: categoryList.length })}
                        </span>
                        {(searchTerm || typeFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setTypeFilter('ALL');
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                            >
                                {t('admin.categories.clearFilters', 'Clear filters')}
                            </button>
                        )}
                    </div>
                </section>

                {categories.isLoading ? (
                    <LoadingPanel />
                ) : categories.isError ? (
                    <ErrorPanel />
                ) : filteredCategories.length === 0 ? (
                    <EmptyState
                        title={categoryList.length === 0 ? t('admin.categories.emptyTitle', 'No categories yet') : t('admin.categories.noMatchTitle', 'No matching categories')}
                        text={
                            categoryList.length === 0
                                ? t('admin.categories.emptyText', 'Create the first category to start shaping the menu.')
                                : t('admin.categories.noMatchText', 'Adjust search or filters to find the category you need.')
                        }
                        action={categoryList.length === 0 ? handleCreate : undefined}
                    />
                ) : viewMode === 'grid' ? (
                    <CategoryGrid
                        categories={filteredCategories}
                        onEdit={handleEdit}
                        onDelete={requestDelete}
                    />
                ) : (
                    <CategoryList
                        categories={filteredCategories}
                        onEdit={handleEdit}
                        onDelete={requestDelete}
                    />
                )}

                {isEditing && (
                    <CategoryModal
                        title={editingCategory ? t('admin.categories.editTitle', 'Edit category') : t('admin.categories.createTitle', 'Create category')}
                        onClose={closeModal}
                        onSubmit={handleSubmit(onSubmit)}
                        register={register}
                    />
                )}

                <ConfirmDialog
                    open={Boolean(deleteTarget)}
                    title={t('admin.categories.deleteTitle', 'Delete category')}
                    message={
                        deleteTarget
                            ? t('admin.categories.deleteMessage', 'Delete "{{name}}"? Menu items may still be linked to it.', {
                                  name: getDisplayName(deleteTarget)
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
};
const TypeTabs = ({
    value,
    counts,
    onChange
}: {
    value: TypeFilter;
    counts: Record<TypeFilter, number>;
    onChange: (value: TypeFilter) => void;
}) => {
    const { t } = useTranslation();
    const tabs: { value: TypeFilter; label: string }[] = [
        { value: 'ALL', label: t('admin.categories.tabAll', 'All') },
        { value: 'food', label: t('admin.categories.tabFood', 'Food') },
        { value: 'beverage', label: t('admin.categories.tabBeverage', 'Drinks') }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <Filter size={13} />
                {t('admin.categories.typeLabel', 'Type')}
            </span>
            <div className="flex max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-stone-50 p-1">
                {tabs.map((tab) => {
                    const active = value === tab.value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                                active
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`rounded-lg px-1.5 py-0.5 text-[10px] ${
                                    active ? 'bg-amber-50 text-amber-800' : 'bg-white text-slate-500'
                                }`}
                            >
                                {counts[tab.value]}
                            </span>
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
        { value: 'grid', label: t('admin.categories.gridLabel', 'Grid'), icon: <Grid3X3 size={14} /> },
        { value: 'list', label: t('admin.categories.listLabel', 'List'), icon: <List size={14} /> }
    ];

    return (
        <div className="grid gap-1.5">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {t('admin.categories.viewLabel', 'View')}
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
                                active
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
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

const CategoryGrid = ({
    categories,
    onEdit,
    onDelete
}: {
    categories: CategoryItem[];
    onEdit: (category: CategoryItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();
    return (
        <section className="rounded-[28px] border border-[color:var(--brand-outline)] bg-[linear-gradient(135deg,var(--brand-surface-warm)_0%,var(--brand-surface-ivory)_42%,var(--brand-slate-soft)_100%)] p-3 shadow-sm">
            <WorkspaceHeader
                title={t('admin.categories.boardTitle', 'Category board')}
                text={t('admin.categories.boardText', 'Review each menu section, translations and display order in a visual workspace.')}
                badge={`${categories.length} ${categories.length === 1 ? t('admin.categories.categorySingular', 'category') : t('admin.categories.categoryPlural', 'categories')}`}
            />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                    <CategoryCard
                        key={category._id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
};

const CategoryCard = ({
    category,
    onEdit,
    onDelete
}: {
    category: CategoryItem;
    onEdit: (category: CategoryItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();
    const categoryType = getCategoryType(category);
    const config = typeConfig[categoryType];

    return (
        <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_var(--brand-slate-a10)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-white shadow-sm">
                        {config.icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-slate-900">
                            {getDisplayName(category)}
                        </h3>
                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                            {t(config.helperKey)}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex shrink-0 rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${config.badgeClass}`}>
                    {t(config.labelKey)}
                </span>
            </div>

            <div className="mt-4 grid gap-2">
                <LangPill label="NL" value={category.nameTranslations?.nl || category.name || '-'} />
                <LangPill label="EN" value={category.nameTranslations?.en || '-'} />
                <LangPill label="TA" value={category.nameTranslations?.ta || '-'} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                    <CheckCircle2 size={13} />
                    {t('admin.categories.orderLabel', 'Order {{order}}', { order: category.order ?? 0 })}
                </span>
                <CategoryActions category={category} onEdit={onEdit} onDelete={onDelete} />
            </div>
        </article>
    );
};

const CategoryList = ({
    categories,
    onEdit,
    onDelete
}: {
    categories: CategoryItem[];
    onEdit: (category: CategoryItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <WorkspaceHeader
                title={t('admin.categories.listTitle', 'List workspace')}
                text={t('admin.categories.listText', 'Scan category type, translation coverage and order in one dense table.')}
                badge={`${categories.length} ${categories.length === 1 ? t('admin.categories.categorySingular', 'category') : t('admin.categories.categoryPlural', 'categories')}`}
            />

            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                    <thead className="bg-stone-50">
                        <tr>
                            {[
                                t('admin.categories.hCategory', 'Category'),
                                t('admin.categories.hType', 'Type'),
                                t('admin.categories.hTranslations', 'Translations'),
                                t('admin.categories.hOrder', 'Order'),
                                t('admin.categories.hAction', 'Action')
                            ].map((heading) => (
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
                        {categories.map((category) => (
                            <CategoryRow
                                key={category._id}
                                category={category}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-3 lg:hidden">
                {categories.map((category) => (
                    <CategoryCard
                        key={category._id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
};

const CategoryRow = ({
    category,
    onEdit,
    onDelete
}: {
    category: CategoryItem;
    onEdit: (category: CategoryItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();
    const categoryType = getCategoryType(category);
    const config = typeConfig[categoryType];

    return (
        <tr className="transition hover:bg-amber-50/50">
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--brand-accent-strong) to-(--brand-primary) text-white shadow-sm">
                        {config.icon}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                            {getDisplayName(category)}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-500">
                            {category.nameTranslations?.nl || category.name || t('admin.categories.nlLabelMissing', 'Dutch label not set')}
                        </p>
                    </div>
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <span className={`inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${config.badgeClass}`}>
                    {t(config.labelKey)}
                </span>
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <div className="grid gap-1">
                    <p className="text-xs font-bold text-slate-700">{t('admin.categories.enLabel', 'EN')}: {category.nameTranslations?.en || '-'}</p>
                    <p className="text-xs font-bold text-slate-700">{t('admin.categories.taLabel', 'TA')}: {category.nameTranslations?.ta || '-'}</p>
                </div>
            </td>
            <td className="border-b border-slate-100 px-4 py-4 text-sm font-extrabold text-slate-900">
                {category.order ?? 0}
            </td>
            <td className="border-b border-slate-100 px-4 py-4">
                <CategoryActions category={category} onEdit={onEdit} onDelete={onDelete} />
            </td>
        </tr>
    );
};
const CategoryActions = ({
    category,
    onEdit,
    onDelete
}: {
    category: CategoryItem;
    onEdit: (category: CategoryItem) => void;
    onDelete: (id: string) => void;
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap justify-end gap-2">
            <button
                type="button"
                onClick={() => onEdit(category)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
            >
                <Pencil size={14} />
                {t('admin.categories.editLabel', 'Edit')}
            </button>
            <button
                type="button"
                onClick={() => onDelete(category._id)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
                <Trash2 size={14} />
                {t('admin.categories.deleteLabel', 'Delete')}
            </button>
        </div>
    );
};

const CategoryModal = ({
    title,
    onClose,
    onSubmit,
    register
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    register: (name: any, options?: any) => UseFormRegisterReturn;
}) => {
    const { t } = useTranslation();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const original = document.activeElement as HTMLElement | null;
        const firstField = panelRef.current?.querySelector<HTMLElement>(
            'input, select, textarea, button'
        );
        firstField?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            original?.focus();
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex overflow-y-auto bg-black/35 p-4 backdrop-blur-[2px]">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="m-auto w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                            {t('admin.categories.modalSubtitle', 'Keep all customer-facing labels clean across Dutch, English and Tamil.')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('admin.categories.closeModalAria', 'Close category form')}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-stone-50 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
                    <div className="rounded-2xl border border-slate-200 bg-(--brand-surface-ivory) p-4">
                        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            <Languages size={13} />
                            {t('admin.categories.menuLabels', 'Menu labels')}
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                            <InputBlock
                                label={t('admin.categories.dutchLabel', 'Dutch (NL)')}
                                placeholder={t('admin.categories.dutchPlaceholder', 'Bijgerechten')}
                                register={register('nameTranslations.nl', { required: true })}
                            />
                            <InputBlock
                                label={t('admin.categories.englishLabel', 'English (EN)')}
                                placeholder={t('admin.categories.englishPlaceholder', 'Side dishes')}
                                register={register('nameTranslations.en')}
                            />
                            <InputBlock
                                label={t('admin.categories.tamilLabel', 'Tamil (TA)')}
                                placeholder={t('admin.categories.tamilPlaceholder', 'Tamil label')}
                                register={register('nameTranslations.ta')}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InputBlock
                            label={t('admin.categories.displayOrder', 'Display order')}
                            placeholder="0"
                            type="number"
                            register={register('order', { valueAsNumber: true })}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-extrabold text-slate-700">
                                {t('admin.categories.categoryType', 'Category type')}
                            </label>
                            <select
                                {...register('type')}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="food">{t('admin.categories.optionFood', 'Food')}</option>
                                <option value="beverage">{t('admin.categories.optionBeverage', 'Drinks')}</option>
                            </select>
                            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                {t('admin.categories.typeHelper', 'This controls where the category appears in the public menu flow.')}
                            </p>
                        </div>
                    </div>

                    <input type="hidden" {...register('name')} />

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-10 rounded-xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-stone-50"
                        >
                            {t('admin.categories.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 rounded-xl border border-slate-900 bg-slate-900 px-5 text-white hover:bg-slate-800"
                        >
                            {t('admin.categories.saveCategory', 'Save category')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LangPill = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-extrabold text-slate-800">{value}</p>
        </div>
    );
};

const InputBlock = ({
    label,
    placeholder,
    register,
    type = 'text'
}: {
    label: string;
    placeholder: string;
    register: UseFormRegisterReturn;
    type?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-extrabold text-slate-700">
                {label}
            </label>
            <input
                type={type}
                {...register}
                placeholder={placeholder}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
};

const LoadingPanel = () => {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className="admin-skeleton h-11 w-11" />
                            <div className="flex-1 space-y-2">
                                <div className="admin-skeleton h-4 w-3/4" />
                                <div className="admin-skeleton h-3 w-1/2" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="admin-skeleton h-4 w-full" />
                            <div className="admin-skeleton h-4 w-5/6" />
                            <div className="admin-skeleton h-4 w-2/3" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="admin-skeleton h-8 w-20" />
                            <div className="admin-skeleton h-8 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ErrorPanel = () => {
    const { t } = useTranslation();
    return (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-14 text-center shadow-sm">
            <LayoutGrid className="mx-auto text-red-700" size={28} />
            <h2 className="mt-4 text-xl font-extrabold text-red-700">
                {t('admin.categories.loadErrorTitle', 'Categories could not be loaded')}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-red-600">
                {t('admin.categories.loadErrorText', 'Refresh the page or check the API connection before changing the menu structure.')}
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
                <LayoutGrid size={22} className="text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                {text}
            </p>
            {action && (
                <Button
                    onClick={action}
                    className="mt-5 h-10 rounded-xl border border-slate-900 bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
                >
                    <Plus size={16} className="mr-2" />
                    {t('admin.categories.addCategory')}
                </Button>
            )}
        </div>
    );
};

const getDisplayName = (category: CategoryItem) => {
    return category.nameTranslations?.nl || category.name || 'Untitled category';
};

const getCategoryType = (category: CategoryItem): CategoryType => {
    return category.type === 'beverage' ? 'beverage' : 'food';
};

