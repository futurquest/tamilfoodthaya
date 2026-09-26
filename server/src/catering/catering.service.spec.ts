import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { CateringService } from './catering.service';
import { CateringQuoteEntity } from './entities/catering-quote.entity';
import { CateringPackageEntity } from './entities/catering-package.entity';
import { CateringOrderEntity } from './entities/catering-order.entity';
import { ChangeRequestEntity } from './entities/change-request.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponService } from '../coupon/coupon.service';

describe('CateringService', () => {
    let service: CateringService;
    let packageRepo: any;
    let orderRepo: any;
    let quoteRepo: any;
    let changeRequestRepo: any;
    let menuItemRepo: any;
    let userRepo: any;
    let eventEmitter: any;

    const mockPackage = {
        _id: 'pkg1',
        name: 'Gold Package',
        basePrice: 25,
        minGuests: 20,
        maxGuests: 200,
        categories: [
            {
                name: 'Main Course',
                minSelect: 1,
                maxSelect: 3,
                items: [{ menuItem: 'm1' }, { menuItem: 'm2' }],
            },
            {
                name: 'Dessert',
                minSelect: 1,
                maxSelect: 1,
                items: [{ menuItem: 'm3' }],
            },
        ],
        available: true,
        sortOrder: 0,
        isActive: true,
    };

    const menuItems: any[] = [
        { _id: 'm1', name: 'Biryani', price: 5, choices: [{ name: 'Extra Spicy', priceModifier: 2 }] },
        { _id: 'm2', name: 'Kottu', price: 0, choices: [] },
        { _id: 'm3', name: 'Watalappam', price: 3, choices: [] },
    ];

    beforeEach(async () => {
        packageRepo = {
            find: jest.fn().mockResolvedValue([mockPackage]),
            findOne: jest.fn().mockResolvedValue({ ...mockPackage }),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (e) => e),
        };
        orderRepo = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (e) => e),
        };
        quoteRepo = {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (e) => e),
        };
        changeRequestRepo = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (e) => e),
        };
        menuItemRepo = {
            find: jest.fn().mockImplementation(() => Promise.resolve([])),
        };
        userRepo = {
            find: jest.fn().mockResolvedValue([]),
        };
        eventEmitter = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CateringService,
                { provide: getRepositoryToken(CateringQuoteEntity), useValue: quoteRepo },
                { provide: getRepositoryToken(CateringPackageEntity), useValue: packageRepo },
                { provide: getRepositoryToken(CateringOrderEntity), useValue: orderRepo },
                { provide: getRepositoryToken(ChangeRequestEntity), useValue: changeRequestRepo },
                { provide: getRepositoryToken(MenuItemEntity), useValue: menuItemRepo },
                { provide: getRepositoryToken(UserEntity), useValue: userRepo },
                { provide: EventEmitter2, useValue: eventEmitter },
                { provide: CouponService, useValue: { incrementUsage: jest.fn() } },
            ],
        }).compile();

        service = module.get<CateringService>(CateringService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllPackages', () => {
        it('should return available packages sorted by sortOrder', async () => {
            const result = await service.findAllPackages();
            expect(result).toHaveLength(1);
            expect(packageRepo.find).toHaveBeenCalledWith({
                where: { isActive: true, available: true },
                order: { sortOrder: 'ASC' },
            });
        });
    });

    describe('findPackageById', () => {
        it('should return package by id and populate menu items', async () => {
            const result = await service.findPackageById('pkg1');
            expect(result._id).toBe('pkg1');
        });

        it('should throw NotFoundException for missing package', async () => {
            packageRepo.findOne.mockResolvedValue(null);
            await expect(service.findPackageById('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createPackage', () => {
        it('should create a package and save', async () => {
            const result = await service.createPackage({ name: 'Silver', basePrice: 20 });
            expect(result.name).toBe('Silver');
            expect(packageRepo.save).toHaveBeenCalled();
        });
    });

    describe('deletePackage', () => {
        it('should soft-delete and return { deleted: true }', async () => {
            const result = await service.deletePackage('pkg1');
            expect(result).toEqual({ deleted: true });
        });

        it('should throw NotFoundException for missing package', async () => {
            packageRepo.findOne.mockResolvedValue(null);
            await expect(service.deletePackage('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createCateringOrder', () => {
        beforeEach(() => {
            menuItemRepo.find.mockImplementation(() => Promise.resolve(menuItems));
        });

        it('should reject order with too few guests', async () => {
            await expect(service.createCateringOrder({
                packageId: 'pkg1',
                guests: 5,
                eventDate: '2026-08-01',
                selections: [],
                customerInfo: { name: 'demo', email: 'demo@example.com', phone: 'demo' },
            })).rejects.toThrow(BadRequestException);
        });

        it('should reject order with missing category selections', async () => {
            await expect(service.createCateringOrder({
                packageId: 'pkg1',
                guests: 50,
                eventDate: '2026-08-01',
                selections: [
                    { categoryName: 'Main Course', selectedItems: [{ itemName: 'Biryani' }] },
                ],
                customerInfo: { name: 'demo', email: 'demo@example.com', phone: 'demo' },
            })).rejects.toThrow(BadRequestException);
        });

        it('should reject order with invalid item name', async () => {
            await expect(service.createCateringOrder({
                packageId: 'pkg1',
                guests: 50,
                eventDate: '2026-08-01',
                selections: [
                    { categoryName: 'Main Course', selectedItems: [{ itemName: 'NonExistentItem' }] },
                    { categoryName: 'Dessert', selectedItems: [{ itemName: 'Watalappam' }] },
                ],
                customerInfo: { name: 'demo', email: 'demo@example.com', phone: 'demo' },
            })).rejects.toThrow(BadRequestException);
        });

        it('should calculate price correctly for valid order', async () => {
            const orderData = {
                packageId: 'pkg1',
                guests: 50,
                eventDate: '2026-08-01',
                selections: [
                    { categoryName: 'Main Course', selectedItems: [{ itemName: 'Biryani', choiceName: 'Extra Spicy' }] },
                    { categoryName: 'Dessert', selectedItems: [{ itemName: 'Watalappam' }] },
                ],
                customerInfo: { name: 'demo', email: 'demo@example.com', phone: 'demo' },
            };

            const saved = await service.createCateringOrder(orderData);

            // basePrice(25) + Biryani(5) + ExtraSpicy(+2) + Watalappam(3) = 35 per person
            // Total = 35 * 50 = 1750
            expect(saved.pricePerPerson).toBe(35);
            expect(saved.totalPrice).toBe(1750);
            expect(saved.packageName).toBe('Gold Package');
        });
    });

    describe('updateCateringOrderStatus', () => {
        it('should throw NotFoundException for missing order', async () => {
            orderRepo.findOne.mockResolvedValue(null);
            await expect(service.updateCateringOrderStatus('nonexistent', 'confirmed' as any)).rejects.toThrow(NotFoundException);
        });
    });
});