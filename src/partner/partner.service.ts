import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Partner } from './schema/partner.schema';
import { PartnerDocument } from './schema/partner.schema';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { CreatePartnerDto } from './dto/partner.dto';
import { HashingService } from 'src/utils/hashing/hashing';
import { EmailOtpService } from 'src/email-otp/email-otp.service';

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
}
