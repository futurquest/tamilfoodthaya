import { Link } from 'react-router-dom';
import { Briefcase, HeartHandshake, Home, PartyPopper, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ScrollReveal from './ScrollReveal';

export default function EventTypesSection() {
  const { t } = useTranslation();
  const eventTypes = [
    { icon: <HeartHandshake size={24} />, title: t('story.events.0.0'), copy: t('story.events.0.1') },
    { icon: <UsersRound size={24} />, title: t('story.events.1.0'), copy: t('story.events.1.1') },
    { icon: <Briefcase size={24} />, title: t('story.events.2.0'), copy: t('story.events.2.1') },
    { icon: <PartyPopper size={24} />, title: t('story.events.3.0'), copy: t('story.events.3.1') },
    { icon: <Home size={24} />, title: t('story.events.4.0'), copy: t('story.events.4.1') },
  ];
  const journey = [0, 1, 2, 3].map((index) => t(`story.journey.${index}`));

  return (
    <section className="section story-section">
      <div className="container story-grid">
        <ScrollReveal variant="fadeUp" className="story-copy">
          <h2 className="section-title">{t('story.title')}</h2>
          <p className="lead">{t('story.lead')}</p>
          <div className="journey-strip">
            {journey.map((step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <Link to="/contact#inquiry" className="btn-ink">{t('story.cta')}</Link>
        </ScrollReveal>

        <div className="event-list">
          {eventTypes.map((event) => (
            <ScrollReveal key={event.title} variant="fadeUp">
              <article className="event-row">
                <div className="event-row__icon">{event.icon}</div>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.copy}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
