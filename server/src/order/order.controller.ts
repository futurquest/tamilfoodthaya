import { Controller, Post, Body, Get, Query, Headers, Req, BadRequestException, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { OrderService } from './order.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('checkout')
    @UseGuards(OptionalJwtAuthGuard)
    async checkout(@Req() req: any, @Body() orderData: any) {
        if (req.user) {
            orderData.userId = req.user._id;
        }
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

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateOrderStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        return this.orderService.updateOrderStatus(id, status as any);
    }
}
