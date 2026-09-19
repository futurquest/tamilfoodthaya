import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { StripePaymentStrategy } from './payment/stripe.strategy';
import { OrderEntity } from './entities/order.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { PaymentGateway } from './payment/payment.interface';

import { PaymentGatewayFactory } from './payment/payment.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, MenuItemEntity]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    StripePaymentStrategy,
    PaymentGatewayFactory,
    {
      provide: PaymentGateway,
      useClass: StripePaymentStrategy,
    },
  ],
})
export class OrderModule { }