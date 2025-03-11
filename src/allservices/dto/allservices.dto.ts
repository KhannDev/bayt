import { IsNotEmpty, IsString } from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubserviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  createdBy?: string;
}
export class UpdateSubserviceDto extends PartialType(CreateSubserviceDto) {}
