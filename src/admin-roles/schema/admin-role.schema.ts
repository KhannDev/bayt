import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminRoleDocument = AdminRole & Document;

@Schema({ timestamps: true })
export class AdminRole {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: Types.ObjectId[];
}

export const AdminRoleSchema = SchemaFactory.createForClass(AdminRole);
