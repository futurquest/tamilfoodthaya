import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Sparkles, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCateringPackages } from '../hooks/useApi';
import { SEO } from '../components/SEO';
import AddonsSection from '../components/AddonsSection';
import ScrollReveal from '../components/ScrollReveal';

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

      <section className="catering-hero catering-hero--packages">
        <span className="fx-aura fx-aura--right" data-para="22" data-cur="10" aria-hidden="true" />
        <div className="container catering-hero__grid">
          <div>
            <span className="eyebrow">{t('catering2.heroEyebrow', 'Kitchen & Fire — Catering')}</span>
            <h1 className="display">{t('catering2.heroTitle')}</h1>
            <p className="lead">{t('catering2.heroLead')}</p>
            <div className="home-hero__actions">
              <button type="button" className="btn-primary" onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('catering2.viewPackages')}
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/contact')}>
                {t('catering2.requestGuidance')}
              </button>
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
        <div className="container">
          <div className="section-heading split package-heading">
            <h2 className="section-title"><span className="eyebrow">{t('catering2.packagesEyebrow', 'Catering — On A Mission')}</span>{t('catering2.packagesTitle')}</h2>
            <p className="lead">{t('catering2.packagesLead')}</p>
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
            <div className="package-grid">{[1, 2, 3].map((item) => <div key={item} className="package-skeleton" />)}</div>
          ) : packages.length === 0 ? (
            <div className="empty-panel">
              <h3>{t('catering2.refreshTitle')}</h3>
              <p>{t('catering2.refreshText')}</p>
              <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>{t('catering2.quote')}</button>
            </div>
          ) : (
            <div className="package-grid package-grid--priority">
              {packages.map((pkg, index) => (
                <article className="package-card" key={pkg._id}>
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
                    <span className="package-card__type">{index === 1 ? t('catering2.favorite') : t('catering2.package')}</span>
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
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-heading split">
            <h2 className="section-title"><span className="eyebrow">{t('catering2.processEyebrow', 'Kitchen & Fire')}</span>{t('catering2.processTitle')}</h2>
            <p className="lead">{t('catering2.processLead')}</p>
          </div>
          <div className="process-grid">
            {process.map((item) => (
              <ScrollReveal key={item.title} variant="fadeUp">
                <article>
                  <span>{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <AddonsSection />
    </div>
  );
};
