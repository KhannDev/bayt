import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schema/customer.schema';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { HashingService } from 'src/utils/hashing/hashing';
import { JWTService } from 'src/utils/jwt/jwt.service';
import { EmailOtpService } from 'src/email-otp/email-otp.service';
import { EmailService } from 'src/utils/email/email.service';
import { IdGeneratorService } from 'src/utils/id-generator/id-generator.service';
import { EmailOtpModule } from 'src/email-otp/email-otp.module';
import { PartnerModule } from 'src/partner/partner.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    EmailOtpModule,
    forwardRef(() => PartnerModule), // Use forwardRef to resolve circular dependency
  ],
  controllers: [CustomerController],
  providers: [CustomerService, HashingService, JWTService],
  exports: [CustomerService],
})
export class CustomerModule {}
