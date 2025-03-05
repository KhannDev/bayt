import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CustomRequest } from './../common/interfaces/interface';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GuardDuty } from 'aws-sdk';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import {
  GetAvailableTimeSlots,
  UpdateOrCreateTimeSlotDto,
} from './dto/timeSlot.dto';
import {
  AppointmentStatusDto,
  CreateAppointmentDto,
} from './dto/appointment.dto';
import sendPushNotification from 'src/common/send-push-notification';
import { PartnerService } from 'src/partner/partner.service';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly partnerService: PartnerService,
  ) {}

  @UseGuards(CustomerAuthGuard)
  @Post()
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: CustomRequest,
  ) {
    console.log('REq PARTNERERRER', req.partner);
    return this.serviceService.createService(createServiceDto, req.partner._id);
  }

  @Post('available-timeslots')
  async getAvailableTimeSlots(@Body() timeSlots: GetAvailableTimeSlots) {
    return this.serviceService.getAvailableTimeSlots(timeSlots.serviceId);
  }

  @UseGuards(CustomerAuthGuard)
  @Post('Appointment')
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: CustomRequest,
  ) {
    console.log('REq PARTNERERRER', req.customer);
    const response = await this.serviceService.createAppointment(
      createAppointmentDto,
      req.customer._id,
    );
    const getPartner = await this.partnerService.findById(
      String(response.partnerId),
    );

    await sendPushNotification({
      title: 'New booking',
      body: 'New booking created ',
      data: {},
      tokens: [(await getPartner).expoToken],
    });

    return response;
  }

  @UseGuards(CustomerAuthGuard)
  @Get('/Partner/Appointment')
  async getPartnerAppointments(@Req() req: CustomRequest) {
    return this.serviceService.getAppointmentsByPartner(req.partner._id);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('/Customer/Appointment')
  async getCustomerAppointments(@Req() req: CustomRequest) {
    return this.serviceService.getAppointmentsByCustomer(req.customer._id);
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
  async getServices(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    // @Query('limit') limit: number = 10, // @Query('page') page: number = 1,
    return this.serviceService.getAllServices(page, limit);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('PartnerServices')
  async getPartnerServices(@Req() req: CustomRequest) {
    // @Query('limit') limit: number = 10, // @Query('page') page: number = 1,
    return this.serviceService.getPartnerServices(req.partner._id);
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return this.serviceService.getServiceById(id);
  }

  @Get('/partner/timeSlots/:id')
  async getPartnerTimeslots(@Param('id') id: string) {
    return this.serviceService.getPartnerTimeSlots(id);
  }

  @Get('/appointment/:id')
  async getAppointmentById(@Param('id') id: string) {
    return this.serviceService.getAppointmentById(id);
  }

  @Patch(':id')
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.updateService(id, updateServiceDto);
  }

  @Patch('Appointment/:id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() status: AppointmentStatusDto,
  ) {
    return this.serviceService.updateAppointment(id, status.status);
  }

  @Patch('serviceTimeSlot/:id')
  async updateServiceTimeSlot(
    @Param('id') id: string,
    @Body() timeSlotData: UpdateOrCreateTimeSlotDto[],
  ) {
    return this.serviceService.updateOrCreateTimeSlots(id, timeSlotData);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.serviceService.deleteService(id);
  }
}
