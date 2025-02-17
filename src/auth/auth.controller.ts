import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

import { response, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/auth.dto';
import configuration from 'src/common/configuration';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/customer')
  async customerLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginDto;
    const token = await this.authService.login(email, password);
    if (token) {
      response.cookie('x-access-token', token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      });
      return { token };
    }
  }

  @Post('login/partner')
  async partnerLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginDto;
    const token = await this.authService.partnerLogin(email, password);
    if (token) {
      response.cookie('x-access-token', token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      });
      return { token };
    }
  }

  @Post('login/admin')
  async adminLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginDto;
    const data = await this.authService.adminLogin(email, password);

    console.log('data', data);

    console.log(configuration().node_env === 'production');
    if (data) {
      response.cookie('x-access-token', data.token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      });
      return { data };
    }
  }
}
