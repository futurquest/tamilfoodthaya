import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { MenuItem } from './schemas/menu-item.schema';

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
    ) { }

    // Cateogry Methods
    async findAllCategories(): Promise<Category[]> {
        return this.categoryModel.find({ isActive: true }).sort({ order: 1 }).exec();
    }

    async createCategory(data: any): Promise<Category> {
        const newCategory = new this.categoryModel(data);
        return newCategory.save();
    }

    async updateCategory(id: string, data: any): Promise<Category> {
        const updated = await this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updated || !updated.isActive) throw new NotFoundException('Category not found');
        return updated;
    }

    async deleteCategory(id: string): Promise<any> {
        const result = await this.categoryModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!result) throw new NotFoundException('Category not found');
        return result;
    }



    // MenuItem Methods
    async findAllMenuItems(): Promise<MenuItem[]> {
        return this.menuItemModel.find({ isActive: true }).populate('categoryId').exec();
    }

    async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
        return this.menuItemModel.find({ categoryId: new Types.ObjectId(categoryId), isActive: true }).exec();
    }

    async createMenuItem(data: any): Promise<MenuItem> {
        const newItem = new this.menuItemModel(data);
        return newItem.save();
    }

    async updateMenuItem(id: string, data: any): Promise<MenuItem> {
        const updated = await this.menuItemModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updated || !updated.isActive) throw new NotFoundException('Menu item not found');
        return updated;
    }

    async deleteMenuItem(id: string): Promise<any> {
        const result = await this.menuItemModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!result) throw new NotFoundException('Menu item not found');
        return result;
    }
}
