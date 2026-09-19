import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddonEntity } from './entities/addon.entity';

@Injectable()
export class AddonService {
    constructor(@InjectRepository(AddonEntity) private addonRepo: Repository<AddonEntity>) { }

    async findAll(adminView = false): Promise<AddonEntity[]> {
        const where = adminView ? {} : { isActive: true };
        return this.addonRepo.find({ where, order: { sortOrder: 'ASC', createdAt: 'ASC' } });
    }

    async findById(id: string): Promise<AddonEntity> {
        const addon = await this.addonRepo.findOne({ where: { _id: id } });
        if (!addon) throw new NotFoundException(`Add-on not found: ${id}`);
        return addon;
    }

    async create(data: any): Promise<AddonEntity> {
        const addon = this.addonRepo.create({
            _id: AddonEntity.newId(),
            name: data.name,
            nameTranslations: data.nameTranslations ?? null,
            description: data.description ?? '',
            descriptionTranslations: data.descriptionTranslations ?? null,
            price: data.price,
            pricingType: data.pricingType ?? 'fixed',
            category: data.category ?? 'other',
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder ?? 0,
        });
        return this.addonRepo.save(addon);
    }

    async update(id: string, data: any): Promise<AddonEntity> {
        const existing = await this.addonRepo.findOne({ where: { _id: id } });
        if (!existing) throw new NotFoundException(`Add-on not found: ${id}`);
        Object.assign(existing, data);
        return this.addonRepo.save(existing);
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const addon = await this.addonRepo.findOne({ where: { _id: id } });
        if (!addon) {
            return { deleted: false };
        }
        addon.isActive = false;
        await this.addonRepo.save(addon);
        return { deleted: true };
    }
}