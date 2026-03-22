import { useState, useEffect } from 'react';
import { getCateringPackages } from '../hooks/useApi';
import HeroSection from '../components/HeroSection';
import EventTypesSection from '../components/EventTypesSection';
import MenuSection from '../components/MenuSection';
import FeaturedPackagesSection from '../components/FeaturedPackagesSection';

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

export const HomePage = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);

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

    return (
        <div className="animate-fadeIn">
            <HeroSection />
            <EventTypesSection />
            <FeaturedPackagesSection packages={packages} loading={loadingPackages} />
            <MenuSection />
        </div>
    );
};
