import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimeSlotDocument = TimeSlot & Document;

@Schema({ timestamps: true })
export class TimeSlot {
  @Prop({ required: true, type: String, ref: 'Service' })
  serviceId: string;

  @Prop({ type: String, ref: 'Partner' })
  partnerId?: string;

  @Prop({ required: true })
  date: Date; // The specific date for the time slot

  @Prop({ type: [{ type: String, ref: 'TimeRange' }], required: true })
  timeRangeIds: string[]; // Array of subservice IDs
}

export const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);
