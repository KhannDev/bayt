import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubServiceDocument = SubService & Document;

@Schema({ timestamps: true })
export class SubService {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number; // Assuming price is a number, you can change the type if needed
}

export const SubServiceSchema = SchemaFactory.createForClass(SubService);
