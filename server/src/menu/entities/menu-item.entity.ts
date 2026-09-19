import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CategoryEntity } from './category.entity';

export interface TranslatedField {
    en?: string;
    nl?: string;
    ta?: string;
}

export interface MenuChoice {
    name: string;
    nameTranslations?: TranslatedField;
    priceModifier: number;
}

/**
 * Menu item mapped 1:1 from the legacy Mongo `MenuItem` collection.
 * `_id` stays a varchar primary key so JSON output (`_id`, `name`,
 * `nameTranslations`, ...) is identical to the old Mongoose API — no client
 * contract change.
 */
@Entity('menu_items')
export class MenuItemEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ type: 'varchar', length: 200 })
    name: string;

    @Column({ name: 'NameTranslations', type: 'jsonb', nullable: true })
    nameTranslations: TranslatedField | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'DescriptionTranslations', type: 'jsonb', nullable: true })
    descriptionTranslations: TranslatedField | null;

    @Column({ name: 'price', type: 'double precision' })
    price: number;

    @Column({ name: 'image', type: 'varchar', length: 500, nullable: true })
    image: string | null;

    @Column({ name: 'categoryId', type: 'varchar', length: 128 })
    categoryId: string;

    @Column({ name: 'spiceLevel', type: 'int', default: 0 })
    spiceLevel: number;

    @Column({ name: 'available', type: 'boolean', default: true })
    available: boolean;

    @Column({ name: 'isVeg', type: 'boolean', default: false })
    isVeg: boolean;

    @Column({ name: 'stockCount', type: 'int', default: 0 })
    stockCount: number;

    @Column({ name: 'dailyAvailability', type: 'boolean', default: true })
    dailyAvailability: boolean;

    @Column({ name: 'isActive', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'choices', type: 'jsonb', default: () => "'[]'::jsonb" })
    choices: MenuChoice[];

    @Column({ name: 'createdAt', type: 'timestamptz' })
    createdAt: Date;

    @Column({ name: 'updatedAt', type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => CategoryEntity, (category) => category.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: CategoryEntity;
}
