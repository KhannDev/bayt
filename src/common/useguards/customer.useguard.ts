import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CustomerService } from '../../customer/customer.service';
import { JWTService } from '../../utils/jwt/jwt.service';
import { CustomRequest } from '../interfaces/interface';
import { AuthService } from 'src/auth/auth.service';
import { PartnerService } from 'src/partner/partner.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JWTService,
    private readonly customer: CustomerService,
    @Inject(forwardRef(() => PartnerService))
    private readonly partner: PartnerService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    if (!req.cookies) req.cookies = {};
    if (!req.headers) req.headers = {};

    const { 'x-access-token': accessTokenFromCookie } = req.cookies;

    const { 'x-access-token': accessTokenFromHeader } = req.headers;

    if (!accessTokenFromCookie && !accessTokenFromHeader) {
      return false;
    }

    try {
      // Validate the token and extract the payload

      let accessToken = accessTokenFromCookie
        ? accessTokenFromCookie
        : accessTokenFromHeader;

      const payload = await this.jwt.decodeAccessToken(accessToken);

      // payload.role = 'partner';
      // Check if the user is a customer or partner and attach to request
      if (payload.role === 'customer') {
        const customer = await this.customer.validateCustomer(payload.email);
        req.customer = customer;
      } else if (payload.role === 'partner') {
        const partner = await this.partner.validatePartner(payload.email);

        req.partner = partner;
      } else {
        throw new UnauthorizedException('Invalid user role');
      }

      return true;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        'Invalid or unauthorized access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
