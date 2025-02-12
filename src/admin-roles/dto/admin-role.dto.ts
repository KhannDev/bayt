import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  permissions?: string[];
}
