import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllservicesService } from './allservices.service';
import { AllservicesController } from './allservices.controller';
import { Allservices, AllserviceSchema } from './schema/allservices.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Allservices.name, schema: AllserviceSchema },
    ]),
  ],
  controllers: [AllservicesController],
  providers: [AllservicesService],
})
export class AllservicesModule {}
