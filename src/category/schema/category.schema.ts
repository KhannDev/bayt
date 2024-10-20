import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, default: true })
  isLive: boolean; // Changed 'onLive' to 'isLive' for clarity

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] }) // Referencing serviceIds
  serviceIds: Types.ObjectId[]; // Array of service IDs linked to this category
}

export const CategorySchema = SchemaFactory.createForClass(Category);
