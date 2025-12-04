import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, UseGuards, Request, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

@Controller()
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('items/:id/attachments')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const basePath = process.env.FILES_BASE_PATH || './uploads';
                const year = new Date().getFullYear().toString();
                const uploadPath = join(basePath, 'contracts', year);
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@Param('id') itemId: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
        return this.attachmentsService.create(file, itemId, req.user.userId);
    }

    @Get('items/:id/attachments')
    findAll(@Param('id') itemId: string) {
        return this.attachmentsService.findAllByItem(itemId);
    }

    @Get('attachments/:id/download')
    async downloadFile(@Param('id') id: string, @Res() res: Response) {
        const attachment = await this.attachmentsService.findOne(id);
        if (!attachment) {
            throw new NotFoundException('File not found');
        }
        const filePath = this.attachmentsService.getFilePath(attachment);
        res.download(filePath, attachment.file_name);
    }
}
