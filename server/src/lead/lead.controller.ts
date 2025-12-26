import { Controller, Post, Body, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('leads')
export class LeadController {
    constructor(private readonly leadService: LeadService) { }

    @Post()
    async create(@Body() createLeadDto: CreateLeadDto) {
        return this.leadService.createLead(createLeadDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async getLeads() {
        return this.leadService.findAllLeads();
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.leadService.updateStatus(id, status);
    }
}
