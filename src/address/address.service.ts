import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schema/address.schema';
import { CreateAddressDto } from './dto/address.dto';
import { Types } from 'mongoose';
import {
  Customer,
  CustomerDocument,
} from 'src/customer/schema/customer.schema';
import { PartnerDocument } from 'src/partner/schema/partner.schema';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
    @InjectModel(Customer.name)
    private readonly userModel: Model<CustomerDocument>,
    @InjectModel(Customer.name)
    private readonly partnerModel: Model<PartnerDocument>,
  ) {}

  async createUserAddress(
    createAddressDto: CreateAddressDto,
    customerId,
  ): Promise<Address> {
    const newAddress = new this.addressModel(createAddressDto);
    const savedAddress = await newAddress.save();

    const user = await this.userModel.findById(customerId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${customerId} not found`);
    }

    if (!user.addresses) {
      user.addresses = []; // Initialize if undefined
    }

    user.addresses.push(savedAddress._id as string);
    await user.save();

    return savedAddress;
  }

  async createPartnerAddress(
    createAddressDto: CreateAddressDto,
    partnerId,
  ): Promise<Address> {
    const newAddress = new this.addressModel(createAddressDto);
    const savedAddress = await newAddress.save();

    const partner = await this.partnerModel.findById(partnerId).exec();
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${partnerId} not found`);
    }

    partner.addresses.push(savedAddress._id as string);
    await partner.save();

    return savedAddress;
  }

  async findOne(id: string): Promise<Address> {
    const address = await this.addressModel.findById(id).exec();
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async findAll(): Promise<Address[]> {
    return await this.addressModel.find().exec();
  }

  async deleteAddress(id: string): Promise<void> {
    const deletedAddress = await this.addressModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    if (!deletedAddress) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
  }
}
