import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ScrollReveal from './ScrollReveal';

const PLACEHOLDER_IMG = '/hero-catering.jpg';

interface Package {
  _id: string;
  name: string | { en: string; ta?: string; nl?: string };
  description: string | { en: string; ta?: string; nl?: string };
  image?: string;
  basePrice?: number;
  pricingModel?: string;
  minGuests?: number;
  maxGuests?: number;
  durationHours?: number;
}

function getLabel(val: string | { nl?: string; en: string; ta?: string } | undefined, lang: string, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  return (val as any)[lang] || val.nl || val.en || fallback;
}

export default function FeaturedPackagesSection({ packages = [], loading = false }: { packages: Package[]; loading?: boolean }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'nl';
  const featured = packages.slice(0, 3);

  return (
    <section className="section package-section">
      <div className="container">
        <div className="section-heading split">
          <div>
            <h2 className="section-title">{t('catering.packagesSection.title', 'Catering packages shaped around your guest list.')}</h2>
          </div>
          <p className="lead">
            {t('catering.packagesSection.lead', 'Start with a tested package, then add service, drinks, decoration, or a special dish. The goal is less guessing and a better event table.')}
          </p>
        </div>

        {loading ? (
          <div className="package-grid">
            {[1, 2, 3].map((item) => <div className="package-skeleton" key={item} />)}
          </div>
        ) : featured.length > 0 ? (
          <div className="package-grid">
            {featured.map((pkg, index) => (
              <ScrollReveal key={pkg._id} variant="fadeUp">
                <article className="package-card">
                  <img
                    src={pkg.image || PLACEHOLDER_IMG}
                    alt={getLabel(pkg.name, currentLang, t('catering.packagesSection.altPhoto', 'Catering package'))}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <div className="package-card__body">
                    <span className="package-card__type">{index === 1 ? t('catering.packagesSection.mostRequested', 'Most requested') : t('catering.packagesSection.eventPackage', 'Event package')}</span>
                    <h3>{getLabel(pkg.name, currentLang)}</h3>
                    <p>{getLabel(pkg.description, currentLang)}</p>
                    <div className="package-card__meta">
                      {pkg.minGuests != null && (
                        <span><Users size={15} /> {pkg.minGuests}{pkg.maxGuests ? `-${pkg.maxGuests}` : '+'} {t('catering.packagesSection.guests', 'guests')}</span>
                      )}
                      {pkg.durationHours != null && <span><Clock size={15} /> {pkg.durationHours} {t('catering.packagesSection.hours', 'hrs')}</span>}
                    </div>
                    <div className="package-card__footer">
                      {pkg.basePrice != null && (
                        <strong>EUR {pkg.basePrice}{pkg.pricingModel === 'per_person' ? ' p.p.' : ''}</strong>
                      )}
                      <Link to={`/catering/checkout/${pkg._id}`} className="btn-primary">{t('catering.packagesSection.book', 'Book')}</Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>{t('catering.packagesSection.refreshTitle', 'Packages are being refreshed')}</h3>
            <p>{t('catering.packagesSection.refreshDesc', 'Send us your event date, guest count, and the dishes you want. We can still prepare a quote.')}</p>
            <Link to="/contact" className="btn-primary">{t('catering.packagesSection.requestQuote', 'Request a quote')}</Link>
          </div>
        )}

        <div className="section-cta">
          <Link to="/catering" className="btn-ink">
            {t('catering.packagesSection.viewAll', 'View all catering options')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
