import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';
import { randomBytes } from 'crypto';

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
}

function newNotificationId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * NotificationLog mapped 1:1 from legacy Mongo notificationlogs.
 * Idempotency constraint (eventId + type) mirrors the legacy unique index.
 */
@Entity('notification_logs')
@Unique(['eventId', 'type'])
export class NotificationLogEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    eventId: string;

    @Column({ type: 'varchar', nullable: true })
    @Index()
    userId?: string | null;

    @Column({ type: 'varchar', nullable: true })
    referenceId?: string | null;

    @Column({ type: 'varchar', length: 16 })
    type: string;

    @Column({ type: 'varchar', length: 16, default: NotificationStatus.PENDING })
    status: NotificationStatus;

    @Column({ type: 'varchar', nullable: true })
    errorMessage?: string | null;

    @Column({ type: 'jsonb', nullable: true })
    payload?: any;

    @Column({ default: false })
    isCleared: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newNotificationId();
    }
}