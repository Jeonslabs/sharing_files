import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

export enum NotificationStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
}

@Entity('notification_logs')
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'item_id' })
    item_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column()
    channel: string;

    @CreateDateColumn()
    sent_at: Date;

    @Column({ type: 'enum', enum: NotificationStatus })
    status: NotificationStatus;

    @Column({ type: 'text', nullable: true })
    error_message: string;
}
