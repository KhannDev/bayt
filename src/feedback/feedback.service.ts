import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const createdFeedback = await this.feedbackModel.create(createFeedbackDto);
    return createdFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel
      .findOne({ _id: id, isActive: true })
      .exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async findByAppointment(appointmentId: string): Promise<Feedback[]> {
    return this.feedbackModel.find({ appointmentId, isActive: true }).exec();
  }

  async update(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    const updatedFeedback = await this.feedbackModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { $set: updateFeedbackDto },
        { new: true },
      )
      .exec();
    if (!updatedFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return updatedFeedback;
  }

  async remove(id: string): Promise<Feedback> {
    const deletedFeedback = await this.feedbackModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
    if (!deletedFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return deletedFeedback;
  }
}
