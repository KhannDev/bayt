import { ApiPreconditionFailedResponse, ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty()
  @IsString()
  appointmentId: string;

  //   @ApiProperty()
  //   @IsBoolean()
  //   @IsOptional()
  //   isAnonymous?: boolean;
}
