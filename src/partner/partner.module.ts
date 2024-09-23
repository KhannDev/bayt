import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Partner, PartnerSchema } from './schema/partner.schema';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { HashingService } from 'src/utils/hashing/hashing';
import { EmailOtpService } from 'src/email-otp/email-otp.service';
import { EmailService } from 'src/utils/email/email.service';
import { EmailOtpModule } from 'src/email-otp/email-otp.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
    EmailOtpModule,
  ],
  providers: [
    PartnerService,
    AwsS3Service,
    HashingService,
    // EmailOtpService,
    // EmailService,
  ],
  controllers: [PartnerController],
})
export class PartnerModule {}
