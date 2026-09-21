import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CateringInvitation({ contact = false }: { contact?: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="catering-invitation" aria-labelledby="catering-invitation-title">
      <div className="container catering-invitation__grid">
        <img src="/hero-catering2.jpg" alt={t('conversion.imageAlt')} width="600" height="400" loading="lazy" />
        <div>
          <h2 id="catering-invitation-title">{t('conversion.title')}</h2>
          <p>{t('conversion.description')}</p>
          <p className="catering-invitation__details">{t('conversion.details')}</p>
          <div className="home-hero__actions">
            <Link className="btn-primary" to="/contact#inquiry">{t('conversion.quote')}<ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="btn-secondary" to="/catering#packages-section">{t('conversion.packages')}</Link>
          </div>
          {contact && <p className="catering-invitation__note">{t('conversion.next')}</p>}
        </div>
      </div>
    </section>
  );
}
