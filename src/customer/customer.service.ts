import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HashingService } from 'src/utils/hashing/hashing';
import { Customer, CustomerDocument } from './schema/customer.schema';
import { Model, Types } from 'mongoose';
import { EmailOtpService } from 'src/email-otp/email-otp.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private hashingService: HashingService,
    private emailOtpService: EmailOtpService,
  ) {}

  async initiateCustomerCreation(createCustomerDto: CreateCustomerDto) {
    // Check if email already exists
    const existingEmail = await this.customerModel.findOne({
      email: createCustomerDto.email,
    });
    if (existingEmail) {
      throw new HttpException('Email already exists', HttpStatus.FORBIDDEN);
    }

    // Check if mobile number already exists
    const existingMobile = await this.customerModel.findOne({
      mobile: createCustomerDto.mobileNumber,
    });
    if (existingMobile) {
      throw new HttpException(
        'Mobile number already exists',
        HttpStatus.FORBIDDEN,
      );
    }

    // Send OTP to the customer's email (initiate verification process)
    await this.emailOtpService.sendOtp({ email: createCustomerDto.email });

    return {
      message:
        'OTP sent to email. Complete OTP verification to finish registration.',
    };
  }

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().exec();
  }

  async findOne(id: string): Promise<Customer> {
    const response = await this.customerModel.findById(id).exec();

    console.log(response);
    return response;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    console.log(id, updateCustomerDto);
    const response = await this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, {
        new: true,
      })
      .exec();
    console.log(response);
    return response;
  }

  async findCustomerWithEmail(email: string) {
    const customer = await this.customerModel.findOne({ email });
    return customer;
  }

  async validateCustomer(email: any) {
    try {
      const customer = await this.customerModel.findOne({ email }).populate({
        path: 'addresses', // Path to the addresses field
        match: { isDeleted: false }, // Only populate where isDeleted is false
      });
      if (!customer) {
        console.log('empty');
        throw new HttpException('Customer Not Found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (e) {
      console.log(e.message);
      throw new HttpException('No Customer ', HttpStatus.NOT_FOUND);
    }
  }
  async findAllUsers(
    page: number,
    limit: number,
  ): Promise<{ users: Customer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.customerModel.find().skip(skip).limit(limit).exec(),
      this.customerModel.countDocuments(),
    ]);

    return { users, total };
  }
}
