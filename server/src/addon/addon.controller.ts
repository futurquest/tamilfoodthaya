import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AddonService } from './addon.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('addons')
export class AddonController {
    constructor(private readonly addonService: AddonService) { }

    /** GET /api/v1/addons — public, returns only active add-ons */
    @Get()
    findAll() {
        return this.addonService.findAll(false);
    }

    /** GET /api/v1/addons/all — admin: returns all incl. inactive */
    @Get('all')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllAdmin() {
        return this.addonService.findAll(true);
    }

    /** POST /api/v1/addons — admin only */
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() body: any) {
        return this.addonService.create(body);
    }

    /** PUT /api/v1/addons/:id — admin only */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
        return this.addonService.update(id, body);
    }

    /** DELETE /api/v1/addons/:id — admin only (soft delete) */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.addonService.remove(id);
    }
}
