import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { LeadEntity } from './entities/lead.entity';

@Injectable()
export class LeadService {
    constructor(@InjectRepository(LeadEntity) private leadRepo: Repository<LeadEntity>) { }

    async createLead(data: any): Promise<LeadEntity> {
        const lead = this.leadRepo.create({
            _id: LeadEntity.newId(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            eventDate: data.eventDate ?? null,
            guests: data.guests != null ? Number(data.guests) : null,
            location: data.location ?? null,
            message: data.message ?? null,
            package: data.package ?? null,
            utmSource: data.utmSource ?? null,
            campaign: data.campaign ?? null,
        });
        return this.leadRepo.save(lead);
    }

    async findAllLeads(filters: any = {}): Promise<any> {
        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const skip = (page - 1) * limit;

        const where: any = { isActive: true };

        if (filters.status) where.status = filters.status;

        if (filters.from) where.createdAt = MoreThanOrEqual(new Date(filters.from));
        if (filters.to) {
            where.createdAt = where.createdAt
                ? (where.createdAt as any).and(LessThanOrEqual(new Date(filters.to)))
                : LessThanOrEqual(new Date(filters.to));
        }

        const [data, total] = await this.leadRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async updateStatus(id: string, status: string): Promise<LeadEntity | null> {
        const lead = await this.leadRepo.findOne({ where: { _id: id } });
        if (!lead) return null;
        lead.status = status;
        return this.leadRepo.save(lead);
    }
}