import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../hooks/useApi';
import ScrollReveal from './ScrollReveal';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    category?: { _id?: string; name?: string } | string;
    spiceLevel?: number;
    isVeg?: boolean;
}

interface Category {
    _id: string;
    name: string;
    image?: string;
    description?: string;
    items: MenuItem[];
}

// Fallback data shown when API returns nothing
const FALLBACK_CATEGORIES: Category[] = [
    {
        _id: 'breakfast',
        name: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop',
        description: 'Start your day with authentic Tamil breakfast dishes like idli, dosa, and pongal.',
        items: [
            { _id: 'i1', name: 'Idli', description: 'Soft steamed rice cakes served with sambar and coconut chutney. A classic South Indian breakfast.' },
            { _id: 'i2', name: 'Dosa', description: 'Crispy rice-lentil crepe served with sambar, coconut and tomato chutneys.' },
            { _id: 'i3', name: 'Pongal', description: 'Savoury rice-lentil porridge tempered with ghee, pepper, cumin and cashews.' },
        ],
    },
    {
        _id: 'lunch',
        name: 'Lunch',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
        description: 'Hearty Tamil thalis with rice, curries, rasam, and an array of sides.',
        items: [
            { _id: 'l1', name: 'Meals (Thali)', description: 'A full traditional thali with rice, 3 curries, rasam, sambar, papad, and pickle.' },
            { _id: 'l2', name: 'Biryani', description: 'Fragrant basmati rice cooked with spiced chicken or vegetables in the Tamil-Chettinad tradition.' },
            { _id: 'l3', name: 'Chettinad Curry', description: 'Rich and spicy curry from the Chettinad region, made with freshly ground masalas.' },
        ],
    },
    {
        _id: 'dinner',
        name: 'Dinner',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop',
        description: 'An elegant evening spread of non-veg curries, tandoor dishes, and classic rice meals.',
        items: [
            { _id: 'd1', name: 'Tandoori Chicken', description: 'Chicken marinated in yogurt and spices, roasted in a clay oven to juicy perfection.' },
            { _id: 'd2', name: 'Mutton Curry', description: 'Slow-cooked tender mutton in a deep spiced Tamil gravy, served with rice or parotta.' },
            { _id: 'd3', name: 'Fish Curry', description: 'Fresh fish simmered in tangy tamarind and tomato gravy with aromatic Tamil spices.' },
        ],
    },
    {
        _id: 'snacks',
        name: 'Snacks & Sides',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop',
        description: 'Street-food favourites and bite-sized Tamil classics, perfect as starters.',
        items: [
            { _id: 's1', name: 'Vada', description: 'Crispy savoury doughnuts made from lentil batter, fried golden and served with chutneys.' },
            { _id: 's2', name: 'Samosa', description: 'Flaky pastry triangles stuffed with spiced potato and peas, deep-fried until crisp.' },
            { _id: 's3', name: 'Onion Pakoda', description: 'Crunchy battered onion fritters seasoned with green chilli and curry leaves.' },
        ],
    },
    {
        _id: 'desserts',
        name: 'Desserts',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
        description: 'Indulge in traditional Tamil sweets — from milky payasam to rich halwa.',
        items: [
            { _id: 'ds1', name: 'Payasam', description: 'Creamy rice or vermicelli pudding simmered in milk, cardamom, and jaggery, garnished with cashews.' },
            { _id: 'ds2', name: 'Kesari', description: 'Saffron-infused semolina halwa with ghee, sugar, and golden raisins.' },
            { _id: 'ds3', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup.' },
        ],
    },
];

// ─── Item Detail Modal ────────────────────────────────────────────────────────
function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) => translations?.[currentLang] || translations?.nl || fallback || '';

    useEffect(() => {
        if (!item) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }, [item, onClose]);

    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-dark-900/70 backdrop-blur-sm" />
            {/* Card */}
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
                        <h3 className="text-2xl font-bold text-dark-800">{getLabel((item as any).nameTranslations, item.name)}</h3>
                        <div className="flex gap-1.5">
                            {item.isVeg && <span className="badge badge-veg">Veg</span>}
                            {item.spiceLevel && item.spiceLevel > 0 && (
                                <span className="badge badge-spicy">{'🌶️'.repeat(item.spiceLevel)}</span>
                            )}
                        </div>
                    </div>
                    <p className="text-dark-600 leading-relaxed">
                        {getLabel((item as any).descriptionTranslations, item.description) || 'A delicious dish crafted with authentic Tamil spices and fresh ingredients.'}
                    </p>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="btn-primary flex-1 text-sm py-2.5"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MenuSection({ showViewMore = true }: { showViewMore?: boolean }) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) => translations?.[currentLang] || translations?.nl || fallback || '';

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to build categories from the API items + categories endpoints
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
                setActiveCategory(built[0]?._id || '');
            } else {
                setCategories(FALLBACK_CATEGORIES);
                setActiveCategory(FALLBACK_CATEGORIES[0]._id);
            }
        }).finally(() => setLoading(false));
    }, []);

    const activeCat = categories.find(c => c._id === activeCategory);

    return (
        <section id="our_menu" className="py-16 md:py-20 bg-dark-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <ScrollReveal variant="fadeUp" className="text-center mb-12">
                    <div className="page_title">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-800 mb-2">
                            Taste of Tamil Nadu
                        </h2>
                        <p className="text-dark-500 text-lg mb-4">
                            Authentic Tamil flavours for every occasion
                        </p>
                        <div className="single_line" />
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className="text-center py-20 text-dark-400">Loading menu…</div>
                ) : (
                    <>
                        {/* Category tabs */}
                        <ScrollReveal variant="fadeIn" className="mb-10">
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => setActiveCategory(cat._id)}
                                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-300
                                            ${activeCategory === cat._id
                                                ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                                                : 'text-dark-700 border-dark-200 bg-white hover:bg-primary-500 hover:text-white hover:border-primary-500'
                                            }`}
                                    >
                                        {getLabel((cat as any).nameTranslations, cat.name)}
                                    </button>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* Active category info */}
                        {activeCat && (
                            <ScrollReveal key={activeCategory} variant="fadeUp">
                                {/* Category hero image + description */}
                                {activeCat.image && (
                                    <div className="relative rounded-2xl overflow-hidden mb-10 h-52 md:h-64 shadow-md">
                                        <img
                                            src={activeCat.image}
                                            alt={activeCat.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-6">
                                            <h3 className="text-2xl font-bold text-white mb-1">{getLabel((activeCat as any).nameTranslations, activeCat.name)}</h3>
                                            {(activeCat as any).descriptionTranslations || activeCat.description ? (
                                                <p className="text-white/80 text-sm max-w-lg">{getLabel((activeCat as any).descriptionTranslations, activeCat.description)}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                )}

                                {/* Dish grid — NO prices, click for description */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeCat.items.map((item, i) => (
                                        <button
                                            key={item._id || i}
                                            onClick={() => setSelectedItem(item)}
                                            className="group text-left bg-white rounded-2xl border border-dark-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {item.image && (
                                                <div className="h-40 overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                            <div className={`p-4 ${!item.image ? 'flex items-center gap-3' : ''}`}>
                                                {!item.image && (
                                                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
                                                        🍽️
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="font-bold text-dark-800 group-hover:text-primary-600 transition-colors">{getLabel((item as any).nameTranslations, item.name)}</h4>
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            {item.isVeg && <span className="badge badge-veg text-xs">Veg</span>}
                                                            {item.spiceLevel && item.spiceLevel > 0 && (
                                                                <span className="text-xs">{'🌶️'.repeat(Math.min(Math.max(item.spiceLevel, 1), 3))}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {((item as any).descriptionTranslations || item.description) && (
                                                        <p className="text-dark-500 text-sm mt-1 line-clamp-2 leading-snug">{getLabel((item as any).descriptionTranslations, item.description)}</p>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 font-semibold">
                                                        View description
                                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollReveal>
                        )}

                        {/* View full menu CTA */}
                        {showViewMore && (
                            <ScrollReveal variant="fadeUp" className="text-center mt-12">
                                <Link
                                    to="/menu"
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    View Full Menu
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </ScrollReveal>
                        )}
                    </>
                )}
            </div>

            {/* Item detail modal */}
            <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </section>
    );
}
