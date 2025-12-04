import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item } from './item.entity';
import { ItemHistory } from './item-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Item, ItemHistory])],
    providers: [ItemsService],
    controllers: [ItemsController],
    exports: [ItemsService],
})
export class ItemsModule { }
