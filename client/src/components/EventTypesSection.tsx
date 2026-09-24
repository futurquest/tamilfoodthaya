import { Link } from 'react-router-dom';
import { Briefcase, HeartHandshake, Home, PartyPopper, UsersRound, ArrowRight, Sparkles, UtensilsCrossed, ChefHat, ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ScrollReveal from './ScrollReveal';
import FluidBackground from './FluidBackground';

export default function EventTypesSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'nl';

  const eventTypes = [
    { 
      icon: <HeartHandshake size={28} />, 
      title: t('story.events.1.0'), // Weddings & anniversaries
      copy: t('story.events.1.1'),
      image: '/events/event-05.png',
      tag: t('eventGallery.badge', 'Weddings & Galas'),
    },
    { 
      icon: <UsersRound size={24} />, 
      title: t('story.events.0.0'), // Family dinners
      copy: t('story.events.0.1'),
      image: '/events/event-01.png',
      tag: 'Family Feasts',
    },
    { 
      icon: <Briefcase size={24} />, 
      title: t('story.events.2.0'), // Corporate events
      copy: t('story.events.2.1'),
      image: '/events/event-04.png',
      tag: 'Corporate & Executive',
    },
    { 
      icon: <PartyPopper size={24} />, 
      title: t('story.events.3.0'), // Parties & celebrations
      copy: t('story.events.3.1'),
      image: '/events/event-06.png',
      tag: 'Celebrations',
    },
    { 
      icon: <Home size={24} />, 
      title: t('story.events.4.0'), // Home meals
      copy: t('story.events.4.1'),
      image: '/events/event-10.png',
      tag: 'Comfort Dinners',
    },
  ];

  const journey = [
    {
      num: '01',
      tag: t('story.journeyTags.0', 'Kitchen to Table'),
      text: t('story.journey.0', 'From our kitchen to your table'),
      icon: <UtensilsCrossed size={20} />,
      desc: t('story.journeyDescs.0', 'Prepared fresh on the morning of your event & delivered hot in insulated carriers.')
    },
    {
      num: '02',
      tag: t('story.journeyTags.1', 'Handcrafted Fresh'),
      text: t('story.journey.1', 'Everything freshly prepared by hand'),
      icon: <ChefHat size={20} />,
      desc: t('story.journeyDescs.1', 'Slow-simmered curries, hand-roasted spice masalas, and artisanal care.')
    },
    {
      num: '03',
      tag: t('story.journeyTags.2', 'Honest Ingredients'),
      text: t('story.journey.2', 'Honest ingredients, no shortcuts'),
      icon: <ShieldCheck size={20} />,
      desc: t('story.journeyDescs.2', 'Cold-pressed oils, pure coconut milk, and zero artificial colors or preservatives.')
    },
    {
      num: '04',
      tag: t('story.journeyTags.3', 'Warm Hospitality'),
      text: t('story.journey.3', 'Served with the warmth of home'),
      icon: <Heart size={20} />,
      desc: t('story.journeyDescs.3', 'Abundant portions served with authentic warmth so every guest feels truly cherished.')
    }
  ];

  return (
    <section className="section story-section">
      <FluidBackground intensity={0.35} parallaxStrength={5} deepParallax={9} />
      <div className="container">
        {/* Section Heading */}
        <div className="section-heading story-heading text-center">
          <div className="story-eyebrow-pill">
            <Sparkles size={14} className="text-primary" />
            <span>{t('story.eyebrow', 'Tamil Food Thaya · What we do')}</span>
          </div>
          <h2 lang={lang} className="section-title">{t('story.title')}</h2>
          <p lang={lang} className="lead story-lead-center">{t('story.lead')}</p>
        </div>

        {/* Event Photographic Bento Grid */}
        <div className="story-bento-grid">
          {eventTypes.map((event, idx) => (
            <ScrollReveal key={event.title} variant="fadeUp" delay={idx * 60} className="story-bento-item">
              <article className="story-photo-card">
                <img
                  src={event.image}
                  alt={event.title}
                  className="story-photo-card__bg"
                  loading="lazy"
                />
                <div className="story-photo-card__overlay" />
                <div className="story-photo-card__body">
                  <div className="story-photo-card__top">
                    <div className="story-photo-card__icon">{event.icon}</div>
                    <span className="story-photo-card__tag">{event.tag}</span>
                  </div>
                  <div className="story-photo-card__content">
                    <h3 lang={lang}>{event.title}</h3>
                    <p lang={lang}>{event.copy}</p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* 4-Step Catering Promise Showcase */}
        <ScrollReveal variant="fadeUp" delay={140}>
          <div className="story-promise-showcase" role="region" aria-label={t('story.journeyEyebrow', 'The Thaya Quality Standard')}>
            <div className="story-promise-banner">
              <div className="story-promise-header">
                <div className="story-promise-header__pill">
                  <Sparkles size={14} className="text-primary" />
                  <span>{t('story.journeyEyebrow', 'The Thaya Quality Standard')}</span>
                </div>
                <h3 lang={lang} className="story-promise-header__title">
                  {t('story.journeyTitle', 'Four commitments behind every feast we prepare')}
                </h3>
              </div>

              <div className="story-promise-track">
                {journey.map((step) => (
                  <div key={step.num} className="story-promise-step">
                    <div className="story-promise-step__top">
                      <span className="story-promise-step__num">{step.num}</span>
                      <div className="story-promise-step__icon-box">
                        {step.icon}
                      </div>
                    </div>
                    <div className="story-promise-step__body">
                      <span className="story-promise-step__tag">{step.tag}</span>
                      <h4 lang={lang} className="story-promise-step__statement">{step.text}</h4>
                      <p lang={lang} className="story-promise-step__desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section CTA */}
        <div className="section-cta story-cta-wrap">
          <Link to="/contact#inquiry" className="btn-primary">
            <span>{t('story.cta')}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
