import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type CategoryFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface CategoryFieldConfig {
    key: string;
    label: string;
    type: CategoryFieldType;
    required: boolean;
    options?: string[];
}

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true, default: '#3B82F6' })
    color_code: string;

    @Column({ type: 'jsonb', nullable: true })
    fields: CategoryFieldConfig[];
}
