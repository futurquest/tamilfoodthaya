import { Link } from 'react-router-dom';
import { ArrowRight, ChefHat, Leaf, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, restaurantSchema } from './SEO';
import FluidBackground from './FluidBackground';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('home2.seoTitle')}
        description={t('home2.seoDescription')}
        schema={restaurantSchema}
      />
<section className="home-hero">
      <span className="fx-aura" data-para="24" data-cur="12" aria-hidden="true" />
      <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
      <div className="container home-hero__grid">
          <div className="home-hero__copy" data-para="7">
            <p className="eyebrow home-hero__eyebrow">
              <span className="home-hero__eyebrow-dot" aria-hidden="true" />
              {t('home2.eyebrow', 'Kitchen & Fire — Traditional Tamil catering')}
            </p>
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
            <div className="home-hero__trust" aria-label="Restaurant highlights">
              <span><Star size={16} /> {t('home2.trust1')}</span>
              <span><ChefHat size={16} /> {t('home2.trust2')}</span>
              <span><Leaf size={16} /> {t('home2.trust3')}</span>
            </div>
          </div>

          <figure className="home-hero__photo">
            <img src="/hero-catering.jpg" alt={t('conversion.imageAlt')} width="960" height="720" fetchPriority="high" />
            <figcaption>{t('conversion.region')}</figcaption>
          </figure>
        </div>

      </section>
    </>
  );
}
