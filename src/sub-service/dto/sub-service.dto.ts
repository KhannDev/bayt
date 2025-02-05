import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subservice: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number; // Price of the sub-service

  @ApiProperty()
  serviceDuration: number;
}

export class UpdateSubServiceDto {
  @ApiProperty()
  @IsString()
  subservice?: string;

  @ApiProperty()
  @IsNumber()
  price?: number; // Price of the sub-service

  @ApiProperty()
  serviceDuration?: number;
}
