import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartnerStatusTrackerDocument = PartnerStatusTracker & Document;

@Schema({ timestamps: true })
export class PartnerStatusTracker {
  @Prop({
    required: true,
    enum: ['Review', 'Accepted', 'Rejected', 'Disabled'],
    default: 'Review',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  UpdatedBy?: Types.ObjectId;
}

export const PartnerStatusTrackerSchema =
  SchemaFactory.createForClass(PartnerStatusTracker);
