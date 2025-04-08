import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AdsDocument = Ads & Document;

@Schema({ timestamps: true })
export class Ads {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  createdBy: string;
}

export const AdsSchema = SchemaFactory.createForClass(Ads);
