import { useState, useEffect } from 'react';
import { api } from '../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

// ─── Hover Popup (follows cursor) ─────────────────────────────────────────────
function HoverPopup({ item, pos, visible }: {
    item: MenuItem | null;
    pos: { x: number; y: number };
    visible: boolean;
}) {
    if (!item) return null;

    // Smart edge detection: flip popup to left if near right edge
    const flipLeft = typeof window !== 'undefined' && pos.x + 320 > window.innerWidth;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'fixed',
                        left: flipLeft ? pos.x - 300 : pos.x + 20,
                        top: Math.min(pos.y - 10, (typeof window !== 'undefined' ? window.innerHeight : 800) - 340),
                        zIndex: 9999,
                        pointerEvents: 'none',
                        width: 280,
                        background: '#fff',
                        borderRadius: 18,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.16), 0 0 0 1px rgba(232,160,32,0.22)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Image */}
                    {item.image ? (
                        <div style={{ height: 155, overflow: 'hidden', position: 'relative' }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(255,250,240,0.75) 0%, transparent 55%)',
                            }} />
                            {/* Badges */}
                            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
                                {item.isVeg && (
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                                        textTransform: 'uppercase', padding: '3px 8px', borderRadius: 100,
                                        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)',
                                        color: '#16a34a', backdropFilter: 'blur(4px)',
                                    }}>Veg</span>
                                )}
                                {item.spiceLevel && item.spiceLevel > 0 && (
                                    <span style={{
                                        fontSize: 12, padding: '3px 7px', borderRadius: 100,
                                        background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)',
                                    }}>{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            height: 90, background: '#faf7f2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                        }}>🍽️</div>
                    )}

                    {/* Text */}
                    <div style={{ padding: '14px 16px 16px' }}>
                        <p style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 16, fontWeight: 700,
                            color: '#1a1209', marginBottom: 7, lineHeight: 1.2,
                        }}>
                            {item.name}
                        </p>
                        <p style={{
                            fontSize: 12.5, color: '#7a6e60', lineHeight: 1.65,
                            fontWeight: 300, margin: 0,
                        }}>
                            {item.description || 'A delicious dish crafted with authentic Tamil spices and the freshest ingredients.'}
                        </p>
                        {/* CTA hint */}
                        <div style={{
                            marginTop: 12, paddingTop: 10,
                            borderTop: '1px solid rgba(232,160,32,0.15)',
                            display: 'flex', alignItems: 'center', gap: 7,
                            fontSize: 10.5, color: '#c97a10', fontWeight: 600,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            <span style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'rgba(232,160,32,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10,
                            }}>↗</span>
                            Click to expand
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Click Modal ──────────────────────────────────────────────────────────────
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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16, background: 'rgba(26,18,9,0.6)', backdropFilter: 'blur(10px)',
                }}
                onClick={onClose}
                role="dialog" aria-modal="true"
            >
                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 28, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background: '#fff',
                        border: '1px solid rgba(232,160,32,0.2)',
                        borderRadius: 24, maxWidth: 440, width: '100%',
                        overflow: 'hidden',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {item.image && (
                        <div style={{ height: 230, overflow: 'hidden', position: 'relative' }}>
                            <img src={item.image} alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(255,250,240,0.8) 0%, transparent 50%)',
                            }} />
                        </div>
                    )}
                    <div style={{ padding: '28px 28px 26px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 26, fontWeight: 700, color: '#1a1209', lineHeight: 1.15,
                            }}>
                                {item.name}
                            </h3>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 4 }}>
                                {item.isVeg && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100,
                                        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                                        color: '#16a34a',
                                    }}>Veg</span>
                                )}
                                {item.spiceLevel && item.spiceLevel > 0 && (
                                    <span style={{ fontSize: 15 }}>{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: 14.5, color: '#6b5a3a', lineHeight: 1.75, fontWeight: 300 }}>
                            {item.description || 'A delicious dish crafted with authentic Tamil spices and the freshest ingredients.'}
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                marginTop: 24, width: '100%', padding: 13,
                                borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #b87a10, #e8a020)',
                                color: '#fff', fontFamily: "'DM Sans', sans-serif",
                                fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
                                boxShadow: '0 4px 16px rgba(232,160,32,0.35)',
                                transition: 'filter 0.2s, transform 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                            onMouseLeave={e => (e.currentTarget.style.filter = '')}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Dish Card ────────────────────────────────────────────────────────────────
function DishCard({ item, onClick, index, onHover, onLeave }: {
    item: MenuItem;
    onClick: () => void;
    index: number;
    onHover: (item: MenuItem, e: React.MouseEvent) => void;
    onLeave: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            onMouseEnter={e => { setHovered(true); onHover(item, e); }}
            onMouseMove={e => onHover(item, e)}
            onMouseLeave={() => { setHovered(false); onLeave(); }}
            style={{
                position: 'relative',
                background: '#fff',
                border: `1px solid ${hovered ? 'rgba(232,160,32,0.45)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                height: 130,
                display: 'flex',
                alignItems: 'stretch',
                textAlign: 'left',
                width: '100%',
                boxShadow: hovered
                    ? '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(232,160,32,0.15)'
                    : '0 2px 10px rgba(0,0,0,0.05)',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s',
            }}
        >
            {/* Chevron image */}
            {item.image ? (
                <div style={{ position: 'relative', width: '38%', flexShrink: 0, overflow: 'hidden' }}>
                    <img
                        src={item.image}
                        alt={item.name}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                            clipPath: hovered
                                ? 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%)'
                                : 'polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%)',
                            transform: hovered ? 'scale(1.06)' : 'scale(1)',
                            filter: hovered ? 'brightness(1.05)' : 'brightness(0.92) saturate(0.88)',
                            transition: 'clip-path 0.38s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1), filter 0.3s',
                        }}
                    />
                </div>
            ) : (
                <div style={{
                    width: '38%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hovered ? 'rgba(232,160,32,0.1)' : '#faf7f2', fontSize: 32,
                    clipPath: hovered
                        ? 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%)'
                        : 'polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%)',
                    transition: 'clip-path 0.38s cubic-bezier(0.22,1,0.36,1), background 0.3s',
                }}>🍽️</div>
            )}

            {/* Content */}
            <div style={{
                flex: 1, padding: '14px 16px 14px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0,
            }}>
                <div style={{
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
                    paddingBottom: 8,
                    borderBottom: `1px dashed ${hovered ? 'rgba(232,160,32,0.7)' : 'rgba(232,160,32,0.3)'}`,
                    marginBottom: 8,
                    transition: 'border-color 0.25s',
                }}>
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 16, fontWeight: 600,
                        color: hovered ? '#b87a10' : '#1a1209',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color 0.2s',
                    }}>
                        {item.name}
                    </span>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                        {item.isVeg && (
                            <span style={{
                                fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                                padding: '3px 8px', borderRadius: 100,
                                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                                color: '#16a34a',
                            }}>Veg</span>
                        )}
                        {item.spiceLevel && item.spiceLevel > 0 && (
                            <span style={{ fontSize: 11 }}>{'🌶️'.repeat(Math.min(item.spiceLevel, 3))}</span>
                        )}
                    </div>
                </div>

                {item.description && (
                    <p style={{
                        fontSize: 12, color: '#9a8c78', lineHeight: 1.55, fontWeight: 300, flex: 1, marginBottom: 8,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {item.description}
                    </p>
                )}

                <span style={{
                    fontSize: 11, color: hovered ? '#c97a10' : 'rgba(201,122,16,0.5)',
                    fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                    display: 'inline-flex', alignItems: 'center', gap: hovered ? 7 : 4,
                    transition: 'color 0.2s, gap 0.2s',
                }}>
                    View details
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </div>
        </motion.button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const MenuPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const [popupVisible, setPopupVisible] = useState(false);
    const { t } = useTranslation();

    const handleCardHover = (item: MenuItem, e: React.MouseEvent) => {
        setHoveredItem(item);
        setPopupPos({ x: e.clientX, y: e.clientY });
        setPopupVisible(true);
    };
    const handleCardLeave = () => {
        setPopupVisible(false);
        setTimeout(() => setHoveredItem(null), 220);
    };

    useEffect(() => {
        Promise.all([
            api.get('/menu/categories').then(r => r.data).catch(() => []),
            api.get('/menu/items').then(r => r.data).catch(() => []),
        ]).then(([cats, items]) => {
            const catArr: any[] = Array.isArray(cats) ? cats : cats?.data || [];
            const itemArr: any[] = Array.isArray(items) ? items : items?.data || [];
            if (catArr.length > 0) {
                const built: Category[] = catArr.map((cat: any) => ({
                    _id: cat._id, name: cat.name, image: cat.image, description: cat.description,
                    items: itemArr.filter((item: any) =>
                        item.categoryId === cat._id || item.categoryId?._id === cat._id
                    ),
                }));
                setCategories(built);
            } else {
                setCategories([{ _id: 'all', name: 'All Items', items: itemArr }]);
            }
        }).finally(() => setLoading(false));
    }, []);

    const allItems: MenuItem[] = categories.flatMap(c => c.items);
    const displayedItems = activeCategory === null
        ? allItems
        : categories.find(c => c._id === activeCategory)?.items || [];
    const activeCatData = categories.find(c => c._id === activeCategory);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

                .mp-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #ffffff; color: #1a1209; }

                .mp-hero { position: relative; background: #0a0806; padding: 120px 24px 80px; text-align: center; overflow: hidden; }
                .mp-hero-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 700px; height: 380px; background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.11) 0%, transparent 70%); pointer-events: none; }
                .mp-hero-grain { position: absolute; inset: 0; opacity: 0.03; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }
                .mp-hero-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to bottom, transparent, #ffffff); pointer-events: none; }
                .mp-eyebrow { font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #e8a020; font-weight: 600; margin-bottom: 16px; display: block; position: relative; }
                .mp-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(44px, 7vw, 80px); font-weight: 700; line-height: 1.06; color: #f5efe4; margin-bottom: 16px; position: relative; }
                .mp-hero-title em { font-style: italic; color: #e8a020; }
                .mp-hero-sub { font-size: 16px; color: rgba(240,236,228,0.5); font-weight: 300; max-width: 480px; margin: 0 auto; line-height: 1.75; position: relative; }
                .mp-divider { width: 52px; height: 1px; background: linear-gradient(90deg, transparent, #e8a020, transparent); margin: 22px auto 0; position: relative; }

                .mp-body { max-width: 1200px; margin: 0 auto; padding: 52px 24px 96px; }

                .mp-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
                .mp-tab { padding: 9px 22px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1); background: #fff; color: #6b5a3a; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.25s; letter-spacing: 0.03em; white-space: nowrap; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
                .mp-tab:hover { color: #1a1209; border-color: rgba(232,160,32,0.5); background: rgba(232,160,32,0.05); }
                .mp-tab.active { background: linear-gradient(135deg, #b87a10, #e8a020); border-color: transparent; color: #fff; font-weight: 600; box-shadow: 0 4px 16px rgba(232,160,32,0.3); }

                .mp-cat-banner { position: relative; border-radius: 20px; overflow: hidden; height: 220px; margin-bottom: 36px; border: 1px solid rgba(232,160,32,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
                .mp-cat-banner img { width: 100%; height: 100%; object-fit: cover; transition: transform 6s linear; transform: scale(1.04); display: block; }
                .mp-cat-banner:hover img { transform: scale(1); }
                .mp-cat-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.4) 60%, rgba(10,8,6,0.1) 100%); }
                .mp-cat-text { position: absolute; left: 32px; bottom: 28px; }
                .mp-cat-name { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f5efe4; line-height: 1.1; margin-bottom: 6px; }
                .mp-cat-desc { font-size: 13.5px; color: rgba(240,236,228,0.65); font-weight: 300; max-width: 460px; line-height: 1.6; }
                .mp-cat-count { position: absolute; right: 24px; top: 20px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; padding: 5px 14px; font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 0.08em; }

                .mp-count-row { display: flex; align-items: center; margin-bottom: 20px; }
                .mp-count-label { font-size: 12px; color: #b8a898; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; white-space: nowrap; }
                .mp-count-line { flex: 1; height: 1px; background: rgba(0,0,0,0.06); margin-left: 16px; }

                .mp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

                .mp-empty { grid-column: 1 / -1; text-align: center; padding: 80px 24px; }
                .mp-empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.4; }
                .mp-empty-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1a1209; margin-bottom: 8px; }
                .mp-empty-sub { font-size: 14px; color: #9a8c78; font-weight: 300; }

                @keyframes mpShimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
                .mp-skeleton { background: linear-gradient(90deg, #f5f5f5 0%, #ebebeb 50%, #f5f5f5 100%); background-size: 600px 100%; animation: mpShimmer 1.6s ease-in-out infinite; border-radius: 12px; }

                @media (max-width: 680px) {
                    .mp-grid { grid-template-columns: 1fr; }
                    .mp-cat-banner { height: 170px; }
                    .mp-cat-text { left: 20px; bottom: 18px; }
                    .mp-cat-name { font-size: 22px; }
                }
            `}</style>

            <div className="mp-root">
                {/* Hero */}
                <div className="mp-hero">
                    <div className="mp-hero-glow" />
                    <div className="mp-hero-grain" />
                    <div className="mp-hero-bottom" />
                    <span className="mp-eyebrow">Tamil Food Thaya</span>
                    <h1 className="mp-hero-title">
                        {t('menu.title', 'Our')} <em>{t('menu.titleHighlight', 'Kitchen')}</em>
                    </h1>
                    <p className="mp-hero-sub">
                        {t('menu.subtitle', 'Explore authentic Tamil flavours crafted with passion and tradition.')}
                    </p>
                    <div className="mp-divider" />
                </div>

                {/* Body */}
                <div className="mp-body">
                    {loading ? (
                        <>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
                                {[1,2,3,4,5].map(i => <div key={i} className="mp-skeleton" style={{ width: 90, height: 38 }} />)}
                            </div>
                            <div className="mp-skeleton" style={{ height: 220, borderRadius: 20, marginBottom: 36 }} />
                            <div className="mp-grid">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="mp-skeleton" style={{ height: 130, borderRadius: 16 }} />)}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="mp-tabs">
                                <button className={`mp-tab${activeCategory === null ? ' active' : ''}`} onClick={() => setActiveCategory(null)}>
                                    {t('menu.all', 'All Dishes')}
                                </button>
                                {categories.map(cat => (
                                    <button key={cat._id} className={`mp-tab${activeCategory === cat._id ? ' active' : ''}`} onClick={() => setActiveCategory(cat._id)}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Category banner */}
                            <AnimatePresence mode="wait">
                                {activeCatData?.image && (
                                    <motion.div key={activeCategory} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="mp-cat-banner">
                                        <img src={activeCatData.image} alt={activeCatData.name} />
                                        <div className="mp-cat-overlay" />
                                        <div className="mp-cat-text">
                                            <p className="mp-cat-name">{activeCatData.name}</p>
                                            {activeCatData.description && <p className="mp-cat-desc">{activeCatData.description}</p>}
                                        </div>
                                        <span className="mp-cat-count">{activeCatData.items.length} {activeCatData.items.length === 1 ? 'dish' : 'dishes'}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Count row */}
                            <div className="mp-count-row">
                                <span className="mp-count-label">{displayedItems.length} {displayedItems.length === 1 ? 'dish' : 'dishes'}{activeCategory === null ? ' total' : ` in ${activeCatData?.name || ''}`}</span>
                                <div className="mp-count-line" />
                            </div>

                            {/* Grid */}
                            <div className="mp-grid">
                                <AnimatePresence mode="popLayout">
                                    {displayedItems.length > 0 ? (
                                        displayedItems.map((item, i) => (
                                            <DishCard key={item._id} item={item} index={i} onClick={() => setSelectedItem(item)} onHover={handleCardHover} onLeave={handleCardLeave} />
                                        ))
                                    ) : (
                                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mp-empty">
                                            <div className="mp-empty-icon">🍽️</div>
                                            <p className="mp-empty-title">Menu coming soon</p>
                                            <p className="mp-empty-sub">Check back soon or contact us directly.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cursor-following hover popup */}
            <HoverPopup item={hoveredItem} pos={popupPos} visible={popupVisible} />

            {/* Click-to-expand modal */}
            <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </>
    );
};