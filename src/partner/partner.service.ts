import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Partner } from './schema/partner.schema';
import { PartnerDocument } from './schema/partner.schema';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { HashingService } from 'src/utils/hashing/hashing';
import { EmailOtpService } from 'src/email-otp/email-otp.service';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';

@Injectable()
export class PartnerService {
  constructor(
    @InjectModel('Partner')
    private readonly partnerModel: Model<PartnerDocument>,
    private readonly awsService: AwsS3Service,
    private hashingService: HashingService,
    private emailOtpService: EmailOtpService,
  ) {}

  // Create a new partner
  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    // Hash the password using the hashing service
    const hashedPassword = await this.hashingService.toHash(
      createPartnerDto.password,
    );

    // Create a new partner object with the hashed password
    const createdPartner = new this.partnerModel({
      ...createPartnerDto,
      password: hashedPassword,
    });

    // Send OTP to the partner's email for verification
    this.emailOtpService.sendOtp({ email: createPartnerDto.email });

    // Save the partner and return the result
    return createdPartner.save();
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
      const partner = await this.partnerModel.findOne({ email }); // Replace with actual DB query
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
    const skip = (page - 1) * limit;

    const [partners, total] = await Promise.all([
      this.partnerModel.find().skip(skip).limit(limit).exec(),
      this.partnerModel.countDocuments(),
    ]);

    return { partners, total };
  }

  async findById(id: string): Promise<Partner> {
    const category = await this.partnerModel.findById(id).exec();

    console.log(category);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCustomerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    console.log(id, updateCustomerDto);
    const response = await this.partnerModel
      .findByIdAndUpdate(id, updateCustomerDto, {
        new: true,
      })
      .exec();
    // console.log(response);
    return response;
  }
}
