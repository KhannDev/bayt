import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminService } from '../../admin/admin.service';
import { JWTService } from '../../utils/jwt/jwt.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JWTService,
    private readonly auth: AdminService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    // console.log(req);

    // console.log({ cookies: req.cookies, headers: req.headers });

    if (!req.cookies) req.cookies = {};
    //   if (!req.headers) req.headers = {};

    const { 'x-access-token': accessTokenFromCookie } = req.cookies;

    const { 'x-access-token': accessTokenFromHeader } = req.headers;
    // console.log(accessTokenFromHeader);
    if (!accessTokenFromCookie && !accessTokenFromHeader) {
      return false;
    }

    try {
      let accessToken: string;
      // If the token is from cookie or header
      if (accessTokenFromCookie) accessToken = accessTokenFromCookie;
      else if (accessTokenFromHeader)
        accessToken = String(accessTokenFromHeader);

      const admin = await this.jwt.decodeAccessToken(accessToken);

      if (!admin.email) {
        throw new HttpException(
          'Invalid Access token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const adminInfo = await this.auth.findAdminWithEmail(admin.email);

      if (!admin)
        throw new HttpException('No Such Users', HttpStatus.BAD_REQUEST);
      // @ts-ignore
      req.admin = admin;

      return true;
    } catch (e) {
      console.log(e.message);
      if (e.message == 'jwt expired')
        throw new HttpException(
          'Invalid Access Token',
          HttpStatus.UNAUTHORIZED,
        );
      return false;
    }
  }
}
