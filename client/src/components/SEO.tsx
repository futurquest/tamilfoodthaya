import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://tamilfoodthaya.nl').replace(/\/$/, '');
export const PUBLIC_PATHS = ['/', '/catering', '/menu', '/contact'];

function meta(attribute: 'name' | 'property', key: string, content: string) {
    let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attribute, key);
        document.head.appendChild(node);
    }
    node.content = content;
}

/** One metadata owner across public, account and administrative routes. */
export function RouteMetadata() {
    const { pathname: rawPathname } = useLocation();
    const pathname = rawPathname.replace(/\/+$/, '') || '/';
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage?.split('-')[0] || 'nl';
    useEffect(() => {
        document.documentElement.lang = lang;
        const publicPage = PUBLIC_PATHS.includes(pathname);
        meta('name', 'robots', publicPage ? 'index, follow, max-image-preview:large' : 'noindex, follow');
        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = `${SITE_URL}${pathname}`;
        meta('property', 'og:url', canonical.href);
        meta('property', 'og:locale', { nl: 'nl_NL', en: 'en_GB', ta: 'ta_IN' }[lang] || 'nl_NL');
        meta('property', 'og:site_name', 'Tamil Food Thaya');
        meta('property', 'og:type', 'website');
        meta('property', 'og:image', `${SITE_URL}/hero-catering.jpg`);
        meta('name', 'twitter:card', 'summary_large_image');
        meta('name', 'twitter:image', `${SITE_URL}/hero-catering.jpg`);
        if (!publicPage) {
            document.title = pathname.startsWith('/admin') ? 'Administration | Tamil Food Thaya' : 'Your account | Tamil Food Thaya';
            meta('name', 'description', 'Manage your Tamil Food Thaya account and catering bookings.');
        }
        // Remove build-time structured data before the current route supplies its own.
        document.querySelector('[data-static-schema]')?.remove();
    }, [pathname, lang]);
    return null;
}

export const SEO = ({ title, description, schema }: { title: string; description: string; schema?: Record<string, unknown> }) => {
    const { pathname } = useLocation();
    useEffect(() => {
        document.title = `${title} | Tamil Food Thaya`;
        meta('name', 'description', description);
        meta('property', 'og:title', document.title);
        meta('property', 'og:description', description);
        meta('name', 'twitter:title', document.title);
        meta('name', 'twitter:description', description);
    }, [title, description, pathname]);
    return schema ? <script type="application/ld+json">{JSON.stringify(schema).replace(/</g, '\\u003c')}</script> : null;
};

// Only business facts established by the brief. Contact details are managed in settings.
export const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tamil Food Thaya',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Traditional Tamil food and catering in the Netherlands.',
    areaServed: { '@type': 'Country', name: 'Netherlands' },
};
