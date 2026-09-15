import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service.js';
import { ContactController } from './contact.controller.js';
import { ContactMessage, ContactMessageSchema } from './contact-message.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
