import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean; // Indicates if the category is active or not

  approvedBy: string;

  approvedDate: Date;
}

export class UpdateCategoryDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  @IsBoolean()
  isActive?: boolean; // Indicates if the category is active or not
}
