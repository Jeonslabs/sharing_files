import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    create(@Body() createCategoryDto: any) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: any) {
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
