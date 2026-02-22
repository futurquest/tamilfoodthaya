import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CateringService } from './catering.service';
import { CateringQuote } from './schemas/catering-quote.schema';
import { CateringPackage } from './schemas/catering-package.schema';
import { CateringOrder } from './schemas/catering-order.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CateringService', () => {
    let service: CateringService;
    let packageModel: any;
    let orderModel: any;
    let quoteModel: any;

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
                items: [
                    { name: 'Biryani', basePrice: 5, choices: [{ name: 'Extra Spicy', priceModifier: 2 }] },
                    { name: 'Kottu', basePrice: 0, choices: [] },
                ],
            },
            {
                name: 'Dessert',
                minSelect: 1,
                maxSelect: 1,
                items: [
                    { name: 'Watalappam', basePrice: 3, choices: [] },
                ],
            },
        ],
        available: true,
        sortOrder: 0,
        isActive: true,
    };

    const createMockModel = (mockData?: any) => {
        const model: any = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({ ...dto, _id: 'new-id' }),
        }));
        model.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockData ? [mockData] : []),
        });
        model.findById = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockData || null),
        });
        model.findByIdAndUpdate = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockData || null),
        });
        model.findByIdAndDelete = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockData || null),
        });
        return model;
    };

    beforeEach(async () => {
        packageModel = createMockModel(mockPackage);
        orderModel = createMockModel();
        quoteModel = createMockModel();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CateringService,
                { provide: getModelToken(CateringPackage.name), useValue: packageModel },
                { provide: getModelToken(CateringOrder.name), useValue: orderModel },
                { provide: getModelToken(CateringQuote.name), useValue: quoteModel },
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
            expect(result).toEqual([mockPackage]);
            expect(packageModel.find).toHaveBeenCalledWith({ available: true, isActive: true });
        });
    });

    describe('findPackageById', () => {
        it('should return package by id', async () => {
            const result = await service.findPackageById('pkg1');
            expect(result).toEqual(mockPackage);
        });

        it('should throw NotFoundException for missing package', async () => {
            packageModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.findPackageById('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createPackage', () => {
        it('should create a PackageModel and save', async () => {
            await service.createPackage({ name: 'Silver', basePrice: 20 });
            expect(packageModel).toHaveBeenCalled();
        });
    });

    describe('deletePackage', () => {
        it('should delete and return { deleted: true }', async () => {
            const result = await service.deletePackage('pkg1');
            expect(result).toEqual({ deleted: true });
        });

        it('should throw NotFoundException for missing package', async () => {
            packageModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.deletePackage('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createCateringOrder', () => {
        it('should reject order with too few guests', async () => {
            await expect(service.createCateringOrder({
                packageId: 'pkg1',
                guests: 5, // min 20
                eventDate: '2026-08-01',
                selections: [],
                customerInfo: { name: 'T', email: 't@t.com', phone: '0612345678' },
            })).rejects.toThrow(BadRequestException);
        });

        it('should reject order with missing category selections', async () => {
            await expect(service.createCateringOrder({
                packageId: 'pkg1',
                guests: 50,
                eventDate: '2026-08-01',
                selections: [
                    { categoryName: 'Main Course', selectedItems: [{ itemName: 'Biryani' }] },
                    // Missing Dessert — requires minSelect=1
                ],
                customerInfo: { name: 'T', email: 't@t.com', phone: '0612345678' },
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
                customerInfo: { name: 'T', email: 't@t.com', phone: '0612345678' },
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
                customerInfo: { name: 'Test', email: 'test@test.com', phone: '0612345678' },
            };

            await service.createCateringOrder(orderData);

            // Verify: basePrice(25) + Biryani(5) + ExtraSpicy(+2) + Watalappam(3) = 35 per person
            // Total = 35 * 50 = 1750
            const constructorCall = orderModel.mock.calls[0][0];
            expect(constructorCall.pricePerPerson).toBe(35);
            expect(constructorCall.totalPrice).toBe(1750);
            expect(constructorCall.packageName).toBe('Gold Package');
        });
    });

    describe('updateCateringOrderStatus', () => {
        it('should throw NotFoundException for missing order', async () => {
            orderModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.updateCateringOrderStatus('nonexistent', 'confirmed' as any)).rejects.toThrow(NotFoundException);
        });
    });
});
