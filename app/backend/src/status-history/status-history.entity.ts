import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

@Entity('status_history')
export class StatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'item_id' })
    item_id: string;

    @Column({ nullable: true })
    old_status: string;

    @Column()
    new_status: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changed_by: User;

    @Column({ name: 'changed_by' })
    changed_by_id: string;

    @CreateDateColumn()
    changed_at: Date;

    @Column({ type: 'text', nullable: true })
    note: string;
}
