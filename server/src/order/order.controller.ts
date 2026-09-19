import { Controller, Post, Body, Get, Query, Headers, Req, BadRequestException, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { OrderService } from './order.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';
import { UserRole } from '../auth/entities/user.entity';

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
        @Headers('stripe-signature') stripeSignature: string,
        @Headers('x-signature') xSignature: string,
        @Req() req: any,
    ) {
        const sig = stripeSignature || xSignature;
        if (!sig) {
            throw new BadRequestException('Missing payment signature header');
        }
        return this.orderService.handleWebhook(method, sig, req.rawBody);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getOrderById(@Param('id') id: string, @Req() req: any) {
        return this.orderService.getOrderById(id, req.user);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async getOrders(@Query() query: PaginationFilterDto) {
        return this.orderService.getOrders(query);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async updateOrderStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        return this.orderService.updateOrderStatus(id, status as any);
    }
}