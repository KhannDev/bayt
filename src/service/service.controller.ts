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
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Request,
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
import { CreateFeedbackDto } from '../feedback/dto/create-feedback.dto';
import { Types } from 'mongoose';

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
    @Req() req: CustomRequest,
  ) {
    return this.serviceService.updateService(id, updateServiceDto);
  }

  @UseGuards(CustomerAuthGuard)
  @Patch('appointment/partner/:id')
  async updatePartnerAppointment(
    @Param('id') id: string,
    @Body() data: AppointmentStatusDto,
    @Req() req: CustomRequest,
  ) {
    return this.serviceService.updatePartnerAppointment(
      req.partner._id,
      id,
      data.status,
    );
  }

  @UseGuards(CustomerAuthGuard)
  @Patch('appointment/customer/:id')
  async updateCustomerAppointment(
    @Param('id') id: string,
    @Body() data: AppointmentStatusDto,
    @Req() req: CustomRequest,
  ) {
    return this.serviceService.updateCustomerAppointment(
      req.customer._id,
      id,
      data.status,
    );
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

  @Post('appointment/:appointmentId/feedback')
  @UseGuards(CustomerAuthGuard)
  async createFeedbackForAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID format');
    }

    const appointment =
      await this.serviceService.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const feedback = await this.serviceService.createFeedbackForAppointment(
      appointmentId,
      createFeedbackDto,
    );

    // Mark the feedback as seen
    await this.serviceService.markFeedbackAsSeen(appointmentId);

    return feedback;
  }

  @UseGuards(CustomerAuthGuard)
  @Post('appointment/:appointmentId/mark-feedback-seen')
  async markFeedbackAsSeen(
    @Param('appointmentId') appointmentId: string,
    @Request() req,
  ) {
    console.log('Im here ', 'appointmentId', appointmentId);
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID format');
    }

    const appointment =
      await this.serviceService.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    console.log(
      appointment.customerId._id.toString(),
      req.customer._id.toString(),
    );

    await this.serviceService.markFeedbackAsSeen(appointmentId);
    return { message: 'Feedback marked as seen successfully' };
  }

  @UseGuards(CustomerAuthGuard)
  @Get('completed-appointments-without-feedback')
  async getCompletedAppointmentsWithoutFeedback(@Req() req: CustomRequest) {
    console.log('Customer ID', req.customer._id);
    return this.serviceService.getCompletedAppointmentsWithoutFeedback(
      req.customer._id,
    );
  }

  @UseGuards(CustomerAuthGuard)
  @Get('appointment/:appointmentId/feedback')
  async getAppointmentWithFeedback(
    @Param('appointmentId') appointmentId: string,
    @Req() req: CustomRequest,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID format');
    }
    return this.serviceService.getAppointmentWithFeedback(appointmentId);
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service ID format');
    }
    return this.serviceService.getServiceById(id);
  }

  @UseGuards(CustomerAuthGuard)
  @Delete('appointment/:appointmentId/feedback')
  async deleteFeedbackFromAppointment(
    @Param('appointmentId') appointmentId: string,
    @Req() req: CustomRequest,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID format');
    }
    return this.serviceService.deleteFeedbackFromAppointment(appointmentId);
  }
}
