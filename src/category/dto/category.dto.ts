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
  onLive: boolean; // Indicates if the category is active or not
}

export class UpdateCategoryDto {
  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty()
  @IsBoolean()
  onLive?: boolean; // Indicates if the category is active or not
}
