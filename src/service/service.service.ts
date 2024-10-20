import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './schema/service.schema';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { SubServiceService } from 'src/sub-service/sub-service.service';
import { CategoryService } from 'src/category/category.service';
import { CreateTimeSlotDto } from './dto/timeSlot.dto';
import { TimeSlot } from './schema/timeSlot.schema';
import * as moment from 'moment';
import { Appointment } from './schema/appointment.schema';
import {
  AppointmentStatusDto,
  CreateAppointmentDto,
} from './dto/appointment.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(TimeSlot.name)
    private readonly timeSlotModel: Model<Service>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Service>,
    private subServiceService: SubServiceService,
    private categoryService: CategoryService,
  ) {}

  // Create a new service
  async createService(
    createServiceDto: CreateServiceDto,
    partnerId,
  ): Promise<Service> {
    // Step 1: Create sub-services first
    const subServiceIds = await this.subServiceService.createSubServices(
      createServiceDto.subServiceIds,
    );

    console.log('1');

    // Step 2: Create the service with the sub-service IDs
    const newService = new this.serviceModel({
      ...createServiceDto,
      subServiceIds,
      partnerId,
    });

    const createdService = await newService.save();

    console.log('2');

    // Step 3: Update the category by appending the service ID
    await this.categoryService.addServiceToCategory(
      createServiceDto.categoryId,
      createdService._id,
    );
    console.log('3');

    await this.createTimeSlotsForService(
      createServiceDto.timeSlotIds,
      createdService._id.toString(),
      partnerId,
    );

    return createdService;
  }

  async createTimeSlotsForService(
    timeSlots: CreateTimeSlotDto,
    serviceId: string,
    partnerId: string,
  ): Promise<void> {
    // Loop through each time slot DTO and create a new time slot entry

    try {
      const newTimeSlot = new this.timeSlotModel({
        ...timeSlots,
        serviceId,
        partnerId, // Link the time slot to the service via serviceId
      });

      // Save each individual time slot
      await newTimeSlot.save();
    } catch (e) {
      console.log('TimeSlot creationg error');
    }
  }

  // Get services with pagination
  async getAllServices(): Promise<Service[]> {
    const response = this.serviceModel
      .find({ status: 'Accepted' }) // Add the filter condition
      .populate('subServiceIds') // Populate the subServiceIds field
      .exec(); // Execute the query

    console.log(response);
    return response;
  }

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    customerId: string,
  ) {
    const partnerId = new Types.ObjectId(createAppointmentDto.partnerId); // Convert string to ObjectId
    const serviceId = new Types.ObjectId(createAppointmentDto.serviceId); // Convert string to ObjectId

    console.log(partnerId);
    console.log(createAppointmentDto, customerId);

    // Create a new appointment by correctly mapping the fields
    const appointment = new this.appointmentModel({
      bookedTime: createAppointmentDto.bookedTime, // Ensure this is included in the object
      partnerId,
      serviceId,
      customerId, // Use the userId from the authenticated request
    });

    // Save the appointment to the database and return it
    return appointment.save();
  }

  // async getPartnerAppointments({

  // });

  async getAppointmentsByCustomer(customerId: string) {
    const objectId = new Types.ObjectId(customerId); // Convert string to ObjectId

    const appointments = await this.appointmentModel
      .find({ customerId: objectId })
      .populate('serviceId') // Populating service details if needed
      .populate('partnerId') // Populating partner details if needed
      .lean() // Convert Mongoose documents to plain objects
      .exec();

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for customer with ID ${customerId}`,
      );
    }

    console.log(appointments); // Ensure type matches Appointment[]
    return appointments;
  }

  async getAppointmentsByPartner(partnerId: string) {
    // const objectId = new Types.ObjectId(partnerId); // Convert string to ObjectId

    // console.log(partnerId);

    const appointments = await this.appointmentModel
      .find({ partnerId })
      .populate('serviceId') // Populating service details if needed
      .populate('customerId') // Populating partner details if needed
      .lean() // Convert Mongoose documents to plain objects
      .exec();

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for customer with ID ${partnerId}`,
      );
    }

    console.log(appointments); // Ensure type matches Appointment[]

    return appointments;
  }

  // Get service by id
  async getServiceById(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  // Update service by id
  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const updatedService = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .exec();
    if (!updatedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return updatedService;
  }

  async updateAppointment(id: string) {
    const updatedService = await this.appointmentModel
      .findByIdAndUpdate(id, { status: 'Accepted' }, { new: true })
      .exec();
    if (!updatedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return updatedService;
  }

  // Delete service by id
  async deleteService(id: string): Promise<void> {
    const deletedService = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!deletedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
  }

  async getAvailableTimeSlots(serviceId: string, partnerId: string) {
    // Retrieve time slots for the serviceId and partnerId
    const slots: any[] = await this.timeSlotModel
      .find({ serviceId, partnerId })
      .exec();

    // Retrieve all appointments for the given partnerId
    const appointments = await this.appointmentModel.find({ partnerId }).exec();

    console.log('Appointments', appointments);

    // Convert booked times to plain objects and group by date
    const bookedTimesByDate: { [key: string]: string[] } = {};
    appointments.forEach((appointment: any) => {
      const appointmentDate = moment(appointment.toObject().date).toISOString();
      const bookedTime = moment(appointment.toObject().bookedTime).format(
        'hh:mm A',
      );

      if (!bookedTimesByDate[appointmentDate]) {
        bookedTimesByDate[appointmentDate] = [];
      }
      bookedTimesByDate[appointmentDate].push(bookedTime);
    });

    // console.log('Booked Times By Date:', bookedTimesByDate);
    const availableTimeSlots: { [key: string]: string[] } = {}; // Object to store available time slots by date

    // Iterate through each time slot
    for (const slot of slots) {
      // Parse start and end times correctly
      const startTime = moment(slot.startTime); // Start time as moment object
      const endTime = moment(slot.endTime); // End time as moment object
      const duration = 30; // Duration in minutes

      // Get the date key for the slot
      const dateKey = moment(slot.date).toISOString(); // Format the date for the key

      // Initialize the available times array for this date
      availableTimeSlots[dateKey] = [];

      // Check if the date is in the booked times by date
      const bookedTimes = bookedTimesByDate[dateKey] || []; // Get booked times for the specific date

      // Iterate through the time slots for the specified date
      let currentTime = startTime.clone(); // Start with the start time

      while (currentTime.isBefore(endTime)) {
        const timeString = currentTime.format('hh:mm A'); // Format the time to the desired string

        // Check if the time is not booked
        if (!bookedTimes.includes(timeString)) {
          availableTimeSlots[dateKey].push(timeString); // Push the available time
        }

        currentTime.add(duration, 'minutes'); // Increment by the duration
      }
    }

    // Format the final result
    const finalResult = Object.keys(availableTimeSlots).map((date) => ({
      date: date,
      time: availableTimeSlots[date],
    }));

    // Log the final result
    console.log('Available Time Slots:', finalResult);
    return finalResult; // Return the final result
  }
}
