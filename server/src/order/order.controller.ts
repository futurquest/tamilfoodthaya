import { Controller, Post, Body, Get, Query, Headers, Req, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('checkout')
    async checkout(@Body() orderData: any) {
        return this.orderService.createCheckoutSession(orderData);
    }

    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') sig: string,
        @Req() req: any,
    ) {
        if (!sig) {
            throw new BadRequestException('Missing stripe-signature header');
        }
        // Stripe webhooks require the raw body
        return this.orderService.handleWebhook(sig, req.body);
    }

    @Get()
    async getOrders(@Query() query: any) {
        return this.orderService.getOrders(query);
    }
}
