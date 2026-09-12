import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
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
        const rawBody = Buffer.from('{"id":"evt_test"}');
        await controller.webhook('paypal', undefined, 'my-sig', { rawBody });
        expect(service.handleWebhook).toHaveBeenCalledWith('paypal', 'my-sig', rawBody);
    });

    it('should reject webhooks without a signature header', async () => {
        await expect(controller.webhook('stripe', undefined, undefined, { rawBody: Buffer.from('{}') }))
            .rejects.toThrow(BadRequestException);
        expect(service.handleWebhook).not.toHaveBeenCalled();
    });
});
