import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentStatusTrackerDocument = AppointmentStatusTracker &
  Document;

@Schema({ timestamps: true })
export class AppointmentStatusTracker {
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
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  updatedByCustomer?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Partner' })
  updatedByPartner?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  updatedByAdmin?: Types.ObjectId;
}

export const AppointmentStatusTrackerSchema = SchemaFactory.createForClass(
  AppointmentStatusTracker,
);
