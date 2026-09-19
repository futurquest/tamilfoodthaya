import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';

/**
 * ObjectId-shaped hex string generator. Replaces Mongo's `new Types.ObjectId()`.
 * Produces the same 24-hex shape so `_id` values remain client-compatible.
 */
function newObjectIdLike(): string {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

import * as crypto from 'crypto';

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepo: Repository<CategoryEntity>,
        @InjectRepository(MenuItemEntity)
        private readonly menuItemRepo: Repository<MenuItemEntity>,
    ) { }

    // Category Methods
    async findAllCategories(): Promise<CategoryEntity[]> {
        return this.categoryRepo.find({ where: { isActive: true }, order: { order: 'ASC' } });
    }

    async createCategory(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        const entity = this.categoryRepo.create({ _id: newObjectIdLike(), ...data });
        return this.categoryRepo.save(entity);
    }

    async updateCategory(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        await this.categoryRepo.update({ _id: id }, data);
        const category = await this.categoryRepo.findOne({ where: { _id: id } });
        if (!category || !category.isActive) throw new NotFoundException('Category not found');
        return category;
    }

    async deleteCategory(id: string): Promise<CategoryEntity> {
        const category = await this.categoryRepo.findOne({ where: { _id: id } });
        if (!category) throw new NotFoundException('Category not found');
        category.isActive = false;
        return this.categoryRepo.save(category);
    }

    // MenuItem Methods
    async findAllMenuItems(): Promise<MenuItemEntity[]> {
        return this.menuItemRepo.find({ where: { isActive: true } });
    }

    async findByCategoryId(categoryId: string): Promise<MenuItemEntity[]> {
        return this.menuItemRepo.find({ where: { categoryId, isActive: true } });
    }

    async createMenuItem(data: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
        const entity = this.menuItemRepo.create({ _id: newObjectIdLike(), ...data });
        return this.menuItemRepo.save(entity);
    }

    async updateMenuItem(id: string, data: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
        await this.menuItemRepo.update({ _id: id }, data);
        const item = await this.menuItemRepo.findOne({ where: { _id: id } });
        if (!item || !item.isActive) throw new NotFoundException('Menu item not found');
        return item;
    }

    async deleteMenuItem(id: string): Promise<MenuItemEntity> {
        const item = await this.menuItemRepo.findOne({ where: { _id: id } });
        if (!item) throw new NotFoundException('Menu item not found');
        item.isActive = false;
        return this.menuItemRepo.save(item);
    }
}
