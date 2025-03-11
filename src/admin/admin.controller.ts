// src/admin/admin.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  Req,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, PaginationDto, UpdateAdminDto } from './dto/admin.dto';

import { AdminAuthGuard } from 'src/common/useguards/admin.useguards';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from 'src/customer/customer.service';
import { PartnerService } from 'src/partner/partner.service';
import { ServiceService } from 'src/service/service.service';
import { UpdatePartnerDto } from 'src/partner/dto/partner.dto';
import { CustomRequest } from 'src/common/interfaces/interface';
import { UpdateServiceDto } from 'src/service/dto/service.dto';
import { CategoryService } from 'src/category/category.service';
import { CreateCategoryDto } from 'src/category/dto/category.dto';
import { AllservicesService } from 'src/allservices/allservices.service';
import { CreateSubserviceDto } from 'src/allservices/dto/allservices.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly CustomerService: CustomerService,
    private readonly PartnerService: PartnerService,
    private readonly ServiceService: ServiceService,
    private readonly CategoryService: CategoryService,
    private readonly AllService: AllservicesService,
  ) {}

  // @UseGuards(AdminAuthGuard)
  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const { email, password, name, adminRole } = createAdminDto;
    return this.adminService.createAdmin(email, password, name, adminRole);
  }

  @Get('')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @UseGuards(AdminAuthGuard)
  @Get('customers')
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
  @ApiOperation({ summary: 'Get all users with pagination' }) // Optional: For Swagger docs
  @ApiResponse({ status: 200, description: 'Successfully fetched users' }) // Optional: For Swagger docs
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Destructure the DTO properties
    console.log('PAGES', page, limit);
    const users = await this.CustomerService.findAllUsers(page, limit);
    return users;
  }

  @UseGuards(AdminAuthGuard)
  @Get('partners')
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
  @ApiOperation({ summary: 'Get all users with pagination' }) // Optional: For Swagger docs
  @ApiResponse({ status: 200, description: 'Successfully fetched users' }) // Optional: For Swagger docs
  async getAllPartners(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    // const { page, limit } = paginationDto; // Destructure the DTO properties
    const partners = await this.PartnerService.findAllPartners(page, limit);
    return partners;
  }
  @UseGuards(AdminAuthGuard)
  @Get('bookings')
  @ApiOperation({ summary: 'Get all appointments' })
  async findAllAppointments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('partnerId') partnerId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('category') category?: string,
  ) {
    return this.ServiceService.findAllAppointments(
      page,
      limit,
      partnerId,
      serviceId,
      customerId,
      status,
      startDate,
      endDate,
      category,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Post('updatePartner/:id')
  async updatePartners(
    @Param('id') id: string,
    @Req() req: CustomRequest,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.PartnerService.StatusUpdate(id, {
      ...updatePartnerDto,
      approvedBy: req.admin.id,
      approvedDate: new Date(),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Post('createCategory/')
  async updateCategory(
    @Req() req: CustomRequest,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.CategoryService.create({
      ...createCategoryDto,
      approvedBy: req.admin.id,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Post('updateService/:id')
  async updateService(
    @Param('id') id: string,
    @Req() req: CustomRequest,
    @Body() updatePartnerDto: UpdateServiceDto,
  ) {
    console.log(id);
    return this.ServiceService.updateService(id, {
      ...updatePartnerDto,
      approvedBy: req.admin.id,
      approvedDate: new Date(),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Post('createAllService/')
  async createAllService(
    @Req() req: CustomRequest,
    @Body() createSubserviceDto: CreateSubserviceDto,
  ) {
    return this.AllService.create({
      ...createSubserviceDto,
      createdBy: req.admin.id,
    });
  }

  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.adminService.getAdminById(id);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }
  @Patch(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminService.updateAdmin(
      id,
      updateAdminDto,
    );
    if (!updatedAdmin) {
      throw new NotFoundException('Admin not found');
    }
    return updatedAdmin;
  }
}
