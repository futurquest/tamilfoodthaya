import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { LeadEntity } from './entities/lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadEntity]),
  ],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule { }