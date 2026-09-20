import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, restaurantSchema } from './SEO';

export interface HeroSectionData {
  title?: string;
  lead?: string;
}

export default function HeroSection({ data }: { data?: HeroSectionData }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'nl';
  const title = data?.title || t('home2.title');
  const lead = data?.lead || t('home2.lead');

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
            <h1 lang={lang} className="display">{title}</h1>
            <p className="lead" lang={lang}>{lead}</p>
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
