import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCateringPackages, getPublishedHomepage } from '../hooks/useApi';
import HeroSection from '../components/HeroSection';
import OurStorySection from '../components/OurStorySection';
import EventTypesSection from '../components/EventTypesSection';
import MenuSection from '../components/MenuSection';
import FeaturedPackagesSection from '../components/FeaturedPackagesSection';
import EventGallery from '../components/EventGallery';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);

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

interface HomepageConfig {
    sections?: Array<{ key: string; visible: boolean; order: number; title?: any; subtitle?: any; description?: string }>;
    featuredPackages?: any[];
    featuredMenuItems?: any[];
}

const DEFAULT_SECTION_KEYS = ['hero', 'catering', 'menu'];

/**
 * The public endpoint returns the default snapshot whenever nothing has been
 * published yet. Treat that untouched shape as "unpublished" so the classic
 * homepage keeps rendering until an admin actually publishes picks/config.
 */
function isUnpublishedConfig(cfg: HomepageConfig | undefined): boolean {
    if (!cfg) return true;
    const sections = Array.isArray(cfg.sections) ? cfg.sections : [];
    if (sections.length === 0) return true;
    const allVisibleDefaults =
        sections.length === DEFAULT_SECTION_KEYS.length &&
        sections.every((section) => section && section.visible !== false);
    const noFeatures =
        (!Array.isArray(cfg.featuredPackages) || cfg.featuredPackages.length === 0) &&
        (!Array.isArray(cfg.featuredMenuItems) || cfg.featuredMenuItems.length === 0);
    return allVisibleDefaults && noFeatures;
}

function toPackageShape(p: any): Package {
    return {
        _id: p._id,
        name: p.nameTranslations || p.name,
        description: p.descriptionTranslations || p.description,
        image: p.image,
        basePrice: p.basePrice,
        pricingModel: p.pricingModel,
        minGuests: p.minGuests,
        maxGuests: p.maxGuests,
        durationHours: p.durationHours,
    };
}

const SectionRenderer = ({ cfg }: { cfg: HomepageConfig }) => {
    const { i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'nl';

    const sections = [...(cfg.sections || [])].sort((a, b) => a.order - b.order);
    const heroSection = sections.find((section) => section.key === 'hero');
    const packages = (cfg.featuredPackages || []).map(toPackageShape);

    const pick = (text: any, langHint = lang) => {
        if (!text) return undefined;
        if (typeof text === 'string') return text;
        return text[langHint] || text.nl || text.en || '';
    };

    return (
        <div>
            {sections.map((section) => {
                if (!section.visible) return null;
                if (section.key === 'hero') {
                    return (
                        <ScrollReveal key="hero">
                            <HeroSection
                                data={{
                                    title: pick(heroSection?.title),
                                    lead: pick(heroSection?.subtitle) || heroSection?.description,
                                }}
                            />
                        </ScrollReveal>
                    );
                }
                if (section.key === 'catering') {
                    return (
                        <ScrollReveal key="catering">
                            <FeaturedPackagesSection packages={packages} loading={false} />
                        </ScrollReveal>
                    );
                }
                if (section.key === 'menu') {
                    return (
                        <ScrollReveal key="menu">
                            <MenuSection />
                        </ScrollReveal>
                    );
                }
                return null;
            })}
        </div>
    );
};

const ClassicHomePage = ({
    packages,
    loadingPackages,
}: {
    packages: Package[];
    loadingPackages: boolean;
}) => (
    <div>
        <ScrollReveal delay={0.1}>
            <HeroSection />
        </ScrollReveal>
        <ScrollReveal>
            <OurStorySection />
        </ScrollReveal>
        <ScrollReveal>
            <EventTypesSection />
        </ScrollReveal>
        <ScrollReveal>
            <EventGallery />
        </ScrollReveal>
        <ScrollReveal>
            <FeaturedPackagesSection packages={packages} loading={loadingPackages} />
        </ScrollReveal>
        <ScrollReveal>
            <MenuSection />
        </ScrollReveal>
    </div>
);

export const HomePage = () => {
    const { t } = useTranslation();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [published, setPublished] = useState<HomepageConfig | null>(null);

    useEffect(() => {
        getCateringPackages()
            .then(data => {
                // Normalise — API may return array or { packages: [...] } or { data: [...] }
                if (Array.isArray(data)) {
                    setPackages(data);
                } else if (Array.isArray(data?.packages)) {
                    setPackages(data.packages);
                } else if (Array.isArray(data?.data)) {
                    setPackages(data.data);
                }
                // If none match, leave as [] — FeaturedPackagesSection renders null when empty
            })
            .catch(() => { })
            .finally(() => setLoadingPackages(false));
    }, []);

    useEffect(() => {
        getPublishedHomepage()
            .then(cfg => setPublished(cfg))
            .catch(() => setPublished(null));
    }, [t]);

    if (published && !isUnpublishedConfig(published)) {
        return <SectionRenderer cfg={published} />;
    }

    return <ClassicHomePage packages={packages} loadingPackages={loadingPackages} />;
};