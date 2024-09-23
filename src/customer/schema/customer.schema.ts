import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum Status {
  Unverified = 'Unverified',
  Verified = 'Verified',
}

@Schema()
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true, default: false })
  isAllowed: boolean;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ required: false })
  profilePicture?: string; // Optional field
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
