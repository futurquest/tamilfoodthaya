import { useState, useEffect } from 'react';
import { api } from '../hooks/useApi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollReveal from './ScrollReveal';
import { Music, Flower2, Camera, Wine, Baby, Check } from 'lucide-react';

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
    entertainment: <Music size={28} className="text-purple-400" />,
    decoration: <Flower2 size={28} className="text-pink-400" />,
    service: <Wine size={28} className="text-blue-400" />,
    extra_time: <Baby size={28} className="text-green-400" />,
    other: <Camera size={28} className="text-gold-400" />,
};

const FALLBACK_ADDONS: Addon[] = [
    { _id: 'a1', name: 'DJ & Music', description: 'Professional DJ with full sound system and lighting for 4 hours.', price: 350, pricingType: 'fixed', category: 'entertainment' },
    { _id: 'a2', name: 'Flower Decoration', description: 'Elegant floral arrangements for tables, entrance, and stage.', price: 200, pricingType: 'fixed', category: 'decoration' },
    { _id: 'a3', name: 'Welcome Drinks', description: 'Mocktail / juice welcome drinks for all guests on arrival.', price: 8, pricingType: 'per_person', category: 'service' },
    { _id: 'a4', name: "Kids' Menu", description: 'Specially prepared mild dishes for children under 12.', price: 12, pricingType: 'per_person', category: 'service' },
    { _id: 'a5', name: 'Photographer', description: 'Professional event photographer for up to 5 hours.', price: 450, pricingType: 'fixed', category: 'other' },
];

export default function AddonsSection() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) => translations?.[currentLang] || translations?.nl || fallback || '';

    const [addons, setAddons] = useState<Addon[]>([]);

    useEffect(() => {
        api.get('/addons')
            .then(r => {
                const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
                setAddons(data.length > 0 ? data : FALLBACK_ADDONS);
            })
            .catch(() => setAddons(FALLBACK_ADDONS));
    }, []);

    return (
        <section className="py-16 md:py-20 bg-dark-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <ScrollReveal variant="fadeUp" className="text-center mb-12">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">Optional Extras</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">Elevate Your Event</h2>
                    <p className="text-dark-400 text-lg max-w-xl mx-auto">
                        Customise your catering package with hand-picked add-ons for an unforgettable experience.
                    </p>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-gold-400 mx-auto mt-5 rounded-full" />
                </ScrollReveal>

                {/* Add-ons grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                    {addons.map((addon) => (
                        <ScrollReveal key={addon._id} variant="fadeUp">
                            <div className="group bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-primary-500/40 hover:bg-dark-700/50 transition-all duration-300">
                                <div className="mb-4">
                                    {CATEGORY_ICONS[addon.category] || CATEGORY_ICONS.other}
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{getLabel((addon as any).nameTranslations, addon.name)}</h3>
                                <p className="text-dark-400 text-sm leading-relaxed mb-4">{getLabel((addon as any).descriptionTranslations, addon.description)}</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-2xl font-extrabold text-gold-400">€{addon.price}</span>
                                        <span className="text-dark-500 text-xs ml-1">{addon.pricingType === 'per_person' ? '/ person' : 'fixed'}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs text-primary-400 font-semibold bg-primary-500/10 px-3 py-1.5 rounded-full">
                                        <Check size={12} /> Add in checkout
                                    </span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* CTA */}
                <ScrollReveal variant="fadeUp" className="text-center">
                    <p className="text-dark-400 mb-4 text-sm">Add these extras when booking your catering package</p>
                    <Link to="/catering" className="btn-primary inline-flex items-center gap-2">
                        Browse Packages & Add-ons →
                    </Link>
                </ScrollReveal>
            </div>
        </section>
    );
}
