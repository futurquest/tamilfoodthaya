import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.userService.getProfile(req.user._id);
    }

    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
        return this.userService.updateProfile(req.user._id, body);
    }

    @Get('dashboard')
    async getDashboardData(@Req() req: any) {
        return this.userService.getDashboardData(req.user._id);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async getAllUsers() {
        return this.userService.findAllUsers();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async adminUpdateUser(@Param('id') id: string, @Body() updateData: AdminUpdateUserDto) {
        return this.userService.adminUpdateUser(id, updateData);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async adminDeleteUser(@Param('id') id: string) {
        return this.userService.adminDeleteUser(id);
    }
}
