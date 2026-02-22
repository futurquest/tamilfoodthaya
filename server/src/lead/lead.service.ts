import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schemas/lead.schema';

@Injectable()
export class LeadService {
    constructor(@InjectModel(Lead.name) private leadModel: Model<Lead>) { }

    async createLead(data: any): Promise<Lead> {
        const newLead = new this.leadModel(data);
        return newLead.save();
    }

    async findAllLeads(filters: any = {}): Promise<any> {
        const query: any = { isActive: true };

        if (filters.status) {
            query.status = filters.status;
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
            this.leadModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.leadModel.countDocuments(query).exec(),
        ]);

        return { data, total, page, limit };
    }

    async updateStatus(id: string, status: string): Promise<Lead | null> {
        return this.leadModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
}
