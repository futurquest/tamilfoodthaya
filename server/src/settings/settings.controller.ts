import { Controller, Get, Put, Body, UseGuards, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { HomepageDto } from './dto/homepage.dto';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    updateSettings(@Body() data: any) {
        return this.settingsService.updateSettings(data);
    }

    /** Public homepage config — PUBLISHED snapshot only, draft never leaks. */
    @Get('homepage')
    getHomepage() {
        return this.settingsService.getPublishedHomepage();
    }

    /** Admin working draft (incl. hidden sections + trilingual copy). */
    @Get('homepage/draft')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    getHomepageDraft() {
        return this.settingsService.getHomepageDraft();
    }

    @Put('homepage/draft')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    updateHomepageDraft(@Body() data: HomepageDto) {
        return this.settingsService.updateHomepageDraft(data);
    }

    /** Publish the current draft — the only writer of the published snapshot. */
    @Post('homepage/publish')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    publishHomepage() {
        return this.settingsService.publishHomepage();
    }
}
