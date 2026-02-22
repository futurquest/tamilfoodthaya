import { Controller, Post, Body, Get, Query, Headers, Req, BadRequestException, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('checkout')
    async checkout(@Body() orderData: any) {
        return this.orderService.createCheckoutSession(orderData);
    }

    @Post('webhook/:method')
    async webhook(
        @Param('method') method: string,
        @Req() req: any,
    ) {
        const sig = req.headers['stripe-signature'] || req.headers['x-signature']; // Support various signatures
        return this.orderService.handleWebhook(method, sig as string, req.body);
    }

    @Get(':id')
    async getOrderById(@Param('id') id: string) {
        return this.orderService.getOrderById(id);
    }

    @Get()
    async getOrders(@Query() query: PaginationFilterDto) {
        return this.orderService.getOrders(query);
    }
}
