import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number; // Price of the sub-service
}

export class UpdateSubServiceDto {
  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNumber()
  price?: number; // Price of the sub-service
}
