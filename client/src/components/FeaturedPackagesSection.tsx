import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconUsers, IconClock } from './Icons';
import ScrollReveal from './ScrollReveal';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600';

interface Package {
    _id: string;
    name: string | { en: string; ta?: string; nl?: string };
    description: string | { en: string; ta?: string; nl?: string };
    image?: string;
    basePrice?: number;
    pricingModel?: string;
    minGuests?: number;
    maxGuests?: number;
    durationHours?: number;
}

function getLabel(val: string | { nl?: string; en: string; ta?: string } | undefined, lang: string, fallback = '') {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    return (val as any)[lang] || val.nl || val.en || fallback;
}

export default function FeaturedPackagesSection({ packages = [] }: { packages: Package[] }) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';

    if (packages.length === 0) return null;

    return (
        <section className="py-16 md:py-20 bg-gradient-to-b from-transparent to-orange-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal variant="fadeUp" className="mb-12">
                    <div className="page_title text-center mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary-600">
                            {t('home.featuredTitle', 'Featured Packages')}
                        </h2>
                        <div className="single_line" />
                    </div>
                    <p className="text-center text-dark-600 text-lg max-w-2xl mx-auto">
                        {t('home.featuredSubtitle', 'Choose from our curated catering packages for every occasion.')}
                    </p>
                </ScrollReveal>

                <ScrollReveal variant="fadeUp" style={{ transitionDelay: '0.15s' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {packages.map((pkg, i) => (
                            <div
                                key={pkg._id}
                                className="group bg-white rounded-2xl overflow-hidden border border-dark-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="relative h-44 sm:h-48 overflow-hidden">
                                    <img
                                        src={pkg.image || PLACEHOLDER_IMG}
                                        alt={getLabel(pkg.name, currentLang)}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-block px-3 py-1 rounded-full bg-white/95 text-primary-600 font-bold text-sm shadow-sm">
                                            €{pkg.basePrice}
                                            {pkg.pricingModel === 'per_person' && <span className="font-normal text-dark-500">/ {t('home.perPerson', 'per person')}</span>}
                                        </span>
                                    </div>
                                    {i === 1 && (
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-dark-900 text-xs font-bold shadow-sm">
                                            POPULAR
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 md:p-5">
                                    <h4 className="text-xl font-semibold text-dark-800 mb-2 border-b border-dashed border-primary-300 pb-2">
                                        {getLabel(pkg.name, currentLang)}
                                    </h4>
                                    <p className="text-dark-600 text-sm font-light tracking-wide line-clamp-2 mb-4">
                                        {getLabel(pkg.description, currentLang)}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-dark-500 mb-5">
                                        {pkg.minGuests != null && pkg.maxGuests != null && (
                                            <span className="flex items-center gap-1.5">
                                                <IconUsers size={14} className="text-primary-500" />
                                                {pkg.minGuests}-{pkg.maxGuests} {t('home.guests', 'guests')}
                                            </span>
                                        )}
                                        {pkg.durationHours != null && (
                                            <span className="flex items-center gap-1.5">
                                                <IconClock size={14} className="text-primary-500" />
                                                {pkg.durationHours} {t('home.hours', 'hours')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link to={`/catering/checkout/${pkg._id}`} className="btn-primary flex-1 text-center text-sm py-2.5 px-4">
                                            {t('home.bookNow', 'Book Now')}
                                        </Link>
                                        <Link to={`/catering`} className="btn-secondary text-sm text-center py-2.5 px-4">
                                            {t('home.viewDetails', 'View Details')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>

                <ScrollReveal variant="fadeUp" style={{ transitionDelay: '0.25s' }} className="text-center mt-12">
                    <Link to="/catering" className="menu_btn inline-block px-8 py-4 bg-primary-500 text-white font-bold rounded-xl border border-primary-500 overflow-hidden relative z-10 transition-all duration-300 hover:bg-primary-600 hover:border-primary-600">
                        View All Packages
                    </Link>
                </ScrollReveal>
            </div>
        </section>
    );
}
