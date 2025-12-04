import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusHistory } from './status-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StatusHistory])],
})
export class StatusHistoryModule { }
