import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CateringService } from './catering.service';

@Controller('catering')
export class CateringController {
    constructor(private readonly cateringService: CateringService) { }

    @Post('quote')
    async requestQuote(@Body() body: any) {
        return this.cateringService.createQuoteRequest(body);
    }

    @Get('packages')
    async getPackages() {
        return this.cateringService.findAllPackages();
    }

    @Post('packages')
    async createPackage(@Body() body: any) {
        return this.cateringService.createPackage(body);
    }

    @Get('quotes')
    async getQuotes() {
        return this.cateringService.findAllQuotes();
    }
}
