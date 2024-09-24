import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { PartnerModule } from './partner/partner.module';
import { CustomerModule } from './customer/customer.module';

import configuration from './common/configuration';
import { EmailOtpModule } from './email-otp/email-otp.module';
import { JWTService } from './utils/jwt/jwt.service';
import { HashingService } from './utils/hashing/hashing';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV == 'development' ? '.dev.env' : '.prod.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        uri: configuration().databaseURI,
        // tlsCAFile: './global-bundle.pem',
      }),
    }),
    AuthModule,
    CustomerModule,
    PartnerModule,
    EmailOtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
