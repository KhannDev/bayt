import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/customer/schema/customer.schema';
import { HashingService } from 'src/utils/hashing/hashing';
import { JWTService } from '../utils/jwt/jwt.service';
import { EmailService } from 'src/utils/email/email.service';
import { Partner, PartnerSchema } from 'src/partner/schema/partner.schema';
import { Admin, AdminSchema } from 'src/admin/schema/admin.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Partner.name, schema: PartnerSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HashingService, JWTService],
  exports: [JWTService],
})
export class AuthModule {}
