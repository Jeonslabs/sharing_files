import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

@Entity('attachments')
export class Attachment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'item_id' })
    item_id: string;

    @Column()
    file_name: string;

    @Column()
    file_path: string;

    @Column({ type: 'bigint' })
    file_size: number;

    @Column()
    mime_type: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploaded_by' })
    uploaded_by: User;

    @Column({ name: 'uploaded_by' })
    uploaded_by_id: string;

    @CreateDateColumn()
    uploaded_at: Date;
}
