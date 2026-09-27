import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export enum CateringOrderStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    QUOTED = 'quoted',
    CONFIRMED = 'confirmed',
    PAID = 'paid',
    PREPARING = 'preparing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface SelectedItem {
    itemName: string;
    choiceName?: string;
    price: number;
}

export interface CategorySelection {
    categoryName: string;
    selectedItems: SelectedItem[];
}

export interface CateringCustomerInfo {
    name: string;
    email: string;
    phone: string;
    notes?: string;
}

function newCateringOrderId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * CateringOrder mapped 1:1 from legacy Mongo cateringorders.
 * `selections` + `customerInfo` are jsonb; `_id` stays a 24-hex varchar PK.
 */
@Entity('catering_orders')
export class CateringOrderEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar', nullable: true })
    @Index()
    userId?: string | null;

    @Column({ type: 'varchar' })
    packageId: string;

    @Column({ type: 'varchar' })
    packageName: string;

    @Column({ type: 'jsonb', default: [] })
    selections: CategorySelection[];

    @Column({ type: 'integer' })
    guests: number;

    @Column({ type: 'timestamptz' })
    eventDate: Date;

    @Column({ type: 'varchar', nullable: true })
    eventLocation?: string | null;

    @Column({ type: 'double precision' })
    pricePerPerson: number;

    @Column({ type: 'double precision' })
    totalPrice: number;

    @Column({ type: 'jsonb' })
    customerInfo: CateringCustomerInfo;

    @Column({ type: 'varchar', length: 24, default: CateringOrderStatus.PENDING })
    status: CateringOrderStatus;

    @Column({ type: 'varchar', length: 24, default: 'unpaid' })
    paymentStatus: string;

    @Column({ type: 'varchar', nullable: true })
    stripeSessionId?: string | null;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newCateringOrderId();
    }
}
