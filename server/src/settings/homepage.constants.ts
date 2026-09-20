/**
 * Homepage domain contract.
 *
 * Sections are a FIXED set of three; the hero is locked to index 0 and cannot
 * be hidden or reordered. Remaining sections (catering, menu) may be hidden
 * and ordered, but their order resolvers stay within the fixed three slots
 * (holes are never created: render falls back to the next visible section).
 */
export const HOMEPAGE_SECTION_KEYS = ['hero', 'catering', 'menu'] as const;
export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export const HOMEPAGE_MAX_FEATURED_PACKAGES = 3;
export const HOMEPAGE_MAX_FEATURED_MENU_ITEMS = 3;
export const HOMEPAGE_HERO_INDEX = 0;
export const HOMEPAGE_SECTION_LOCKED = new Set<HomepageSectionKey>(['hero']);

export const DEFAULT_HOMEPAGE_SECTIONS: Array<{
    key: HomepageSectionKey;
    visible: boolean;
    order: number;
}> = [
    { key: 'hero', visible: true, order: 0 },
    { key: 'catering', visible: true, order: 1 },
    { key: 'menu', visible: true, order: 2 },
];
