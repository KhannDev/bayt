import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';
import { ServiceController } from './service.controller';
import { SubServiceModule } from 'src/sub-service/sub-service.module';
import { CategoryModule } from 'src/category/category.module';
import { JWTService } from 'src/utils/jwt/jwt.service';
import { CustomerModule } from 'src/customer/customer.module';
import { PartnerModule } from 'src/partner/partner.module';
import { TimeSlot, TimeSlotSchema } from './schema/timeSlot.schema';
import { Appointment, AppointmentSchema } from './schema/appointment.schema';
import { TimeRange, TimeRangeSchema } from './schema/timeRange.schema';
import {
  SubService,
  SubServiceSchema,
} from 'src/sub-service/schema/sub-service.schema';
import {
  AppointmentStatusTracker,
  AppointmentStatusTrackerSchema,
} from './schema/appointmentStatusTracker.schema';
import { Feedback, FeedbackSchema } from '../feedback/schemas/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    MongooseModule.forFeature([
      {
        name: AppointmentStatusTracker.name,
        schema: AppointmentStatusTrackerSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: TimeSlot.name, schema: TimeSlotSchema },
    ]),
    MongooseModule.forFeature([
      { name: TimeRange.name, schema: TimeRangeSchema },
    ]),
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
    MongooseModule.forFeature([
      { name: SubService.name, schema: SubServiceSchema },
    ]),
    SubServiceModule,
    CategoryModule,
    CustomerModule,
    PartnerModule,
  ],
  providers: [ServiceService, JWTService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
