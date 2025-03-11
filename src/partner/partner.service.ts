import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Partner } from './schema/partner.schema';
import { PartnerDocument } from './schema/partner.schema';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { HashingService } from 'src/utils/hashing/hashing';
import { EmailOtpService } from 'src/email-otp/email-otp.service';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import { PartnerStatusTrackerDocument } from './schema/partnerStatusTracker';
import { ServiceDocument } from 'src/service/schema/service.schema';
import { Appointment } from 'src/service/schema/appointment.schema';

@Injectable()
export class PartnerService {
  constructor(
    @InjectModel('Partner')
    private readonly partnerModel: Model<PartnerDocument>,
    @InjectModel('Service')
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('PartnerStatusTracker')
    private readonly partnerStatusTrackerModel: Model<PartnerStatusTrackerDocument>,
    private readonly awsService: AwsS3Service,
    private hashingService: HashingService,
    private emailOtpService: EmailOtpService,
  ) {}

  // Send OTP to the partner email
  async create(createPartnerDto: CreatePartnerDto) {
    // Check if the email already exists

    console.log('Partner Body ', createPartnerDto);
    const existingEmail = await this.partnerModel.findOne({
      email: createPartnerDto.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if the mobile number already exists
    const existingMobile = await this.partnerModel.findOne({
      mobileNumber: createPartnerDto.mobileNumber,
    });
    if (existingMobile) {
      throw new ConflictException('Mobile number already exists');
    }

    // Send OTP to the partner's email for verification
    this.emailOtpService.sendOtp({ email: createPartnerDto.email });

    // Save the partner and return the result
    return {
      message:
        'OTP sent to email. Complete OTP verification to finish registration.',
    };
  }

  // Find a partner by email and update
  async findByEmailAndUpdate(email: string, updateDto: any): Promise<Partner> {
    return this.partnerModel.findOneAndUpdate(
      { email },
      { $set: updateDto },
      { new: true },
    );
  }

  // Get all partners

  async getAllPartners(): Promise<Partner[]> {
    return this.partnerModel.find().exec();
  }

  async validatePartner(email: any) {
    // Implement logic to validate customer based on payload data
    // For example, check the customer ID in the payload and fetch from DB

    console.log('Email', email);
    try {
      const partner = (await this.partnerModel.findOne({ email })).populate({
        path: 'addresses', // Path to the addresses field
        match: { isDeleted: false }, // Only populate where isDeleted is false
      });
      if (!partner)
        throw new HttpException('Partner Not Found', HttpStatus.NOT_FOUND);
      return partner;
    } catch (e) {
      console.log(e.message);
      throw new HttpException('No Partner ', HttpStatus.UNAUTHORIZED);
    }
  }

  async findAllPartners(
    page: number,
    limit: number,
  ): Promise<{ partners: Partner[]; total: number }> {
    const skip = Number(page - 1) * Number(limit);
    const limitNum = Number(limit);

    const result = await this.partnerModel.aggregate([
      // Lookup services
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'partnerId',
          as: 'services',
        },
      },
      // Lookup partnerStatusTracker
      {
        $lookup: {
          from: 'partnerstatustrackers',
          localField: 'statusTracker',
          foreignField: '_id',
          as: 'partnerStatusTracker',
        },
      },
      // Unwind partnerStatusTracker to process each item individually
      {
        $unwind: {
          path: '$partnerStatusTracker',
          preserveNullAndEmptyArrays: true, // Keep partners even if statusTracker is empty
        },
      },
      // Lookup admin for UpdatedBy field in partnerStatusTracker
      {
        $lookup: {
          from: 'admins', // Matches your admin collection name
          localField: 'partnerStatusTracker.UpdatedBy',
          foreignField: '_id',
          as: 'partnerStatusTracker.updatedBy', // Store populated admin data here
        },
      },
      // Unwind updatedBy to handle single admin object (since it's a single reference)
      {
        $unwind: {
          path: '$partnerStatusTracker.updatedBy',
          preserveNullAndEmptyArrays: true, // Keep if no admin is found
        },
      },
      // Group back to reconstruct the partnerStatusTracker array
      {
        $group: {
          _id: '$_id',
          partnerDetails: { $first: '$$ROOT' },
          services: { $first: '$services' },
          partnerStatusTracker: {
            $push: {
              _id: '$partnerStatusTracker._id',
              status: '$partnerStatusTracker.status',
              UpdatedBy: '$partnerStatusTracker.updatedBy', // Populated admin object
              createdAt: '$partnerStatusTracker.createdAt',
            },
          },
        },
      },
      // Project to clean up the structure
      {
        $project: {
          partnerDetails: 1,
          services: {
            $map: {
              input: '$services',
              as: 'service',
              in: { name: '$$service.name' },
            },
          },
          partnerStatusTracker: 1,
        },
      },
      // Merge partnerDetails with other fields
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$partnerDetails',
              {
                services: '$services',
                partnerStatusTracker: '$partnerStatusTracker',
              },
            ],
          },
        },
      },
      // Facet for pagination
      {
        $facet: {
          partners: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const partners = result[0]?.partners || [];
    const total = result[0]?.totalCount[0]?.total || 0;

    return { partners, total };
  }

  async findById(id: string): Promise<Partner> {
    const partner = await this.partnerModel
      .findById(id)
      .populate({
        path: 'statusTracker',
        model: 'PartnerStatusTracker',
        populate: {
          path: 'UpdatedBy',
          model: 'Admin', // Ensure this matches your Admin model name
        },
      })
      .exec();

    console.log(partner);
    if (!partner) {
      throw new NotFoundException(`partner with ID ${id} not found`);
    }
    return partner;
  }

  async update(
    id: string,
    updateCustomerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    console.log(typeof id, updateCustomerDto);
    const response = await this.partnerModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateCustomerDto, {
        new: true,
      })
      .exec();
    // console.log(response);
    return response;
  }
  async StatusUpdate(
    id: string,
    updateCustomerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.partnerModel.findById(id).exec();
    if (!partner) {
      throw new Error('Partner not found');
    }

    console.log('partner', updateCustomerDto);

    // Check if the status is changing
    if (partner.status !== updateCustomerDto.status) {
      const statusTrackerEntry = await this.partnerStatusTrackerModel.create({
        status: updateCustomerDto.status,
        UpdatedBy: new Types.ObjectId(updateCustomerDto.approvedBy), // Assuming the admin is updating
      });

      console.log(statusTrackerEntry);

      await this.partnerModel.findByIdAndUpdate(id, {
        $set: { status: updateCustomerDto.status },
        $push: { statusTracker: statusTrackerEntry._id },
      });

      // Handle status changes for services and appointments
      if (updateCustomerDto.status === 'Disabled') {
        // Disable all services of the partner

        console.log('Being Disabled');
        await this.serviceModel.updateMany(
          { partnerId: new Types.ObjectId(id) },
          { $set: { isDisabled: true } },
        );

        // Find all service IDs related to the partner
        const services = await this.serviceModel.find(
          { partnerId: new Types.ObjectId(id) },
          '_id',
        );
        const serviceIds = services.map((service) => service._id);

        console.log(serviceIds);

        // Cancel all appointments related to those services
        const response = await this.appointmentModel.updateMany(
          {
            serviceId: { $in: serviceIds },
            bookedTime: { $gt: new Date() }, // Only update appointments with a bookedDate in the future
          },
          { $set: { status: 'Cancelled' } },
        );

        console.log('Updated Appointment response', response);
      } else if (updateCustomerDto.status === 'Accepted') {
        // Accept all services of the partner

        console.log('activated');
        await this.serviceModel.updateMany(
          { partnerId: id },
          { $set: { isDisabled: false } },
        );
      }
    }

    // Update the partner with other details from updateCustomerDto
    const updatedPartner = await this.partnerModel
      .findByIdAndUpdate(
        id,
        { $set: updateCustomerDto }, // Only update provided fields
        { new: true },
      )
      .exec();

    return updatedPartner;
  }
}
