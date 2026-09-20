import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsEntity } from './entities/settings.entity';
import { CateringPackageEntity } from '../catering/entities/catering-package.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SettingsEntity, CateringPackageEntity, MenuItemEntity])],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }