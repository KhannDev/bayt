import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubService } from '../../sub-service/schema/sub-service.schema'; // Adjust the path as necessary
// import { TimeSlot } from './timeslot.schema'; // Adjust the path to the TimeSlot schema

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ type: [{ type: String, ref: 'SubService' }], required: true })
  subServiceIds: string[]; // Array of subservice IDs

  @Prop({ type: Types.ObjectId, required: true })
  partnerId: Types.ObjectId; // Array of subservice IDs

  @Prop({
    required: true,
    enum: ['Review', 'Accepted', 'Rejected'],
    default: 'Review',
  })
  status: string;

  // @Prop({ type: String, ref: 'TimeSlot', required: true })
  // timeSlotId: string; // Reference to another collection for time slots
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
