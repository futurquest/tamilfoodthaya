import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, restaurantSchema } from './SEO';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('home2.seoTitle')}
        description={t('home2.seoDescription')}
        schema={restaurantSchema}
      />
<section className="home-hero home-hero--photographic">
      <picture className="home-hero__backdrop" aria-hidden="true">
        <img src="/home-hero.png" alt="" width="1678" height="937" fetchPriority="high" decoding="async" />
      </picture>
      <div className="container home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow home-hero__eyebrow">{t('home2.eyebrow')}</p>
            <h1 className="display">{t('home2.title')}</h1>
            <p className="lead">{t('home2.lead')}</p>
            <div className="home-hero__actions">
              <Link to="/catering#packages-section" className="btn-primary">
                {t('home2.cateringCta')}
                <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn-secondary">
                {t('home2.menuCta')}
              </Link>
            </div>
            <p className="home-hero__note">{t('home2.regionNote')}</p>
          </div>
        </div>

      </section>
    </>
  );
}
