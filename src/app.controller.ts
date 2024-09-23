import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users') // This groups the API under 'Users'
@Controller('users')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get all users' }) // Adds description to the API endpoint
  getAllUsers() {
    return ['user1', 'user2'];
  }
}
