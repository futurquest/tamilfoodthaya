import { createLead, getSettings } from '../hooks/useApi';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { PageHeader } from '../components/Header';

export const ContactPage = () => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const { t } = useTranslation();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    const onSubmit = async (data: any) => {
        try {
            await createLead(data);
            toast.success('Bedankt! Uw bericht is verzonden.');
            reset();
        } catch (error) {
            toast.error('Verzenden mislukt. Probeer het later opnieuw.');
        }
    };

    return (
        <div className="min-h-screen bg-dark-50 pb-24">
            <PageHeader title={t('nav.contact', 'Contact Us')} subtitle="We'd love to hear from you. Reach out for catering enquiries or reservations." />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <ContactInfoCard icon={<MapPin size={22} />} title={t('footer.locations', 'Location')} value={settings?.address || 'Hofplein 20, Rotterdam'} />
                        <ContactInfoCard icon={<Phone size={22} />} title={t('contact.phone', 'Phone')} value={settings?.phone || '+31 (0) 6 1234 5678'} sub={settings?.businessHours ? `Today: ${settings.businessHours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]}` : 'Mon – Sun: 12:00 – 22:00'} />
                        <ContactInfoCard icon={<Mail size={22} />} title={t('contact.email', 'Email')} value={settings?.email || 'info@tamilfoodthaya.nl'} />
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-dark-800 mb-6">{t('contact.sendMessage', 'Send a Message')}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <FormField label={t('form.name', 'Name')} error={errors.name}>
                                <input {...register('name', { required: t('form.required', 'Required') })} className="input-field" placeholder="Your name" />
                            </FormField>
                            <FormField label={t('form.email', 'Email')} error={errors.email}>
                                <input type="email" {...register('email', { required: t('form.required', 'Required'), pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('form.invalidEmail', 'Invalid email') } })} className="input-field" placeholder="your@email.com" />
                            </FormField>
                            <FormField label={t('form.phone', 'Phone')} error={errors.phone}>
                                <input {...register('phone', { required: t('form.required', 'Required') })} className="input-field" placeholder="+31 6 1234 5678" />
                            </FormField>
                            <FormField label={t('form.message', 'Message')} error={errors.message}>
                                <textarea {...register('message', { required: t('form.required', 'Required') })} className="input-field h-32 resize-none" placeholder="How can we help you?" />
                            </FormField>
                            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                                {isSubmitting ? t('form.sending', 'Sending...') : t('form.send', 'Send Message')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactInfoCard = ({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-2xl border border-dark-200 p-6 flex items-start gap-4 shadow-sm hover:border-primary-200 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-dark-800 mb-0.5">{title}</h3>
            <p className="text-dark-600 text-sm">{value}</p>
            {sub && <p className="text-dark-400 text-xs mt-0.5">{sub}</p>}
        </div>
    </div>
);

const FormField = ({ label, error, children }: { label: string; error?: any; children: React.ReactNode }) => (
    <div>
        <label className="label-text">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{String(error.message)}</p>}
    </div>
);
