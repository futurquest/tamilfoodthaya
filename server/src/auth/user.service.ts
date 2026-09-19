import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from './entities/user.entity';
import { CateringOrder } from '../catering/schemas/catering-order.schema';
import { Order } from '../order/schemas/order.schema';
import { NotificationLog } from '../notification/schemas/notification.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        // CateringOrder/Order/NotificationLog still live on Mongo for now.
        @InjectModel(CateringOrder.name) private cateringOrderModel: Model<CateringOrder>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLog>,
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

        const cateringOrders = await this.cateringOrderModel.find({
            $or: [{ userId }, { 'customerInfo.email': email }]
        }).sort({ createdAt: -1 }).exec();

        const regularOrders = await this.orderModel.find({
            $or: [{ userId }, { 'customerInfo.email': email }]
        }).sort({ createdAt: -1 }).exec();

        const notifications = await this.notificationLogModel.find({ userId, isCleared: false }).sort({ createdAt: -1 }).limit(10).exec();

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