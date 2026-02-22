import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { Order } from './schemas/order.schema';
import { MenuItem } from '../menu/schemas/menu-item.schema';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayFactory } from './payment/payment.factory';
import { BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
    let service: OrderService;
    let mockOrderModel: any;
    let mockMenuItemModel: any;
    let mockConnection: any;
    let mockGateway: any;

    beforeEach(async () => {
        mockOrderModel = {
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
        };

        mockMenuItemModel = {
            findById: jest.fn(() => ({ session: jest.fn() })),
            findByIdAndUpdate: jest.fn(),
        };

        const mockSession = {
            withTransaction: jest.fn((cb) => cb()),
            endSession: jest.fn(),
        };

        mockConnection = {
            startSession: jest.fn().mockResolvedValue(mockSession),
        };

        mockGateway = {
            createCheckoutSession: jest.fn().mockResolvedValue({ url: 'http://stripe.com', sessionId: 'sess_123' }),
            validateWebhook: jest.fn(),
        };

        const mockPaymentFactory = {
            getStrategy: jest.fn().mockReturnValue(mockGateway),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                { provide: getModelToken(Order.name), useValue: mockOrderModel },
                { provide: getModelToken(MenuItem.name), useValue: mockMenuItemModel },
                { provide: getConnectionToken(), useValue: mockConnection },
                { provide: PaymentGatewayFactory, useValue: mockPaymentFactory },
                { provide: ConfigService, useValue: {} },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createCheckoutSession', () => {
        it('should throw BadRequestException if stock is insufficient', async () => {
            mockMenuItemModel.findById.mockReturnValue({
                session: jest.fn().mockResolvedValue({ stockCount: 1, name: 'Dosa' }),
            });

            const orderData = { items: [{ menuItemId: '1', quantity: 5 }] };
            await expect(service.createCheckoutSession(orderData)).rejects.toThrow(BadRequestException);
        });

        it('should correctly process order with transactions and return payment URL', async () => {
            mockMenuItemModel.findById.mockReturnValue({
                session: jest.fn().mockResolvedValue({ stockCount: 10, name: 'Dosa' }),
            });

            const mockSavedOrder = { _id: '123', save: jest.fn() };
            mockOrderModel.create.mockResolvedValue([mockSavedOrder]);

            const orderData = { items: [{ menuItemId: '1', quantity: 2 }] };
            const res = await service.createCheckoutSession(orderData);

            expect(res.url).toBe('http://stripe.com');
            expect(mockOrderModel.create).toHaveBeenCalled();
            expect(mockGateway.createCheckoutSession).toHaveBeenCalled();
            expect(mockSavedOrder.save).toHaveBeenCalled();
            expect(mockConnection.startSession).toHaveBeenCalled();
        });
    });

    describe('handleWebhook', () => {
        it('should increase order status and decrease stock inside a transaction', async () => {
            mockGateway.validateWebhook.mockResolvedValue({
                type: 'checkout.session.completed',
                data: { object: { metadata: { orderId: '123' } } }
            });

            mockOrderModel.findByIdAndUpdate.mockResolvedValue({
                _id: '123',
                items: [{ menuItemId: 'abc', quantity: 2 }]
            });

            await service.handleWebhook('stripe', 'sig', {});

            expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockMenuItemModel.findByIdAndUpdate).toHaveBeenCalledWith('abc', { $inc: { stockCount: -2 } }, expect.any(Object));
        });
    });
});
