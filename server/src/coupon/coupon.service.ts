import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity, CouponDiscountType } from './entities/coupon.entity';

@Injectable()
export class CouponService {
    constructor(
        @InjectRepository(CouponEntity) private couponRepo: Repository<CouponEntity>,
    ) { }

    async findAll(): Promise<CouponEntity[]> {
        return this.couponRepo.find({ order: { createdAt: 'DESC' } });
    }

    async create(data: Partial<CouponEntity>): Promise<CouponEntity> {
        const entity = this.couponRepo.create({
            _id: CouponEntity.newId(),
            code: String(data.code || '').toUpperCase(),
            ...data,
        });
        return this.couponRepo.save(entity);
    }

    async update(id: string, data: Partial<CouponEntity>): Promise<CouponEntity> {
        const updated = await this.couponRepo.update({ _id: id }, data);
        if (!updated.affected) throw new NotFoundException(`Coupon not found: ${id}`);
        return this.couponRepo.findOneOrFail({ where: { _id: id } });
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const result = await this.couponRepo.delete({ _id: id });
        return { deleted: result.affected ? true : false };
    }

    async validate(code: string, orderTotal: number): Promise<any> {
        const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase(), isActive: true } });
        if (!coupon) throw new BadRequestException('Coupon not found or inactive');

        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) throw new BadRequestException('Coupon is not yet valid');
        if (coupon.validUntil && now > coupon.validUntil) throw new BadRequestException('Coupon has expired');
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
        if (orderTotal < coupon.minOrderAmount) throw new BadRequestException(`Minimum order of €${coupon.minOrderAmount} required`);

        const discount = coupon.discountType === CouponDiscountType.PERCENTAGE
            ? Math.round((orderTotal * coupon.discountValue / 100) * 100) / 100
            : Math.min(coupon.discountValue, orderTotal);

        return {
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount,
            finalTotal: Math.max(0, orderTotal - discount),
        };
    }

    async incrementUsage(code: string): Promise<void> {
        await this.couponRepo.increment({ code: code.toUpperCase() }, 'usedCount', 1);
    }
}
