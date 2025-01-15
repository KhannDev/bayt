import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
} from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty()
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  // @IsNotEmpty()
  @ApiProperty()
  isAllowed: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  mobileNumber: string;

  @ApiProperty()
  otp: string;

  @IsOptional()
  @IsEnum(Gender)
  profilePicture?: Gender;
}
export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  profilePicture?: string;
}
