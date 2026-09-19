import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export enum CouponDiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

function newCouponId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Coupon 1:1 from the legacy Mongo `Coupon` collection.
 * `_id` stays a 24-hex varchar PK; `code` stays unique + uppercase so the admin
 * CRUD, the /validate endpoint payloads and the order at-checkout math all stay
 * byte-identical to today's Mongoose API.
 */
@Entity('coupons')
export class CouponEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'varchar', length: 16, default: 'percentage' })
    discountType: CouponDiscountType;

    @Column({ type: 'double precision' })
    discountValue: number;

    @Column({ type: 'double precision', default: 0 })
    minOrderAmount: number;

    @Column({ type: 'int', default: 0 })
    maxUses: number;

    @Column({ type: 'int', default: 0 })
    usedCount: number;

    @Column({ type: 'timestamptz', nullable: true })
    validFrom?: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    validUntil?: Date | null;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newCouponId();
    }
}
