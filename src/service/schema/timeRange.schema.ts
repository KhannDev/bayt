import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeRangeDocument = TimeRange & Document;

@Schema({ timestamps: true })
export class TimeRange {
  @Prop({ required: true }) // Ensure uniqueness across partners or globally
  startTime: string; // Start time in the format "09:00 AM"

  @Prop({ required: true }) // Ensure uniqueness
  endTime: string; // End time in the format "05:00 PM"

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const TimeRangeSchema = SchemaFactory.createForClass(TimeRange);
