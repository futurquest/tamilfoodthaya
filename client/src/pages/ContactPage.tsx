import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { CalendarDays, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createLead, getSettings } from '../hooks/useApi';
import { SEO } from '../components/SEO';
import FluidBackground from '../components/FluidBackground';

export const ContactPage = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const today = new Date().toLocaleDateString('en-CA');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const eventDate = watch('eventDate');
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const onSubmit = async (data: any) => {
    setResult(null);
    try {
      await createLead(data);
      setResult('success');
      toast.success(t('contactPage.success'));
      reset();
    } catch {
      setResult('error');
      toast.error(t('contactPage.error'));
    }
  };

  return (
    <div className="contact-page">
      <SEO title={t('contactPage.seoTitle')} description={t('contactPage.seoDescription')} />

      <section className="page-hero contact-hero">
        <span className="fx-aura" data-para="22" data-cur="9" aria-hidden="true" />
        <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
        <div className="container">
          <div className="catering-hero__eyebrow-badge">
            <span className="catering-hero__badge-pulse" aria-hidden="true" />
            <span>{t('contactPage.heroEyebrow', 'Kitchen & Fire — Get in Touch')}</span>
          </div>
          <h1 className="display catering-hero__headline">{t('contactPage.heroTitle')}</h1>
          <p className="lead catering-hero__lead">{t('contactPage.heroDesc')}</p>
        </div>
      </section>

      <section id="inquiry" className="section contact-section">
        <FluidBackground intensity={0.42} parallaxStrength={6} deepParallax={10} />
        <div className="container contact-grid">
          <aside className="contact-aside">
            <p className="eyebrow">{t('contactPage.asideEyebrow', 'Kitchen & Fire — Say hello')}</p>
            <h2 className="section-title">{t('contactPage.asideTitle')}</h2>
            <p className="lead">{t('contactPage.asideLead')}</p>
            <div className="contact-cards">
              <div>
                <MapPin size={22} />
                <span>{t('contactPage.visit')}</span>
                <strong>{settings?.address || t('conversion.region')}</strong>
              </div>
              <div>
                <Phone size={22} />
                <span>{t('contactPage.call')}</span>
                {settings?.phone ? <a href={`tel:${settings.phone.replace(/[^+0-9]/g, '')}`}>{settings.phone}</a> : <a href="#inquiry">{t('conversion.contactFallback')}</a>}
              </div>
              <div>
                <Mail size={22} />
                <span>{t('form.email')}</span>
                {settings?.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : <a href="#inquiry">{t('conversion.contactFallback')}</a>}
              </div>
              <div>
                <CalendarDays size={22} />
                <span>{t('contactPage.bestFor')}</span>
                <strong>{t('contactPage.bestDetails')}</strong>
              </div>
            </div>
          </aside>

          <form className="contact-form surface" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="contact-form__title">
              <MessageCircle size={24} />
              <div>
                <h2>{t('contactPage.formTitle')}</h2>
                <p>{t('contactPage.formLead')}</p>
              </div>
            </div>

            <label>
              {t('form.name')}
              <input autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name', { required: t('contactPage.nameRequired') })} className="input-field" placeholder={t('contactPage.yourName')} />
              {errors.name && <small role="alert" id="name-error">{String(errors.name.message)}</small>}
            </label>

            <div className="contact-form__row">
              <label>
                {t('form.email')}
                <input
                  type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email', {
                    required: t('contactPage.emailRequired'),
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('contactPage.validEmail') },
                  })}
                  className="input-field"
                  placeholder="name@email.com"
                />
                {errors.email && <small role="alert" id="email-error">{String(errors.email.message)}</small>}
              </label>
              <label>
                {t('form.phone')}
                <input type="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} {...register('phone', { required: t('contactPage.phoneRequired') })} className="input-field" placeholder="+31 6 1234 5678" />
                {errors.phone && <small role="alert" id="phone-error">{String(errors.phone.message)}</small>}
              </label>
            </div>

            <fieldset className="event-details">
              <legend>{t('conversion.optional')}</legend>
              <div className="contact-form__row">
                <label>{t('conversion.date')}<input type="date" className={`input-field${eventDate ? '' : ' input-field--empty'}`} min={today} {...register('eventDate', { validate: value => !value || value >= today || t('conversion.pastDate') })} aria-invalid={!!errors.eventDate} aria-describedby={errors.eventDate ? 'date-error' : undefined} />{errors.eventDate && <small id="date-error" role="alert">{String(errors.eventDate.message)}</small>}</label>
                <label>{t('conversion.guests')}<input type="number" inputMode="numeric" min="1" step="1" className="input-field" {...register('guests', { validate: value => !value || (Number.isInteger(Number(value)) && Number(value) >= 1) || t('conversion.invalidGuests') })} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? 'guests-error' : undefined} />{errors.guests && <small id="guests-error" role="alert">{String(errors.guests.message)}</small>}</label>
              </div>
              <label>{t('conversion.location')}<input className="input-field" autoComplete="address-level2" {...register('location')} /></label>
            </fieldset>
            {result && <p className={`form-result form-result--${result}`} role={result === 'error' ? 'alert' : 'status'}>{t(result === 'success' ? 'conversion.success' : 'conversion.retry')}</p>}
            <label>
              {t('form.message')}
              <textarea aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} {...register('message', { required: t('contactPage.messageRequired') })} className="input-field" placeholder={t('contactPage.messagePlaceholder')} />
              {errors.message && <small role="alert" id="message-error">{String(errors.message.message)}</small>}
            </label>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? t('form.sending') : t('contactPage.sendInquiry')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
