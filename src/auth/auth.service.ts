import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Customer,
  CustomerDocument,
} from 'src/customer/schema/customer.schema';
import { PartnerDocument } from 'src/partner/schema/partner.schema';
import { HashingService } from 'src/utils/hashing/hashing';
import { JWTService } from 'src/utils/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Customer.name)
    private readonly CustomerModel: Model<CustomerDocument>,
    @InjectModel('Partner')
    private readonly partnerModel: Model<PartnerDocument>,
    private readonly hashingService: HashingService,
    private readonly authService: JWTService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    // Fetch the user from the database
    const user = await this.CustomerModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    // Compare passwords
    const isMatch = await this.hashingService.compare(user.password, password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isAllowed) {
      const token = await this.authService.createAccessToken(
        user.email,
        'customer',
      );

      return token;
    } else {
      throw new UnauthorizedException('Verify Account ');
    }

    // Generate JWT token
  }

  async partnerLogin(email: string, password: string): Promise<string> {
    // Fetch the user from the database
    const partner = await this.partnerModel.findOne({ email });
    if (!partner) {
      throw new UnauthorizedException('Invalid Email');
    }

    // Compare passwords
    const isMatch = await this.hashingService.compare(
      partner.password,
      password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (partner.isAllowed) {
      const token = await this.authService.createAccessToken(
        partner.email,
        'partner',
      );

      if (partner.isVerified) {
        return token;
      } else {
        throw new HttpException(
          'Account is under Verification',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    } else {
      throw new UnauthorizedException('OTP Verification Incomplete');
    }
  }
}
