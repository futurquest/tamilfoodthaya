import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
    constructor(@InjectModel(Settings.name) private settingsModel: Model<Settings>) { }

    async getSettings(): Promise<Settings> {
        let settings = await this.settingsModel.findOne().exec();
        if (!settings) {
            settings = new this.settingsModel();
            await settings.save();
        }
        return settings;
    }

    async updateSettings(data: any): Promise<Settings> {
        const settings = await this.settingsModel.findOne().exec();
        if (settings) {
            Object.assign(settings, data);
            return settings.save();
        } else {
            const newSettings = new this.settingsModel(data);
            return newSettings.save();
        }
    }
}
