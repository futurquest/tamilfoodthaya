import ScrollReveal from './ScrollReveal';
import FluidBackground from './FluidBackground';
import { useTranslation } from 'react-i18next';
import { Sparkles, Award } from 'lucide-react';

export default function OurStorySection() {
  const { t } = useTranslation();
  return (
    <section className="section about-section">
      <span className="fx-aura" data-para="24" data-cur="12" aria-hidden="true" />
      <FluidBackground intensity={0.35} parallaxStrength={7} deepParallax={12} />
      <div className="container about-grid">
        <ScrollReveal variant="fadeUp" className="about-copy">
          <div className="about-eyebrow-pill">
            <Sparkles size={14} className="text-primary" />
            <span>{t('about.eyebrow', 'The story behind the table')}</span>
          </div>
          <h2 className="section-title">{t('about.title')}</h2>
          <h3 className="about-subhead">{t('about.subtitle')}</h3>
          <div className="about-body">
            <p>{t('about.paragraph1')}</p>
            <p>{t('about.paragraph2')}</p>
            <p>{t('about.paragraph3')}</p>
          </div>
          <div className="about-tagline-card">
            <p className="about-tagline-text">
              “{t('about.tagline')}”
            </p>
            <span className="about-tagline-author">— Master Chef Thayapalan</span>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" className="about-image" delay={120}>
          <div className="about-image-wrapper">
            <div className="about-image-halo" aria-hidden="true" />
            <figure className="about-portrait-card">
              <img
                src="/thayapaalan.png"
                alt={t('about.imageAlt')}
                loading="lazy"
              />
              <div className="about-portrait-overlay">
                <div className="about-badge-float">
                  <Award size={18} className="text-amber-500" />
                  <div>
                    <strong>{t('about.caption', 'Thayapalan · Founder')}</strong>
                    <span>25+ Years Culinary Craft</span>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
