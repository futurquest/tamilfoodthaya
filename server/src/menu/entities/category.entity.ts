import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

export enum CategoryType {
    VEG = 'Veg',
    NON_VEG = 'Non-Veg',
    DRINKS = 'Drinks',
    FOOD = 'food',
    BEVERAGE = 'beverage',
}

export interface CategoryTranslations {
    en?: string;
    nl?: string;
    ta?: string;
}

/**
 * Menu category mapped 1:1 from the legacy Mongo `Category` collection.
 * Columns mirror the Mongoose schema field-for-field so the serialized JSON
 * (`_id`, `name`, `type`, `order`, `isActive`) is byte-identical to today's
 * API — no client changes required.
 */
@Entity('categories')
export class CategoryEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'jsonb', nullable: true })
    nameTranslations: CategoryTranslations | null;

    @Column({ type: 'varchar', length: 24, default: CategoryType.VEG })
    type: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ name: 'isActive', type: 'boolean', default: true, transformer: { to: (v: boolean) => v ?? true, from: (v: boolean) => (v === null || v === undefined ? true : v) } })
    isActive: boolean;

    @OneToMany(() => MenuItemEntity, (item) => item.category, { lazy: true })
    items: MenuItemEntity[];
}
