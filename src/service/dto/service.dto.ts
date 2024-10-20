import { IsNotEmpty, IsString, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubServiceDto } from 'src/sub-service/dto/sub-service.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTimeSlotDto } from './timeSlot.dto';

export class CreateServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  @Type(() => String)
  subServiceIds: CreateSubServiceDto[]; // Array of sub-service IDs

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @Type(() => String)
  timeSlotIds: CreateTimeSlotDto; // Array of time slot IDs
}

export class UpdateServiceDto {
  @IsString()
  description?: string;

  @IsUrl()
  imageUrl?: string;

  @IsArray()
  @Type(() => String)
  subServiceIds?: string[]; // Array of sub-service IDs

  // @IsArray()
  @Type(() => String)
  timeSlotIds: CreateTimeSlotDto; // Array of time slot IDs
}
