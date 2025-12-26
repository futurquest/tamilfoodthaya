import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 60, // 60 requests per minute
    }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
