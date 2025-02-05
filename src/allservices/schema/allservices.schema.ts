import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AllserviceDocument = Allservices & Document;

@Schema({ timestamps: true })
export class Allservices {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isVerified: boolean;
  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;
}

export const AllserviceSchema = SchemaFactory.createForClass(Allservices);
