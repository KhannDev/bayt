import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/utils/email/email.service';
import { IdGeneratorService } from 'src/utils/id-generator/id-generator.service';
import { SendOtpDto } from './dto/email-otp.dto';
import { EmailOtp, EmailOtpDocument } from './schema/email-otp.schema';
import { VerifyOtpDto } from './dto/email-otp.dto';
import * as moment from 'moment';
import {
  Customer,
  CustomerDocument,
} from 'src/customer/schema/customer.schema';
import { Partner, PartnerDocument } from 'src/partner/schema/partner.schema';
import { HashingService } from 'src/utils/hashing/hashing';
import { CreateCustomerDto } from 'src/customer/dto/customer.dto';
import { CreatePartnerDto } from 'src/partner/dto/partner.dto';

@Injectable()
export class EmailOtpService {
  constructor(
    private readonly emailservice: EmailService,
    private readonly idgenerator: IdGeneratorService,
    private hashingService: HashingService,

    @InjectModel(EmailOtp.name)
    private readonly emailOtpModel: Model<EmailOtpDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Partner.name) private partnerModel: Model<PartnerDocument>,
  ) {}

  /**
   * Send Otp to user over email
   * Otp is randomly generated 4 digit value which is stored in database after creation
   */

  async sendOtp(data: SendOtpDto) {
    // check if otp is generated for the user

    const createdUser: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    console.log('Email OTP', createdUser);

    // If otp is not created for the user

    if (!createdUser) {
      const res = await this.generateAndStoreOtp(data);
      if (res) {
        this.emailservice.sendEmail({
          email: res.email,
          subject: 'Email Verification',
          html: `<p>Welcome to handyman, <br><br> Here is the OTP for your Email verification : ${res.otp} <br> <br> Please enter the above code in the app to validate your official mail <br><br> Best Regards, <br> Flaq Team  </p>`,
        });
      }
    } else {
      //   If Otp is generated and expired, delete the record and create a new one

      await this.emailOtpModel.findOneAndDelete({ email: data.email });
      const res = await this.generateAndStoreOtp(data);

      console.log(res);

      if (res) {
        this.emailservice.sendEmail({
          email: res.email,
          subject: 'Email Verification',
          html: `<p>Welcome to handyman, <br><br> Here is the OTP for your Email verification : ${res.otp} <br> <br> Please enter the above code in the app to validate your official mail <br><br> Best Regards, <br> Flaq Team  </p>`,
        });
      }
    }
  }

  /**
   * Verify Otp
   * @Body email and otp
   */

  async verifyOtpAndCreateCustomer(data: CreateCustomerDto): Promise<Customer> {
    const otpRecord: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    if (!otpRecord) {
      throw new HttpException(
        'OTP not found or already verified',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if the OTP is correct
    if (otpRecord?.otp !== data.otp) {
      throw new HttpException('Incorrect OTP', HttpStatus.BAD_REQUEST);
    }

    // Check if the OTP has expired
    if (moment(otpRecord?.createdAt).isBefore(moment().subtract(3, 'hours'))) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    // Hash the password
    const hashedPassword = await this.hashingService.toHash(data.password);

    // Create the customer object with hashed password
    const createdCustomer = new this.customerModel({
      email: data.email,
      gender: data.gender,
      name: data.name,
      mobileNumber: data.mobileNumber,
      password: hashedPassword,
    });

    // Save the customer to the database
    const savedCustomer = await createdCustomer.save();

    // Optionally, delete the OTP record after successful registration
    await this.emailOtpModel.findOneAndDelete({ email: data.email });

    return savedCustomer;
  }

  async verifyOtpAndCreatePartner(data: CreatePartnerDto): Promise<Partner> {
    const otpRecord: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    if (!otpRecord) {
      throw new HttpException(
        'OTP not found or already verified',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if the OTP is correct
    if (otpRecord?.otp !== data.otp) {
      throw new HttpException('Incorrect OTP', HttpStatus.BAD_REQUEST);
    }

    // Check if the OTP has expired
    if (moment(otpRecord?.createdAt).isBefore(moment().subtract(3, 'hours'))) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    // Hash the password
    const hashedPassword = await this.hashingService.toHash(data.password);

    // Create the customer object with hashed password
    const createdCustomer = new this.partnerModel({
      ...data,
      password: hashedPassword,
    });

    // Save the customer to the database
    const savedCustomer = await createdCustomer.save();

    // Optionally, delete the OTP record after successful registration
    await this.emailOtpModel.findOneAndDelete({ email: data.email });

    return savedCustomer;
  }

  async partnerVerifyOtp(data: VerifyOtpDto) {
    const createdUser: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    await this.emailOtpModel.findOneAndDelete({ email: data.email });
    const updatedCustomer = await this.partnerModel.findOneAndUpdate(
      { email: data.email }, // Find by email
      { $set: { isAllowed: true } }, // Update the fields
      { new: true }, // Return the updated document
    );

    this.emailservice.sendEmail({
      email: data.email,
      subject: 'Account Under verification',
      html: `<p>Welcome to handyman, <br><br> Congratulations, You're just  one step away from being an official Handyman partner. We're reviewing your details and will verify it shortly. You'll receive an email update once the verification is complete. <br> Thank you for your patience   <br><br> Best Regards, <br> Handyman  </p>`,
    });
  }

  /**
   *  function for generating and storing Otp
   * */

  async generateAndStoreOtp(data: SendOtpDto) {
    const generatedOtp = this.idgenerator.generateOtp();
    console.log('OTP', generatedOtp);

    const newOtp = this.emailOtpModel.create({
      email: data.email,
      otp: generatedOtp,
    });
    return newOtp;
  }
}
