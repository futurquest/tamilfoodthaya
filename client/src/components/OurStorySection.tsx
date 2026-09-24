import ScrollReveal from './ScrollReveal';
import FluidBackground from './FluidBackground';
import { useTranslation } from 'react-i18next';

export default function OurStorySection() {
  const { t } = useTranslation();
  return (
    <section className="section about-section">
      <span className="fx-aura" data-para="24" data-cur="12" aria-hidden="true" />
      <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
      <div className="container about-grid">
        <ScrollReveal variant="fadeUp" className="about-copy">
          <h2 className="section-title">{t('about.title')}</h2>
          <h3 className="about-subhead">{t('about.subtitle')}</h3>
          <div className="about-body">
            <p>{t('about.paragraph1')}</p>
            <p>{t('about.paragraph2')}</p>
            <p>{t('about.paragraph3')}</p>
          </div>
          <p className="about-tagline">
            <strong>{t('about.tagline')}</strong>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" className="about-image" delay={120}>
          <figure>
            <img
              src="/thayapaalan.png"
              alt={t('about.imageAlt')}
              loading="lazy"
            />
            <figcaption className="about-image__caption">{t('about.caption')}</figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
