import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async onModuleInit() {
        await this.seedCategories();
    }

    async seedCategories() {
        const categories = ['보험', '임대차', '예금', '점검'];
        for (const name of categories) {
            const exists = await this.categoriesRepository.findOne({ where: { name } });
            if (!exists) {
                await this.categoriesRepository.save({ name });
            }
        }
        console.log('Categories seeded');
    }

    findAll() {
        return this.categoriesRepository.find();
    }

    findOne(id: number) {
        return this.categoriesRepository.findOne({ where: { id } });
    }

    async create(createCategoryDto: { name: string; description?: string; color_code?: string; fields?: any }) {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async remove(id: number) {
        await this.categoriesRepository.delete(id);
    }

    async update(id: number, updateCategoryDto: any) {
        await this.categoriesRepository.update(id, updateCategoryDto);
        return this.findOne(id);
    }
}
