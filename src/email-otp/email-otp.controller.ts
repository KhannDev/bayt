import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { EmailService } from 'src/utils/email/email.service';
import { SendOtpDto, VerifyOtpDto } from './dto/email-otp.dto';
import { EmailOtpService } from './email-otp.service';
import { CreateCustomerDto } from 'src/customer/dto/customer.dto';
import sendPushNotification from 'src/common/send-push-notification';
import { CreatePartnerDto } from 'src/partner/dto/partner.dto';

/**
 * Controller for handling email Otp
 */

@ApiTags('Email')
@Controller('email')
export class EmailOtpController {
  constructor(
    private readonly emailotpservice: EmailOtpService,
    private readonly emailz: EmailService,
  ) {}

  /**
   * Send Otp to the email in the request body
   */

  @ApiOperation({
    summary: 'Send OTP to the email ',
  })
  @Post('/sendOtp')
  async sendOtp(@Body() data: SendOtpDto) {
    return this.emailotpservice.sendOtp(data);
  }

  /**
   * Verify Otp
   * @body email,otp
   */

  @ApiOperation({
    summary: 'Verify Otp ',
  })
  @Post('/verifyOtpAndCreateCustomer')
  async verifyOtp(@Body() data: CreateCustomerDto) {
    return this.emailotpservice.verifyOtpAndCreateCustomer(data);
  }

  @ApiOperation({
    summary: 'Verify Otp ',
  })
  @Post('/verifyOtpAndCreatePartner')
  async verifyPartnerOtp(@Body() data: CreatePartnerDto) {
    return this.emailotpservice.verifyOtpAndCreatePartner(data);
  }

  /**
   * Verify Otp for Partner
   * @body email,otp
   */

  @ApiOperation({
    summary: ' Verify Otp for Partner ',
  })
  @Post('/partner/VerifyOtp')
  async partnerVerifyOtp(@Body() data: VerifyOtpDto) {
    return this.emailotpservice.partnerVerifyOtp(data);
  }

  @Post('test')
  async testNotification() {
    await sendPushNotification({
      title: 'HELLO',
      body: 'We missed you',
      data: {},
      tokens: ['ExponentPushToken[Q9RzM_Cyshd9cR7EN4NcYq]'],
    });
  }
}
