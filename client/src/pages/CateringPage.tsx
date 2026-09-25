import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Sparkles, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCateringPackages } from '../hooks/useApi';
import { SEO } from '../components/SEO';
import AddonsSection from '../components/AddonsSection';
import ScrollReveal from '../components/ScrollReveal';
import FluidBackground from '../components/FluidBackground';
import EventGallery from '../components/EventGallery';

interface CateringPackageData {
  _id: string;
  name: string | { en: string; ta?: string; nl?: string };
  description: string | { en: string; ta?: string; nl?: string };
  basePrice: number;
  minGuests: number;
  maxGuests?: number;
  image?: string;
  pricingModel?: string;
  durationHours?: number;
  available: boolean;
}

const PLACEHOLDER_IMG = '/hero-catering2.jpg';

function getLabel(val: string | { nl?: string; en: string; ta?: string } | undefined, lang: string, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  return (val as any)[lang] || val.nl || val.en || fallback;
}

export const CateringPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [packages, setPackages] = useState<CateringPackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language?.split('-')[0] || 'nl';
  const featuredPackage = packages[0];

  useEffect(() => {
    getCateringPackages()
      .then((data: any) => {
        if (Array.isArray(data)) setPackages(data);
        else if (Array.isArray(data?.packages)) setPackages(data.packages);
        else if (Array.isArray(data?.data)) setPackages(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const process = [
    { icon: <MessageSquareText size={22} />, title: t('catering2.process.0.0'), copy: t('catering2.process.0.1') },
    { icon: <Sparkles size={22} />, title: t('catering2.process.1.0'), copy: t('catering2.process.1.1') },
    { icon: <CheckCircle2 size={22} />, title: t('catering2.process.2.0'), copy: t('catering2.process.2.1') },
  ];

  return (
    <div className="catering-page">
      <SEO title={t('catering2.seoTitle')} description={t('catering2.seoDescription')} />

      <section className="page-hero catering-hero catering-hero--packages">
        <span className="fx-aura fx-aura--right" data-para="22" data-cur="10" aria-hidden="true" />
        <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
        <div className="container catering-hero__grid">
          <div className="catering-hero__content">
            <div className="catering-hero__eyebrow-badge">
              <span className="catering-hero__badge-pulse" aria-hidden="true" />
              <span>{t('catering2.heroEyebrow', 'Kitchen & Fire — Catering')}</span>
            </div>
            <h1 lang={currentLang} className="display catering-hero__headline">{t('catering2.heroTitle')}</h1>
            <p lang={currentLang} className="lead catering-hero__lead">{t('catering2.heroLead')}</p>
            <div className="home-hero__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}
              >
                <span>{t('catering2.viewPackages')}</span>
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/contact#inquiry')}>
                <span>{t('catering2.requestGuidance')}</span>
              </button>
            </div>
            <div className="catering-hero__trust-strip" aria-label="Catering guarantees">
              <div className="catering-hero__trust-item">
                <span className="text-amber-500 font-bold">★</span>
                <span>{currentLang === 'ta' ? 'நிகழ்வு நாளில் புதிதாக சமையல்' : currentLang === 'nl' ? 'Vers bereid op de dag zelf' : 'Freshly prepared on event day'}</span>
              </div>
              <div className="catering-hero__trust-divider" aria-hidden="true" />
              <div className="catering-hero__trust-item">
                <span className="text-primary font-bold">✦</span>
                <span>{currentLang === 'ta' ? 'தனிப்பயன் விருந்தினர் மெனு' : currentLang === 'nl' ? 'Maatwerk menu & dieetwensen' : 'Custom menus & dietary care'}</span>
              </div>
              <div className="catering-hero__trust-divider" aria-hidden="true" />
              <div className="catering-hero__trust-item">
                <span className="text-accent font-bold">●</span>
                <span>{currentLang === 'ta' ? '10 முதல் 500+ விருந்தினர்கள்' : currentLang === 'nl' ? '10 tot 500+ gasten' : '10 to 500+ guests'}</span>
              </div>
            </div>
          </div>

          <div className="catering-hero__panel" data-cur="11">
            <span className="catering-hero__panel-kicker">{t('catering2.panelKicker', 'How it works')}</span>
            <strong className="catering-hero__panel-title">{t('catering2.panelTitle')}</strong>
            <p className="catering-hero__panel-lede">{t('catering2.panelText')}</p>
            <div className="catering-hero__steps">
              {process.map((item, index) => (
                <div className="catering-hero__step" key={item.title}>
                  <span>{`0${index + 1}`}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="packages-section" className="section package-section package-section--primary">
        <FluidBackground intensity={0.45} parallaxStrength={6} deepParallax={10} />
        <div className="container">
          <div className="section-heading section-heading--centered package-heading text-balance text-center">
            <div className="package-eyebrow-pill">
              <span className="text-primary font-bold">✦</span>
              <span>{t('catering2.packagesEyebrow', 'Catering · Shaped around your guests')}</span>
            </div>
            <h2 className="section-title">{t('catering2.packagesTitle')}</h2>
            <p className="lead lead--centered">{t('catering2.packagesLead')}</p>
          </div>

          {!loading && featuredPackage && (
            <div className="package-spotlight">
              <div>
                <span><Star size={16} /> {t('catering2.spotlight')}</span>
                <strong>{getLabel(featuredPackage.name, currentLang, 'Catering package')}</strong>
                <p>{getLabel(featuredPackage.description, currentLang)}</p>
              </div>
              <button type="button" className="btn-gold" onClick={() => navigate(`/catering/checkout/${featuredPackage._id}`)}>
                {t('catering2.customiseThis')}
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="package-grid package-grid--count-2">{[1, 2].map((item) => <div key={item} className="package-skeleton" />)}</div>
          ) : packages.length === 0 ? (
            <div className="empty-panel package-empty">
              <div>
                <h3>{t('catering2.refreshTitle')}</h3>
                <p>{t('catering2.refreshText')}</p>
              </div>
              <button type="button" className="btn-primary" onClick={() => navigate('/contact#inquiry')}>{t('catering2.quote')}</button>
            </div>
          ) : (
            <div className={`package-grid package-grid--priority package-grid--count-${packages.length}`}>
              {packages.map((pkg, index) => (
                <ScrollReveal key={pkg._id} variant="fadeUp" className="package-grid-item">
                  <article className="package-card">
                    <div className="package-card__image">
                      <img
                        src={pkg.image || PLACEHOLDER_IMG}
                        alt={getLabel(pkg.name, currentLang, 'Catering package')}
                        loading="lazy"
                        onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMG; }}
                      />
                      <span>{index === 0 ? t('catering2.best') : index === 1 ? t('catering2.favorite') : t('catering2.ready')}</span>
                    </div>
                    <div className="package-card__body">
                      <h3>{getLabel(pkg.name, currentLang)}</h3>
                      <p>{getLabel(pkg.description, currentLang)}</p>
                      <div className="package-card__meta">
                        <span><Users size={15} /> {pkg.minGuests}{pkg.maxGuests ? `-${pkg.maxGuests}` : '+'} {t('catering2.guests')}</span>
                        {pkg.durationHours && <span><Clock size={15} /> {pkg.durationHours} hrs</span>}
                      </div>
                      <div className="package-card__footer">
                        <div>
                          <span>{t('common.from')}</span>
                          <strong>EUR {pkg.basePrice}{pkg.pricingModel === 'per_person' ? ' p.p.' : ''}</strong>
                        </div>
                        <button type="button" className="btn-primary" onClick={() => navigate(`/catering/checkout/${pkg._id}`)}>
                          {t('catering2.customise')}
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <EventGallery />

      <section className="section process-section">
        <FluidBackground intensity={0.4} parallaxStrength={5} deepParallax={9} />
        <div className="container">
          <div className="section-heading section-heading--centered text-balance text-center">
            <div className="package-eyebrow-pill">
              <span className="text-primary font-bold">✦</span>
              <span>{t('catering2.processEyebrow', 'Tamil Food Thaya · From kitchen to table')}</span>
            </div>
            <h2 lang={currentLang} className="section-title">{t('catering2.processTitle')}</h2>
            <p lang={currentLang} className="lead lead--centered">{t('catering2.processLead')}</p>
          </div>
          <div className="catering-process-showcase">
            <div className="catering-process-grid">
              {process.map((item, index) => (
                <ScrollReveal key={item.title} variant="fadeUp" delay={index * 80} className="catering-process-item">
                  <article className="catering-process-card">
                    <div className="catering-process-card__header">
                      <span className="catering-process-card__step">{`0${index + 1}`}</span>
                      <div className="catering-process-card__icon">{item.icon}</div>
                    </div>
                    <div className="catering-process-card__body">
                      <h3 lang={currentLang}>{item.title}</h3>
                      <p lang={currentLang}>{item.copy}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AddonsSection />
    </div>
  );
};
