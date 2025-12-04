import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    @Post()
    create(@Body() createReminderDto: any) {
        return this.remindersService.create(createReminderDto);
    }

    @Get()
    findAll() {
        return this.remindersService.findAll();
    }
}
