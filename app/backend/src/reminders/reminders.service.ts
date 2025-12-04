import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminder.entity';

@Injectable()
export class RemindersService {
    constructor(
        @InjectRepository(Reminder)
        private remindersRepository: Repository<Reminder>,
    ) { }

    create(createReminderDto: any) {
        return this.remindersRepository.save(createReminderDto);
    }

    findAll() {
        return this.remindersRepository.find();
    }

    // Stub for checking reminders
    async checkReminders() {
        console.log('Checking reminders...');
        // Logic to find items due soon and create notifications
    }
}
