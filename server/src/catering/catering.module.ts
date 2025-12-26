import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CateringController } from './catering.controller';
import { CateringService } from './catering.service';
import { CateringQuote, CateringQuoteSchema } from './schemas/catering-quote.schema';
import { CateringPackage, CateringPackageSchema } from './schemas/catering-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CateringQuote.name, schema: CateringQuoteSchema },
      { name: CateringPackage.name, schema: CateringPackageSchema },
    ]),
  ],
  controllers: [CateringController],
  providers: [CateringService],
})
export class CateringModule { }
