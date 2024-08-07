import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './modules/service/categories.service';
import { CategoriesController } from './modules/controller/categories.controller';
import { Category } from './entity/category.entity';
// import { Subcategory } from './entity/subcatagory.entity';
// import { Content } from './entity/content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
