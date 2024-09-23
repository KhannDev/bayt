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
  async createAccessToken(email: string): Promise<string> {
    return jwt.sign({ email }, configuration().jwtsecret, {
      expiresIn: '10d', // Access token expires in 2 hours
    });
  }

  // Validate and Decode Access Token
  async decodeAccessToken(token: string): Promise<string> {
    try {
      const data: any = jwt.verify(token, configuration().jwtsecret);
      return data.email;
    } catch (e) {
      throw new HttpException('Invalid Access Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
