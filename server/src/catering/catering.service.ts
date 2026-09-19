import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CateringQuoteEntity } from './entities/catering-quote.entity';
import { CateringPackageEntity } from './entities/catering-package.entity';
import { CateringOrderEntity, CateringOrderStatus } from './entities/catering-order.entity';
import { ChangeRequestEntity, ChangeRequestStatus } from './entities/change-request.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class CateringService {
    constructor(
        @InjectRepository(CateringQuoteEntity) private quoteRepo: Repository<CateringQuoteEntity>,
        @InjectRepository(CateringPackageEntity) private packageRepo: Repository<CateringPackageEntity>,
        @InjectRepository(CateringOrderEntity) private cateringOrderRepo: Repository<CateringOrderEntity>,
        @InjectRepository(ChangeRequestEntity) private changeRequestRepo: Repository<ChangeRequestEntity>,
        @InjectRepository(MenuItemEntity) private menuItemRepo: Repository<MenuItemEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private couponService: CouponService,
        private eventEmitter: EventEmitter2,
    ) { }

    /** Replicates legacy `.populate('categories.items.menuItem')`. */
    private async populateMenuItems(pkg: CateringPackageEntity): Promise<CateringPackageEntity> {
        const ids = new Set<string>();
        pkg.categories.forEach(c => c.items.forEach(i => ids.add(i.menuItem)));
        if (ids.size === 0) return pkg;

        const items = await this.menuItemRepo.find({ where: { _id: In(Array.from(ids)) } });
        if (items.length === 0) return pkg;

        const byId = new Map(items.map(i => [i._id, i]));
        for (const category of pkg.categories) {
            for (const item of category.items) {
                const full = byId.get(item.menuItem);
                if (full) {
                    (item as any).menuItem = full;
                }
            }
        }
        return pkg;
    }

    private async populatePackagesMenuItems(pkgs: CateringPackageEntity[]): Promise<CateringPackageEntity[]> {
        const ids = new Set<string>();
        pkgs.forEach(p => p.categories.forEach(c => c.items.forEach(i => ids.add(i.menuItem))));
        if (ids.size === 0) return pkgs;

        const items = await this.menuItemRepo.find({ where: { _id: In(Array.from(ids)) } });
        const byId = new Map(items.map(i => [i._id, i]));
        for (const pkg of pkgs) {
            for (const category of pkg.categories) {
                for (const item of category.items) {
                    const full = byId.get(item.menuItem);
                    if (full) {
                        (item as any).menuItem = full;
                    }
                }
            }
        }
        return pkgs;
    }

    // ── Quote Methods (existing) ──

    async createQuoteRequest(data: any): Promise<CateringQuoteEntity> {
        const quote = this.quoteRepo.create({
            _id: CateringQuoteEntity.newId(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            eventDate: new Date(data.eventDate),
            guests: Number(data.guests),
            location: data.location,
            budgetRange: data.budgetRange ?? null,
            eventType: data.eventType ?? null,
            notes: data.notes ?? null,
            utmSource: data.utmSource ?? null,
            campaign: data.campaign ?? null,
        });
        return this.quoteRepo.save(quote);
    }

    async findAllQuotes(): Promise<CateringQuoteEntity[]> {
        return this.quoteRepo.find({ order: { createdAt: 'DESC' } });
    }

    // ── Package CRUD ──

    async createPackage(data: any): Promise<CateringPackageEntity> {
        const pkg = this.packageRepo.create({
            _id: CateringPackageEntity.newId(),
            name: data.name,
            nameTranslations: data.nameTranslations ?? null,
            description: data.description ?? null,
            descriptionTranslations: data.descriptionTranslations ?? null,
            basePrice: data.basePrice,
            minGuests: data.minGuests,
            maxGuests: data.maxGuests ?? null,
            categories: data.categories ?? [],
            image: data.image ?? null,
            available: data.available ?? true,
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder ?? 0,
        });
        return this.packageRepo.save(pkg);
    }

    async findAllPackages(user?: any): Promise<CateringPackageEntity[]> {
        const where: any = { isActive: true };
        if (!user || user.role !== 'admin') {
            where.available = true;
        }
        const pkgs = await this.packageRepo.find({ where, order: { sortOrder: 'ASC' } });
        return this.populatePackagesMenuItems(pkgs);
    }

    async findPackageById(id: string): Promise<CateringPackageEntity> {
        const pkg = await this.packageRepo.findOne({ where: { _id: id } });
        if (!pkg || !pkg.isActive) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        return this.populateMenuItems(pkg);
    }

    async updatePackage(id: string, data: any): Promise<CateringPackageEntity> {
        const existing = await this.packageRepo.findOne({ where: { _id: id } });
        if (!existing) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        const { _id, pk, ...rest } = data;
        Object.assign(existing, rest);
        const updated = await this.packageRepo.save(existing);
        if (!updated.isActive) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        return updated;
    }

    async deletePackage(id: string): Promise<{ deleted: boolean }> {
        const pkg = await this.packageRepo.findOne({ where: { _id: id } });
        if (!pkg) {
            throw new NotFoundException(`Package not found: ${id}`);
        }
        pkg.isActive = false;
        await this.packageRepo.save(pkg);
        return { deleted: true };
    }

    // ── Catering Order Methods ──

    async createCateringOrder(data: any): Promise<CateringOrderEntity> {
        const pkg = await this.packageRepo.findOne({ where: { _id: data.packageId } });
        if (!pkg) {
            throw new NotFoundException(`Package not found: ${data.packageId}`);
        }
        const populated = await this.populateMenuItems(pkg);

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

        const order = this.cateringOrderRepo.create({
            _id: CateringOrderEntity.newId(),
            userId: data.userId ?? null,
            packageId: data.packageId,
            packageName: pkg.name,
            selections: data.selections,
            guests: Number(data.guests),
            eventDate: new Date(data.eventDate),
            eventLocation: data.eventLocation ?? null,
            pricePerPerson: totalPerPerson,
            totalPrice,
            customerInfo: data.customerInfo,
            status: CateringOrderStatus.PENDING,
            paymentStatus: 'unpaid',
        });

        const saved = await this.cateringOrderRepo.save(order);

        this.eventEmitter.emit('order.status.changed', {
            orderId: saved._id,
            userId: saved.userId ?? null,
            customerEmail: saved.customerInfo.email,
            customerPhone: saved.customerInfo.phone,
            customerName: saved.customerInfo.name,
            oldStatus: 'none',
            newStatus: saved.status,
            orderType: 'catering',
        });

        if (data.couponCode) {
            try {
                await this.couponService.incrementUsage(data.couponCode);
            } catch (err) {
                console.error(`Error incrementing usage for coupon ${data.couponCode}`, err);
            }
        }

        return saved;
    }

    async findOrderById(id: string, user?: any): Promise<CateringOrderEntity> {
        const order = await this.cateringOrderRepo.findOne({ where: { _id: id } });
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
        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const where: any = { isActive: true };

        if (filters.status) where.status = filters.status;

        if (filters.from) where.createdAt = MoreThanOrEqual(new Date(filters.from));
        if (filters.to) {
            where.createdAt = where.createdAt
                ? (where.createdAt as any).and(LessThanOrEqual(new Date(filters.to)))
                : LessThanOrEqual(new Date(filters.to));
        }

        const [data, total] = await this.cateringOrderRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async updateCateringOrderStatus(id: string, newStatus: CateringOrderStatus): Promise<CateringOrderEntity> {
        if (!Object.values(CateringOrderStatus).includes(newStatus)) {
            throw new BadRequestException(`Invalid catering status: ${newStatus}`);
        }
        const order = await this.cateringOrderRepo.findOne({ where: { _id: id } });
        if (!order) {
            throw new NotFoundException(`Catering order not found: ${id}`);
        }

        const oldStatus = order.status;
        order.status = newStatus;
        const saved = await this.cateringOrderRepo.save(order);

        this.eventEmitter.emit('order.status.changed', {
            orderId: saved._id,
            userId: saved.userId ?? null,
            customerEmail: saved.customerInfo.email,
            customerPhone: saved.customerInfo.phone,
            customerName: saved.customerInfo.name,
            oldStatus: oldStatus,
            newStatus: saved.status,
            orderType: 'catering',
        });

        return saved;
    }

    // ── Change Requests ──

    async requestChange(userId: string, orderId: string, requestedChanges: string): Promise<ChangeRequestEntity> {
        const order = await this.cateringOrderRepo.findOne({ where: { _id: orderId } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId?.toString() !== userId) {
            throw new BadRequestException('Unauthorized to modify this order');
        }

        const eventDate = new Date(order.eventDate);
        const today = new Date();
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 10) {
            throw new BadRequestException(`Changes cannot be requested less than 10 days before the event (Event date: ${order.eventDate.toISOString().split('T')[0]}).`);
        }

        const request = this.changeRequestRepo.create({
            _id: ChangeRequestEntity.newId(),
            userId,
            orderId,
            requestedChanges,
        });

        return this.changeRequestRepo.save(request);
    }

    async getUserChangeRequests(userId: string): Promise<ChangeRequestEntity[]> {
        const requests = await this.changeRequestRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        return this.populateOrderSummaries(requests);
    }

    async getAllChangeRequests(): Promise<any[]> {
        const requests = await this.changeRequestRepo.find({ order: { createdAt: 'DESC' } });
        const populated = await this.populateOrderSummaries(requests);

        const userIds = Array.from(new Set(populated.map(r => r.userId).filter(Boolean)));
        if (userIds.length > 0) {
            const users = await this.userRepo.find({
                where: { _id: In(userIds) },
                select: { _id: true, name: true, email: true },
            });
            const byId = new Map(users.map(u => [u._id, u]));
            for (const req of populated) {
                const u = byId.get(req.userId);
                if (u) (req as any).userId = u;
            }
        }
        return populated;
    }

    private async populateOrderSummaries(requests: ChangeRequestEntity[]): Promise<ChangeRequestEntity[]> {
        const orderIds = Array.from(new Set(requests.map(r => r.orderId).filter(Boolean)));
        if (orderIds.length === 0) return requests;

        const orders = await this.cateringOrderRepo.find({
            where: { _id: In(orderIds) },
            select: { _id: true, packageName: true, eventDate: true, status: true },
        });

        const byId = new Map(orders.map(o => [o._id, o]));
        for (const req of requests) {
            const o = byId.get(req.orderId);
            if (o) (req as any).orderId = o;
        }
        return requests;
    }

    async updateChangeRequestStatus(
        requestId: string,
        status: ChangeRequestStatus,
        adminNotes?: string,
    ): Promise<ChangeRequestEntity> {
        const req = await this.changeRequestRepo.findOne({ where: { _id: requestId } });
        if (!req) {
            throw new NotFoundException('Change request not found');
        }
        req.status = status;
        if (adminNotes !== undefined) {
            req.adminNotes = adminNotes;
        }
        return this.changeRequestRepo.save(req);
    }
}