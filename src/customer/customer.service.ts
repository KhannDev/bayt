import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HashingService } from 'src/utils/hashing/hashing';
import { Customer, CustomerDocument } from './schema/customer.schema';
import { Model } from 'mongoose';
import { EmailOtpService } from 'src/email-otp/email-otp.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private hashingService: HashingService,
    private emailOtpService: EmailOtpService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
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
    console.log('Existing Mobile', existingMobile);
    if (existingMobile) {
      throw new HttpException(
        'Mobile number already exists',
        HttpStatus.FORBIDDEN,
      );
    }

    // Hash the password
    const hashedPassword = await this.hashingService.toHash(
      createCustomerDto.password,
    );

    // Create the customer object with hashed password
    const createdCustomer = new this.customerModel({
      ...createCustomerDto,
      password: hashedPassword,
    });

    // Send OTP to the customer's email
    this.emailOtpService.sendOtp({ email: createCustomerDto.email });

    // Save and return the created customer
    return createdCustomer.save();
  }

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().exec();
  }

  async findOne(id: string): Promise<Customer> {
    return this.customerModel.findById(id).exec();
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    if (updateCustomerDto.password) {
      updateCustomerDto.password = await this.hashingService.toHash(
        updateCustomerDto.password,
      );
    }
    return this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, { new: true })
      .exec();
  }

  async findCustomerWithEmail(email: string) {
    const customer = await this.customerModel.findOne({ email });
    return customer;
  }
}
