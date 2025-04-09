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
    console.log(createCategoryDto);
    const category = new this.categoryModel(createCategoryDto);
    return await category.save();
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<{ categories: Category[]; total: number }> {
    let skip;
    if (page && limit) {
      skip = (page - 1) * limit;
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find()
        .populate({
          path: 'serviceIds',
          populate: {
            path: 'subServiceIds',
          },
        })
        .populate('createdBy')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(),
    ]);

    return { categories, total };
  }

  // Get a single category by ID
  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(id)
      .populate({
        path: 'serviceIds',
        match: { status: 'Accepted', isDisabled: false }, // Filter services with status "Accepted"
        populate: {
          path: 'subServiceIds', // Populating subservices
          model: 'SubService',
          populate: {
            path: 'subservice', // Populate another field inside Subservice
            model: 'Allservices', // Change to the actual model name
          },
        },
      })
      .exec();

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
