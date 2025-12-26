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

    async findAll(): Promise<Message[]> {
        return this.messageModel.find().sort({ createdAt: -1 }).exec();
    }

    async markAsRead(id: string): Promise<Message | null> {
        return this.messageModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
    }

    async remove(id: string): Promise<any> {
        return this.messageModel.findByIdAndDelete(id).exec();
    }
}
