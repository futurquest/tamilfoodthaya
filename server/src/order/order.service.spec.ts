import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { PaymentGatewayFactory } from './payment/payment.factory';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
    let service: OrderService;
    let mockOrderRepo: any;
    let mockMenuItemRepo: any;
    let mockDataSource: any;
    let mockGateway: any;
    let mockEventEmitter: any;

    const runTransaction = (work: (manager: any) => Promise<any>) => work({
        findOne: mockMenuItemRepo.findOne,
        findOneOrFail: jest.fn(),
        create: mockMenuOrderManagerCreate,
        save: mockMenuOrderManagerSave,
        increment: mockMenuItemRepo.increment,
    });

    const mockMenuOrderManagerCreate = jest.fn();
    const mockMenuOrderManagerSave = jest.fn();

    beforeEach(async () => {
        // Wire the manager.create/save used inside dataSource.transaction.
        mockMenuOrderManagerCreate.mockReturnValue({});
        mockMenuOrderManagerSave.mockImplementation(async (entity: any) => entity);

        mockOrderRepo = {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn().mockImplementation(async (entity: any) => entity),
        };

        mockMenuItemRepo = {
            findOne: jest.fn(),
            increment: jest.fn(),
        };

        mockDataSource = {
            transaction: jest.fn().mockImplementation(runTransaction),
        };

        mockGateway = {
            createCheckoutSession: jest.fn().mockResolvedValue({ url: 'http://stripe.com', sessionId: 'sess_123' }),
            validateWebhook: jest.fn(),
        };

        const mockPaymentFactory = {
            getStrategy: jest.fn().mockReturnValue(mockGateway),
        };

        mockEventEmitter = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
                { provide: getRepositoryToken(MenuItemEntity), useValue: mockMenuItemRepo },
                { provide: getDataSourceToken(), useValue: mockDataSource },
                { provide: PaymentGatewayFactory, useValue: mockPaymentFactory },
                { provide: ConfigService, useValue: {} },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createCheckoutSession', () => {
        it('should throw BadRequestException if stock is insufficient', async () => {
            mockMenuItemRepo.findOne.mockResolvedValue({ stockCount: 1, name: 'Dosa' });

            const orderData = { items: [{ menuItemId: '1', quantity: 5 }] };
            await expect(service.createCheckoutSession(orderData)).rejects.toThrow(BadRequestException);
            expect(mockDataSource.transaction).toHaveBeenCalled();
        });

        it('should correctly process order with transactions and return payment URL', async () => {
            mockMenuItemRepo.findOne.mockResolvedValue({ stockCount: 10, name: 'Dosa', price: 5 });

            const mockSavedOrder = { _id: '123', save: jest.fn() };
            mockMenuOrderManagerCreate.mockReturnValue(mockSavedOrder);

            const orderData = { items: [{ menuItemId: '1', quantity: 2 }], total: 10, pickupTime: new Date(), customerInfo: {} };
            const res = await service.createCheckoutSession(orderData);

            expect(res.url).toBe('http://stripe.com');
            expect(mockMenuOrderManagerCreate).toHaveBeenCalled();
            expect(mockGateway.createCheckoutSession).toHaveBeenCalled();
            expect(mockMenuOrderManagerSave).toHaveBeenCalled();
            expect(mockDataSource.transaction).toHaveBeenCalled();
        });
    });

    describe('handleWebhook', () => {
        it('should set order to paid and decrease stock inside a transaction', async () => {
            mockGateway.validateWebhook.mockResolvedValue({
                type: 'checkout.session.completed',
                data: { object: { metadata: { orderId: '123' } } }
            });

            mockMenuItemRepo.findOne.mockResolvedValue({ _id: '123', customerInfo: { email: 'demo@example.com', phone: 'demo', name: 'demo' }, items: [{ menuItemId: 'abc', quantity: 2 }] });

            await service.handleWebhook('stripe', 'sig', {});

            expect(mockDataSource.transaction).toHaveBeenCalled();
            expect(mockMenuItemRepo.increment).toHaveBeenCalledWith(MenuItemEntity, { _id: 'abc' }, 'stockCount', -2);
        });
    });
});