import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { AllservicesService } from './allservices.service';
import { CreateSubserviceDto } from './dto/allservices.dto';
import { UpdateSubserviceDto } from './dto/allservices.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('allservices')
@Controller('allservices')
export class AllservicesController {
  constructor(private readonly subservicesService: AllservicesService) {}

  @Post()
  create(@Body() createSubserviceDto: CreateSubserviceDto) {
    return this.subservicesService.create(createSubserviceDto);
  }
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit for pagination',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Category ID ',
  })
  @Get()
  findAll(
    @Query('category') category: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.subservicesService.findAll(category, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subservicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubserviceDto: UpdateSubserviceDto,
  ) {
    return this.subservicesService.update(id, updateSubserviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subservicesService.remove(id);
  }
}
