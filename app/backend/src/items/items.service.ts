import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Item, ItemStatus } from './item.entity';
import { ItemHistory } from './item-history.entity';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
        @InjectRepository(ItemHistory)
        private historyRepository: Repository<ItemHistory>,
    ) { }

    async create(createItemDto: any, userId: string) {
        const item = this.itemsRepository.create({
            ...createItemDto,
            created_by_id: userId,
        });
        return this.itemsRepository.save(item);
    }

    async findAll(query: any) {
        const where: any = {};

        if (query.category_id) where.category_id = query.category_id;
        if (query.status) where.status = query.status;
        if (query.assignee_id) where.assignee_id = query.assignee_id;

        if (query.from_date && query.to_date) {
            where.due_date = Between(query.from_date, query.to_date);
        }

        return this.itemsRepository.find({
            where,
            relations: ['category', 'assignee'],
            order: { due_date: 'ASC' },
        });
    }

    async findOne(id: string) {
        return this.itemsRepository.findOne({
            where: { id },
            relations: ['category', 'assignee'],
        });
    }

    async update(id: string, updateItemDto: any, userId: string) {
        await this.itemsRepository.update(id, updateItemDto);
        const after = await this.findOne(id);

        if (after) {
            const history = this.historyRepository.create({
                item_id: after.id,
                amount: after.amount,
                status: after.status,
                due_date: after.due_date,
                extra_data: after.extra_data,
                assignee_id: after.assignee_id,
                changed_by_id: userId,
            });
            await this.historyRepository.save(history);
        }

        return after;
    }

    async remove(id: string) {
        await this.itemsRepository.softDelete(id);
    }

    async getHistory(itemId: string) {
        return this.historyRepository.find({
            where: { item_id: itemId },
            order: { snapshot_at: 'DESC' },
        });
    }

    async renew(
        id: string,
        dto: { due_date: string; assignee_id?: string | null; reason?: string },
        userId: string,
    ) {
        const item = await this.itemsRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException('Item not found');
        }

        item.due_date = dto.due_date;
        if (dto.assignee_id !== undefined) {
            // 빈 문자열이면 담당자 해제
            item.assignee_id = dto.assignee_id || null;
        }

        await this.itemsRepository.save(item);

        const history = this.historyRepository.create({
            item_id: item.id,
            amount: item.amount,
            status: item.status,
            due_date: item.due_date,
            extra_data: item.extra_data,
            assignee_id: item.assignee_id,
            reason: dto.reason || null,
            changed_by_id: userId,
        });
        await this.historyRepository.save(history);

        return item;
    }
}
