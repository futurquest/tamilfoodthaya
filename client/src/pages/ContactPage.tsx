import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { CalendarDays, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createLead, getSettings } from '../hooks/useApi';
import { SEO } from '../components/SEO';

export const ContactPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const onSubmit = async (data: any) => {
    try {
      await createLead(data);
      toast.success(t('contactPage.success'));
      reset();
    } catch {
      toast.error(t('contactPage.error'));
    }
  };

  return (
    <div className="contact-page">
      <SEO title={t('contactPage.seoTitle')} description={t('contactPage.seoDescription')} />

      <section className="page-hero">
        <span className="fx-aura" data-para="22" data-cur="9" aria-hidden="true" />
        <div className="container">
          <h1>{t('contactPage.heroTitle')}</h1>
          <p>{t('contactPage.heroDesc')}</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <aside className="contact-aside">
            <h2 className="section-title">{t('contactPage.asideTitle')}</h2>
            <p className="lead">{t('contactPage.asideLead')}</p>
            <div className="contact-cards">
              <div>
                <MapPin size={22} />
                <span>{t('contactPage.visit')}</span>
                <strong>{settings?.address || 'Hofplein 20, Rotterdam'}</strong>
              </div>
              <div>
                <Phone size={22} />
                <span>{t('contactPage.call')}</span>
                <strong>{settings?.phone || '+31 (0) 6 1234 5678'}</strong>
              </div>
              <div>
                <Mail size={22} />
                <span>{t('form.email')}</span>
                <strong>{settings?.email || 'info@tamilfoodthaya.nl'}</strong>
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
              <input {...register('name', { required: t('contactPage.nameRequired') })} className="input-field" placeholder={t('contactPage.yourName')} />
              {errors.name && <small>{String(errors.name.message)}</small>}
            </label>

            <div className="contact-form__row">
              <label>
                {t('form.email')}
                <input
                  type="email"
                  {...register('email', {
                    required: t('contactPage.emailRequired'),
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('contactPage.validEmail') },
                  })}
                  className="input-field"
                  placeholder="name@email.com"
                />
                {errors.email && <small>{String(errors.email.message)}</small>}
              </label>
              <label>
                {t('form.phone')}
                <input {...register('phone', { required: t('contactPage.phoneRequired') })} className="input-field" placeholder="+31 6 1234 5678" />
                {errors.phone && <small>{String(errors.phone.message)}</small>}
              </label>
            </div>

            <label>
              {t('form.message')}
              <textarea {...register('message', { required: t('contactPage.messageRequired') })} className="input-field" placeholder={t('contactPage.messagePlaceholder')} />
              {errors.message && <small>{String(errors.message.message)}</small>}
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
