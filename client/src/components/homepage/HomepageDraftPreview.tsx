import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone, Eye } from 'lucide-react';
import type { Device, Draft, Lang } from './homepage.types';
import { HOMEPAGE_MAX_FEATURED, pickText } from './homepage.types';

export const HomepageDraftPreview = ({
    draft,
    lang,
    device,
    packageById,
    menuItemById,
    onLangChange,
    onDeviceChange,
}: {
    draft: Draft;
    lang: Lang;
    device: Device;
    packageById: Map<string, any>;
    menuItemById: Map<string, any>;
    onLangChange: (lang: Lang) => void;
    onDeviceChange: (device: Device) => void;
}) => {
    const { t } = useTranslation();
    const visibleSections = [...draft.sections].sort((a, b) => a.order - b.order);
    const packages = draft.featuredPackageIds
        .slice(0, HOMEPAGE_MAX_FEATURED)
        .map((id) => packageById.get(id))
        .filter(Boolean);
    const menuItems = draft.featuredMenuItemIds
        .slice(0, HOMEPAGE_MAX_FEATURED)
        .map((id) => menuItemById.get(id))
        .filter(Boolean);

    const hero = draft.sections.find((section) => section.key === 'hero');
    const heroTitle = hero ? pickText(hero.title, lang) : '';
    const heroLead = hero ? pickText(hero.subtitle, lang) : '';

    const labelFor = (item: any) => pickText(item?.nameTranslations || item?.name, lang) || item?.name || '';

    const frameClass =
        device === 'mobile'
            ? 'mx-auto w-[300px] max-w-full overflow-hidden rounded-[24px] border border-slate-300 shadow-md'
            : 'w-full overflow-hidden rounded-2xl border border-slate-300 shadow-sm';

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                    <Eye size={17} className="text-amber-700" />
                    {t('admin.homepage.previewTitle', 'Live preview')}
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {(['en', 'nl', 'ta'] as Lang[]).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onLangChange(option)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition ${
                                lang === option ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                    type="button"
                    onClick={() => onDeviceChange('desktop')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition ${
                        device === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Monitor size={13} />
                    {t('admin.homepage.desktop', 'Desktop')}
                </button>
                <button
                    type="button"
                    onClick={() => onDeviceChange('mobile')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition ${
                        device === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Smartphone size={13} />
                    {t('admin.homepage.mobile', 'Mobile')}
                </button>
            </div>

            <div className={`mt-4 ${device === 'mobile' ? 'bg-stone-100 p-3' : ''}`}>
                <div className={frameClass}>
                    {visibleSections.map((section) => {
                        if (section.key === 'hero') {
                            return (
                                <div key="hero" className={device === 'mobile' ? 'px-4 py-6' : 'px-6 py-10'}>
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                                        {t('home2.eyebrow')}
                                    </p>
                                    <p lang={lang} className={`mt-2 font-extrabold leading-tight text-slate-950 ${device === 'mobile' ? 'text-lg' : 'text-2xl'}`}>
                                        {heroTitle || t('admin.homepage.noTitle', 'No title yet')}
                                    </p>
                                    <p lang={lang} className={`mt-2 font-medium leading-6 text-slate-500 ${device === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                                        {heroLead || t('admin.homepage.noLead', 'No subtitle yet')}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-(--brand-text) px-3 py-1.5 text-[11px] font-bold text-white">
                                            {t('home2.cateringCta')}
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700">
                                            {t('home2.menuCta')}
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        if (section.key === 'catering') {
                            if (!section.visible) return <HiddenSlot key="catering" label={t('admin.homepage.hiddenPreview', 'Catering hidden')} />;
                            return (
                                <div key="catering" className="border-t border-slate-200 px-6 py-5">
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                                        {t('admin.homepage.section.catering', 'Catering')}
                                    </p>
                                    <p lang={lang} className="mt-1 text-base font-extrabold text-slate-950">
                                        {pickText(section.title, lang) || t('admin.homepage.noTitle', 'No title yet')}
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                        {packages.length === 0 && (
                                            <p className="text-xs font-semibold text-slate-400">
                                                {t('admin.homepage.noFeaturedPackages', 'No featured packages')}
                                            </p>
                                        )}
                                        {packages.map((pkg) => (
                                            <p key={pkg._id} className="truncate text-xs font-semibold text-slate-600">
                                                · {labelFor(pkg)}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[11px] font-extrabold text-amber-700 underline decoration-amber-300 underline-offset-2">
                                        {t('admin.homepage.viewAll', 'View all')}
                                    </p>
                                </div>
                            );
                        }
                        if (section.key === 'menu') {
                            if (!section.visible) return <HiddenSlot key="menu" label={t('admin.homepage.hiddenPreview', 'Menu hidden')} />;
                            return (
                                <div key="menu" className="border-t border-slate-200 px-6 py-5">
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                                        {t('admin.homepage.section.menu', 'Menu')}
                                    </p>
                                    <p lang={lang} className="mt-1 text-base font-extrabold text-slate-950">
                                        {pickText(section.title, lang) || t('admin.homepage.noTitle', 'No title yet')}
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                        {menuItems.length === 0 && (
                                            <p className="text-xs font-semibold text-slate-400">
                                                {t('admin.homepage.noFeaturedMenu', 'No featured menu items')}
                                            </p>
                                        )}
                                        {menuItems.map((item) => (
                                            <p key={item._id} className="truncate text-xs font-semibold text-slate-600">
                                                · {labelFor(item)}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[11px] font-extrabold text-amber-700 underline decoration-amber-300 underline-offset-2">
                                        {t('admin.homepage.viewAll', 'View all')}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </section>
    );
};

const HiddenSlot = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-200 bg-stone-50 px-6 py-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <Eye size={10} className="mr-1 inline" />
            Hidden
        </span>
    </div>
);