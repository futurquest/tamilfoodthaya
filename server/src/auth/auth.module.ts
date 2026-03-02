import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { CateringOrder, CateringOrderSchema } from '../catering/schemas/catering-order.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
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
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CateringOrder.name, schema: CateringOrderSchema },
      { name: Order.name, schema: OrderSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController, UserController],
  exports: [AuthService, UserService],
})
export class AuthModule { }
