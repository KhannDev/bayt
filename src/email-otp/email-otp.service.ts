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

@Injectable()
export class EmailOtpService {
  constructor(
    private readonly emailservice: EmailService,
    private readonly idgenerator: IdGeneratorService,

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
    }
    // else if (
    //   moment(createdUser?.createdAt).isBefore(moment().add(3, 'hours'))
    // ) {
    //   // If otp hasnt expired

    //   throw new HttpException('Otp Already Sent', HttpStatus.BAD_REQUEST);
    // }
    else {
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

  async verifyOtp(data: VerifyOtpDto) {
    const createdUser: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    // Check if the otp has expired
    //Check if the otp is correct

    if (createdUser && createdUser?.otp === data.otp) {
      if (moment(createdUser?.createdAt).isBefore(moment().add(3, 'hours'))) {
        await this.emailOtpModel.findOneAndDelete({ email: data.email });
        const updatedCustomer = await this.customerModel.findOneAndUpdate(
          { email: data.email }, // Find by email
          { $set: { isAllowed: true } }, // Update the fields
          { new: true }, // Return the updated document
        );
      } else {
        throw new HttpException('Otp has Expired', HttpStatus.BAD_REQUEST);
      }
    } else throw new HttpException('Incorrect Otp', HttpStatus.BAD_REQUEST);
  }

  async partnerVerifyOtp(data: VerifyOtpDto) {
    const createdUser: any = await this.emailOtpModel.findOne({
      email: data.email,
    });

    // if (createdUser?.otp === data.otp) {
    //   if (moment(createdUser?.createdAt).isBefore(moment().add(3, 'hours'))) {
    await this.emailOtpModel.findOneAndDelete({ email: data.email });
    const updatedCustomer = await this.partnerModel.findOneAndUpdate(
      { email: data.email }, // Find by email
      { $set: { isAllowed: true } }, // Update the fields
      { new: true }, // Return the updated document
    );
    //   } else {
    //     throw new HttpException('Otp has Expired', HttpStatus.BAD_REQUEST);
    //   }
    // } else throw new HttpException('Incorrect Otp', HttpStatus.BAD_REQUEST);
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
