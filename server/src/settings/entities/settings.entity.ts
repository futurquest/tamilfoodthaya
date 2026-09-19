import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

const DEFAULT_BUSINESS_HOURS: Record<string, string> = {
    monday: 'Gesloten',
    tuesday: '12:00 - 22:00',
    wednesday: '12:00 - 22:00',
    thursday: '12:00 - 22:00',
    friday: '12:00 - 23:00',
    saturday: '12:00 - 23:00',
    sunday: '12:00 - 22:00',
};

function newSettingsId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Settings mapped from legacy Mongo settings (single-doc pattern preserved;
 * getSettings/updateSettings operate on the first row).
 */
@Entity('settings')
export class SettingsEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar', default: 'Tamil Food Thaya' })
    siteName: string;

    @Column({ type: 'varchar', default: '' })
    address: string;

    @Column({ type: 'varchar', default: '' })
    phone: string;

    @Column({ type: 'varchar', default: '' })
    email: string;

    @Column({ type: 'varchar', default: '' })
    whatsapp: string;

    @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_BUSINESS_HOURS)}'::jsonb` })
    businessHours: Record<string, string>;

    @Column({ type: 'varchar', default: '' })
    facebookUrl: string;

    @Column({ type: 'varchar', default: '' })
    instagramUrl: string;

    @Column({ default: true })
    ordersEnabled: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newSettingsId();
    }
}