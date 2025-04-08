import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdsDto } from './dto/create-ads.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/useguards/admin.useguards';
import { CustomRequest } from '../common/interfaces/interface';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() createAdsDto: CreateAdsDto, @Req() req: CustomRequest) {
    return this.adsService.create({
      ...createAdsDto,
      createdBy: req.admin._id,
    });
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
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdsDto: CreateAdsDto,
    @Req() req: CustomRequest,
  ) {
    return this.adsService.update(id, {
      ...updateAdsDto,
      approvedBy: req.admin.id,
      approvedDate: new Date(),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
