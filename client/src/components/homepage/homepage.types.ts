export type Lang = 'en' | 'nl' | 'ta';
export type SectionKey = 'hero' | 'catering' | 'menu';
export type Device = 'desktop' | 'mobile';

export interface SectionText {
    en: string;
    nl: string;
    ta: string;
}

export interface Section {
    key: SectionKey;
    visible: boolean;
    order: number;
    title: SectionText;
    subtitle: SectionText;
}

export interface Draft {
    sections: Section[];
    featuredPackageIds: string[];
    featuredMenuItemIds: string[];
}

export const SECTION_KEYS: SectionKey[] = ['hero', 'catering', 'menu'];
export const HOMEPAGE_MAX_FEATURED = 3;

export const emptySectionText = (): SectionText => ({ en: '', nl: '', ta: '' });

export const normalizeCatalog = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.packages)) return data.packages;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

export const pickText = (text: any, lang: Lang): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.nl || text.en || '';
};

/** Normalize an arbitrary API draft (or missing draft) into the canonical shape for the editor. */
export const toDraft = (draft: any): Draft => {
    if (!draft) {
        return {
            sections: SECTION_KEYS.map((key, index) => ({
                key,
                visible: true,
                order: index,
                title: emptySectionText(),
                subtitle: emptySectionText(),
            })),
            featuredPackageIds: [],
            featuredMenuItemIds: [],
        };
    }
    const known = new Set<SectionKey>(SECTION_KEYS);
    const sections: Section[] = (Array.isArray(draft.sections) ? draft.sections : [])
        .filter((section: any) => section && known.has(section.key))
        .map((section: any) => ({
            key: section.key,
            visible: section.visible !== false,
            order: typeof section.order === 'number' ? section.order : SECTION_KEYS.indexOf(section.key),
            title: { en: section.title?.en || '', nl: section.title?.nl || '', ta: section.title?.ta || '' },
            subtitle: {
                en: section.subtitle?.en || '',
                nl: section.subtitle?.nl || '',
                ta: section.subtitle?.ta || '',
            },
        }));
    const sectionsByKey = new Map(sections.map((section) => [section.key, section]));
    const unordered: Section[] = SECTION_KEYS.map((key) => {
        const existing = sectionsByKey.get(key);
        return (
            existing || {
                key,
                visible: true,
                order: SECTION_KEYS.indexOf(key),
                title: emptySectionText(),
                subtitle: emptySectionText(),
            }
        );
    });
    // Honour server-stored order values, then renumber sequentially to keep them unique.
    const normalized = [...unordered].sort((a, b) => a.order - b.order);
    normalized.forEach((section, index) => {
        section.order = index;
    });
    return {
        sections: normalized,
        featuredPackageIds: Array.isArray(draft.featuredPackageIds) ? draft.featuredPackageIds.slice(0, HOMEPAGE_MAX_FEATURED) : [],
        featuredMenuItemIds: Array.isArray(draft.featuredMenuItemIds) ? draft.featuredMenuItemIds.slice(0, HOMEPAGE_MAX_FEATURED) : [],
    };
};