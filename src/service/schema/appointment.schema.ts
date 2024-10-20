import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Service',
  })
  serviceId: Types.ObjectId; // Reference to the TimeSlot

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Customer',
  })
  customerId: Types.ObjectId; // Reference to the user who booked

  @Prop({ required: true, type: Types.ObjectId, ref: 'Partner' })
  partnerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'rescheduled',
      'in-progress',
      'no-show',
      'rejected',
      'expired',
    ],
    default: 'pending',
  })
  status: string; // Status of the appointment

  @Prop({ required: true })
  bookedTime: string; // The specific time slot the user booked (e.g., "09:30 AM")
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
