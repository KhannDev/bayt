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
import sendPushNotification from 'src/common/send-push-notification';
import { AppointmentStatusTracker } from './schema/appointmentStatusTracker.schema';
import {
  Feedback,
  FeedbackDocument,
} from '../feedback/schemas/feedback.schema';
import { CreateFeedbackDto } from '../feedback/dto/create-feedback.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(TimeSlot.name)
    private readonly timeSlotModel: Model<TimeSlot>,
    @InjectModel(AppointmentStatusTracker.name)
    private readonly appointmentStatusTrackerModel: Model<AppointmentStatusTracker>,
    @InjectModel(TimeRange.name)
    private readonly timeRangeModel: Model<TimeRangeDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(SubService.name)
    private readonly subServiceModel: Model<SubService>,
    private subServiceService: SubServiceService,
    private categoryService: CategoryService,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
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
      category: createServiceDto.categoryId,
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
  async getAllServices(
    page?: number,
    limit?: number,
  ): Promise<{ services: Service[]; total: number }> {
    let skip;
    if (page && limit) {
      skip = (page - 1) * limit;
    }

    const [services, total] = await Promise.all([
      this.serviceModel
        .find()
        .populate({
          path: 'subServiceIds',
          populate: { path: 'subservice', model: 'Allservices' },
        })
        .populate('partnerId', 'name ')
        .populate('category', 'name ')
        .populate('approvedBy')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.serviceModel.countDocuments(),
    ]);

    return { services, total };
  }

  async getPartnerServices(partnerId): Promise<Service[]> {
    const response = this.serviceModel
      .find({ partnerId: partnerId, isDeleted: false }) // Add the filter condition
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
    const addressId = new Types.ObjectId(createAppointmentDto.address); // Convert string to ObjectId

    console.log(partnerId);
    console.log(createAppointmentDto, customerId);

    // Fetch the latest appointment to determine the current max bookingId
    const latestAppointment = await this.appointmentModel
      .findOne()
      .sort({ bookingId: -1 }) // Make sure the field name is 'bookingId' and not 'BookingId'
      .select('bookingId') // Make sure the field name is 'bookingId'
      .exec();

    // Calculate the next bookingId
    const nextBookingId =
      latestAppointment && latestAppointment.bookingId
        ? latestAppointment.bookingId + 1
        : 1; // Default to 1 if no previous bookingId exists

    console.log('booking Id ', nextBookingId);

    // Create a new appointment by correctly mapping the fields
    const appointment = new this.appointmentModel({
      bookedTime: createAppointmentDto.bookedTime,
      partnerId,
      serviceId,
      subServiceIds: createAppointmentDto.subServiceIds,
      customerId,
      address: addressId,
      bookingId: nextBookingId, // Assign the calculated bookingId
    });

    // Save the appointment to the database and return it

    await sendPushNotification({
      title: 'New booking',
      body: 'New booking created ',
      data: {},
      tokens: ['ExponentPushToken[Q9RzM_Cyshd9cR7EN4NcYq]'],
    });
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
      .populate({
        path: 'subServiceIds',
        // Specify which fields to include from the sub-services
        populate: {
          path: 'subservice',
          model: 'Allservices',
        },
      }) // Populating partner details if needed
      .populate('address') // Populating partner details if needed
      .lean() // Convert Mongoose documents to plain objects
      .exec();

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for customer with ID ${customerId}`,
      );
    }

    // Ensure type matches Appointment[]
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
        // Specify which fields to include from the sub-services
        populate: {
          path: 'subservice',
          model: 'Allservices',
        },
      })
      .populate({
        path: 'address',
        // Specify which fields to include from the address
      })
      .populate({
        path: 'statusTracker',
        // Specify which fields to include from the sub-services
        populate: {
          path: 'updatedByPartner',
          model: 'Partner',
        },
      })
      .lean() // Convert Mongoose documents to plain objects
      .exec();

    if (!appointments || appointments.length === 0) {
      return [];
    }

    // Ensure type matches Appointment[]

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

    // Ensure type matches Appointment[]

    return Timeslots;
  }

  // Get service by id
  async getServiceById(id: string): Promise<Service> {
    const service = await this.serviceModel
      .findById(id)
      .populate({
        path: 'subServiceIds',
        populate: {
          path: 'subservice',
          select: 'name createdAt',
        },
      })
      .populate('partnerId', 'name email')
      .populate('category', 'name');

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

  async updatePartnerAppointment(userId: string, id: string, status: string) {
    // Create a new AppointmentStatusTracker entry
    const statusTrackerEntry = await this.appointmentStatusTrackerModel.create({
      status: status,
      updatedByPartner: userId, // Assign the userId to updatedByPartner
    });

    // Update the appointment with the new status and push the status tracker entry
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          status: status,
          $push: { statusTracker: statusTrackerEntry._id }, // Store tracker ID in the appointment
        },
        { new: true },
      )
      .exec();

    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }

    return updatedAppointment;
  }

  async updateCustomerAppointment(userId: string, id: string, status: string) {
    // Create a new AppointmentStatusTracker entry
    const statusTrackerEntry = await this.appointmentStatusTrackerModel.create({
      status: status,
      updatedByCustomer: userId, // Assign the userId to updatedByPartner
    });

    // Update the appointment with the new status and push the status tracker entry
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          status: status,
          $push: { statusTracker: statusTrackerEntry._id }, // Store tracker ID in the appointment
        },
        { new: true },
      )
      .exec();

    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }

    return updatedAppointment;
  }

  // Delete service by id
  async deleteService(id: string): Promise<void> {
    const deletedService = await this.serviceModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    if (!deletedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
  }

  // Get Available Timelslots for the service for the partner
  async getAvailableTimeSlots(serviceId: string) {
    // Retrieve time slots for the serviceId
    console.log('Service ID', serviceId);
    const slots: any = await this.timeSlotModel
      .find({ serviceId })
      .populate('timeRangeIds')
      .exec();

    console.log(1);
    // Retrieve all appointments for the given serviceId (excluding rejected/cancelled)
    const appointments: any = await this.appointmentModel
      .find({
        serviceId: new Types.ObjectId(serviceId),
        status: { $nin: ['Rejected', 'Cancelled'] },
      })
      .populate('subServiceIds')
      .exec();

    console.log(2);
    console.log('Appointments', JSON.stringify(appointments, null, 3));

    // Retrieve the service to get its duration and employee count
    const service = await this.serviceModel.findOne({ _id: serviceId }).exec();
    console.log(3);
    const duration = service.duration || 30; // Default duration in minutes if not found
    const employeeCount = service.employeeCount || 1; // Default to 1 if not specified

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

        // Iterate through the time range in increments
        while (currentTime.isBefore(endTime)) {
          const formattedTime = currentTime.toISOString();

          // Count how many appointments start at the current time slot
          const bookingsAtSlot = appointments.filter((appointment) =>
            moment(appointment.bookedTime).isSame(currentTime),
          );

          if (bookingsAtSlot.length < employeeCount) {
            // Slot is available because we haven't reached the employee limit
            availableTimeSlotsMap.get(dateKey)?.push(formattedTime);
            // Move forward by the service duration
            currentTime.add(duration, 'minutes');
          } else {
            // Fully booked for this time slot.
            // Calculate the maximum duration among the bookings at this slot.
            let maxSkip = duration; // default skip at least the duration
            for (const appointment of bookingsAtSlot) {
              const totalDuration = appointment.subServiceIds.reduce(
                (acc: number, item: any) => acc + (item.serviceDuration || 0),
                0,
              );
              if (totalDuration > maxSkip) {
                maxSkip = totalDuration;
              }
            }
            // Skip ahead by the maximum duration of the booked appointments
            currentTime.add(maxSkip, 'minutes');
          }
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

  async findAllAppointments(
    page: number,
    limit: number,
    partnerId?: string,
    serviceId?: string,
    customerId?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    category?: string,
    bookingId?: number,
  ): Promise<{ bookings: Appointment[]; total: number }> {
    console.log('Typesss', typeof page, typeof limit);

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // Build the query object
    const query: any = {};

    // if (partnerId) query.partnerId = new Types.ObjectId(partnerId);

    if (serviceId) query.serviceId = new Types.ObjectId(serviceId);
    if (customerId) query.customerId = new Types.ObjectId(customerId);
    if (status) query.status = status;
    if (bookingId) query.bookingId = bookingId;
    if (startDate || endDate) {
      query.bookedTime = {};
      if (startDate) query.bookedTime.$gte = startDate;
      if (endDate) query.bookedTime.$lte = endDate;
    }

    // If category is provided, filter the results by category within the serviceId
    if (category) {
      query['serviceId.category'] = category; // This assumes that category is within serviceId
    }

    // Count total matching appointments (before pagination)
    const total = await this.appointmentModel.countDocuments(query).exec();

    // Fetch the paginated appointments
    const appointments = await this.appointmentModel
      .find(query)
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: 'serviceId',
        select: 'name description imageUrl',
        populate: {
          path: 'category',
          model: 'Category',
        },
      })
      .populate({
        path: 'subServiceIds',
        populate: {
          path: 'subservice', // This is the field inside subServiceIds that you want to populate
        },
      })
      .populate({
        path: 'customerId',
        select: 'name mobileNumber email',
        model: 'Customer',
      })
      .populate({
        path: 'partnerId',
        select: 'name',
        model: 'Partner',
      })
      .populate({
        path: 'statusTracker',
        model: 'AppointmentStatusTracker',
        populate: [
          {
            path: 'updatedByPartner',
            model: 'Partner',
            select: 'name',
          },
          {
            path: 'updatedByCustomer',
            model: 'Customer',
            select: 'name',
          },
        ],
      })
      .lean() // Convert Mongoose documents to plain objects
      .exec();

    return { bookings: appointments, total };
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(new Types.ObjectId(id))
      .populate('serviceId') // Populate the service details
      .populate('customerId') // Populate the customer details
      .populate('partnerId');

    if (!appointment) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return appointment;
  }

  async findAllAppointments1(
    page: number,
    limit: number,
    categoryId?: string,
    partnerId?: string,
    serviceId?: string,
    customerId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ bookings: Appointment[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build the query object based on the provided parameters
    const query: any = [];

    // Check if the startDate and endDate are valid Date objects or valid date strings

    // Debugging: check if dates are valid Date objects
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (categoryId) {
      query.push({
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      });

      query.push({
        $unwind: '$serviceDetails',
      });

      query.push({
        $match: {
          'serviceDetails.subserviceIds.subservice.category':
            new Types.ObjectId(categoryId),
        },
      });
    }

    if (partnerId) {
      query.push({ $match: { partnerId: new Types.ObjectId(partnerId) } });
    }

    if (serviceId) {
      query.push({ $match: { serviceId: new Types.ObjectId(serviceId) } });
    }

    if (customerId) {
      query.push({ $match: { customerId: new Types.ObjectId(customerId) } });
    }

    if (status) {
      query.push({ $match: { status } });
    }

    // Handle startDate and endDate filtering in the aggregation pipeline
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate); // Ensure startDate is a valid Date
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate); // Ensure endDate is a valid Date
      }

      // Log the date filter for debugging

      query.push({
        $match: {
          bookedTime: dateFilter,
        },
      });
    }

    // Aggregation pipeline
    const bookingsQuery = [
      ...query,
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerId',
        },
      },
      {
        $lookup: {
          from: 'partners',
          localField: 'partnerId',
          foreignField: '_id',
          as: 'partnerId',
        },
      },
    ];

    const [bookings, total] = await Promise.all([
      this.appointmentModel.aggregate(bookingsQuery),
      this.appointmentModel.countDocuments(query), // Get the total count
    ]);

    return { bookings, total };
  }

  async createFeedbackForAppointment(
    appointmentId: string,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Appointment> {
    // Create the feedback
    const feedback = await this.feedbackModel.create({
      ...createFeedbackDto,
      appointmentId,
    });

    // Update the appointment with the feedback ID
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        appointmentId,
        { $set: { feedbackId: feedback._id } },
        { new: true },
      )
      .exec();

    if (!updatedAppointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    return updatedAppointment;
  }

  async getAppointmentWithFeedback(
    appointmentId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('feedbackId')
      .exec();

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    return appointment;
  }

  async deleteFeedbackFromAppointment(
    appointmentId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    if (appointment.feedbackId) {
      // Soft delete the feedback
      await this.feedbackModel.findByIdAndUpdate(
        appointment.feedbackId,
        { $set: { isActive: false } },
        { new: true },
      );
    }

    // Remove feedback reference from appointment
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        appointmentId,
        { $unset: { feedbackId: 1 } },
        { new: true },
      )
      .exec();

    return updatedAppointment;
  }

  async getCompletedAppointmentsWithoutFeedback(customerId: string) {
    return this.appointmentModel
      .find({
        customerId,
        status: 'Completed',
        feedbackId: { $exists: false },
        feedbackSeen: false,
        isDeleted: false,
      })
      .populate('serviceId', 'name description imageUrl')
      .populate('partnerId', 'name')
      .sort({ bookedTime: -1 });
  }

  async markFeedbackAsSeen(appointmentId: string): Promise<void> {
    await this.appointmentModel.findByIdAndUpdate(
      new Types.ObjectId(appointmentId),
      { $set: { feedbackSeen: true } },
      { new: true },
    );
  }
}
