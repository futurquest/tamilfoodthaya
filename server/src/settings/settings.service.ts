import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from './entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(SettingsEntity) private settingsRepo: Repository<SettingsEntity>) { }

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
}