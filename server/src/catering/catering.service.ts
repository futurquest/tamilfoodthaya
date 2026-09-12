import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CateringQuote } from './schemas/catering-quote.schema';
import { CateringPackage } from './schemas/catering-package.schema';
import { CateringOrder, CateringOrderStatus } from './schemas/catering-order.schema';
import { ChangeRequest, ChangeRequestStatus } from './schemas/change-request.schema';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class CateringService {
    constructor(
        @InjectModel(CateringQuote.name) private quoteModel: Model<CateringQuote>,
        @InjectModel(CateringPackage.name) private packageModel: Model<CateringPackage>,
        @InjectModel(CateringOrder.name) private cateringOrderModel: Model<CateringOrder>,
        @InjectModel(ChangeRequest.name) private changeRequestModel: Model<ChangeRequest>,
        private couponService: CouponService,
        private eventEmitter: EventEmitter2,
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
            userId: data.userId,
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

        await order.save();

        this.eventEmitter.emit('order.status.changed', {
            orderId: order._id.toString(),
            userId: order.userId?.toString(),
            customerEmail: order.customerInfo.email,
            customerPhone: order.customerInfo.phone,
            customerName: order.customerInfo.name,
            oldStatus: 'none',
            newStatus: order.status,
            orderType: 'catering',
        });

        if (data.couponCode) {
            try {
                await this.couponService.incrementUsage(data.couponCode);
            } catch (err) {
                console.error(`Error incrementing usage for coupon ${data.couponCode}`, err);
            }
        }

        return order;
    }

    async findOrderById(id: string, user?: any): Promise<CateringOrder> {
        const order = await this.cateringOrderModel.findById(id).exec();
        if (!order || !order.isActive) {
            throw new NotFoundException(`Order not found: ${id}`);
        }
        const isAdmin = user?.role === 'admin' || user?.role === 'staff';
        if (!isAdmin && order.userId?.toString() !== user?._id?.toString()) {
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
        newStatus: CateringOrderStatus,
    ): Promise<CateringOrder> {
        const order = await this.cateringOrderModel.findById(id).exec();
        if (!order) {
            throw new NotFoundException(`Catering order not found: ${id}`);
        }

        const oldStatus = order.status;
        order.status = newStatus;
        await order.save();

        this.eventEmitter.emit('order.status.changed', {
            orderId: order._id.toString(),
            userId: order.userId?.toString(),
            customerEmail: order.customerInfo.email,
            customerPhone: order.customerInfo.phone,
            customerName: order.customerInfo.name,
            oldStatus: oldStatus,
            newStatus: order.status,
            orderType: 'catering',
        });

        return order;
    }

    // ── Change Requests ──
    async requestChange(userId: string, orderId: string, requestedChanges: string): Promise<ChangeRequest> {
        const order = await this.cateringOrderModel.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId?.toString() !== userId) {
            throw new BadRequestException('Unauthorized to modify this order');
        }

        // 10-day prior validation
        const eventDate = new Date(order.eventDate);
        const today = new Date();
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 10) {
            throw new BadRequestException(`Changes cannot be requested less than 10 days before the event (Event date: ${order.eventDate.toISOString().split('T')[0]}).`);
        }

        const request = new this.changeRequestModel({
            userId,
            orderId,
            requestedChanges,
        });

        return request.save();
    }

    async getUserChangeRequests(userId: string): Promise<ChangeRequest[]> {
        return this.changeRequestModel.find({ userId }).populate('orderId', 'packageName eventDate status').sort({ createdAt: -1 }).exec();
    }

    async getAllChangeRequests(): Promise<ChangeRequest[]> {
        return this.changeRequestModel.find().populate('userId', 'name email').populate('orderId', 'packageName eventDate status').sort({ createdAt: -1 }).exec();
    }

    async updateChangeRequestStatus(requestId: string, status: ChangeRequestStatus, adminNotes?: string): Promise<ChangeRequest> {
        const req = await this.changeRequestModel.findByIdAndUpdate(
            requestId,
            { status, adminNotes },
            { new: true }
        ).exec();
        if (!req) {
            throw new NotFoundException('Change request not found');
        }
        return req;
    }
}
