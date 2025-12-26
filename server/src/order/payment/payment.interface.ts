export abstract class PaymentGateway {
    abstract createCheckoutSession(orderData: any, metadata: any): Promise<{ url: string; sessionId: string }>;
    abstract validateWebhook(signature: string, payload: any): Promise<any>;
    abstract getPaymentMethodName(): string;
}
