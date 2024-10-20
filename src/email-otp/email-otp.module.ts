import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/utils/email/email.service';
import { IdGeneratorService } from 'src/utils/id-generator/id-generator.service';
import { EmailOtpController } from './email-otp.controller';
import { EmailOtpService } from './email-otp.service';
import { EmailOtp, EmailOtpSchema } from './schema/email-otp.schema';
import { Customer, CustomerSchema } from 'src/customer/schema/customer.schema';
import { Partner, PartnerSchema } from 'src/partner/schema/partner.schema';
import { HashingService } from 'src/utils/hashing/hashing';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailOtp.name, schema: EmailOtpSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Partner.name, schema: PartnerSchema },
    ]),
  ],
  controllers: [EmailOtpController],
  providers: [
    EmailOtpService,
    EmailService,
    IdGeneratorService,
    HashingService,
  ],
  exports: [EmailOtpService],
})
export class EmailOtpModule {}
