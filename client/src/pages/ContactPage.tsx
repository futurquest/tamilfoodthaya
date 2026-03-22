import { createLead, getSettings } from '../hooks/useApi';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/Container';

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
        <div className="ct-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

                .ct-root { font-family: 'DM Sans', sans-serif; }

                /* ═══════════════════════════════════════
                   HERO
                ═══════════════════════════════════════ */
                .ct-hero {
                    position: relative;
                    min-height: 65vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    background: #0a0806;
                }
                .ct-hero-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600');
                    background-size: cover; background-position: center;
                    opacity: 0.2;
                    transform: scale(1.04);
                }
                .ct-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.6) 55%, rgba(10,8,6,0.3) 100%);
                }
                .ct-hero-bottom {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 160px;
                    background: linear-gradient(to bottom, transparent, #ffffff);
                }
                .ct-hero-glow {
                    position: absolute; top: 0; left: 50%;
                    transform: translateX(-50%);
                    width: 800px; height: 400px;
                    background: radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                .ct-hero-grain {
                    position: absolute; inset: 0; opacity: 0.03; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px 200px;
                }
                .ct-hero-inner {
                    position: relative; z-index: 10;
                    text-align: center;
                    padding: 120px 24px 80px;
                    max-width: 860px; margin: 0 auto;
                }
                .ct-hero-eyebrow {
                    font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
                    color: #e8a020; font-weight: 600; margin-bottom: 20px;
                    display: block;
                }
                .ct-hero-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(40px, 7vw, 72px);
                    font-weight: 300; line-height: 1.1;
                    color: #f5efe4;
                    margin-bottom: 20px;
                }
                .ct-hero-title strong {
                    font-weight: 700;
                    background: linear-gradient(135deg, #e8a020, #f5c842);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .ct-hero-subtitle {
                    font-size: 17px; font-weight: 300; line-height: 1.7;
                    color: rgba(245,239,228,0.7);
                    max-width: 560px; margin: 0 auto;
                }

                /* ═══════════════════════════════════════
                   CONTENT SECTION
                ═══════════════════════════════════════ */
                .ct-content {
                    background: #ffffff;
                    padding: 96px 24px;
                    position: relative;
                }

                /* Contact Info Cards */
                .ct-info-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.08);
                    padding: 28px;
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
                    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                                box-shadow 0.35s,
                                border-color 0.35s;
                    margin-bottom: 20px;
                }
                .ct-info-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
                    border-color: rgba(232,160,32,0.35);
                }
                .ct-info-icon {
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, #faf7f2, #fff5e6);
                    border: 1px solid rgba(232,160,32,0.2);
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    color: #e8a020;
                    flex-shrink: 0;
                }
                .ct-info-content h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 18px; font-weight: 700;
                    color: #1a1209;
                    margin-bottom: 6px;
                }
                .ct-info-content p {
                    font-size: 14px; color: #6b5a3a;
                    line-height: 1.6;
                    margin: 0;
                }
                .ct-info-content .ct-info-sub {
                    font-size: 12px; color: #888070;
                    margin-top: 4px;
                }

                /* Form Card */
                .ct-form-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.08);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
                    padding: 36px;
                }
                .ct-form-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px; font-weight: 700;
                    color: #1a1209;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px dashed rgba(232,160,32,0.3);
                }
                .ct-form-field {
                    margin-bottom: 20px;
                }
                .ct-form-label {
                    display: block;
                    font-size: 13px; font-weight: 600;
                    color: #1a1209;
                    margin-bottom: 8px;
                    letter-spacing: 0.02em;
                }
                .ct-form-input, .ct-form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid rgba(0,0,0,0.12);
                    border-radius: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1a1209;
                    background: #ffffff;
                    transition: all 0.2s;
                    outline: none;
                }
                .ct-form-input:focus, .ct-form-textarea:focus {
                    border-color: #e8a020;
                    box-shadow: 0 0 0 3px rgba(232,160,32,0.08);
                }
                .ct-form-textarea {
                    resize: vertical;
                    min-height: 120px;
                }
                .ct-form-error {
                    color: #dc2626;
                    font-size: 11px;
                    margin-top: 4px;
                    font-weight: 500;
                }
                .ct-form-btn {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                    box-shadow: 0 3px 12px rgba(232,160,32,0.3);
                    letter-spacing: 0.02em;
                }
                .ct-form-btn:hover:not(:disabled) {
                    filter: brightness(1.08);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(232,160,32,0.4);
                }
                .ct-form-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .ct-hero-inner { padding: 100px 24px 60px; }
                    .ct-content { padding: 64px 24px; }
                    .ct-form-card { padding: 28px 20px; }
                }
            `}</style>

            {/* Hero Section */}
            <section className="ct-hero">
                <div className="ct-hero-bg" />
                <div className="ct-hero-overlay" />
                <div className="ct-hero-glow" />
                <div className="ct-hero-grain" />
                <div className="ct-hero-bottom" />
                <div className="ct-hero-inner">
                    <motion.span 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="ct-hero-eyebrow"
                    >
                        Get in Touch
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="ct-hero-title"
                    >
                        We'd <strong>Love</strong> to Hear from You
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }}
                        className="ct-hero-subtitle"
                    >
                        Whether you have a question about our menu, catering services, or reservations, our team is ready to assist you.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="ct-content">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Contact Info */}
                        <div>
                            <div className="ct-info-card">
                                <div className="ct-info-icon">
                                    <MapPin size={24} />
                                </div>
                                <div className="ct-info-content">
                                    <h3>{t('footer.locations', 'Location')}</h3>
                                    <p>{settings?.address || 'Hofplein 20, Rotterdam'}</p>
                                </div>
                            </div>

                            <div className="ct-info-card">
                                <div className="ct-info-icon">
                                    <Phone size={24} />
                                </div>
                                <div className="ct-info-content">
                                    <h3>{t('contact.phone', 'Phone')}</h3>
                                    <p>{settings?.phone || '+31 (0) 6 1234 5678'}</p>
                                    <p className="ct-info-sub">
                                        {settings?.businessHours 
                                            ? `Today: ${settings.businessHours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]}` 
                                            : 'Mon – Sun: 12:00 – 22:00'}
                                    </p>
                                </div>
                            </div>

                            <div className="ct-info-card">
                                <div className="ct-info-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="ct-info-content">
                                    <h3>{t('contact.email', 'Email')}</h3>
                                    <p>{settings?.email || 'info@tamilfoodthaya.nl'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="ct-form-card">
                            <h2 className="ct-form-title">{t('contact.sendMessage', 'Send a Message')}</h2>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="ct-form-field">
                                    <label className="ct-form-label">{t('form.name', 'Name')}</label>
                                    <input 
                                        {...register('name', { required: t('form.required', 'Required') })} 
                                        className="ct-form-input" 
                                        placeholder="Your name" 
                                    />
                                    {errors.name && <p className="ct-form-error">{String(errors.name.message)}</p>}
                                </div>

                                <div className="ct-form-field">
                                    <label className="ct-form-label">{t('form.email', 'Email')}</label>
                                    <input 
                                        type="email" 
                                        {...register('email', { 
                                            required: t('form.required', 'Required'), 
                                            pattern: { 
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                                                message: t('form.invalidEmail', 'Invalid email') 
                                            } 
                                        })} 
                                        className="ct-form-input" 
                                        placeholder="your@email.com" 
                                    />
                                    {errors.email && <p className="ct-form-error">{String(errors.email.message)}</p>}
                                </div>

                                <div className="ct-form-field">
                                    <label className="ct-form-label">{t('form.phone', 'Phone')}</label>
                                    <input 
                                        {...register('phone', { required: t('form.required', 'Required') })} 
                                        className="ct-form-input" 
                                        placeholder="+31 6 1234 5678" 
                                    />
                                    {errors.phone && <p className="ct-form-error">{String(errors.phone.message)}</p>}
                                </div>

                                <div className="ct-form-field">
                                    <label className="ct-form-label">{t('form.message', 'Message')}</label>
                                    <textarea 
                                        {...register('message', { required: t('form.required', 'Required') })} 
                                        className="ct-form-textarea" 
                                        placeholder="How can we help you?" 
                                    />
                                    {errors.message && <p className="ct-form-error">{String(errors.message.message)}</p>}
                                </div>

                                <button type="submit" className="ct-form-btn" disabled={isSubmitting}>
                                    {isSubmitting ? t('form.sending', 'Sending...') : t('form.send', 'Send Message')}
                                </button>
                            </form>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};
