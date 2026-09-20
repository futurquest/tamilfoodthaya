import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SettingsEntity } from './entities/settings.entity';
import { CateringPackageEntity } from '../catering/entities/catering-package.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import {
    HOMEPAGE_MAX_FEATURED_MENU_ITEMS,
    HOMEPAGE_MAX_FEATURED_PACKAGES,
    HOMEPAGE_SECTION_KEYS,
    DEFAULT_HOMEPAGE_SECTIONS,
    HomepageSectionKey,
} from './homepage.constants';
import { HomepageDto } from './dto/homepage.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SettingsEntity) private settingsRepo: Repository<SettingsEntity>,
        @InjectRepository(CateringPackageEntity) private cateringPackageRepo: Repository<CateringPackageEntity>,
        @InjectRepository(MenuItemEntity) private menuItemRepo: Repository<MenuItemEntity>,
    ) { }

    async getSettings(): Promise<SettingsEntity> {
        let settings = await this.settingsRepo.findOne({ order: { createdAt: 'ASC' } });
        if (!settings) {
            settings = await this.settingsRepo.save(this.settingsRepo.create({ _id: SettingsEntity.newId() }));
        }
        return settings;
    }

    async updateSettings(data: any): Promise<SettingsEntity> {
        let settings = await this.settingsRepo.findOne({ order: { createdAt: 'ASC' } });
        if (settings) {
            Object.assign(settings, data);
            return this.settingsRepo.save(settings);
        } else {
            const newSettings = new SettingsEntity();
            newSettings._id = SettingsEntity.newId();
            Object.assign(newSettings, data);
            return this.settingsRepo.save(newSettings);
        }
    }

    /**
     * Homepage config served to the PUBLIC route. Only the PUBLISHED snapshot is
     * considered — the draft is never consulted here, and the draft jsonb columns
     * are never leaked. Featured picks are resolved to live, available, active
     * entities (capped at HOMEPAGE_MAX_FEATURED_* in the order the IDs appear),
     * then the array is sliced in-place so a stale/deleted id never widens the cap.
     */
    async getPublishedHomepage(): Promise<Record<string, any>> {
        const settings = await this.getSettings();
        const cfg = settings.homepagePublished && Object.keys(settings.homepagePublished).length
            ? settings.homepagePublished
            : { sections: DEFAULT_HOMEPAGE_SECTIONS, featuredPackageIds: [], featuredMenuItemIds: [] };
        const result: Record<string, any> = { sections: cfg.sections ?? DEFAULT_HOMEPAGE_SECTIONS };
        result.featuredPackages = await this.resolveFeaturedPackages(cfg.featuredPackageIds ?? []);
        result.featuredMenuItems = await this.resolveFeaturedMenuItems(cfg.featuredMenuItemIds ?? []);
        return result;
    }

    /** Admin draft view — full working config incl. trilingual titles, order, visibility. Admin-only route. */
    async getHomepageDraft(): Promise<Record<string, any>> {
        const settings = await this.getSettings();
        return {
            draft: settings.homepageDraft && Object.keys(settings.homepageDraft).length ? settings.homepageDraft : { sections: DEFAULT_HOMEPAGE_SECTIONS, featuredPackageIds: [], featuredMenuItemIds: [] },
            published: settings.homepagePublished && Object.keys(settings.homepagePublished).length ? settings.homepagePublished : {},
        };
    }

    /** Persist the admin's working draft (admin-only route). */
    async updateHomepageDraft(data: HomepageDto): Promise<Record<string, any>> {
        const settings = await this.getSettings();
        settings.homepageDraft = data;
        const saved = await this.settingsRepo.save(settings);
        return { draft: saved.homepageDraft };
    }

    /** Publish the current draft: the ONLY writer of homepagePublished (admin-only route). */
    async publishHomepage(): Promise<Record<string, any>> {
        const settings = await this.getSettings();
        const draft = settings.homepageDraft && Object.keys(settings.homepageDraft).length
            ? settings.homepageDraft
            : { sections: DEFAULT_HOMEPAGE_SECTIONS, featuredPackageIds: [], featuredMenuItemIds: [] };
        settings.homepagePublished = draft;
        const saved = await this.settingsRepo.save(settings);
        return { published: saved.homepagePublished };
    }

    private async resolveFeaturedPackages(ids: string[]): Promise<any[]> {
        const capped = ids.slice(0, HOMEPAGE_MAX_FEATURED_PACKAGES).filter(Boolean);
        if (!capped.length) return [];
        const found = await this.cateringPackageRepo.find({ where: { _id: In(capped), isActive: true, available: true } });
        const byId = new Map(found.map(p => [p._id, p]));
        return capped.map(id => byId.get(id)).filter(Boolean);
    }

    private async resolveFeaturedMenuItems(ids: string[]): Promise<any[]> {
        const capped = ids.slice(0, HOMEPAGE_MAX_FEATURED_MENU_ITEMS).filter(Boolean);
        if (!capped.length) return [];
        const found = await this.menuItemRepo.find({ where: { _id: In(capped), isActive: true, available: true } });
        const byId = new Map(found.map(m => [m._id, m]));
        return capped.map(id => byId.get(id)).filter(Boolean);
    }
}