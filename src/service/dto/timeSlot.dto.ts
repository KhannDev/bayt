import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateTimeRangeDto } from './timeRange.schema';

export class CreateTimeSlotDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @Type(() => Array)
  timeRangeIds: CreateTimeRangeDto[];
}

export class GetAvailableTimeSlots {
  @ApiProperty()
  @IsString()
  serviceId: string;

  // @ApiProperty()
  // @IsNotEmpty()`
  // @IsString()
  // partnerId: string;
}

export class TimeRangeDto {
  @IsNotEmpty()
  startTime: string; // ISO 8601 formatted string

  @IsNotEmpty()
  endTime: string; // ISO 8601 formatted string
}

// DTO for the incoming request to update or create time slots
export class UpdateOrCreateTimeSlotDto {
  @IsNotEmpty()
  date: string; // ISO 8601 formatted date string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  timeRanges: TimeRangeDto[]; // Array of time ranges
}
