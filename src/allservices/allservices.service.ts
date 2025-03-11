import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Allservices, AllserviceDocument } from './schema/allservices.schema';
import { CreateSubserviceDto } from './dto/allservices.dto';
import { UpdateSubserviceDto } from './dto/allservices.dto';

@Injectable()
export class AllservicesService {
  constructor(
    @InjectModel(Allservices.name)
    private subserviceModel: Model<AllserviceDocument>,
  ) {}

  async create(createSubserviceDto: CreateSubserviceDto): Promise<Allservices> {
    const subservice = new this.subserviceModel(createSubserviceDto);
    return subservice.save();
  }

  async findAll(
    category?: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: Allservices[]; total: number }> {
    const query: any = {};
    if (category) {
      query.category = category;
    }
    const total = await this.subserviceModel.countDocuments(query).exec();
    const data = await this.subserviceModel
      .find(query)
      .populate('category', 'name')
      .populate('createdBy')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total };
  }

  async findOne(id: string): Promise<Allservices> {
    const subservice = await this.subserviceModel
      .findById(id)
      .populate('category', 'name')
      .exec();
    if (!subservice) {
      throw new NotFoundException(`Subservice with ID ${id} not found`);
    }
    return subservice;
  }

  async update(
    id: string,
    updateSubserviceDto: UpdateSubserviceDto,
  ): Promise<Allservices> {
    const updatedSubservice = await this.subserviceModel.findByIdAndUpdate(
      id,
      updateSubserviceDto,
      { new: true, runValidators: true },
    );
    if (!updatedSubservice) {
      throw new NotFoundException(`Subservice with ID ${id} not found`);
    }
    return updatedSubservice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.subserviceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Subservice with ID ${id} not found`);
    }
  }
}
