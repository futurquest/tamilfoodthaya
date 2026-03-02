import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CateringController } from './catering.controller';
import { CateringService } from './catering.service';
import { CateringQuote, CateringQuoteSchema } from './schemas/catering-quote.schema';
import { CateringPackage, CateringPackageSchema } from './schemas/catering-package.schema';
import { CateringOrder, CateringOrderSchema } from './schemas/catering-order.schema';
import { ChangeRequest, ChangeRequestSchema } from './schemas/change-request.schema';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CateringQuote.name, schema: CateringQuoteSchema },
      { name: CateringPackage.name, schema: CateringPackageSchema },
      { name: CateringOrder.name, schema: CateringOrderSchema },
      { name: ChangeRequest.name, schema: ChangeRequestSchema },
    ]),
    CouponModule,
  ],
  controllers: [CateringController],
  providers: [CateringService],
})
export class CateringModule { }
