import { useState, useEffect } from 'react';
import { api } from '../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/Header';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    spiceLevel?: number;
    isVeg?: boolean;
    categoryId?: string | { _id?: string; name?: string };
}

interface Category {
    _id: string;
    name: string;
    image?: string;
    description?: string;
    items: MenuItem[];
}

// ─── Item Detail Modal ─────────────────────────────────────────────────────────
function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
    useEffect(() => {
        if (!item) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }, [item, onClose]);

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="absolute inset-0 bg-dark-900/70 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {item.image && (
                    <div className="h-52 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-2xl font-bold text-dark-800">{item.name}</h3>
                        <div className="flex gap-1.5 flex-shrink-0">
                            {item.isVeg && <span className="badge badge-veg">Veg</span>}
                            {item.spiceLevel && item.spiceLevel > 0 && (
                                <span className="badge badge-spicy">{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                            )}
                        </div>
                    </div>
                    <p className="text-dark-600 leading-relaxed">
                        {item.description || 'A delicious dish crafted with authentic Tamil spices and the freshest ingredients.'}
                    </p>
                    <button onClick={onClose} className="btn-primary w-full mt-6 text-sm py-2.5">
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Dish Card ─────────────────────────────────────────────────────────────────
function DishCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
    return (
        <motion.button
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="group text-left bg-white rounded-2xl border border-dark-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 hover:-translate-y-1 w-full"
        >
            {item.image ? (
                <div className="h-44 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ) : (
                <div className="h-32 bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center text-5xl">
                    🍽️
                </div>
            )}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-dark-800 group-hover:text-primary-600 transition-colors">{item.name}</h4>
                    <div className="flex gap-1 flex-shrink-0 mt-0.5">
                        {item.isVeg && <span className="badge badge-veg text-xs">Veg</span>}
                        {item.spiceLevel && item.spiceLevel > 0 && (
                            <span className="text-xs">{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                        )}
                    </div>
                </div>
                {item.description && (
                    <p className="text-dark-500 text-sm line-clamp-2 leading-snug">{item.description}</p>
                )}
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 font-semibold">
                    View description
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </motion.button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const MenuPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = all
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        Promise.all([
            api.get('/menu/categories').then(r => r.data).catch(() => []),
            api.get('/menu/items').then(r => r.data).catch(() => []),
        ]).then(([cats, items]) => {
            const catArr: any[] = Array.isArray(cats) ? cats : cats?.data || [];
            const itemArr: any[] = Array.isArray(items) ? items : items?.data || [];

            if (catArr.length > 0) {
                const built: Category[] = catArr.map((cat: any) => ({
                    _id: cat._id,
                    name: cat.name,
                    image: cat.image,
                    description: cat.description,
                    items: itemArr.filter((item: any) =>
                        item.categoryId === cat._id || item.categoryId?._id === cat._id
                    ),
                }));
                setCategories(built);
            } else {
                // Fallback — group all items under "All"
                setCategories([{ _id: 'all', name: 'All Items', items: itemArr }]);
            }
        }).finally(() => setLoading(false));
    }, []);

    const allItems: MenuItem[] = categories.flatMap(c => c.items);
    const displayedItems = activeCategory === null
        ? allItems
        : categories.find(c => c._id === activeCategory)?.items || [];
    const activeCatData = categories.find(c => c._id === activeCategory);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-50 pb-24">
            <PageHeader
                title={t('menu.title', 'Our Kitchen')}
                subtitle={t('menu.subtitle', 'Explore authentic Tamil flavours crafted with passion and tradition')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category tabs */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar flex-wrap">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-300 whitespace-nowrap flex-shrink-0
                            ${activeCategory === null
                                ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                                : 'text-dark-700 border-dark-200 bg-white hover:bg-primary-500 hover:text-white hover:border-primary-500'
                            }`}
                    >
                        {t('menu.all', 'All Dishes')}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-300 whitespace-nowrap flex-shrink-0
                                ${activeCategory === cat._id
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                                    : 'text-dark-700 border-dark-200 bg-white hover:bg-primary-500 hover:text-white hover:border-primary-500'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Category banner (shown when a specific category is selected) */}
                {activeCatData?.image && (
                    <div className="relative rounded-2xl overflow-hidden mb-10 h-48 md:h-60 shadow-md">
                        <img src={activeCatData.image} alt={activeCatData.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h3 className="text-2xl font-bold text-white mb-1">{activeCatData.name}</h3>
                            {activeCatData.description && (
                                <p className="text-white/80 text-sm max-w-lg">{activeCatData.description}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Dish grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                        {displayedItems.map(item => (
                            <DishCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
                        ))}
                    </AnimatePresence>
                    {displayedItems.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-dark-400">
                            <div className="text-5xl mb-4">🍽️</div>
                            <p className="text-lg font-semibold">Menu coming soon.</p>
                            <p className="text-sm mt-1">Check back soon or contact us directly.</p>
                        </div>
                    )}
                </div>
            </div>

            <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </div>
    );
};
