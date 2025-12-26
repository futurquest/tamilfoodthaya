import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CateringQuote } from './schemas/catering-quote.schema';
import { CateringPackage } from './schemas/catering-package.schema';

@Injectable()
export class CateringService {
    constructor(
        @InjectModel(CateringQuote.name) private quoteModel: Model<CateringQuote>,
        @InjectModel(CateringPackage.name) private packageModel: Model<CateringPackage>,
    ) { }

    async createQuoteRequest(data: any): Promise<CateringQuote> {
        const newQuote = new this.quoteModel(data);
        return newQuote.save();
    }

    async findAllQuotes(): Promise<CateringQuote[]> {
        return this.quoteModel.find().sort({ createdAt: -1 }).exec();
    }

    async findAllPackages(): Promise<CateringPackage[]> {
        return this.packageModel.find({ available: true }).sort({ pricePerPerson: 1 }).exec();
    }

    async createPackage(data: any): Promise<CateringPackage> {
        const newPackage = new this.packageModel(data);
        return newPackage.save();
    }
}
