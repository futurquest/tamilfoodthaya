import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
    constructor(@InjectModel(Message.name) private messageModel: Model<Message>) { }

    async create(createMessageDto: CreateMessageDto): Promise<Message> {
        const newMessage = new this.messageModel(createMessageDto);
        return newMessage.save();
    }

    async findAll(filters: any = {}): Promise<any> {
        const query: any = { isActive: true };

        if (filters.read !== undefined) {
            query.read = filters.read === 'true';
        }

        if (filters.from || filters.to) {
            query.createdAt = {};
            if (filters.from) query.createdAt.$gte = new Date(filters.from);
            if (filters.to) query.createdAt.$lte = new Date(filters.to);
        }

        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.messageModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.messageModel.countDocuments(query).exec(),
        ]);

        return { data, total, page, limit };
    }

    async markAsRead(id: string): Promise<Message | null> {
        return this.messageModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
    }

    async remove(id: string): Promise<any> {
        return this.messageModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    }
}
