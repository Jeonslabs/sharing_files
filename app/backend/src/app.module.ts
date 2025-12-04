import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { RemindersModule } from './reminders/reminders.module';
import { StatusHistoryModule } from './status-history/status-history.module';
import { NotificationLogsModule } from './notification-logs/notification-logs.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                autoLoadEntities: true,
                synchronize: true, // Set to false in production
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        CategoriesModule,
        ItemsModule,
        AttachmentsModule,
        RemindersModule,
        StatusHistoryModule,
        NotificationLogsModule,
    ],
})
export class AppModule { }
