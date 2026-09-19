import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
    constructor(@InjectRepository(MessageEntity) private messageRepo: Repository<MessageEntity>) { }

    async create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
        const message = this.messageRepo.create({
            _id: MessageEntity.newId(),
            name: createMessageDto.name,
            email: createMessageDto.email,
            phone: createMessageDto.phone,
            message: createMessageDto.message,
        });
        return this.messageRepo.save(message);
    }

    async findAll(filters: any = {}): Promise<any> {
        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const where: any = { isActive: true };

        if (filters.read !== undefined) {
            where.read = filters.read === 'true';
        }

        if (filters.from) where.createdAt = MoreThanOrEqual(new Date(filters.from));
        if (filters.to) {
            where.createdAt = where.createdAt
                ? (where.createdAt as any).and(LessThanOrEqual(new Date(filters.to)))
                : LessThanOrEqual(new Date(filters.to));
        }

        const [data, total] = await this.messageRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async markAsRead(id: string): Promise<MessageEntity | null> {
        const message = await this.messageRepo.findOne({ where: { _id: id } });
        if (!message) return null;
        message.read = true;
        return this.messageRepo.save(message);
    }

    async remove(id: string): Promise<MessageEntity | null> {
        const message = await this.messageRepo.findOne({ where: { _id: id } });
        if (!message) return null;
        message.isActive = false;
        return this.messageRepo.save(message);
    }
}