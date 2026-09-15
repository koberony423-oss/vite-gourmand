import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactMessage } from './contact-message.schema.js';
import type { CreateContactDto } from './dto/create-contact.dto.js';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly model: Model<ContactMessage>,
  ) {}

  create(dto: CreateContactDto) {
    return this.model.create(dto);
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async marquerTraite(id: string, traite: boolean) {
    const result = await this.model.findByIdAndUpdate(id, { traite }, { new: true });
    if (!result) throw new NotFoundException('Message introuvable');
    return result;
  }
}
