import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';
import { AgeRange } from '../schema/partner.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  // Adjust based on country code if necessary
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  experience: string;

  @ApiProperty()
  //   @IsEnum(AgeRange)
  @IsNotEmpty()
  ageRange: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  previousWorkplace: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  passportFront?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  passportBack?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cpr?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  iban?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  flexiVisa?: string;
}

export class UploadDocsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileExtension: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
