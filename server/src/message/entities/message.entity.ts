import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

function newMessageId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Message mapped 1:1 from legacy Mongo messages.
 */
@Entity('messages')
export class MessageEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar' })
    phone: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: false })
    read: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newMessageId();
    }
}