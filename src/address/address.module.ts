import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { Address, AddressSchema } from './schema/address.schema';
import { Customer, CustomerSchema } from 'src/customer/schema/customer.schema';
import { JWTService } from 'src/utils/jwt/jwt.service';
import { HashingService } from 'src/utils/hashing/hashing';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerModule } from 'src/customer/customer.module';
import { PartnerModule } from 'src/partner/partner.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    CustomerModule,
    PartnerModule,
  ],
  controllers: [AddressController],
  providers: [AddressService, HashingService, JWTService],
})
export class AddressModule {}
