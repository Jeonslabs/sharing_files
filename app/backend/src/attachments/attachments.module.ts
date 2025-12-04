import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { Attachment } from './attachment.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attachment]),
        ConfigModule,
    ],
    providers: [AttachmentsService],
    controllers: [AttachmentsController],
})
export class AttachmentsModule { }
