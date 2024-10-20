import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SubServiceService } from './sub-service.service';
import { CreateSubServiceDto } from './dto/sub-service.dto';
import { UpdateSubServiceDto } from './dto/sub-service.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sub-service')
@Controller('sub-service')
export class SubServiceController {
  constructor(private readonly subServiceService: SubServiceService) {}

  @Post()
  async createSubService(@Body() createSubServiceDTO: CreateSubServiceDto) {
    return await this.subServiceService.createSubService(createSubServiceDTO);
  }

  @Get(':id')
  async getSubService(@Param('id') id: string) {
    return await this.subServiceService.getSubService(id);
  }

  @Patch(':id')
  async updateSubService(
    @Param('id') id: string,
    @Body() updateSubServiceDTO: UpdateSubServiceDto,
  ) {
    return await this.subServiceService.updateSubService(
      id,
      updateSubServiceDTO,
    );
  }

  @Delete(':id')
  async deleteSubService(@Param('id') id: string) {
    return await this.subServiceService.deleteSubService(id);
  }
}
