import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  content?: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: true,
  })
  parentCategory?: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subcategories: Category[];
}
