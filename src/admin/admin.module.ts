// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schema/admin.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HashingService } from 'src/utils/hashing/hashing';
import { JWTService } from 'src/utils/jwt/jwt.service';
import { CustomerModule } from 'src/customer/customer.module';
import { PartnerModule } from 'src/partner/partner.module';
import { ServiceModule } from 'src/service/service.module';
import { Category } from 'src/category/schema/category.schema';
import { CategoryModule } from 'src/category/category.module';
import { Allservices } from 'src/allservices/schema/allservices.schema';
import { AllservicesModule } from 'src/allservices/allservices.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    CustomerModule,
    PartnerModule,
    ServiceModule,
    CategoryModule,
    AllservicesModule,
  ],
  providers: [AdminService, HashingService, JWTService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
