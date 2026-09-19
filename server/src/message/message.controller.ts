import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { PaginationFilterDto } from '../common/dto/pagination-filter.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Post()
    create(@Body() createMessageDto: CreateMessageDto) {
        return this.messageService.create(createMessageDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll(@Query() query: PaginationFilterDto) {
        return this.messageService.findAll(query);
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    markAsRead(@Param('id') id: string) {
        return this.messageService.markAsRead(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.messageService.remove(id);
    }
}
