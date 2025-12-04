import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from '../items/item.entity';

export enum ReminderChannel {
    EMAIL = 'EMAIL',
    WEB = 'WEB',
}

@Entity('reminders')
export class Reminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'item_id' })
    item_id: string;

    @Column()
    offset_days: number;

    @Column({ type: 'enum', enum: ReminderChannel, default: ReminderChannel.WEB })
    channel: ReminderChannel;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
