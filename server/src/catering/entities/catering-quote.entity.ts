import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

function newQuoteId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * CateringQuote mapped 1:1 from legacy Mongo cateringquotes.
 */
@Entity('catering_quotes')
export class CateringQuoteEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar' })
    phone: string;

    @Column({ type: 'timestamptz' })
    eventDate: Date;

    @Column({ type: 'integer' })
    guests: number;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'varchar', nullable: true })
    budgetRange?: string | null;

    @Column({ type: 'varchar', nullable: true })
    eventType?: string | null;

    @Column({ type: 'varchar', nullable: true })
    notes?: string | null;

    @Column({ type: 'varchar', nullable: true })
    utmSource?: string | null;

    @Column({ type: 'varchar', nullable: true })
    campaign?: string | null;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newQuoteId();
    }
}