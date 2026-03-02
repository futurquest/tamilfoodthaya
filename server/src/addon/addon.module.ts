import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddonController } from './addon.controller';
import { AddonService } from './addon.service';
import { Addon, AddonSchema } from './schemas/addon.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Addon.name, schema: AddonSchema }]),
    ],
    controllers: [AddonController],
    providers: [AddonService],
    exports: [AddonService],
})
export class AddonModule { }
