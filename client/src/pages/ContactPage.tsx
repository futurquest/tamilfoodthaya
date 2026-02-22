import { createLead, getSettings } from '../hooks/useApi';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

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
            console.error('Failed to send message:', error);
            toast.error('Verzenden mislukt. Probeer het later opnieuw.');
        }
    };

    return (
        <div className="pt-24 pb-24 bg-gray-50 min-h-screen">
            <Container>
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-tamil-charcoal mb-4">{t('nav.contact')}</h1>
                    <div className="w-24 h-1 bg-tamil-maroon mx-auto" />
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card>
                            <CardContent className="p-8 flex items-start gap-4">
                                <div className="w-12 h-12 bg-tamil-maroon/10 rounded-full flex items-center justify-center text-tamil-maroon shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{t('footer.locations')}</h3>
                                    <p className="text-gray-600">{settings?.address || 'Hofplein 20, Rotterdam'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-8 flex items-start gap-4">
                                <div className="w-12 h-12 bg-tamil-maroon/10 rounded-full flex items-center justify-center text-tamil-maroon shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{t('contact.phone')}</h3>
                                    <p className="text-gray-600">{settings?.phone || '+31 (0) 6 1234 5678'}</p>
                                    <p className="text-sm text-gray-500">
                                        {settings?.businessHours ?
                                            `Vandaag: ${settings.businessHours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]}`
                                            : 'Ma - Zo: 12:00 - 22:00'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-8 flex items-start gap-4">
                                <div className="w-12 h-12 bg-tamil-maroon/10 rounded-full flex items-center justify-center text-tamil-maroon shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{t('contact.email')}</h3>
                                    <p className="text-gray-600">{settings?.email || 'info@tamilfoodthaya.nl'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-6">{t('contact.sendMessage')}</h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('form.name')}</label>
                                    <input
                                        {...register('name', { required: t('form.required') })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-tamil-maroon outline-none"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('form.email')}</label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: t('form.required'),
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: t('form.invalidEmail')
                                            }
                                        })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-tamil-maroon outline-none"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('form.phone')}</label>
                                    <input
                                        {...register('phone', { required: t('form.required') })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-tamil-maroon outline-none"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{String(errors.phone.message)}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">{t('form.message')}</label>
                                    <textarea
                                        {...register('message', { required: t('form.required') })}
                                        className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-tamil-maroon outline-none"
                                    />
                                    {errors.message && <p className="text-red-500 text-xs mt-1">{String(errors.message.message)}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? t('form.sending') : t('form.send')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
};
