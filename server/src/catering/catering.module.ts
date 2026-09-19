import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CateringController } from './catering.controller';
import { CateringService } from './catering.service';
import { CateringQuoteEntity } from './entities/catering-quote.entity';
import { CateringPackageEntity } from './entities/catering-package.entity';
import { CateringOrderEntity } from './entities/catering-order.entity';
import { ChangeRequestEntity } from './entities/change-request.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CateringQuoteEntity,
      CateringPackageEntity,
      CateringOrderEntity,
      ChangeRequestEntity,
      MenuItemEntity,
      UserEntity,
    ]),
    CouponModule,
  ],
  controllers: [CateringController],
  providers: [CateringService],
})
export class CateringModule { }