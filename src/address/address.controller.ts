import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/address.dto';
import { CustomRequest } from 'src/common/interfaces/interface';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Address')
@Controller('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(CustomerAuthGuard)
  @Post('userAddress')
  async createUserAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req: CustomRequest,
  ) {
    return await this.addressService.createUserAddress(
      createAddressDto,
      req.customer._id,
    );
  }

  @UseGuards(CustomerAuthGuard)
  @Post('partnerAddress')
  async createPartnerAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req: CustomRequest,
  ) {
    return await this.addressService.createPartnerAddress(
      createAddressDto,
      req.partner._id,
    );
  }

  //   @UseGuards(CustomerAuthGuard)
  //   @Get('customer')
  //   async findOne(@Req() req: CustomRequest) {
  //     return await this.addressService.findCustomerAddresses(req.customer._id);
  //   }

  @Get()
  async findAll() {
    return await this.addressService.findAll();
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string) {
    await this.addressService.deleteAddress(id);
    return { message: `Address with id ${id} deleted successfully` };
  }
}
