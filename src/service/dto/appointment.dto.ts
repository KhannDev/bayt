import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Rescheduled = 'rescheduled',
  InProgress = 'in-progress',
  NoShow = 'no-show',
  Rejected = 'rejected',
  Expired = 'expired',
}

export interface IAppointment {
  timeSlotId: string;
  userId: string;
  partnerId: string;
  bookedTime: string;
  status: AppointmentStatus; // Using the AppointmentStatus enum
  address: string;
}

export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookedTime: string; // The specific time the user booked (e.g., "09:30 AM")

  @ApiProperty()
  @IsString()
  partnerId?: string;

  @ApiProperty()
  @IsString()
  serviceId?: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @Type(() => String)
  subServiceIds?: string[];
}

export class AppointmentStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string; // The specific time the user booked (e.g., "09:30 AM")
}
