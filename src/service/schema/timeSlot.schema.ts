import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimeSlotDocument = TimeSlot & Document;

@Schema({ timestamps: true })
export class TimeSlot {
  @Prop({ required: true, type: String, ref: 'Service' })
  serviceId: string;

  @Prop({ required: true, type: String, ref: 'Partner' })
  partnerId: string;

  @Prop({ required: true })
  date: Date; // The specific date for the time slot

  @Prop({ required: true })
  startTime: string; // Start time in the format "09:00 AM"

  @Prop({ required: true })
  endTime: string; // End time in the format "05:00 PM"

  @Prop({ required: true })
  duration: number; // Duration in minutes (e.g., 30)
}

export const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);
