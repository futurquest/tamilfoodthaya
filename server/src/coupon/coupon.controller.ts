import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    /** GET /api/v1/coupons — admin: list all coupons */
    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.couponService.findAll();
    }

    /** POST /api/v1/coupons — admin: create coupon */
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() body: any) {
        return this.couponService.create(body);
    }

    /** POST /api/v1/coupons/validate — public: validate a coupon code */
    @Post('validate')
    validate(@Body() body: { code: string; orderTotal: number }) {
        return this.couponService.validate(body.code, body.orderTotal || 0);
    }

    /** PUT /api/v1/coupons/:id — admin: update coupon */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
        return this.couponService.update(id, body);
    }

    /** DELETE /api/v1/coupons/:id — admin: delete coupon */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.couponService.remove(id);
    }
}
