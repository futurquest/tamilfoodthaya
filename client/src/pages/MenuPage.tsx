import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../hooks/useApi';
import { localizeFallbackCategories } from '../components/MenuSection';
import { SEO } from '../components/SEO';
import FluidBackground from '../components/FluidBackground';

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

const getLabel = (translations: any, fallback: string | undefined, lang: string) =>
  translations?.[lang] || translations?.nl || fallback || '';

export const MenuPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'nl';
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/menu/categories').then((r) => r.data).catch(() => []),
      api.get('/menu/items').then((r) => r.data).catch(() => []),
    ]).then(([cats, items]) => {
      const catArr: any[] = Array.isArray(cats) ? cats : cats?.data || [];
      const itemArr: any[] = Array.isArray(items) ? items : items?.data || [];
      if (catArr.length > 0) {
        setCategories(catArr.map((cat: any) => ({
          _id: cat._id,
          name: cat.name,
          image: cat.image,
          description: cat.description,
          items: itemArr.filter((item: any) => item.categoryId === cat._id || item.categoryId?._id === cat._id),
        })));
      } else {
        setCategories(localizeFallbackCategories(t));
      }
    }).finally(() => setLoading(false));
  }, []);

  const allItems = categories.flatMap((category) => category.items.map((item) => ({ ...item, categoryName: getLabel((category as any).nameTranslations, category.name, currentLang) })));
  const filteredItems = useMemo(() => {
    const pool = activeCategory === 'all'
      ? allItems
      : allItems.filter((item: any) => categories.find((cat) => cat._id === activeCategory && getLabel((cat as any).nameTranslations, cat.name, currentLang) === item.categoryName));
    return pool.filter((item) => {
      const itemName = getLabel((item as any).nameTranslations, item.name, currentLang);
      const itemDescription = getLabel((item as any).descriptionTranslations, item.description, currentLang);
      return `${itemName} ${itemDescription}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [activeCategory, allItems, categories, currentLang, query]);

  return (
    <div className="menu-page">
      <SEO title={t('menuPage.seoTitle')} description={t('menuPage.seoDescription')} />
      <section className="page-hero">
        <span className="fx-aura" data-para="22" data-cur="9" aria-hidden="true" />
        <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
        <div className="container">
          <h1>{t('menuPage.heroTitle')}</h1>
          <p>{t('menuPage.heroDesc')}</p>
          <div className="home-hero__actions"><Link to="/catering#packages-section" className="btn-primary">{t('conversion.packages')}</Link><Link to="/contact#inquiry" className="btn-secondary">{t('conversion.quote')}</Link></div>
        </div>
      </section>

      <section className="section menu-browser">
        <FluidBackground intensity={0.4} parallaxStrength={5} deepParallax={9} />
        <div className="container">
          <div className="menu-toolbar">
            <label className="menu-search">
              <Search size={18} />
              <input type="search" aria-label={t('menuPage.searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('menuPage.searchPlaceholder')} />
            </label>
            <div className="menu-filter-label" role="status">
              <SlidersHorizontal size={18} />
              {filteredItems.length} {t('common.dishes')}
            </div>
          </div>

          {loading ? (
            <div className="menu-loading"><span /><span /><span /></div>
          ) : (
            <>
              <div className="menu-tabs" role="group" aria-label={t('menuPage.categories')}>
                <button type="button" aria-pressed={activeCategory === 'all'} className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>{t('menuPage.all')}</button>
                {categories.map((category) => (
                  <button key={category._id} type="button" aria-pressed={activeCategory === category._id} className={activeCategory === category._id ? 'active' : ''} onClick={() => setActiveCategory(category._id)}>
                    {getLabel((category as any).nameTranslations, category.name, currentLang)}
                  </button>
                ))}
              </div>

              <div className="menu-page-grid">
                {filteredItems.length > 0 ? filteredItems.map((item: any) => {
                  const itemName = getLabel((item as any).nameTranslations, item.name, currentLang);
                  const itemDescription = getLabel((item as any).descriptionTranslations, item.description, currentLang);
                  return (
                  <article className="menu-page-card" key={item._id}>
                    <img
                      src={item.image || '/hero-catering2.jpg'}
                      alt={itemName}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.src = '/hero-catering2.jpg'; }}
                    />
                    <div>
                      <span>{item.categoryName}</span>
                      <h2>{itemName}</h2>
                      <p>{itemDescription || t('menuPage.fallbackDesc')}</p>
                      <div className="menu-page-card__meta">
                        {item.isVeg && <strong>{t('common.veg')}</strong>}
                        {!!item.spiceLevel && <strong>{t('common.spice')} {item.spiceLevel}</strong>}
                      </div>
                    </div>
                  </article>
                  );
                }) : (
                  <div className="empty-panel">
                    <h3>{t('menuPage.emptyTitle')}</h3>
                    <p>{t('menuPage.emptyDesc')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
