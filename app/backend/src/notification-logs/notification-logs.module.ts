import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './notification-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationLog])],
})
export class NotificationLogsModule { }
