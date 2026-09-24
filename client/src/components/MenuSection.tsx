import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../hooks/useApi';
import ScrollReveal from './ScrollReveal';
import FluidBackground from './FluidBackground';

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

export const FALLBACK_CATEGORIES: Category[] = [
  {
    _id: 'breakfast',
    name: 'Tamil breakfast',
    image: '/hero-catering.jpg',
    description: 'Soft idli, crisp dosai, pongal, sambar, and fresh chutneys.',
    items: [
      { _id: 'idli', name: 'Idli sambar', description: 'Steamed rice cakes with sambar and coconut chutney.', isVeg: true },
      { _id: 'dosa', name: 'Masala dosai', description: 'Crisp fermented crepe with potato masala and chutneys.', isVeg: true, spiceLevel: 1 },
      { _id: 'pongal', name: 'Ven pongal', description: 'Rice and lentils finished with pepper, cumin, ghee, and cashew.', isVeg: true },
    ],
  },
  {
    _id: 'mains',
    name: 'Rice meals and curries',
    image: '/hero-catering2.jpg',
    description: 'Hearty lunch and dinner plates built around rice, rasam, sambar, and curry.',
    items: [
      { _id: 'thali', name: 'Tamil meals', description: 'Rice, sambar, rasam, poriyal, kootu, appalam, and pickle.', isVeg: true },
      { _id: 'biryani', name: 'Chicken biryani', description: 'Fragrant rice layered with masala, herbs, and tender chicken.', spiceLevel: 2 },
      { _id: 'chettinad', name: 'Chettinad curry', description: 'Deep peppery curry with roasted spices and curry leaves.', spiceLevel: 3 },
    ],
  },
  {
    _id: 'snacks',
    name: 'Snacks and sweets',
    image: '/hero-catering.jpg',
    description: 'Starters, street snacks, and traditional sweet finishes.',
    items: [
      { _id: 'vada', name: 'Medhu vadai', description: 'Crisp lentil fritters served with chutney and sambar.', isVeg: true },
      { _id: 'pakoda', name: 'Onion pakoda', description: 'Golden onion fritters with chilli, curry leaf, and gram flour.', isVeg: true, spiceLevel: 1 },
      { _id: 'payasam', name: 'Payasam', description: 'Creamy milk pudding with cardamom, cashew, raisins, and jaggery.', isVeg: true },
    ],
  },
];

const getLabel = (translations: any, fallback: string | undefined, lang: string) =>
  translations?.[lang] || translations?.nl || fallback || '';

export const localizeFallbackCategories = (t: (key: string, defaultValue: string) => string): Category[] =>
  FALLBACK_CATEGORIES.map((cat) => ({
    ...cat,
    name: t(`menuPreview.fallback.cat.${cat._id}.name`, cat.name),
    description: t(`menuPreview.fallback.cat.${cat._id}.description`, cat.description || ''),
    items: cat.items.map((item) => ({
      ...item,
      name: t(`menuPreview.fallback.item.${item._id}.name`, item.name),
      description: item.description ? t(`menuPreview.fallback.item.${item._id}.description`, item.description) : undefined,
    })),
  }));

export default function MenuSection({ showViewMore = true }: { showViewMore?: boolean }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'nl';
const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedItem) return;
    const previous = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedItem(null);
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusables = modalRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [selectedItem]);

  useEffect(() => {
    Promise.all([
      api.get('/menu/categories').then((r) => r.data).catch(() => []),
      api.get('/menu/items').then((r) => r.data).catch(() => []),
    ]).then(([cats, items]) => {
      const catArr: any[] = Array.isArray(cats) ? cats : cats?.data || [];
      const itemArr: any[] = Array.isArray(items) ? items : items?.data || [];
      if (catArr.length > 0) {
        const built = catArr.map((cat: any) => ({
          _id: cat._id,
          name: cat.name,
          image: cat.image,
          description: cat.description,
          items: itemArr.filter((item: any) => item.categoryId === cat._id || item.categoryId?._id === cat._id),
        }));
        setCategories(built);
        setActiveCategory(built[0]?._id || '');
      } else {
        setCategories(localizeFallbackCategories(t));
        setActiveCategory(FALLBACK_CATEGORIES[0]._id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const activeCat = categories.find((category) => category._id === activeCategory);

  return (
    <section id="our_menu" className="section menu-preview">
      <FluidBackground intensity={0.4} parallaxStrength={5} deepParallax={9} />
      <div className="container">
        <div className="section-heading split">
<div>
            <h2 className="section-title">{t('menuPreview.title')}</h2>
          </div>
          <p className="lead">{t('menuPreview.lead')}</p>
        </div>

        {loading ? (
          <div className="menu-loading">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <div className="menu-tabs" role="tablist" aria-label={t('menuPreview.categories')}>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={activeCategory === cat._id ? 'active' : ''}
                  onClick={() => setActiveCategory(cat._id)}
                >
                  {getLabel((cat as any).nameTranslations, cat.name, currentLang)}
                </button>
              ))}
            </div>

            {activeCat && (
              <div className="menu-feature-grid">
                <ScrollReveal variant="fadeUp">
                  <article className="menu-category-panel">
                    <img
                      src={activeCat.image || FALLBACK_CATEGORIES[0].image}
                      alt={getLabel((activeCat as any).nameTranslations, activeCat.name, currentLang)}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.src = FALLBACK_CATEGORIES[0].image || ''; }}
                    />
                    <div>
                      <h3>{getLabel((activeCat as any).nameTranslations, activeCat.name, currentLang)}</h3>
                      {activeCat.description && <p>{getLabel((activeCat as any).descriptionTranslations, activeCat.description, currentLang)}</p>}
                    </div>
                  </article>
                </ScrollReveal>

                <div className="dish-list">
                  {activeCat.items.map((item) => (
                    <button key={item._id} type="button" className="dish-row" onClick={() => setSelectedItem(item)}>
                      <span className="dish-row__name">{getLabel((item as any).nameTranslations, item.name, currentLang)}</span>
                      <span className="dish-row__copy">{getLabel((item as any).descriptionTranslations, item.description, currentLang)}</span>
                      <span className="dish-row__meta">
                        {item.isVeg && <span><Leaf size={14} /> {t('common.veg')}</span>}
                        {!!item.spiceLevel && <span><Flame size={14} /> {t('common.spice')} {item.spiceLevel}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showViewMore && (
              <div className="section-cta">
                <Link to="/menu" className="btn-primary">
                  {t('menuPreview.viewFull')}
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </>
        )}

        {selectedItem && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSelectedItem(null)}>
            <div className="dish-modal" ref={modalRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
              {selectedItem.image && <img src={selectedItem.image} alt={selectedItem.name} />}
              <div>
                <h3>{getLabel((selectedItem as any).nameTranslations, selectedItem.name, currentLang)}</h3>
                <p>{getLabel((selectedItem as any).descriptionTranslations, selectedItem.description, currentLang) || t('menuPage.fallbackDesc')}</p>
                <button type="button" className="btn-ink" onClick={() => setSelectedItem(null)}>{t('menuPreview.close')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
