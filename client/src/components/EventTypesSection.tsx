import { useTranslation } from 'react-i18next';
import { IconBirthday, IconWedding, IconCorporate, IconFamily, IconPrivate } from './Icons';
import ScrollReveal from './ScrollReveal';

const eventIcons = [
    IconBirthday,
    IconWedding,
    IconCorporate,
    IconFamily,
    IconPrivate,
];

const eventTypes = ['birthday', 'wedding', 'corporate', 'family', 'private'] as const;

const defaultLabels: Record<string, string> = {
    birthday: 'Birthday',
    wedding: 'Wedding',
    corporate: 'Corporate',
    family: 'Family',
    private: 'Private',
};

export default function EventTypesSection() {
    const { t } = useTranslation();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 overflow-x-hidden">
            <ScrollReveal variant="fadeUp" className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-dark-800 mb-3">
                    {t('home.eventsTitle', 'Events We Cater For')}
                </h2>
                <p className="text-dark-500 text-lg">
                    {t('home.eventsSubtitle', 'From intimate gatherings to grand celebrations')}
                </p>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4" style={{ transitionDelay: '0.1s' }}>
                {eventTypes.map((type, i) => {
                    const IconComponent = eventIcons[i];
                    return (
                        <div key={type} className="card-glow text-center group cursor-pointer">
                            <div className="flex justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 text-primary-500 [&_svg]:w-8 [&_svg]:h-8 md:[&_svg]:w-10 md:[&_svg]:h-10">
                                <IconComponent size={40} />
                            </div>
                            <p className="text-xs md:text-sm font-medium text-dark-700">
                                {t(`home.${type}`, defaultLabels[type])}
                            </p>
                        </div>
                    );
                })}
            </ScrollReveal>
        </section>
    );
}
