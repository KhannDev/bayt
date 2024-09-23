// import {
//     CanActivate,
//     ExecutionContext,
//     HttpException,
//     HttpStatus,
//     Injectable,
//   } from '@nestjs/common';
//   import { Reflector } from '@nestjs/core';
//   import { Request } from 'express';
//   import { UserService } from '../../user/user.service';
//   import { JwtsService } from 'utils/jwt/jwt.service';

//   @Injectable()
//   export class UserAuthGuard implements CanActivate {
//     constructor(
//       private readonly jwt: JwtsService,
//       private readonly auth: UserService,
//       private readonly reflector: Reflector,
//     ) {}
//     async canActivate(context: ExecutionContext): Promise<boolean> {
//       const req: Request = context.switchToHttp().getRequest();
//       // console.log(req);

//       // console.log({ cookies: req.cookies, headers: req.headers });

//       if (!req.cookies) req.cookies = {};
//       if (!req.headers) req.headers = {};

//       const { 'x-access-token': accessTokenFromCookie } = req.cookies;

//       const { 'x-access-token': accessTokenFromHeader } = req.headers;
//       // console.log(accessTokenFromHeader);
//       if (!accessTokenFromCookie && !accessTokenFromHeader) {
//         return false;
//       }

//       try {
//         let accessToken: string;
//         // If the token is from cookie or header
//         if (accessTokenFromCookie) accessToken = accessTokenFromCookie;
//         else if (accessTokenFromHeader)
//           accessToken = String(accessTokenFromHeader);

//         const userEmail = await this.jwt.decodeAccessToken(accessToken);

//         if (!userEmail) {
//           throw new HttpException(
//             'Invalid Access token',
//             HttpStatus.UNAUTHORIZED,
//           );
//         }

//         const user = await this.auth.findUserwithEmail(userEmail);

//         if (!user)
//           throw new HttpException('No Such Users', HttpStatus.BAD_REQUEST);
//         // @ts-ignore
//         req.user = user;
//         return true;
//       } catch (e) {
//         console.log(e.message);
//         if (e.message == 'jwt expired')
//           throw new HttpException(
//             'Invalid Access Token',
//             HttpStatus.UNAUTHORIZED,
//           );
//         return false;
//       }
//     }
//   }
