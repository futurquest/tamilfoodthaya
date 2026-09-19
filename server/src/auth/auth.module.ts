import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { CateringOrderEntity } from '../catering/entities/catering-order.entity';
import { NotificationLogEntity } from '../notification/entities/notification-log.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PassportModule,
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    // All auth cross-module models (User/Order/CateringOrder/Notification) are
    // on Postgres now. AuthModule is fully TypeORM.
    TypeOrmModule.forFeature([UserEntity, OrderEntity, CateringOrderEntity, NotificationLogEntity]),
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController, UserController],
  exports: [AuthService, UserService],
})
export class AuthModule { }