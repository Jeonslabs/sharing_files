import { Body, Controller, Get, Post, Patch, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    async create(
        @Body()
        body: {
            username: string;
            email?: string;
            password?: string;
            role?: UserRole;
        },
    ) {
        if (!body.username) {
            throw new BadRequestException('username is required');
        }
        return this.usersService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: Partial<{ email: string; is_active: boolean }>) {
        return this.usersService.update(id, body);
    }
}




