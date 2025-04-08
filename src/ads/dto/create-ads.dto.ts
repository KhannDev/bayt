import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAdsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsOptional()
  approvedDate?: Date;
}
