import { Controller, Post, Body, Get, Patch, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { CateringService } from './catering.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';
import { UpdateCateringStatusDto } from './dto/update-catering-status.dto';

@Controller('catering')
export class CateringController {
    constructor(private readonly cateringService: CateringService) { }

    // ── Quote Endpoints (existing) ──

    @Post('quote')
    async requestQuote(@Body() body: any) {
        return this.cateringService.createQuoteRequest(body);
    }

    @Get('quotes')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getQuotes() {
        return this.cateringService.findAllQuotes();
    }

    // ── Package Endpoints ──

    @Get('packages')
    @UseGuards(OptionalJwtAuthGuard)
    async getPackages(@Req() req: any) {
        return this.cateringService.findAllPackages(req.user);
    }

    @Get('packages/:id')
    async getPackageById(@Param('id') id: string) {
        return this.cateringService.findPackageById(id);
    }

    @Post('packages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async createPackage(@Body() body: any) {
        return this.cateringService.createPackage(body);
    }

    @Patch('packages/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updatePackage(@Param('id') id: string, @Body() body: any) {
        return this.cateringService.updatePackage(id, body);
    }

    @Delete('packages/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async deletePackage(@Param('id') id: string) {
        return this.cateringService.deletePackage(id);
    }

    // ── Catering Order Endpoints ──

    @Post('orders')
    async createCateringOrder(@Body() body: any) {
        return this.cateringService.createCateringOrder(body);
    }

    @Get('orders/:id')
    async getCateringOrderById(@Param('id') id: string) {
        return this.cateringService.findOrderById(id);
    }

    @Get('orders')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getCateringOrders(@Query() query: PaginationFilterDto) {
        return this.cateringService.findAllCateringOrders(query);
    }

    @Patch('orders/:id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateCateringOrderStatus(
        @Param('id') id: string,
        @Body() body: UpdateCateringStatusDto,
    ) {
        return this.cateringService.updateCateringOrderStatus(id, body.status);
    }
}
