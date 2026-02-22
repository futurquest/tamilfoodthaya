import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { MenuItem } from '../src/menu/schemas/menu-item.schema';
import { Order } from '../src/order/schemas/order.schema';
import { PaymentGatewayFactory } from '../src/order/payment/payment.factory';
import { Model, Types } from 'mongoose';

describe('Order API (Integration)', () => {
    let app: INestApplication;
    let replSet: MongoMemoryReplSet;
    let menuItemModel: Model<MenuItem>;
    let orderModel: Model<Order>;
    let mockPaymentGateway: any;

    beforeAll(async () => {
        // Start a Mongo Memory Replica Set to fully support multi-document transactions!
        replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        const uri = replSet.getUri();

        mockPaymentGateway = {
            createCheckoutSession: jest.fn().mockResolvedValue({ url: 'http://stripe.test', sessionId: 'sess_e2e' }),
            validateWebhook: jest.fn(), // Setup dynamically per test
        };

        const mockFactory = {
            getStrategy: jest.fn().mockReturnValue(mockPaymentGateway),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: (key: string) => {
                    if (key === 'MONGODB_URI') return uri;
                    return process.env[key];
                },
            })
            .overrideProvider(PaymentGatewayFactory)
            .useValue(mockFactory)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        menuItemModel = moduleFixture.get<Model<MenuItem>>(getModelToken(MenuItem.name));
        orderModel = moduleFixture.get<Model<Order>>(getModelToken(Order.name));
    }, 60000);

    afterAll(async () => {
        await app.close();
        await replSet.stop();
    });

    let testMenuItemId: string;
    let savedOrderId: string;

    it('/orders/checkout (POST) - Insufficient stock', async () => {
        const item = new menuItemModel({
            name: 'Test Setup Item',
            description: 'Desc',
            price: 10,
            spiceLevel: 1,
            available: true,
            stockCount: 1, // Max 1
            categoryId: new Types.ObjectId(),
        });
        await item.save();
        testMenuItemId = item._id.toString();

        return request(app.getHttpServer())
            .post('/orders/checkout')
            .send({ items: [{ menuItemId: testMenuItemId, quantity: 5 }] }) // Tries to buy 5
            .expect(400); // Should rollback and reject
    });

    it('/orders/checkout (POST) - Success', async () => {
        const res = await request(app.getHttpServer())
            .post('/orders/checkout')
            .send({
                paymentMethod: 'stripe',
                items: [{ menuItemId: testMenuItemId, quantity: 1, name: 'Test Setup Item', price: 10, spiceLevel: 1 }],
                customerInfo: { name: 'Test', email: 'test@example.com', phone: '123' },
                pickupTime: new Date().toISOString(),
                total: 10,
            })
            .expect(201);

        expect(res.body.url).toBe('http://stripe.test');
        const order = await orderModel.findOne({ 'customerInfo.email': 'test@example.com' });
        expect(order).toBeDefined();
        expect(order?.stripeSessionId).toBe('sess_e2e');
        savedOrderId = order!._id.toString();
    });

    it('/orders/webhook/stripe (POST) - Success handles full webhook transaction', async () => {
        mockPaymentGateway.validateWebhook.mockResolvedValue({
            type: 'checkout.session.completed',
            data: { object: { metadata: { orderId: savedOrderId } } }
        });

        await request(app.getHttpServer())
            .post('/orders/webhook/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({})
            .expect(201); // Created or 200

        // Verify stock has reduced!
        const item = await menuItemModel.findById(testMenuItemId);
        expect(item?.stockCount).toBe(0); // Because it was 1 and we bought 1

        // Verify Order is paid
        const order = await orderModel.findById(savedOrderId);
        expect(order?.status).toBe('paid');
    });
});
