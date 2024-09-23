import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { EmailService } from 'src/utils/email/email.service';
import { SendOtpDto, VerifyOtpDto } from './dto/email-otp.dto';
import { EmailOtpService } from './email-otp.service';

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
  @Post('/verifyOtp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.emailotpservice.verifyOtp(data);
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
}
