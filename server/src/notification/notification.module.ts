import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationLogEntity } from './entities/notification-log.entity';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationLogEntity]),
        ConfigModule,
    ],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule { }