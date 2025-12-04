import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Post()
    create(@Body() createItemDto: any, @Request() req) {
        return this.itemsService.create(createItemDto, req.user.userId);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.itemsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateItemDto: any, @Request() req) {
        return this.itemsService.update(id, updateItemDto, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemsService.remove(id);
    }

    @Get(':id/histories')
    getHistory(@Param('id') id: string) {
        return this.itemsService.getHistory(id);
    }

    @Post(':id/renew')
    renew(
        @Param('id') id: string,
        @Body() body: { due_date: string; assignee_id?: string | null; reason?: string },
        @Request() req,
    ) {
        return this.itemsService.renew(id, body, req.user.userId);
    }
}
