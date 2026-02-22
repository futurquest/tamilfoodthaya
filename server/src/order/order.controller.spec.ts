import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
    let controller: OrderController;
    let service: OrderService;

    beforeEach(async () => {
        const mockOrderService = {
            createCheckoutSession: jest.fn(),
            handleWebhook: jest.fn(),
            getOrderById: jest.fn(),
            getOrders: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [{ provide: OrderService, useValue: mockOrderService }],
        }).compile();

        controller = module.get<OrderController>(OrderController);
        service = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should correctly pass the method parameter from URL to webhook handler', async () => {
        await controller.webhook('paypal', { headers: { 'x-signature': 'my-sig' }, body: {} });
        expect(service.handleWebhook).toHaveBeenCalledWith('paypal', 'my-sig', {});
    });
});
