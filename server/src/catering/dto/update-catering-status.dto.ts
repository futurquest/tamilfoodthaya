import { IsEnum, IsNotEmpty } from 'class-validator';
import { CateringOrderStatus } from '../entities/catering-order.entity';

export class UpdateCateringStatusDto {
    @IsNotEmpty()
    @IsEnum(CateringOrderStatus)
    status: CateringOrderStatus;
}
