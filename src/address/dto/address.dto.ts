import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  street: string; // Street name

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  addressName: string; // Street name

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string; // Street name

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  block: string; // Block

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildingOrHouse: string; // Building or house number

  @ApiProperty()
  @IsOptional()
  @IsString()
  aptNumber?: string; // Apartment number (optional)

  @ApiProperty()
  longitude: string; // Longitude as a string

  @ApiProperty()
  latitude: string; // Latitude as a string
}
