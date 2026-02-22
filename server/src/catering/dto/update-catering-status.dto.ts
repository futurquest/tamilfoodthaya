import { IsEnum, IsNotEmpty } from 'class-validator';
import { CateringOrderStatus } from '../schemas/catering-order.schema';

export class UpdateCateringStatusDto {
    @IsNotEmpty()
    @IsEnum(CateringOrderStatus)
    status: CateringOrderStatus;
}
