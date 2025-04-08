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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'AppointmentStatusTracker' }] })
  statusTracker: Types.ObjectId[];

  @Prop({
    required: true,
    enum: [
      'Pending',
      'Confirmed',
      'Completed',
      'Cancelled',
      'Rescheduled',
      'In-progress',
      'No-show',
      'Rejected',
      'Expired',
      'Accepted',
    ],
    default: 'Pending',
  })
  status: string; // Status of the appointment

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SubService' }], required: true })
  subServiceIds?: string[]; // Array of subservice IDs

  @Prop({ required: true })
  bookedTime: string;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  address: Types.ObjectId; // Array of subservice IDs

  @Prop({ type: Types.ObjectId, ref: 'Feedback' })
  feedbackId?: Types.ObjectId; // Reference to the feedback

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop({ default: false })
  isDisabled?: boolean;

  @Prop()
  bookingId?: number;

  @Prop({ default: false })
  feedbackSeen: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
