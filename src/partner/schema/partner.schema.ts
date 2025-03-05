import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartnerDocument = Partner & Document;

// export enum ExperienceLevel {
//   Junior = 'Junior',
//   Mid = 'Mid',
//   Senior = 'Senior',
// }

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

@Schema({ timestamps: true, collection: 'Partner' })
export class Partner {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  password: string;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ enum: Gender })
  gender?: Gender;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  profilePicture?: string; // Optional field

  @Prop({ type: [{ type: String, ref: 'Address' }] })
  addresses: string[]; // Array of subservice IDs

  @Prop({ required: false })
  experience: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true, default: true })
  isAllowed: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ required: true })
  currentAddress: string;

  @Prop({ required: false })
  previousWorkplace: string;

  @Prop({ required: false })
  passportFront?: string; // URL or path to the passport front image

  @Prop({ required: false })
  passportBack?: string; // URL or path to the passport back image

  @Prop({ required: false })
  cpr?: string; // URL or path to the CPR document

  @Prop({ required: false })
  iban?: string; // URL or path to the IBAN document

  @Prop({ required: false })
  flexiVisa?: string; // URL or path to the Flexi Visa document

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedDate?: Date;

  @Prop({ required: false })
  expoToken?: string;
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);
