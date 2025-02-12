// src/admin/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin, AdminDocument } from './schema/admin.schema';
import { HashingService } from 'src/utils/hashing/hashing';
import { UpdateAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private hashingService: HashingService,
  ) {}

  async createAdmin(
    email: string,
    password: string,
    name: string,
    adminRole: string,
  ): Promise<Admin> {
    const hashedPassword = await this.hashingService.toHash(password);
    const admin = new this.adminModel({
      email,
      password: hashedPassword,
      name,
      adminRole: new Types.ObjectId(adminRole),
    });
    return admin.save();
  }

  async findAdminWithEmail(email: string): Promise<Admin | null> {
    console.log('email', email);

    const response = await this.adminModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }, // Case-insensitive match
    });

    console.log(response);
    return response;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return this.adminModel.find().populate('adminRole').exec();
  }

  async getAdminById(id: string): Promise<Admin> {
    const admin = await this.adminModel
      .findById(id)
      .populate('adminRole')
      .exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    const deleted = await this.adminModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Admin not found');
    return { message: 'Admin deleted successfully' };
  }

  async updateAdmin(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    console.log('latest', updateAdminDto);

    Object.assign(admin, updateAdminDto);

    // Ensure password is hashed before saving (implement hashing logic)
    if (updateAdminDto.password) {
      admin.password = await this.hashingService.toHash(
        updateAdminDto.password,
      ); // Hash it before saving
    }

    console.log('new', admin);

    await admin.save();
    return admin;
  }

  // Additional methods like findAdmin, updateAdmin can be added here
}
