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
      useFactory: (configService: ConfigService) => {
        const poolMax = Number(configService.get<string>('POSTGRES_POOL_MAX', '10'));
        if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 50) {
          throw new Error('POSTGRES_POOL_MAX must be an integer from 1 to 50');
        }
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          autoLoadEntities: true,
          // Never let production change schema implicitly. Development keeps its
          // current behavior unless TYPEORM_SYNCHRONIZE=false is configured.
          synchronize: process.env.NODE_ENV !== 'production'
            && configService.get<string>('TYPEORM_SYNCHRONIZE', 'true') === 'true',
          ssl: false,
          extra: {
            max: poolMax,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },
        };
      },
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
