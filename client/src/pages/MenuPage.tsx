import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Leaf, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../hooks/useApi';
import { localizeFallbackCategories } from '../components/MenuSection';
import { SEO } from '../components/SEO';
import FluidBackground from '../components/FluidBackground';
import ScrollReveal from '../components/ScrollReveal';

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
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
          items: itemArr
            .filter((item: any) => item.categoryId === cat._id || item.categoryId?._id === cat._id)
            .slice(0, 6),
        })));
      } else {
        setCategories(localizeFallbackCategories(t));
      }
    }).finally(() => setLoading(false));
  }, [t]);

  // Modal accessibility: Escape key and focus trapping
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
      previous?.focus();
    };
  }, [selectedItem]);

  const allItems = useMemo(() => {
    return categories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: getLabel((category as any).nameTranslations, category.name, currentLang),
        categoryId: category._id,
      }))
    );
  }, [categories, currentLang]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item: any) => {
      if (activeCategory !== 'all' && item.categoryId !== activeCategory) {
        return false;
      }
      if (query.trim()) {
        const itemName = getLabel((item as any).nameTranslations, item.name, currentLang);
        const itemDescription = getLabel((item as any).descriptionTranslations, item.description, currentLang);
        const text = `${itemName} ${itemDescription} ${item.categoryName}`.toLowerCase();
        if (!text.includes(query.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [activeCategory, allItems, currentLang, query]);

  const pillars = [
    {
      title: t('menuPage.pillar1Title', currentLang === 'ta' ? 'பாரம்பரிய காலை டிபன்' : currentLang === 'nl' ? 'Traditionele Tiffin' : 'Traditional Tiffin Classics'),
      copy: t('menuPage.pillar1Desc', currentLang === 'ta' ? 'மெதுவான இட்லி, மொறுமொறு தோசைகள், சாம்பார் மற்றும் தேங்காய் சட்னி.' : currentLang === 'nl' ? "Zachte idlis, goudbruine dosa's, geurige sambar en kokos-chutneys." : 'Fluffy idli, crisp golden dosa, slow-simmered sambar & fresh coconut chutneys.'),
    },
    {
      title: t('menuPage.pillar2Title', currentLang === 'ta' ? 'மணமணக்கும் குழம்புகள் & பிரியாணி' : currentLang === 'nl' ? 'Feestelijke Curries & Biryani' : 'Heritage Curries & Biryani'),
      copy: t('menuPage.pillar2Desc', currentLang === 'ta' ? 'யாழ்ப்பாண மட்டன், சிக்கன் குழம்பு மற்றும் நறுமண தம் பிரியாணி.' : currentLang === 'nl' ? 'Rijke Jaffna lamsvleescurry, malse kip kulambu en langzaam gegaarde dum biryani.' : 'Slow-cooked Jaffna mutton curry, pepper chicken & aromatic dum biryani.'),
    },
    {
      title: t('menuPage.pillar3Title', currentLang === 'ta' ? 'உணவுக்கட்டுப்பாடு & சைவ கவனம்' : currentLang === 'nl' ? 'Dieetwensen & Vegetarisch' : 'Dietary Care & Pure Veg'),
      copy: t('menuPage.pillar3Desc', currentLang === 'ta' ? 'சைவ, வீகன் மற்றும் ஹலால் விருந்தினர்களுக்கு பிரத்யேக தயாரிப்பு.' : currentLang === 'nl' ? 'Aparte bereiding en kookgerei voor vegetarische, veganistische en halal gerechten.' : 'Dedicated preparation and cookware for vegetarian, vegan, and halal dining.'),
    },
  ];

  return (
    <div className="menu-page">
      <SEO title={t('menuPage.seoTitle')} description={t('menuPage.seoDescription')} />

      {/* Hero Section: Matches ContactPage & CateringPage theme front + transparent pattern */}
      <section className="page-hero menu-hero">
        <span className="fx-aura" data-para="22" data-cur="9" aria-hidden="true" />
        <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
        <div className="container">
          <div className="catering-hero__eyebrow-badge">
            <span className="catering-hero__badge-pulse" aria-hidden="true" />
            <span>{t('menuPage.heroEyebrow', 'Kitchen & Fire — Authentic Flavours')}</span>
          </div>
          <h1 lang={currentLang} className="display catering-hero__headline">{t('menuPage.heroTitle')}</h1>
          <p lang={currentLang} className="lead catering-hero__lead">{t('menuPage.heroDesc')}</p>
          <div className="home-hero__actions">
            <Link to="/catering#packages-section" className="btn-primary">
              <span>{t('conversion.packages')}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact#inquiry" className="btn-secondary">
              <span>{t('conversion.quote')}</span>
            </Link>
          </div>
          <div className="catering-hero__trust-strip" aria-label="Menu guarantees">
            <div className="catering-hero__trust-item">
              <span className="text-amber-500 font-bold">★</span>
              <span>{currentLang === 'ta' ? 'நிகழ்வு நாளில் புதிதாக சமையல்' : currentLang === 'nl' ? 'Vers bereid op de dag zelf' : 'Freshly prepared daily'}</span>
            </div>
            <div className="catering-hero__trust-divider" aria-hidden="true" />
            <div className="catering-hero__trust-item">
              <span className="text-primary font-bold">✦</span>
              <span>{currentLang === 'ta' ? '100% ஹலால் & சுத்த சைவ உணவுகள்' : currentLang === 'nl' ? '100% Halal & puur vegetarisch' : '100% Halal & pure vegetarian'}</span>
            </div>
            <div className="catering-hero__trust-divider" aria-hidden="true" />
            <div className="catering-hero__trust-item">
              <span className="text-accent font-bold">●</span>
              <span>{currentLang === 'ta' ? 'பாரம்பரிய யாழ்ப்பாண மசாலா' : currentLang === 'nl' ? 'Traditionele Jaffna specerijen' : 'Traditional Jaffna spices'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Catalog Section */}
      <section id="menu-catalog" className="section package-section package-section--primary">
        <FluidBackground intensity={0.45} parallaxStrength={6} deepParallax={10} />
        <div className="container">
          <div className="section-heading section-heading--centered package-heading text-balance text-center">
            <div className="package-eyebrow-pill">
              <span className="text-primary font-bold">✦</span>
              <span>{t('menuPage.catalogEyebrow', 'Our Offerings · Fresh from the Hearth')}</span>
            </div>
            <h2 lang={currentLang} className="section-title">{t('menuPage.catalogTitle', 'Handcrafted dishes for every celebration')}</h2>
            <p lang={currentLang} className="lead lead--centered">{t('menuPage.catalogLead', 'Filter by category or search your favourite Tamil and Sri Lankan dishes. Available for catering spreads and custom orders.')}</p>
          </div>

          {/* Culinary Craftsmanship Pillars */}
          <div className="menu-pillars-showcase">
            <div className="menu-pillars-grid">
              {pillars.map((item, index) => (
                <div className="menu-pillar-card" key={item.title}>
                  <div className="menu-pillar-card__header">
                    <span className="menu-pillar-card__step">{`0${index + 1}`}</span>
                    <strong className="menu-pillar-card__title">{item.title}</strong>
                  </div>
                  <p className="menu-pillar-card__copy">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Toolbar: Search on left, count on right */}
          <div className="menu-toolbar">
            <label className="menu-search">
              <Search size={18} />
              <input
                type="search"
                aria-label={t('menuPage.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('menuPage.searchPlaceholder')}
              />
              {query && (
                <button
                  type="button"
                  className="menu-search__clear"
                  onClick={() => setQuery('')}
                  aria-label={t('common.clear', 'Clear')}
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <div className="menu-filter-label" role="status">
              <SlidersHorizontal size={17} />
              <span>{filteredItems.length} {t('common.dishes')}</span>
            </div>
          </div>

          {loading ? (
            <div className="package-grid package-grid--count-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="package-skeleton" />
              ))}
            </div>
          ) : (
            <>
              {/* Category Filter Tabs: Clean pills matching Home page */}
              <div className="menu-tabs" role="tablist" aria-label={t('menuPage.categories')}>
                <button
                  type="button"
                  aria-pressed={activeCategory === 'all'}
                  className={activeCategory === 'all' ? 'active' : ''}
                  onClick={() => setActiveCategory('all')}
                >
                  {t('menuPage.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    aria-pressed={activeCategory === category._id}
                    className={activeCategory === category._id ? 'active' : ''}
                    onClick={() => setActiveCategory(category._id)}
                  >
                    {getLabel((category as any).nameTranslations, category.name, currentLang)}
                  </button>
                ))}
              </div>

              {/* Bento Dish Cards Grid */}
              <div className="package-grid menu-page-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item: any) => {
                    const itemName = getLabel((item as any).nameTranslations, item.name, currentLang);
                    const itemDescription = getLabel((item as any).descriptionTranslations, item.description, currentLang);
                    return (
                      <ScrollReveal key={item._id} variant="fadeUp" className="package-grid-item">
                        <article className="package-card">
                          <div className="package-card__image">
                            <img
                              src={item.image || '/hero-catering2.jpg'}
                              alt={itemName}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.src = '/hero-catering2.jpg';
                              }}
                            />
                            <span>{item.categoryName}</span>
                          </div>

                          <div className="package-card__body">
                            <h3 lang={currentLang}>{itemName}</h3>
                            <p lang={currentLang}>{itemDescription || t('menuPage.fallbackDesc')}</p>
                            <div className="package-card__footer">
                              <div className="menu-card-meta">
                                {item.isVeg ? (
                                  <span className="menu-card-tag menu-card-tag--veg">
                                    <Leaf size={12} /> {t('common.veg', 'Veg')}
                                  </span>
                                ) : (
                                  <span className="menu-card-tag menu-card-tag--halal">
                                    ✦ Halal
                                  </span>
                                )}
                                {!!item.spiceLevel && (
                                  <span className="menu-card-tag menu-card-tag--spice" title={`Spice level ${item.spiceLevel}`}>
                                    <Flame size={12} /> {Array(item.spiceLevel).fill('🌶️').join('')}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => setSelectedItem(item)}
                              >
                                <span>{t('menuPreview.viewDetails', 'Details')}</span>
                                <ArrowRight size={17} />
                              </button>
                            </div>
                          </div>
                        </article>
                      </ScrollReveal>
                    );
                  })
                ) : (
                  <div className="empty-panel package-empty">
                    <div>
                      <h3>{t('menuPage.emptyTitle')}</h3>
                      <p>{t('menuPage.emptyDesc')}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        setQuery('');
                        setActiveCategory('all');
                      }}
                    >
                      {t('common.clear', 'Show all dishes')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Accessible Dish Detail Modal */}
      {selectedItem && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="dish-modal dish-modal--elevated"
            ref={modalRef}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dish-modal__media">
              <img
                src={selectedItem.image || '/hero-catering2.jpg'}
                alt={getLabel((selectedItem as any).nameTranslations, selectedItem.name, currentLang)}
                onError={(event) => {
                  event.currentTarget.src = '/hero-catering2.jpg';
                }}
              />
              <button
                type="button"
                className="dish-modal__close-circle"
                onClick={() => setSelectedItem(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={18} />
              </button>
            </div>
            <div className="dish-modal__body">
              <div className="dish-modal__meta-pills">
                <span className="dish-modal__category-tag">{selectedItem.categoryName}</span>
                {selectedItem.isVeg ? (
                  <span className="menu-card-tag menu-card-tag--veg"><Leaf size={12} /> {t('common.veg', 'Vegetarian')}</span>
                ) : (
                  <span className="menu-card-tag menu-card-tag--halal">✦ 100% Halal Meat</span>
                )}
                {!!selectedItem.spiceLevel && (
                  <span className="menu-card-tag menu-card-tag--spice">
                    <Flame size={12} /> {t('common.spice', 'Spice')} {Array(selectedItem.spiceLevel).fill('🌶️').join('')}
                  </span>
                )}
              </div>
              <h3 lang={currentLang}>{getLabel((selectedItem as any).nameTranslations, selectedItem.name, currentLang)}</h3>
              <p lang={currentLang}>{getLabel((selectedItem as any).descriptionTranslations, selectedItem.description, currentLang) || t('menuPage.fallbackDesc')}</p>
              <div className="dish-modal__actions">
                <Link
                  to="/contact#inquiry"
                  className="btn-primary"
                  onClick={() => setSelectedItem(null)}
                >
                  <span>{t('conversion.quote')}</span>
                  <ArrowRight size={18} />
                </Link>
                <button type="button" className="btn-secondary" onClick={() => setSelectedItem(null)}>
                  <span>{t('menuPreview.close', 'Close')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
