import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, restaurantSchema } from './SEO';
import FluidBackground from './FluidBackground';

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
          <img src="/home-hero.webp" alt="" width="1678" height="937" fetchPriority="high" decoding="async" />
        </picture>
        <span className="fx-aura" data-para="24" data-cur="12" aria-hidden="true" />
        <FluidBackground intensity={0.4} parallaxStrength={7} deepParallax={12} />
        <div className="container home-hero__grid">
          <div className="home-hero__glass-card">
            <div className="home-hero__eyebrow-badge">
              <span className="home-hero__badge-pulse" aria-hidden="true" />
              <span>{t('home2.eyebrow')}</span>
            </div>
            <h1 lang={lang} className="display home-hero__headline">{title}</h1>
            <p className="lead home-hero__lead" lang={lang}>{lead}</p>
            <div className="home-hero__actions">
              <Link to="/catering#packages-section" className="btn-primary">
                <span>{t('home2.cateringCta')}</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn-secondary">
                <span>{t('home2.menuCta')}</span>
              </Link>
            </div>
            <div className="home-hero__trust-strip" aria-label="Trust highlights">
              <div className="home-hero__trust-item">
                <span className="text-amber-500 font-bold">★</span>
                <span>{t('home2.trust1')}</span>
              </div>
              <div className="home-hero__trust-divider" aria-hidden="true" />
              <div className="home-hero__trust-item">
                <span className="text-primary font-bold">✦</span>
                <span>{t('home2.trust2')}</span>
              </div>
              <div className="home-hero__trust-divider" aria-hidden="true" />
              <div className="home-hero__trust-item">
                <span className="text-accent font-bold">●</span>
                <span>{t('home2.trust3')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
