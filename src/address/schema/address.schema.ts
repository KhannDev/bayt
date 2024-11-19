import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  street: string; // Street name

  @Prop({ required: true })
  addressName: string; // Street name
  @Prop({ required: true })
  type: string; // Street name

  @Prop({ required: true })
  block: string; // Block

  @Prop({ required: false })
  buildingOrHouse: string; // Building or house number

  @Prop({ required: false })
  aptNumber: string; // Apartment number (optional)

  @Prop()
  longitude?: string; // Longitude as a string

  @Prop()
  latitude?: string; // Latitude as a string
}

export const AddressSchema = SchemaFactory.createForClass(Address);
