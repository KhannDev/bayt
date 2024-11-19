import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './schema/service.schema';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { SubServiceService } from 'src/sub-service/sub-service.service';
import { CategoryService } from 'src/category/category.service';
import {
  CreateTimeSlotDto,
  UpdateOrCreateTimeSlotDto,
} from './dto/timeSlot.dto';
import { TimeSlot } from './schema/timeSlot.schema';
import * as moment from 'moment';
import { Appointment } from './schema/appointment.schema';

import {
  AppointmentStatusDto,
  CreateAppointmentDto,
} from './dto/appointment.dto';
import { TimeRange, TimeRangeDocument } from './schema/timeRange.schema';
import { SubService } from 'src/sub-service/schema/sub-service.schema';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(TimeSlot.name)
    private readonly timeSlotModel: Model<TimeSlot>,
    @InjectModel(TimeRange.name)
    private readonly timeRangeModel: Model<TimeRangeDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(SubService.name)
    private readonly subServiceModel: Model<SubService>,
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
      createdService._id.toString(),
    );
    console.log('3');

    // await this.createTimeSlotsForService(
    //   createServiceDto.timeSlotIds,
    //   createdService._id.toString(),
    //   partnerId,
    // );

    return createdService;
  }

  async createTimeSlotsForService(
    timeSlots: CreateTimeSlotDto[],
    serviceId: string,
    partnerId: string,
  ): Promise<void> {
    for (const timeSlotDto of timeSlots) {
      try {
        // Step 4.1: Create time ranges if not already created
        const timeRangeIds: string[] = [];

        for (const timeRangeDto of timeSlotDto.timeRangeIds) {
          const newTimeRange = new this.timeRangeModel({
            ...timeRangeDto,
          });

          const createdTimeRange = await newTimeRange.save();
          timeRangeIds.push(createdTimeRange._id.toString());
        }

        // Step 4.2: Create time slot referencing the created time ranges
        const newTimeSlot = new this.timeSlotModel({
          ...timeSlotDto,
          serviceId,
          partnerId,
          timeRangeIds, // Set the array of timeRangeIds
        });

        // Save the time slot
        await newTimeSlot.save();
      } catch (e) {
        console.log('TimeSlot creation error:', e);
      }
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

  async getPartnerServices(partnerId): Promise<Service[]> {
    const response = this.serviceModel
      .find({ partnerId: partnerId }) // Add the filter condition
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
      subServiceIds: createAppointmentDto.subServiceIds,
      customerId,
      address: new Types.ObjectId(createAppointmentDto.address), // Use the userId from the authenticated request
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
      .populate('subServiceIds') // Populating partner details if needed
      .populate('address') // Populating partner details if needed
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
      .populate({
        path: 'serviceId',
        select: 'name description  imageUrl', // Specify which fields to include from the service
      })
      .populate({
        path: 'customerId',
        select: 'name mobileNumber email', // Specify which fields to include from the customer
      })
      .populate({
        path: 'subServiceIds',
        select: 'name price', // Specify which fields to include from the sub-services
      })
      .populate({
        path: 'address',
        // Specify which fields to include from the address
      })
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

  async getPartnerTimeSlots(serviceId: string) {
    // const objectId = new Types.ObjectId(partnerId); // Convert string to ObjectId

    // console.log(partnerId);

    const Timeslots = await this.timeSlotModel
      .find({ serviceId })
      .populate('timeRangeIds') // Populating service details if needed

      .lean() // Convert Mongoose documents to plain objects
      .exec();

    console.log(Timeslots); // Ensure type matches Appointment[]

    return Timeslots;
  }

  // Get service by id
  async getServiceById(id: string): Promise<Service> {
    const service = await (
      await this.serviceModel.findById(id)
    ).populate('subServiceIds');

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
    const { subServiceIds, ...rest } = updateServiceDto;

    // Find the existing service document
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    // If subServiceIds is provided, handle sub-service deletion and addition
    if (subServiceIds) {
      // Delete existing sub-services associated with the service

      // Create new sub-services and get their IDs

      const createdSubServices =
        await this.subServiceModel.insertMany(subServiceIds);
      const newSubServiceIds = createdSubServices.map((sub) =>
        sub._id.toString(),
      );

      // Update the service with new sub-service IDs
      service.subServiceIds = newSubServiceIds;
    }

    // Update other fields in the service
    Object.assign(service, rest);
    await service.save();

    return service;
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

  // Get Available Timelslots for the service for the partner
  async getAvailableTimeSlots(serviceId: string) {
    // Retrieve time slots for the serviceId and partnerId

    console.log('Service ID', serviceId);
    const slots: any = await this.timeSlotModel
      .find({ serviceId })
      .populate('timeRangeIds')
      .exec();

    console.log(1);
    // Retrieve all appointments for the given serviceId
    const appointments: any = await this.appointmentModel
      .find({
        serviceId: new Types.ObjectId(serviceId),
        // status: 'confirmed',
      })
      .exec();

    console.log(2);
    console.log('Appointment', appointments);

    // Extract the duration from the service
    const service = await this.serviceModel.findOne({ _id: serviceId }).exec();

    console.log(3);
    const duration = service.duration || 30; // Default duration in minutes if not found

    // Object to group time slots by date
    const availableTimeSlotsMap = new Map<string, string[]>();

    for (const slot of slots) {
      const { date, timeRangeIds } = slot;
      const dateKey = moment(date).toISOString();

      if (!availableTimeSlotsMap.has(dateKey)) {
        availableTimeSlotsMap.set(dateKey, []);
      }

      for (const timeRange of timeRangeIds) {
        let currentTime = moment(timeRange.startTime);
        const endTime = moment(timeRange.endTime);

        // Iterate and add time slots by duration
        while (currentTime.isBefore(endTime)) {
          const formattedTime = currentTime.toISOString();

          // Check if this time slot is already taken by an appointment
          const isBooked = appointments.some((appointment) => {
            return moment(appointment.bookedTime).isSame(currentTime);
          });

          if (!isBooked) {
            // If not booked, add to the array for that date
            availableTimeSlotsMap.get(dateKey)?.push(formattedTime);
          }

          // Increment the current time by the duration
          currentTime.add(duration, 'minutes');
        }
      }
    }

    // Convert the Map to an array
    const availableTimeSlots = Array.from(
      availableTimeSlotsMap,
      ([date, timeSlots]) => ({
        date,
        timeSlots,
      }),
    );

    return availableTimeSlots;
  }

  async updateOrCreateTimeSlots(
    serviceId: string,

    timeSlotData: UpdateOrCreateTimeSlotDto[],
  ) {
    for (const slot of timeSlotData) {
      const { date, timeRanges } = slot;

      console.log(slot, timeRanges);
      const dateKey = new Date(date).toISOString(); // Normalize the date for comparison

      // Check if a time slot with the same date exists for the given serviceId and partnerId
      let existingSlot = await this.timeSlotModel
        .findOne({ serviceId, date: dateKey })
        .exec();

      console.log(1);

      if (existingSlot) {
        // If a slot exists, remove the current timeRangeIds and append new ones
        await this.timeSlotModel.updateOne(
          { _id: existingSlot._id },
          { $set: { timeRangeIds: [] } }, // Clear current time ranges
        );

        console.log(2);

        // Create new time range documents
        const newTimeRangeIds = await Promise.all(
          timeRanges.map(async (range) => {
            const newTimeRange = new this.timeRangeModel({
              startTime: range.startTime,
              endTime: range.endTime,
            });
            const savedRange = await newTimeRange.save();
            return savedRange._id;
          }),
        );
        console.log(3);
        // Update the existing slot with new timeRangeIds
        await this.timeSlotModel.updateOne(
          { _id: existingSlot._id },
          { $push: { timeRangeIds: { $each: newTimeRangeIds } } },
        );

        console.log(`Updated time slot for date ${date}`);
      } else {
        // If a slot doesn't exist, create a new one

        console.log(5);
        const newTimeRangeIds = await Promise.all(
          timeRanges?.map(async (range) => {
            const newTimeRange = new this.timeRangeModel({
              startTime: range.startTime,
              endTime: range.endTime,
            });
            const savedRange = await newTimeRange.save();
            return savedRange._id;
          }),
        );

        const newTimeSlot = new this.timeSlotModel({
          serviceId,

          date: dateKey,
          timeRangeIds: newTimeRangeIds,
        });

        await newTimeSlot.save();

        console.log(`Created new time slot for date ${date}`);
      }
    }

    return { message: 'Time slots have been updated or created successfully.' };
  }
}
