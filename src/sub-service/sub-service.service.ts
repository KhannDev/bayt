import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubService, SubServiceDocument } from './schema/sub-service.schema';
import { CreateSubServiceDto } from './dto/sub-service.dto';
import { UpdateSubServiceDto } from './dto/sub-service.dto';

@Injectable()
export class SubServiceService {
  constructor(
    @InjectModel(SubService.name)
    private subServiceModel: Model<SubServiceDocument>,
  ) {}

  async createSubService(
    createSubServiceDTO: CreateSubServiceDto,
  ): Promise<SubService> {
    const newSubService = new this.subServiceModel(createSubServiceDTO);
    return await newSubService.save();
  }

  async getSubService(id: string): Promise<SubService> {
    const subService = await this.subServiceModel.findById(id).exec();
    if (!subService) {
      throw new NotFoundException(`SubService with ID ${id} not found`);
    }
    return subService;
  }

  async updateSubService(
    id: string,
    updateSubServiceDTO: UpdateSubServiceDto,
  ): Promise<SubService> {
    const updatedSubService = await this.subServiceModel
      .findByIdAndUpdate(id, updateSubServiceDTO, { new: true })
      .exec();
    if (!updatedSubService) {
      throw new NotFoundException(`SubService with ID ${id} not found`);
    }
    return updatedSubService;
  }

  async deleteSubService(id: string): Promise<void> {
    const result = await this.subServiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SubService with ID ${id} not found`);
    }
  }
  async createSubServices(
    subServices: Array<{ name: string; price: number }>,
  ): Promise<string[]> {
    const subServiceIds = [];

    for (const subServiceDto of subServices) {
      const newSubService = await new this.subServiceModel(subServiceDto);
      await newSubService.save();
      subServiceIds.push(newSubService._id);
    }

    return subServiceIds;
  }
}
