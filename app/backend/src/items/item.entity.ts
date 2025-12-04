import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';

export enum RepeatUnit {
    NONE = 'NONE',
    DAY = 'DAY',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

export enum ItemStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    CANCELED = 'CANCELED',
}

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id' })
    category_id: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: RepeatUnit, default: RepeatUnit.NONE })
    repeat_unit: RepeatUnit;

    @Column({ nullable: true })
    repeat_interval: number;

    @Column({ type: 'date', nullable: true })
    start_date: string;

    @Column({ type: 'date' })
    due_date: string;

    @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.PLANNED })
    status: ItemStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assignee_id' })
    assignee: User;

    @Column({ name: 'assignee_id', nullable: true })
    assignee_id: string;

    @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
    amount: number;

    @Column({ type: 'jsonb', nullable: true })
    extra_data: any;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by: User;

    @Column({ name: 'created_by' })
    created_by_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
