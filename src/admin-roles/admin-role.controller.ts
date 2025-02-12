import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AdminRolesService } from './admin-role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/admin-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Roles')
@Controller('adminRoles')
export class AdminRolesController {
  constructor(private readonly rolesService: AdminRolesService) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Get()
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return await this.rolesService.getRoleById(id);
  }

  @Put(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return await this.rolesService.deleteRole(id);
  }
}
