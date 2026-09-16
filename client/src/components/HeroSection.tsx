import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, ChefHat, Leaf, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, restaurantSchema } from './SEO';
import FluidBackground from './FluidBackground';

export default function HeroSection() {
  const { t } = useTranslation();
  const proof = [
    { label: t('home2.proof1'), value: '40+' },
    { label: t('home2.proof2'), value: '25-500' },
    { label: t('home2.proof3'), value: 'Daily' },
  ];

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

          <div className="hero-menu-board" data-cur="13" aria-label={t('home2.boardLabel')}>
            <div>
              <span>{t('home2.today')}</span>
              <strong>{t('home2.dish1')}</strong>
              <p>{t('home2.dish1Desc')}</p>
            </div>
            <div>
              <span>{t('home2.breakfast')}</span>
              <strong>{t('home2.dish2')}</strong>
              <p>{t('home2.dish2Desc')}</p>
            </div>
            <div>
              <span>{t('home2.anchor')}</span>
              <strong>{t('home2.dish3')}</strong>
              <p>{t('home2.dish3Desc')}</p>
            </div>
            <Link to="/catering#packages-section" className="hero-menu-board__cta">
              <CalendarCheck size={18} />
              {t('home2.eventCta')}
            </Link>
          </div>
        </div>

        <div className="container home-hero__proof" data-para="6">
          {proof.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
