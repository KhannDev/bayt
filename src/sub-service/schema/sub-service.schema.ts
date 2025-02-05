import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubServiceDocument = SubService & Document;

@Schema({ timestamps: true })
export class SubService {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Allservices' })
  subservice: Types.ObjectId;

  @Prop({ required: true })
  price: number; // Assuming price is a number, you can change the type if needed

  @Prop({ required: true })
  serviceDuration: number; // Assuming price is a number, you can change the type if needed
}

export const SubServiceSchema = SchemaFactory.createForClass(SubService);
