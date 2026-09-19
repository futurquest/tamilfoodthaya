import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { CateringOrderEntity } from '../catering/entities/catering-order.entity';
import { NotificationLogEntity } from '../notification/entities/notification-log.entity';

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

    async updateProfile(userId: string, updateData: any): Promise<UserEntity> {
        delete updateData.password;
        delete updateData.role;
        delete updateData.isVerified;
        delete updateData.email;
        delete updateData.username;

        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateData);
        const saved = await this.userRepo.save(user);

        const { password, verificationPin, verificationPinExpires, resetPasswordToken, resetPasswordExpires, ...safe } = saved;
        console.log(`[AUDIT] User ${userId} updated their profile`);
        return safe as UserEntity;
    }

    async getDashboardData(userId: string) {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        const email = user?.email;

        let cateringOrders: CateringOrderEntity[];
        if (user && email) {
            cateringOrders = await this.cateringOrderRepo
                .createQueryBuilder('corder')
                .where('("corder"."userId" = :userId OR "corder"."customerInfo"->>\'email\' = :email)', {
                    userId,
                    email,
                })
                .orderBy('"corder"."createdAt"', 'DESC')
                .getMany();
        } else {
            cateringOrders = await this.cateringOrderRepo.find({ order: { createdAt: 'DESC' } });
        }

        let regularOrders: OrderEntity[];
        if (user && email) {
            regularOrders = await this.orderRepo
                .createQueryBuilder('order')
                .where('("order"."userId" = :userId OR "order"."customerInfo"->>\'email\' = :email)', {
                    userId,
                    email,
                })
                .orderBy('"order"."createdAt"', 'DESC')
                .getMany();
        } else {
            regularOrders = await this.orderRepo.find({ order: { createdAt: 'DESC' } });
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

    async adminUpdateUser(userId: string, updateData: any): Promise<UserEntity> {
        const user = await this.userRepo.findOne({ where: { _id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateData);
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