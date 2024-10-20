import { IsNotEmpty, IsString, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeSlotDto {
  //   @ApiProperty()
  //   @IsNotEmpty()
  //   @IsString()
  //   serviceId: string;

  //   @ApiProperty()
  //   @IsNotEmpty()
  //   @IsString()
  //   partnerId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}

export class GetAvailableTimeSlots {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  partnerId: string;
}
