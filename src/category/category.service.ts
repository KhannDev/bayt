import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schema/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  // Create a new category
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return await category.save();
  }

  // Get all categories
  async findAll(): Promise<Category[]> {
    return await this.categoryModel
      .find()
      .populate({
        path: 'serviceIds',
        populate: {
          path: 'subServiceIds',
        },
      })
      .exec();
  }

  // Get a single category by ID
  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(id)
      .populate({
        path: 'serviceIds',
        populate: {
          path: 'subServiceIds', // Adjust if your field name differs
          model: 'SubService', // Ensure 'SubService' matches the actual model name
        },
      })
      .exec();

    console.log(category);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  // Update a category by ID
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, {
        new: true,
      })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  // Delete a category by ID
  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
  async addServiceToCategory(categoryId: String, serviceId: string) {
    const category = await this.categoryModel.findById(categoryId);

    console.log('category', category);

    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    category.serviceIds.push(serviceId);
    await category.save();
  }
}
