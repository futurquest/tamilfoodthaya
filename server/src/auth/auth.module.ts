import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { CateringOrderEntity } from '../catering/entities/catering-order.entity';
import { NotificationLog, NotificationLogSchema } from '../notification/schemas/notification.schema';
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
    // User/Order/CateringOrder are on Postgres now; NotificationLog stays on
    // Mongo until notification converts (transitional dual-DB).
    TypeOrmModule.forFeature([UserEntity, OrderEntity, CateringOrderEntity]),
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController, UserController],
  exports: [AuthService, UserService],
})
export class AuthModule { }