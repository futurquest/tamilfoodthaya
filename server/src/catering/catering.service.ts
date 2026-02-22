import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CateringQuote } from './schemas/catering-quote.schema';
import { CateringPackage } from './schemas/catering-package.schema';
import { CateringOrder, CateringOrderStatus } from './schemas/catering-order.schema';

@Injectable()
export class CateringService {
    constructor(
        @InjectModel(CateringQuote.name) private quoteModel: Model<CateringQuote>,
        @InjectModel(CateringPackage.name) private packageModel: Model<CateringPackage>,
        @InjectModel(CateringOrder.name) private cateringOrderModel: Model<CateringOrder>,
    ) { }

    // ── Quote Methods (existing) ──

    async createQuoteRequest(data: any): Promise<CateringQuote> {
        const newQuote = new this.quoteModel(data);
        return newQuote.save();
    }

    async findAllQuotes(): Promise<CateringQuote[]> {
        return this.quoteModel.find().sort({ createdAt: -1 }).exec();
    }

    // ── Package CRUD ──

    async createPackage(data: any): Promise<CateringPackage> {
        const newPackage = new this.packageModel(data);
        return newPackage.save();
    }

    async findAllPackages(user?: any): Promise<CateringPackage[]> {
        const query: any = { isActive: true };
        if (!user || user.role !== 'admin') {
            query.available = true;
        }
        return this.packageModel.find(query).sort({ sortOrder: 1 }).populate('categories.items.menuItem').exec();
    }

    async findPackageById(id: string): Promise<CateringPackage> {
        const pkg = await this.packageModel.findById(id).populate('categories.items.menuItem').exec();
        if (!pkg || !pkg.isActive) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        return pkg;
    }

    async updatePackage(id: string, data: any): Promise<CateringPackage> {
        const updated = await this.packageModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updated || !updated.isActive) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        return updated;
    }

    async deletePackage(id: string): Promise<{ deleted: boolean }> {
        const result = await this.packageModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!result) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        return { deleted: true };
    }

    // ── Catering Order Methods ──

    async createCateringOrder(data: any): Promise<CateringOrder> {
        // Validate that the package exists
        const pkg = await this.packageModel.findById(data.packageId).populate('categories.items.menuItem').exec();
        if (!pkg) {
            throw new NotFoundException(`Package not found: ${data.packageId}`);
        }

        // Validate guest count
        if (data.guests < pkg.minGuests) {
            throw new BadRequestException(
                `Minimum ${pkg.minGuests} guests required for package "${pkg.name}"`,
            );
        }
        if (pkg.maxGuests && data.guests > pkg.maxGuests) {
            throw new BadRequestException(
                `Maximum ${pkg.maxGuests} guests allowed for package "${pkg.name}"`,
            );
        }

        // Validate selections against package categories
        if (!data.selections || !Array.isArray(data.selections)) {
            throw new BadRequestException('Selections are required');
        }

        let totalPerPerson = pkg.basePrice;

        for (const category of pkg.categories) {
            const selection = data.selections.find(
                (s: any) => s.categoryName === category.name,
            );

            if (!selection || !selection.selectedItems) {
                if (category.minSelect > 0) {
                    throw new BadRequestException(
                        `Category "${category.name}" requires at least ${category.minSelect} selection(s)`,
                    );
                }
                continue;
            }

            if (selection.selectedItems.length < category.minSelect) {
                throw new BadRequestException(
                    `Category "${category.name}" requires at least ${category.minSelect} selection(s)`,
                );
            }
            if (selection.selectedItems.length > category.maxSelect) {
                throw new BadRequestException(
                    `Category "${category.name}" allows at most ${category.maxSelect} selection(s)`,
                );
            }

            // Validate each selected item exists in the category and calculate price
            for (const selected of selection.selectedItems) {
                const itemEntry = category.items.find(
                    (i: any) =>
                        (selected.itemId && i.menuItem._id.toString() === selected.itemId) ||
                        i.menuItem.name === selected.itemName
                );

                if (!itemEntry) {
                    throw new BadRequestException(
                        `Item "${selected.itemName || selected.itemId}" not found in category "${category.name}"`,
                    );
                }

                const menuItem = itemEntry.menuItem as any;
                let itemPrice = menuItem.price;

                // Ensure the order snapshot has the correct name
                selected.itemName = menuItem.name;

                if (selected.choiceName) {
                    const choice = menuItem.choices?.find((c: any) => c.name === selected.choiceName);
                    if (!choice) {
                        throw new BadRequestException(
                            `Choice "${selected.choiceName}" not found for item "${menuItem.name}"`,
                        );
                    }
                    itemPrice += choice.priceModifier;
                }

                selected.price = itemPrice;
                totalPerPerson += itemPrice;
            }
        }

        const totalPrice = totalPerPerson * data.guests;

        const order = new this.cateringOrderModel({
            packageId: data.packageId,
            packageName: pkg.name,
            selections: data.selections,
            guests: data.guests,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
            pricePerPerson: totalPerPerson,
            totalPrice,
            customerInfo: data.customerInfo,
            status: CateringOrderStatus.PENDING,
            paymentStatus: 'unpaid',
        });

        return order.save();
    }

    async findOrderById(id: string): Promise<CateringOrder> {
        const order = await this.cateringOrderModel.findById(id).exec();
        if (!order || !order.isActive) {
            throw new NotFoundException(`Order not found: ${id}`);
        }
        return order;
    }

    async findAllCateringOrders(filters: any = {}): Promise<any> {
        const query: any = { isActive: true };

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.from || filters.to) {
            query.createdAt = {};
            if (filters.from) query.createdAt.$gte = new Date(filters.from);
            if (filters.to) query.createdAt.$lte = new Date(filters.to);
        }

        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.cateringOrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.cateringOrderModel.countDocuments(query).exec(),
        ]);

        return { data, total, page, limit };
    }

    async updateCateringOrderStatus(
        id: string,
        status: CateringOrderStatus,
    ): Promise<CateringOrder> {
        const order = await this.cateringOrderModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();
        if (!order) {
            throw new NotFoundException(`Catering order not found: ${id}`);
        }
        return order;
    }
}
