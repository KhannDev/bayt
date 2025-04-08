import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true })
  rating: number;

  @Prop({})
  comment: string;

  @Prop({ required: true })
  appointmentId: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
