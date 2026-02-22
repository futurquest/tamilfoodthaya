import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createLead, getCateringPackages } from '../hooks/useApi';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Users, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';

const quoteSchema = z.object({
    name: z.string().min(2, 'Naam is verplicht'),
    email: z.string().email('Ongeldig e-mailadres'),
    phone: z.string().min(10, 'Ongeldig telefoonnummer'),
    eventDate: z.string().min(1, 'Datum is verplicht'),
    guests: z.string().min(1, 'Aantal gasten is verplicht'),
    location: z.string().min(2, 'Locatie is verplicht'),
    package: z.string().optional(),
    notes: z.string().optional(),
});

type QuoteForm = z.infer<typeof quoteSchema>;

import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface CateringPackageData {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    minGuests: number;
    maxGuests?: number;
    categories: { name: string; items: any[] }[];
    available: boolean;
}

export const CateringPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [packages, setPackages] = useState<CateringPackageData[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<QuoteForm>({
        resolver: zodResolver(quoteSchema)
    });

    const selectedPackage = watch('package');

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const data = await getCateringPackages();
                setPackages(data);
            } catch {
                // Silently fail - packages section will show empty state
            } finally {
                setLoadingPackages(false);
            }
        };
        loadPackages();
    }, []);

    const onSubmit = async (data: QuoteForm) => {
        try {
            await createLead(data);
            toast.success('Bedankt! We nemen binnen 24 uur contact met u op.');
            reset();
        } catch (error) {
            console.error(error);
            toast.error('Er is iets misgegaan. Probeer het later opnieuw.');
        }
    };

    const handlePackageSelect = (pkg: CateringPackageData) => {
        navigate(`/catering/checkout/${pkg._id}`);
    };

    const handleQuotePackageSelect = (packageName: string) => {
        setValue('package', packageName);
        document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
        toast.success(`Pakket ${packageName} geselecteerd`);
    };

    // Featured package is the middle one (or the most expensive if odd count)
    const featuredIdx = packages.length > 2 ? 1 : -1;

    return (
        <div className="pt-24 pb-24">
            <SEO title="Catering" description="Premium Tamil catering packages for your events." />

            {/* Hero Section */}
            <section className="bg-tamil-charcoal text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center" />
                <Container className="relative z-10 text-center">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-bold mb-6">
                        {t('catering.hero.title')} <span className="text-tamil-gold">{t('catering.hero.titleHighlight')}</span>
                    </motion.h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        {t('catering.hero.desc')}
                    </p>
                    <Button size="lg" onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        {t('catering.hero.button')}
                    </Button>
                </Container>
            </section>

            {/* Packages Section */}
            <section id="packages-section" className="py-24 bg-white">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-tamil-charcoal mb-4">{t('catering.packages.title')}</h2>
                        <p className="text-gray-500">{t('catering.packages.subtitle')}</p>
                    </div>

                    {loadingPackages ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-tamil-maroon" size={32} />
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg font-bold mb-2">Packages coming soon</p>
                            <p className="text-sm">Contact us below for a custom quote.</p>
                        </div>
                    ) : (
                        <div className={`grid gap-8 ${packages.length === 1 ? 'max-w-md mx-auto' : packages.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
                            {packages.map((pkg, idx) => (
                                <PackageCard
                                    key={pkg._id}
                                    pkg={pkg}
                                    featured={idx === featuredIdx}
                                    badge={idx === featuredIdx ? 'Meest Gekozen' : undefined}
                                    onSelect={() => handlePackageSelect(pkg)}
                                    onQuote={() => handleQuotePackageSelect(pkg.name)}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </section>

            {/* Quote Form */}
            <section id="quote-form" className="py-24 bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-4xl font-bold text-tamil-charcoal mb-8">{t('catering.quote.title')}</h2>
                                <div className="space-y-6">
                                    <BenefitItem icon={<Users />} title={t('catering.quote.capacity.title')} desc={t('catering.quote.capacity.desc')} />
                                    <BenefitItem icon={<MapPin />} title={t('catering.quote.location.title')} desc={t('catering.quote.location.desc')} />
                                    <BenefitItem icon={<Clock />} title={t('catering.quote.response.title')} desc={t('catering.quote.response.desc')} />
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit(onSubmit, (errors) => {
                                        console.log('Validation errors:', errors);
                                        toast.error('Controleer de gemarkeerde velden.');
                                    })} className="space-y-6">
                                        {selectedPackage && (
                                            <div className="bg-tamil-gold/10 border border-tamil-gold text-tamil-charcoal p-4 rounded-md flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={20} className="text-tamil-gold" />
                                                    <span className="font-bold">Geselecteerd Pakket: {selectedPackage}</span>
                                                </div>
                                                <button type="button" onClick={() => setValue('package', undefined)} className="text-xs underline hover:text-tamil-maroon">
                                                    Wijzigen
                                                </button>
                                            </div>
                                        )}
                                        <InputField label={t('catering.form.name')} name="name" register={register} error={errors.name?.message} />
                                        <InputField label={t('catering.form.email')} name="email" type="email" register={register} error={errors.email?.message} />
                                        <InputField label={t('catering.form.phone')} name="phone" type="tel" register={register} error={errors.phone?.message} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label={t('catering.form.date')} name="eventDate" type="date" register={register} error={errors.eventDate?.message} />
                                            <InputField label={t('catering.form.guests')} name="guests" type="number" register={register} error={errors.guests?.message} />
                                        </div>
                                        <InputField label={t('catering.form.location')} name="location" register={register} error={errors.location?.message} />
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {t('catering.form.submit')}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};

const PackageCard = ({ pkg, featured, onSelect, onQuote, badge }: {
    pkg: CateringPackageData; featured?: boolean; onSelect: () => void; onQuote: () => void; badge?: string;
}) => {
    const totalItems = pkg.categories.reduce((acc, c) => acc + c.items.length, 0);

    return (
        <Card className={featured ? 'border-tamil-maroon border-2 scale-105 shadow-xl relative z-10' : ''}>
            {featured && badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tamil-maroon text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                    {badge}
                </div>
            )}
            <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold text-tamil-maroon mb-2">
                    €{pkg.basePrice.toFixed(2)} <span className="text-base font-normal text-gray-400">p.p.</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{pkg.description}</p>

                <div className="text-left space-y-3 mb-6">
                    {pkg.categories.map((cat, i) => (
                        <div key={i} className="flex gap-2 text-sm items-start">
                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span>
                                <strong>{cat.name}</strong>
                                <span className="text-gray-400 ml-1">({cat.items.length} options)</span>
                            </span>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-gray-400 mb-6">
                    {totalItems} items · {pkg.minGuests}–{pkg.maxGuests || '∞'} guests
                </div>

                <div className="space-y-2">
                    <Button variant={featured ? 'primary' : 'outline'} className="w-full gap-2" onClick={onSelect}>
                        Customize & Order <ArrowRight size={16} />
                    </Button>
                    <button onClick={onQuote} className="w-full text-xs text-gray-400 hover:text-tamil-maroon underline transition-colors">
                        Or request a custom quote
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

const BenefitItem = ({ icon, title, desc }: any) => (
    <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-tamil-maroon/10 flex items-center justify-center text-tamil-maroon shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-gray-500 text-sm">{desc}</p>
        </div>
    </div>
);

const InputField = ({ label, name, type = 'text', register, error }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            {...register(name)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none transition-all"
        />
        {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
    </div>
);
