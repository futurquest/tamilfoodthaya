import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { CateringOrderEntity } from '../catering/entities/catering-order.entity';
import { NotificationLogEntity } from '../notification/entities/notification-log.entity';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>,
        @InjectRepository(CateringOrderEntity) private cateringOrderRepo: Repository<CateringOrderEntity>,
        @InjectRepository(NotificationLogEntity) private notificationRepo: Repository<NotificationLogEntity>,
    ) { }

    async getProfile(userId: string): Promise<UserEntity> {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...safe } = user;
        return safe as UserEntity;
    }

    async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<UserEntity> {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateData.name !== undefined) user.name = updateData.name;
        if (updateData.phone !== undefined) user.phone = updateData.phone;
        if (updateData.address !== undefined) user.address = updateData.address;
        if (updateData.eventPreferences !== undefined) user.eventPreferences = updateData.eventPreferences;
        const saved = await this.userRepo.save(user);

        const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...safe } = saved;
        console.log(`[AUDIT] User ${userId} updated their profile`);
        return safe as UserEntity;
    }

    async getDashboardData(userId: string) {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) throw new NotFoundException('User not found');
        const email = user?.email;

        let cateringOrders: CateringOrderEntity[];
        if (user.isVerified && email) {
            cateringOrders = await this.cateringOrderRepo
                .createQueryBuilder('corder')
                .where('("corder"."userId" = :userId OR "corder"."customerInfo"->>\'email\' = :email)', {
                    userId,
                    email,
                })
                .orderBy('"corder"."createdAt"', 'DESC')
                .getMany();
        } else {
            cateringOrders = await this.cateringOrderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
        }

        let regularOrders: OrderEntity[];
        if (user.isVerified && email) {
            regularOrders = await this.orderRepo
                .createQueryBuilder('order')
                .where('("order"."userId" = :userId OR "order"."customerInfo"->>\'email\' = :email)', {
                    userId,
                    email,
                })
                .orderBy('"order"."createdAt"', 'DESC')
                .getMany();
        } else {
            regularOrders = await this.orderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
        }

        const notifications = await this.notificationRepo.find({
            where: { userId, isCleared: false },
            order: { createdAt: 'DESC' },
            take: 10,
        });

        const activeCatering = cateringOrders.filter(o => ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'preparing'].includes(o.status));
        const historyCatering = cateringOrders.filter(o => ['completed', 'cancelled'].includes(o.status));

        const activeRegular = regularOrders.filter(o => ['pending', 'paid', 'preparing', 'ready'].includes(o.status));
        const historyRegular = regularOrders.filter(o => ['completed', 'cancelled'].includes(o.status));

        return {
            stats: {
                totalCatering: cateringOrders.length,
                totalRegular: regularOrders.length,
            },
            active: {
                catering: activeCatering,
                regular: activeRegular,
            },
            history: {
                catering: historyCatering,
                regular: historyRegular,
            },
            recentNotifications: notifications,
        };
    }

    async findAllUsers(): Promise<UserEntity[]> {
        const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
        return users.map(u => {
            const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...safe } = u;
            return safe as UserEntity;
        });
    }

    async adminUpdateUser(userId: string, updateData: AdminUpdateUserDto): Promise<UserEntity> {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateData.name !== undefined) user.name = updateData.name;
        if (updateData.phone !== undefined) user.phone = updateData.phone;
        if (updateData.role !== undefined) user.role = updateData.role;
        if (updateData.isVerified !== undefined) user.isVerified = updateData.isVerified;
        const saved = await this.userRepo.save(user);

        const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...safe } = saved;
        return safe as UserEntity;
    }

    async adminDeleteUser(userId: string): Promise<void> {
        const result = await this.userRepo.delete({ _id: userId });
        if (!result.affected) {
            throw new NotFoundException('User not found');
        }
    }
}
