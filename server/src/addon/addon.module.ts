import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonController } from './addon.controller';
import { AddonService } from './addon.service';
import { AddonEntity } from './entities/addon.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AddonEntity]),
    ],
    controllers: [AddonController],
    providers: [AddonService],
    exports: [AddonService],
})
export class AddonModule { }