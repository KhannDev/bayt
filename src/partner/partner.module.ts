import { forwardRef, Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Partner, PartnerSchema } from './schema/partner.schema';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { HashingService } from 'src/utils/hashing/hashing';
import { EmailOtpModule } from 'src/email-otp/email-otp.module';
import { CustomerModule } from 'src/customer/customer.module';
import { JWTService } from 'src/utils/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
    EmailOtpModule,
    forwardRef(() => CustomerModule), // Use forwardRef to resolve circular dependency
  ],
  providers: [PartnerService, AwsS3Service, HashingService, JWTService],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnerModule {}
