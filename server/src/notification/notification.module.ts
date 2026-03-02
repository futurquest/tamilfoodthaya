import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationLog, NotificationLogSchema } from './schemas/notification.schema';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: NotificationLog.name, schema: NotificationLogSchema }]),
        ConfigModule,
    ],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule { }
