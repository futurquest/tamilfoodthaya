import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { StripePaymentStrategy } from './payment/stripe.strategy';
import { Order, OrderSchema } from './schemas/order.schema';
import { MenuItem, MenuItemSchema } from '../menu/schemas/menu-item.schema';
import { PaymentGateway } from './payment/payment.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    StripePaymentStrategy,
    {
      provide: PaymentGateway,
      useClass: StripePaymentStrategy,
    },
  ],
})
export class OrderModule { }
