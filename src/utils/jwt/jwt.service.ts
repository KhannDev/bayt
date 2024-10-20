import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import configuration from '../../common/configuration';

@Injectable()
export class JWTService {
  constructor() {}

  // Create Access Token
  async createAccessToken(email: string, role: string) {
    return jwt.sign({ email, role }, configuration().jwtsecret, {
      expiresIn: '30d',
    });
  }

  // Validate and Decode Access Token
  async decodeAccessToken(token: string) {
    console.log('token', token);
    try {
      const data: any = jwt.verify(token, configuration().jwtsecret);
      console.log('JWT ', data);
      return data;
    } catch (e) {
      throw new HttpException('Invalid Access Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
