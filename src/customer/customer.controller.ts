import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Customer } from './schema/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerService } from './customer.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';

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
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @UseGuards(CustomerAuthGuard)
  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
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
