import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export type PricingType = 'fixed' | 'per_person';
export type AddonCategory = 'decoration' | 'entertainment' | 'service' | 'extra_time' | 'other';

export interface AddonTranslation {
    en?: string;
    ta?: string;
    nl?: string;
    [key: string]: string | undefined;
}

function newAddonId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * Addon mapped 1:1 from legacy Mongo addons.
 */
@Entity('addons')
export class AddonEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'jsonb', nullable: true })
    nameTranslations?: AddonTranslation | null;

    @Column({ type: 'varchar', default: '' })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    descriptionTranslations?: AddonTranslation | null;

    @Column({ type: 'double precision' })
    price: number;

    @Column({ type: 'varchar', length: 16, default: 'fixed' })
    pricingType: PricingType;

    @Column({ type: 'varchar', length: 24, default: 'other' })
    category: AddonCategory;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'integer', default: 0 })
    sortOrder: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newAddonId();
    }
}