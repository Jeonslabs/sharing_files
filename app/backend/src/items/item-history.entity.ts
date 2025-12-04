import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { User } from '../users/user.entity';

@Entity('item_histories')
export class ItemHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'item_id' })
    item_id: string;

    @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
    amount: number;

    @Column({ type: 'text' })
    status: string;

    @Column({ type: 'date', nullable: true })
    due_date: string;

    @Column({ type: 'jsonb', nullable: true })
    extra_data: any;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignee_id' })
    assignee: User;

    @Column({ name: 'assignee_id', nullable: true })
    assignee_id: string | null;

    @Column({ type: 'text', nullable: true })
    reason: string | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changed_by: User;

    @Column({ name: 'changed_by', nullable: true })
    changed_by_id: string;

    @CreateDateColumn()
    snapshot_at: Date;
}



