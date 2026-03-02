import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon } from './schemas/coupon.schema';

@Injectable()
export class CouponService {
    constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) { }

    async findAll(): Promise<Coupon[]> {
        return this.couponModel.find().sort({ createdAt: -1 }).exec();
    }

    async create(data: any): Promise<Coupon> {
        return this.couponModel.create(data);
    }

    async update(id: string, data: any): Promise<Coupon> {
        const updated = await this.couponModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!updated) throw new NotFoundException(`Coupon not found: ${id}`);
        return updated;
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        await this.couponModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }

    async validate(code: string, orderTotal: number): Promise<any> {
        const coupon = await this.couponModel.findOne({ code: code.toUpperCase(), isActive: true }).exec();
        if (!coupon) throw new BadRequestException('Coupon not found or inactive');

        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) throw new BadRequestException('Coupon is not yet valid');
        if (coupon.validUntil && now > coupon.validUntil) throw new BadRequestException('Coupon has expired');
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
        if (orderTotal < coupon.minOrderAmount) throw new BadRequestException(`Minimum order of €${coupon.minOrderAmount} required`);

        const discount = coupon.discountType === 'percentage'
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
        await this.couponModel.findOneAndUpdate({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } }).exec();
    }
}
