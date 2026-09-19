import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    spiceLevel?: number;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    notes?: string;
}

function newOrderId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Order mapped 1:1 from the legacy Mongo `Order` collection.
 * `_id` stays a 24-hex varchar PK; `items` + `customerInfo` are jsonb columns so
 * the serialized API payload is byte-identical to the old Mongoose output
 * (no client changes). userId column is indexed like the legacy ref field.
 */
@Entity('orders')
export class OrderEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar', nullable: true })
    @Index()
    userId?: string | null;

    @Column({ type: 'jsonb' })
    items: OrderItem[];

    @Column({ type: 'double precision' })
    total: number;

    @Column({ type: 'varchar', length: 24, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'timestamptz' })
    pickupTime: Date;

    @Column({ type: 'jsonb' })
    customerInfo: CustomerInfo;

    @Column({ type: 'varchar', length: 24, default: 'unpaid' })
    paymentStatus: string;

    @Column({ type: 'varchar', nullable: true })
    stripeSessionId?: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmSource?: string | null;

    @Column({ type: 'varchar', nullable: true })
    couponCode?: string | null;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newOrderId();
    }
}