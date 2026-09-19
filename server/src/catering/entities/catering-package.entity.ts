import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export interface TranslatedText {
    en?: string;
    ta?: string;
    nl?: string;
    [key: string]: string | undefined;
}

export interface CateringItemRef {
    /** Legacy Mongo populate stores the full MenuItem doc here; PG stores the _id string. */
    menuItem: string;
}

export interface CateringCategoryRef {
    name: string;
    nameTranslations?: TranslatedText | null;
    description?: string;
    descriptionTranslations?: TranslatedText | null;
    minSelect: number;
    maxSelect: number;
    items: CateringItemRef[];
}

function newPackageId(): string {
    return randomBytes(12).toString('hex');
}

/**
 * CateringPackage mapped 1:1 from legacy Mongo cateringpackages.
 * `categories` (with nested `items[].menuItem` ids) is a jsonb column;
 * menu items are batch-populated in the service from MenuItemEntity to match
 * the old Mongo `.populate('categories.items.menuItem')` output shape.
 */
@Entity('catering_packages')
export class CateringPackageEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'jsonb', nullable: true })
    nameTranslations?: TranslatedText | null;

    @Column({ type: 'varchar', nullable: true })
    description?: string | null;

    @Column({ type: 'jsonb', nullable: true })
    descriptionTranslations?: TranslatedText | null;

    @Column({ type: 'double precision' })
    basePrice: number;

    @Column({ type: 'integer' })
    minGuests: number;

    @Column({ type: 'integer', nullable: true })
    maxGuests?: number | null;

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    categories: CateringCategoryRef[];

    @Column({ type: 'varchar', nullable: true })
    image?: string | null;

    @Column({ default: true })
    available: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'integer', default: 0 })
    sortOrder: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newPackageId();
    }
}