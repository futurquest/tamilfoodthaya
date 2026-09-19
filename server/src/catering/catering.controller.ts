import { Controller, Post, Body, Get, Patch, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { CateringService } from './catering.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';
import { UpdateCateringStatusDto } from './dto/update-catering-status.dto';
import { CreateCateringOrderDto } from './dto/create-catering-order.dto';
import { CreateCateringQuoteDto } from './dto/create-catering-quote.dto';
import { ChangeRequestStatus } from './entities/change-request.entity';
import { UserRole } from '../auth/entities/user.entity';

@Controller('catering')
export class CateringController {
    constructor(private readonly cateringService: CateringService) { }

    // ── Quote Endpoints (existing) ──

    @Post('quote')
    async requestQuote(@Body() body: CreateCateringQuoteDto) {
        return this.cateringService.createQuoteRequest(body);
    }

    @Get('quotes')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
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
    @Roles(UserRole.ADMIN)
    async createPackage(@Body() body: any) {
        return this.cateringService.createPackage(body);
    }

    @Patch('packages/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async updatePackage(@Param('id') id: string, @Body() body: any) {
        return this.cateringService.updatePackage(id, body);
    }

    @Delete('packages/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async deletePackage(@Param('id') id: string) {
        return this.cateringService.deletePackage(id);
    }

    // ── Catering Order Endpoints ──

    @Post('orders')
    @UseGuards(OptionalJwtAuthGuard)
    async createCateringOrder(@Req() req: any, @Body() body: CreateCateringOrderDto) {
        if (req.user) {
            body.userId = req.user._id;
        }
        return this.cateringService.createCateringOrder(body);
    }

    @Get('orders/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getCateringOrderById(@Param('id') id: string, @Req() req: any) {
        return this.cateringService.findOrderById(id, req.user);
    }

    @Get('orders')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async getCateringOrders(@Query() query: PaginationFilterDto) {
        return this.cateringService.findAllCateringOrders(query);
    }

    @Patch('orders/:id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async updateCateringOrderStatus(
        @Param('id') id: string,
        @Body() body: UpdateCateringStatusDto,
    ) {
        return this.cateringService.updateCateringOrderStatus(id, body.status);
    }

    // ── Change Request Endpoints ──

    @Post('orders/:id/change-requests')
    @UseGuards(AuthGuard('jwt'))
    async requestChange(
        @Req() req: any,
        @Param('id') orderId: string,
        @Body('requestedChanges') requestedChanges: string,
    ) {
        return this.cateringService.requestChange(req.user._id.toString(), orderId, requestedChanges);
    }

    @Get('change-requests/me')
    @UseGuards(AuthGuard('jwt'))
    async getMyChangeRequests(@Req() req: any) {
        return this.cateringService.getUserChangeRequests(req.user._id.toString());
    }

    @Get('change-requests')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllChangeRequests() {
        return this.cateringService.getAllChangeRequests();
    }

    @Patch('change-requests/:id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateChangeRequestStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @Body('adminNotes') adminNotes?: string,
    ) {
        return this.cateringService.updateChangeRequestStatus(id, status as ChangeRequestStatus, adminNotes);
    }
}