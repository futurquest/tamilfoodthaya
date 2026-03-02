import { Controller, Patch, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Patch(':id/clear')
    async clearNotification(@Param('id') id: string, @Req() req: any) {
        const result = await this.notificationService.clearNotification(id, req.user._id);
        if (!result) {
            throw new NotFoundException('Notification not found');
        }
        return { success: true };
    }
}
