// src/admin/admin.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schema/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async createAdmin(
    email: string,
    password: string,
    name: string,
  ): Promise<Admin> {
    const admin = new this.adminModel({ email, password, name });
    return admin.save();
  }

  async findAdminWithEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({
      where: {
        email: email, // No case-insensitivity here
      },
    });
  }

  // Additional methods like findAdmin, updateAdmin can be added here
}
