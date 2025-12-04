import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    async seedAdmin() {
        const admin = await this.usersRepository.findOne({ where: { username: 'admin' } });
        if (!admin) {
            const salt = await bcrypt.genSalt();
            const password_hash = await bcrypt.hash('1234', salt);
            const newAdmin = this.usersRepository.create({
                username: 'admin',
                password_hash,
                role: UserRole.ADMIN,
                email: 'admin@example.com',
            });
            await this.usersRepository.save(newAdmin);
            console.log('Admin user seeded');
        }
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async findById(id: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll() {
        return this.usersRepository.find({
            where: { is_active: true },
            order: { username: 'ASC' },
        });
    }

    async create(body: { username: string; email?: string; password?: string; role?: UserRole }) {
        const existing = await this.usersRepository.findOne({ where: { username: body.username } });
        if (existing) {
            throw new BadRequestException('이미 존재하는 사용자입니다.');
        }

        const salt = await bcrypt.genSalt();
        const password = body.password || '1234';
        const password_hash = await bcrypt.hash(password, salt);

        const user = this.usersRepository.create({
            username: body.username,
            email: body.email,
            role: body.role || UserRole.USER,
            password_hash,
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, body: Partial<{ email: string; is_active: boolean }>) {
        await this.usersRepository.update(id, body);
        return this.findById(id);
    }
}
