import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuModule } from './menu/menu.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { LeadModule } from './lead/lead.module';
import { CateringModule } from './catering/catering.module';
import { HealthModule } from './health/health.module';
import { MessageModule } from './message/message.module';
import { SettingsModule } from './settings/settings.module';
import { AddonModule } from './addon/addon.module';
import { CouponModule } from './coupon/coupon.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    WinstonModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 60, // 60 requests per minute
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true, // dev/sandbox only; replaced by migrations before prod
        ssl: false,
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    MenuModule,
    AuthModule,
    OrderModule,
    LeadModule,
    CateringModule,
    MessageModule,
    SettingsModule,
    AddonModule,
    CouponModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enforce the configured rate limits on every request.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
