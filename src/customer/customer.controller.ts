import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Customer } from './schema/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerService } from './customer.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import { CustomRequest } from './../common/interfaces/interface';

@ApiTags('customers')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'create new user' })
  @ApiResponse({
    status: 201,
    description: 'User Created Successfully',
  })
  @Post()
  @ApiBody({ type: CreateCustomerDto })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.initiateCustomerCreation(createCustomerDto);
  }

  @UseGuards(CustomerAuthGuard)
  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Get currently logged-in customer' })
  @Get('/me')
  async getCustomerData(@Req() req: CustomRequest): Promise<Customer> {
    try {
      // console.log(req);
      const customer = req.customer as Customer; // Access the user from the request
      console.log(customer);
      return customer;
    } catch (e) {
      throw new HttpException('UnAuthorized ', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, updateCustomerDto);
  }
}
