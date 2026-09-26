import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentGateway } from './payment.interface';

@Injectable()
export class StripePaymentStrategy implements PaymentGateway {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2025-01-27.acacia' as any, // Using latest api version
        });
    }

    async createCheckoutSession(orderData: any, metadata: any): Promise<{ url: string; sessionId: string }> {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey || !secretKey.startsWith('sk_')) {
            throw new ServiceUnavailableException('Online payment is not configured. Please contact the restaurant before placing an order.');
        }

        const lineItems = orderData.items.map((item: any) => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const clientUrl = this.configService.get<string>('CLIENT_URL');

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['ideal', 'card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${clientUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/checkout`,
            metadata: metadata,
        });

        if (!session.url || !session.id) {
            throw new Error('Failed to create Stripe session');
        }

        return { url: session.url, sessionId: session.id };
    }

    async validateWebhook(signature: string, payload: any): Promise<any> {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }

        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }

    getPaymentMethodName(): string {
        return 'stripe';
    }
}
