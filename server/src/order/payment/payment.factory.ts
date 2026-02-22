import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentGateway } from './payment.interface';
import { StripePaymentStrategy } from './stripe.strategy';

@Injectable()
export class PaymentGatewayFactory {
    constructor(
        private readonly stripePaymentStrategy: StripePaymentStrategy,
    ) { }

    getStrategy(method: string): PaymentGateway {
        switch (method?.toLowerCase()) {
            case 'stripe':
            case 'card':
            case 'ideal':
                return this.stripePaymentStrategy;
            // e.g. case 'paypal': return this.paypalPaymentStrategy;
            default:
                // Defaulting to stripe if not provided, or throw if you want strictly explicit methods
                return this.stripePaymentStrategy;
        }
    }
}
