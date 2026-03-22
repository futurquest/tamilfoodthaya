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

const FALLBACK_CATEGORIES: Category[] = [
    {
        _id: 'breakfast',
        name: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
        description: 'Start your day with authentic Tamil breakfast dishes like idli, dosa, and pongal.',
        items: [
            { _id: 'i1', name: 'Idli', description: 'Soft steamed rice cakes served with sambar and coconut chutney. A classic South Indian breakfast.', isVeg: true },
            { _id: 'i2', name: 'Dosa', description: 'Crispy rice-lentil crepe served with sambar, coconut and tomato chutneys.', isVeg: true, spiceLevel: 1 },
            { _id: 'i3', name: 'Pongal', description: 'Savoury rice-lentil porridge tempered with ghee, pepper, cumin and cashews.', isVeg: true },
        ],
    },
    {
        _id: 'lunch',
        name: 'Lunch',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop',
        description: 'Hearty Tamil thalis with rice, curries, rasam, and an array of sides.',
        items: [
            { _id: 'l1', name: 'Meals (Thali)', description: 'A full traditional thali with rice, 3 curries, rasam, sambar, papad, and pickle.', isVeg: true },
            { _id: 'l2', name: 'Biryani', description: 'Fragrant basmati rice cooked with spiced chicken or vegetables in the Tamil-Chettinad tradition.', spiceLevel: 2 },
            { _id: 'l3', name: 'Chettinad Curry', description: 'Rich and spicy curry from the Chettinad region, made with freshly ground masalas.', spiceLevel: 3 },
        ],
    },
    {
        _id: 'dinner',
        name: 'Dinner',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
        description: 'An elegant evening spread of non-veg curries, tandoor dishes, and classic rice meals.',
        items: [
            { _id: 'd1', name: 'Tandoori Chicken', description: 'Chicken marinated in yogurt and spices, roasted in a clay oven to juicy perfection.', spiceLevel: 2 },
            { _id: 'd2', name: 'Mutton Curry', description: 'Slow-cooked tender mutton in a deep spiced Tamil gravy, served with rice or parotta.', spiceLevel: 2 },
            { _id: 'd3', name: 'Fish Curry', description: 'Fresh fish simmered in tangy tamarind and tomato gravy with aromatic Tamil spices.', spiceLevel: 1 },
        ],
    },
    {
        _id: 'snacks',
        name: 'Snacks & Sides',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
        description: 'Street-food favourites and bite-sized Tamil classics, perfect as starters.',
        items: [
            { _id: 's1', name: 'Vada', description: 'Crispy savoury doughnuts made from lentil batter, fried golden and served with chutneys.', isVeg: true },
            { _id: 's2', name: 'Samosa', description: 'Flaky pastry triangles stuffed with spiced potato and peas, deep-fried until crisp.', isVeg: true, spiceLevel: 1 },
            { _id: 's3', name: 'Onion Pakoda', description: 'Crunchy battered onion fritters seasoned with green chilli and curry leaves.', isVeg: true, spiceLevel: 1 },
        ],
    },
    {
        _id: 'desserts',
        name: 'Desserts',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
        description: 'Indulge in traditional Tamil sweets — from milky payasam to rich halwa.',
        items: [
            { _id: 'ds1', name: 'Payasam', description: 'Creamy rice or vermicelli pudding simmered in milk, cardamom, and jaggery, garnished with cashews.', isVeg: true },
            { _id: 'ds2', name: 'Kesari', description: 'Saffron-infused semolina halwa with ghee, sugar, and golden raisins.', isVeg: true },
            { _id: 'ds3', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup.', isVeg: true },
        ],
    },
];

// ─── Item Modal ───────────────────────────────────────────────────────────────
function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) =>
        translations?.[currentLang] || translations?.nl || fallback || '';

    useEffect(() => {
        if (!item) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }, [item, onClose]);

    if (!item) return null;

    return (
        <>
            <style>{`
                @keyframes ms-backdropIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes ms-modalIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .ms-modal-backdrop { animation: ms-backdropIn 0.25s ease both; }
                .ms-modal-card { animation: ms-modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>
            <div
                className="ms-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(10,8,6,0.82)] backdrop-blur-md"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="ms-modal-card bg-[#161310] border border-[rgba(232,160,32,0.2)] rounded-3xl max-w-[440px] w-full overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
                    onClick={e => e.stopPropagation()}
                >
                    {item.image && (
                        <div className="h-[220px] overflow-hidden relative">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(22,19,16,0.9)] to-transparent to-50%" />
                        </div>
                    )}
                    <div className="px-7 pt-7 pb-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-['Playfair_Display'] text-[26px] font-bold text-[#f5efe4] leading-[1.15]">
                                {getLabel((item as any).nameTranslations, item.name)}
                            </h3>
                            <div className="flex gap-1.5 flex-shrink-0 mt-1">
                                {item.isVeg && (
                                    <span className="text-[10px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-green-400/10 border border-green-400/30 text-green-400">
                                        Veg
                                    </span>
                                )}
                                {item.spiceLevel && item.spiceLevel > 0 && (
                                    <span className="text-sm">{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-[rgba(240,236,228,0.55)] leading-[1.75] font-light">
                            {getLabel((item as any).descriptionTranslations, item.description) ||
                                'A delicious dish crafted with authentic Tamil spices and fresh ingredients.'}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-[13px] rounded-xl border-none cursor-pointer bg-gradient-to-br from-[#b87a10] to-[#e8a020] text-[#0c0a08] font-['DM_Sans'] text-sm font-semibold tracking-[0.04em] transition-all duration-200 hover:brightness-110 hover:-translate-y-px"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MenuSection({ showViewMore = true }: { showViewMore?: boolean }) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) =>
        translations?.[currentLang] || translations?.nl || fallback || '';

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/menu/categories').then(r => r.data).catch(() => []),
            api.get('/menu/items').then(r => r.data).catch(() => []),
        ]).then(([cats, items]) => {
            const catArr: any[] = Array.isArray(cats) ? cats : cats?.data || [];
            const itemArr: any[] = Array.isArray(items) ? items : items?.data || [];
            if (catArr.length > 0) {
                const built: Category[] = catArr.map((cat: any) => ({
                    _id: cat._id, name: cat.name, image: cat.image,
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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

                @keyframes ms-shimmer {
                    0%   { background-position: -600px 0; }
                    100% { background-position: 600px 0; }
                }
                @keyframes ms-fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .ms-fade { animation: ms-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
                
                .ms-card-chevron img {
                    clip-path: polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%);
                    transition: clip-path 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1);
                }
                .ms-card:hover .ms-card-chevron img {
                    clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%);
                }
                .ms-card-chevron-placeholder {
                    clip-path: polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%);
                    transition: clip-path 0.35s cubic-bezier(0.22,1,0.36,1);
                }
                .ms-card:hover .ms-card-chevron-placeholder {
                    clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%);
                }
            `}</style>

            <section id="our_menu" className="font-['DM_Sans'] bg-white relative overflow-hidden py-[88px] pb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,160,32,0.04)_0%,transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-[length:200px_200px]" />

                <div className="max-w-[1160px] mx-auto px-6 relative">

                    {/* ── Heading ── */}
                    <ScrollReveal variant="fadeUp">
                        <div className="text-center mb-[52px]">
                            <p className="text-[11px] tracking-[0.26em] uppercase text-[#e8a020] font-medium mb-3.5">
                                Taste of Tamil Nadu
                            </p>
                            <h2 className="font-['Playfair_Display'] text-[clamp(36px,5vw,60px)] font-bold text-[#1a1612] leading-[1.08] mb-3.5">
                                Our <em className="italic text-[#e8a020]">Menu</em>
                            </h2>
                            <p className="text-base text-[rgba(26,22,18,0.65)] font-light max-w-[440px] mx-auto leading-[1.7]">
                                Authentic Tamil flavours crafted with tradition — for every occasion and every palate.
                            </p>
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#e8a020] to-transparent mt-5 mx-auto" />
                        </div>
                    </ScrollReveal>

                    {loading ? (
                        /* Skeleton state */
                        <div>
                            <div className="flex justify-center gap-2 mb-12 flex-wrap">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-24 h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:600px_100%] animate-[ms-shimmer_1.6s_ease-in-out_infinite] rounded-xl" />
                                ))}
                            </div>
                            <div className="h-[220px] rounded-[20px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:600px_100%] animate-[ms-shimmer_1.6s_ease-in-out_infinite] mb-9" />
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-[130px] rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:600px_100%] animate-[ms-shimmer_1.6s_ease-in-out_infinite]" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Category tabs ── */}
                            <ScrollReveal variant="fadeIn">
                                <div className="flex justify-center gap-2 flex-wrap mb-12">
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            className={`px-[22px] py-[9px] rounded-full border font-['DM_Sans'] text-[13.5px] font-medium cursor-pointer transition-all duration-250 tracking-[0.03em] ${
                                                activeCategory === cat._id
                                                    ? 'bg-gradient-to-br from-[#b87a10] to-[#e8a020] border-transparent text-white font-semibold shadow-[0_4px_16px_rgba(232,160,32,0.3)]'
                                                    : 'border-[rgba(26,22,18,0.15)] bg-transparent text-[rgba(26,22,18,0.55)] hover:text-[#1a1612] hover:border-[rgba(26,22,18,0.3)]'
                                            }`}
                                            onClick={() => setActiveCategory(cat._id)}
                                        >
                                            {getLabel((cat as any).nameTranslations, cat.name)}
                                        </button>
                                    ))}
                                </div>
                            </ScrollReveal>

                            {/* ── Active category ── */}
                            {activeCat && (
                                <div key={activeCategory} className="ms-fade">
                                    {/* Banner */}
                                    {activeCat.image && (
                                        <div className="relative rounded-[20px] overflow-hidden h-[220px] mb-9 border border-[rgba(26,22,18,0.1)] group md:h-[180px] max-[480px]:h-[160px]">
                                            <img 
                                                src={activeCat.image} 
                                                alt={activeCat.name}
                                                className="w-full h-full object-cover transition-transform duration-[6000ms] linear scale-[1.04] group-hover:scale-100"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,8,6,0.85)] via-[rgba(10,8,6,0.4)] via-60% to-[rgba(10,8,6,0.1)]" />
                                            <div className="absolute left-8 bottom-7 md:left-5 md:bottom-[18px]">
                                                <h3 className="font-['Playfair_Display'] text-[32px] font-bold text-[#f5efe4] leading-[1.1] mb-1.5 md:text-2xl">
                                                    {getLabel((activeCat as any).nameTranslations, activeCat.name)}
                                                </h3>
                                                {((activeCat as any).descriptionTranslations || activeCat.description) && (
                                                    <p className="text-[13.5px] text-[rgba(240,236,228,0.6)] font-light max-w-[460px] leading-[1.6]">
                                                        {getLabel((activeCat as any).descriptionTranslations, activeCat.description)}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="absolute right-6 top-5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1 text-[11px] text-[rgba(240,236,228,0.6)] tracking-[0.08em]">
                                                {activeCat.items.length} {activeCat.items.length === 1 ? 'dish' : 'dishes'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Dish grid */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {activeCat.items.map((item, i) => (
                                            <button
                                                key={item._id || i}
                                                className="ms-card group relative bg-white border border-[rgba(26,22,18,0.12)] rounded-2xl overflow-hidden cursor-pointer h-[130px] flex items-stretch transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] text-left hover:-translate-y-1 hover:border-[rgba(232,160,32,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(232,160,32,0.12)] max-[480px]:h-[110px]"
                                                onClick={() => setSelectedItem(item)}
                                                style={{ animationDelay: `${i * 0.07}s` }}
                                            >
                                                {/* Chevron image */}
                                                {item.image ? (
                                                    <div className="ms-card-chevron relative w-[38%] flex-shrink-0 overflow-hidden">
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-full h-full object-cover block group-hover:scale-105"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="ms-card-chevron-placeholder w-[38%] flex-shrink-0 flex items-center justify-center bg-[rgba(232,160,32,0.08)] text-[32px]">
                                                        🍽️
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 px-[18px] pl-3.5 py-4 pb-3.5 flex flex-col justify-center min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-dashed border-[rgba(232,160,32,0.25)] mb-2 transition-colors duration-250 group-hover:border-[rgba(232,160,32,0.55)]">
                                                        <span className="font-['Playfair_Display'] text-base font-semibold text-[#1a1612] leading-[1.2] transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#e8a020] max-[480px]:text-sm">
                                                            {getLabel((item as any).nameTranslations, item.name)}
                                                        </span>
                                                        <div className="flex gap-[5px] flex-shrink-0 items-center">
                                                            {item.isVeg && (
                                                                <span className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-[3px] rounded-full bg-green-400/10 border border-green-400/25 text-green-400">
                                                                    Veg
                                                                </span>
                                                            )}
                                                            {item.spiceLevel && item.spiceLevel > 0 && (
                                                                <span className="text-[11px]">
                                                                    {'🌶️'.repeat(Math.min(item.spiceLevel, 3))}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {((item as any).descriptionTranslations || item.description) && (
                                                        <p className="text-xs text-[rgba(26,22,18,0.5)] leading-[1.55] font-light line-clamp-2 mb-2 flex-1">
                                                            {getLabel((item as any).descriptionTranslations, item.description)}
                                                        </p>
                                                    )}
                                                    <span className="text-[11px] text-[rgba(232,160,32,0.5)] font-medium tracking-[0.08em] uppercase inline-flex items-center gap-1 transition-all duration-200 group-hover:text-[#e8a020] group-hover:gap-[7px]">
                                                        View details
                                                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── View full menu CTA ── */}
                            {showViewMore && (
                                <ScrollReveal variant="fadeUp">
                                    <div className="text-center mt-14">
                                        <Link 
                                            to="/menu" 
                                            className="inline-flex items-center gap-2.5 px-9 py-3.5 rounded-lg bg-gradient-to-br from-[#b87a10] to-[#e8a020] text-[#0c0a08] font-['DM_Sans'] text-[15px] font-semibold no-underline transition-all duration-200 shadow-[0_4px_24px_rgba(232,160,32,0.3)] border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(232,160,32,0.5)]"
                                        >
                                            {t('home.viewFullMenu', 'View Full Menu')}
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            )}
                        </>
                    )}
                </div>

                {/* Item modal */}
                <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            </section>
        </>
    );
}