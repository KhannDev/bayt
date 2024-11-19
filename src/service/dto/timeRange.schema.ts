import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsDate } from 'class-validator';

export class CreateTimeRangeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  startTime: string; // e.g., "09:00 AM"

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  endTime: string; // e.g., "05:00 PM"
}
