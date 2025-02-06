// src/admin/admin.controller.ts

import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, PaginationDto } from './dto/admin.dto';

import { AdminAuthGuard } from 'src/common/useguards/admin.useguards';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from 'src/customer/customer.service';
import { PartnerService } from 'src/partner/partner.service';
import { ServiceService } from 'src/service/service.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly CustomerService: CustomerService,
    private readonly PartnerService: PartnerService,
    private readonly ServiceService: ServiceService,
  ) {}

  // @UseGuards(AdminAuthGuard)
  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const { email, password, name } = createAdminDto;
    return this.adminService.createAdmin(email, password, name);
  }

  // @UseGuards(AdminAuthGuard)
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

  // @UseGuards(AdminAuthGuard)
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

  @Get('bookings')
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched appointments',
  })
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
    name: 'partnerId',
    required: false,
    type: String,
    description: 'Filter by partner ID',
  })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    type: String,
    description: 'Filter by service ID',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: String,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Filter by appointment status (e.g., Pending, Confirmed, etc.)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter by start date for the appointment',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter by end date for the appointment',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
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
}
