import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Check, Flower2, Music, Plus, Wine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../hooks/useApi';
import ScrollReveal from './ScrollReveal';

interface Addon {
  _id: string;
  name: string;
  description: string;
  price: number;
  pricingType: 'fixed' | 'per_person';
  category: string;
  isActive?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  entertainment: <Music size={22} />,
  decoration: <Flower2 size={22} />,
  service: <Wine size={22} />,
  extra_time: <Plus size={22} />,
  other: <Camera size={22} />,
};

const FALLBACK_ADDONS: Addon[] = [
  { _id: 'a1', name: 'DJ and sound', description: 'Music support with a compact sound system for the celebration.', price: 350, pricingType: 'fixed', category: 'entertainment' },
  { _id: 'a2', name: 'Flower decoration', description: 'Table, entrance, and stage flowers arranged around your event colors.', price: 200, pricingType: 'fixed', category: 'decoration' },
  { _id: 'a3', name: 'Welcome drinks', description: 'Mocktails or juices ready as guests arrive.', price: 8, pricingType: 'per_person', category: 'service' },
  { _id: 'a4', name: 'Kids menu', description: 'Milder portions for younger guests.', price: 12, pricingType: 'per_person', category: 'service' },
  { _id: 'a5', name: 'Event photography', description: 'Photo coverage for speeches, service, and family moments.', price: 450, pricingType: 'fixed', category: 'other' },
];

const getLabel = (translations: any, fallback: string | undefined, lang: string) =>
  translations?.[lang] || translations?.nl || fallback || '';

export default function AddonsSection() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'nl';
  const [addons, setAddons] = useState<Addon[]>([]);

  useEffect(() => {
    api.get('/addons')
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setAddons(data.length > 0 ? data : FALLBACK_ADDONS);
      })
      .catch(() => setAddons(FALLBACK_ADDONS));
  }, []);

  return (
    <section className="section addons-section">
      <div className="container">
        <div className="section-heading split">
          <h2 className="section-title"><span className="eyebrow">{t('addons.eyebrow', 'Kitchen & Fire')}</span>{t('addons.title')}</h2>
          <p className="lead">{t('addons.lead')}</p>
        </div>

        <div className="addons-grid">
          {addons.map((addon) => (
            <ScrollReveal key={addon._id} variant="fadeUp">
              <article className="addon-card">
                <span className="addon-card__icon">{CATEGORY_ICONS[addon.category] || CATEGORY_ICONS.other}</span>
                <h3>{getLabel((addon as any).nameTranslations, addon.name, currentLang)}</h3>
                <p>{getLabel((addon as any).descriptionTranslations, addon.description, currentLang)}</p>
                <div>
                  <strong>EUR {addon.price}</strong>
                  <span>{addon.pricingType === 'per_person' ? t('common.perGuest') : t('common.fixed')}</span>
                </div>
                <small><Check size={13} /> {t('addons.addDuring')}</small>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <div className="section-cta">
          <Link to="/catering" className="btn-secondary">{t('addons.browse')}</Link>
        </div>
      </div>
    </section>
  );
}
