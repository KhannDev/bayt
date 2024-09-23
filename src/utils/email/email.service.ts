import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import configuration from 'src/common/configuration';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: 'email-smtp.ap-south-1.amazonaws.com',
      port: 465,
      auth: {
        user: 'AKIAXO4KKOIQAFU3NC2F',
        pass: 'BP9/TdrAx1TsOfBR7JCVf2IYXhp9IQKRMZ91F24/Orf8',
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
      console.log(res);
    } catch (error) {
      console.log('SMTP ERROR: ', error);
      throw new HttpException(
        'Email Service Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
