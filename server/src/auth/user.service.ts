import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CateringOrder } from '../catering/schemas/catering-order.schema';
import { Order } from '../order/schemas/order.schema';
import { NotificationLog } from '../notification/schemas/notification.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(CateringOrder.name) private cateringOrderModel: Model<CateringOrder>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLog>,
    ) { }

    async getProfile(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId).select('-password -verificationPin -resetPasswordToken').exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updateProfile(userId: string, updateData: any): Promise<User> {
        // Prevent updating sensitive fields via profile update
        delete updateData.password;
        delete updateData.role;
        delete updateData.isVerified;
        delete updateData.email;
        delete updateData.username;

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password -verificationPin -resetPasswordToken').exec();

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        // Ideally, we'd log this audit event somewhere (audit collection)
        console.log(`[AUDIT] User ${userId} updated their profile`);

        return updatedUser;
    }

    async getDashboardData(userId: string) {
        const user = await this.userModel.findById(userId).exec();
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

    async findAllUsers(): Promise<User[]> {
        return this.userModel.find().select('-password -verificationPin -resetPasswordToken').sort({ createdAt: -1 }).exec();
    }

    async adminUpdateUser(userId: string, updateData: any): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password -verificationPin -resetPasswordToken').exec();

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser;
    }

    async adminDeleteUser(userId: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(userId).exec();
        if (!result) {
            throw new NotFoundException('User not found');
        }
    }
}
