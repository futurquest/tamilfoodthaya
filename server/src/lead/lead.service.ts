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

    async findAllLeads(): Promise<Lead[]> {
        return this.leadModel.find().sort({ createdAt: -1 }).exec();
    }

    async updateStatus(id: string, status: string): Promise<Lead | null> {
        return this.leadModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
}
