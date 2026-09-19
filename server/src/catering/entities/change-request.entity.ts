import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export enum ChangeRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

function newChangeRequestId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * ChangeRequest mapped 1:1 from legacy Mongo changerequests.
 */
@Entity('change_requests')
export class ChangeRequestEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    userId: string;

    @Column({ type: 'varchar' })
    orderId: string;

    @Column({ type: 'varchar' })
    requestedChanges: string;

    @Column({ type: 'varchar', length: 16, default: ChangeRequestStatus.PENDING })
    status: ChangeRequestStatus;

    @Column({ type: 'varchar', nullable: true })
    adminNotes?: string | null;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newChangeRequestId();
    }
}