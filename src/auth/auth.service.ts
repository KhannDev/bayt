import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminDocument } from 'src/admin/schema/admin.schema';
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
    @InjectModel('Admin')
    private readonly adminModel: Model<AdminDocument>,
    private readonly hashingService: HashingService,
    private readonly authService: JWTService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    // Fetch the user from the database
    const user = await this.CustomerModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
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

  async adminLogin(email: string, password: string) {
    // Fetch the user from the database
    const admin = await this.adminModel
      .findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') },
      })
      .populate({
        path: 'adminRole',
        model: 'AdminRole',
        populate: {
          path: 'permissions',
        },
      });
    if (!admin) {
      throw new UnauthorizedException('Invalid Email');
    }

    // Compare passwords
    const isMatch = await this.hashingService.compare(admin.password, password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.createAccessToken(
      admin.email,
      'admin',
    );

    return { token: token, role: admin.adminRole };
  }

  async partnerLogin(email: string, password: string): Promise<string> {
    // Fetch the user from the database
    const partner = await this.partnerModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
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

      if (partner.status === 'Accepted') {
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
