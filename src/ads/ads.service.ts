import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ads, AdsDocument } from './schemas/ads.schema';
import { CreateAdsDto } from './dto/create-ads.dto';

@Injectable()
export class AdsService {
  constructor(@InjectModel(Ads.name) private adsModel: Model<AdsDocument>) {}

  async create(createAdsDto: CreateAdsDto): Promise<Ads> {
    const createdAds = new this.adsModel(createAdsDto);
    return createdAds.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ads: Ads[]; total: number }> {
    const skip = (page - 1) * limit;
    const [ads, total] = await Promise.all([
      this.adsModel
        .find()
        .populate('createdBy', 'name')

        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.adsModel.countDocuments().exec(),
    ]);

    return { ads, total };
  }

  async findOne(id: string): Promise<Ads> {
    return this.adsModel
      .findById(id)
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .exec();
  }

  async update(id: string, updateAdsDto: CreateAdsDto): Promise<Ads> {
    return this.adsModel
      .findByIdAndUpdate(id, updateAdsDto, { new: true })
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .exec();
  }

  async remove(id: string): Promise<Ads> {
    return this.adsModel.findByIdAndDelete(id).exec();
  }
}
