import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Addon } from './schemas/addon.schema';

@Injectable()
export class AddonService {
    constructor(@InjectModel(Addon.name) private addonModel: Model<Addon>) { }

    async findAll(adminView = false): Promise<Addon[]> {
        const query = adminView ? {} : { isActive: true };
        return this.addonModel.find(query).sort({ sortOrder: 1, createdAt: 1 }).exec();
    }

    async findById(id: string): Promise<Addon> {
        const addon = await this.addonModel.findById(id).exec();
        if (!addon) throw new NotFoundException(`Add-on not found: ${id}`);
        return addon;
    }

    async create(data: any): Promise<Addon> {
        return this.addonModel.create(data);
    }

    async update(id: string, data: any): Promise<Addon> {
        const updated = await this.addonModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!updated) throw new NotFoundException(`Add-on not found: ${id}`);
        return updated;
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        // Soft delete — set isActive false so existing orders still reference it
        await this.addonModel.findByIdAndUpdate(id, { isActive: false }).exec();
        return { deleted: true };
    }
}
