import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import configuration from 'src/common/configuration';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: configuration().smtp.SMTP_HOST,
      port: configuration().smtp.SMTP_PORT,
      auth: {
        user: configuration().smtp.SMTP_EMAIL,
        pass: configuration().smtp.SMTP_PASSWORD,
      },
    });
  }

  /**
   * sendEmail - Send email to the provided recipient
   * @param emailMessageOptions EmailMessageOptionsDto
   * @returns {Promise<void>}
   */
  async sendEmail(emailMessageOptions): Promise<void> {
    console.log(
      configuration().smtp.SMTP_HOST,
      configuration().smtp.SMTP_PORT,
      configuration().smtp.SMTP_EMAIL,
      configuration().smtp.SMTP_PASSWORD,
    );
    console.log(emailMessageOptions);
    const message = {
      from: `${configuration().smtp.FROM_NAME} <${
        configuration().smtp.FROM_EMAIL
      }>`,
      to: emailMessageOptions.email,
      subject: emailMessageOptions.subject,

      html: `<html> ${emailMessageOptions.html}</html>`,
      //   attachments: emailMessageOptions.attachments,
    };
    try {
      const res = await this.transporter.sendMail(message);
      console.log('Email result', res);
    } catch (error) {
      console.log('SMTP ERROR: ', error);
      throw new HttpException(
        'Email Service Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
