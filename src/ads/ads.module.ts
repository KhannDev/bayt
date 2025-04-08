import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Ads, AdsSchema } from './schemas/ads.schema';
import { AuthModule } from '../auth/auth.module';
import e from 'express';
import { HashingService } from 'src/utils/hashing/hashing';
import { JWTService } from 'src/utils/jwt/jwt.service';
import { Admin } from 'src/admin/schema/admin.schema';
import { AdminService } from 'src/admin/admin.service';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }]),
    AdminModule,
  ],

  controllers: [AdsController],
  providers: [AdsService, HashingService, JWTService],
  exports: [AdsService],
})
export class AdsModule {}
