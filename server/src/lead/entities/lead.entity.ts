import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

function newLeadId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Lead mapped 1:1 from legacy Mongo leads.
 */
@Entity('leads')
export class LeadEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar' })
    phone: string;

    @Column({ type: 'varchar', nullable: true })
    eventDate?: string | null;

    @Column({ type: 'integer', nullable: true })
    guests?: number | null;

    @Column({ type: 'varchar', nullable: true })
    location?: string | null;

    @Column({ type: 'varchar', nullable: true })
    message?: string | null;

    @Column({ type: 'varchar', nullable: true })
    package?: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmSource?: string | null;

    @Column({ type: 'varchar', nullable: true })
    campaign?: string | null;

    @Column({ type: 'varchar', length: 24, default: 'OPEN' })
    status: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newLeadId();
    }
}