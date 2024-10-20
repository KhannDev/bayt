import { Module } from '@nestjs/common';
import { SubServiceService } from './sub-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubService, SubServiceSchema } from './schema/sub-service.schema';
import { SubServiceController } from './sub-service.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubService.name, schema: SubServiceSchema },
    ]),
  ],
  providers: [SubServiceService],
  controllers: [SubServiceController],
  exports: [SubServiceService],
})
export class SubServiceModule {}
