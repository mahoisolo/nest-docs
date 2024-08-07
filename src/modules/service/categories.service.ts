import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../../entity/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async createOrUpdateCategoryOrSubcategory(data: {
    id?: string;
    name: string;
    content?: string;
    parentCategoryId?: string;
  }): Promise<Category> {
    let category: Category;

    if (data.id) {
      category = await this.categoriesRepository.findOne({
        where: { id: data.id },
        relations: ['subcategories'],
      });

      if (!category) {
        throw new NotFoundException(`Category #${data.id} not found`);
      }

      category.name = data.name;

      if (data.content) {
        category.content = data.content;
      }

      if (data.parentCategoryId) {
        const parentCategory = await this.categoriesRepository.findOne({
          where: { id: data.parentCategoryId },
        });
        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category #${data.parentCategoryId} not found`,
          );
        }
        category.parentCategory = parentCategory;
      }
    } else {
      category = new Category();
      category.name = data.name;

      if (data.content) {
        category.content = data.content;
      }

      if (data.parentCategoryId) {
        const parentCategory = await this.categoriesRepository.findOne({
          where: { id: data.parentCategoryId },
        });
        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category #${data.parentCategoryId} not found`,
          );
        }
        category.parentCategory = parentCategory;
      }
    }

    return await this.categoriesRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: ['subcategories'],
    });
  }

  async findSubcategoryContent(
    subcategoryId: string,
  ): Promise<{ name: string; content?: string }> {
    const subcategory = await this.categoriesRepository.findOne({
      where: { id: subcategoryId },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory #${subcategoryId} not found`);
    }

    return {
      name: subcategory.name,
      content: subcategory.content,
    };
  }

  async getCategoryTree(): Promise<any> {
    const categories = await this.categoriesRepository.find({
      where: { parentCategory: IsNull() },
      relations: ['subcategories'],
    });
    const tree = categories.map((category) => this.buildCategoryTree(category));
    return tree;
  }

  private buildCategoryTree(category: Category): any {
    return {
      // id: category.id,
      name: category.name,
      // content: category.content,
      subcategories: (category.subcategories || []).map((subcategory) =>
        this.buildCategoryTree(subcategory),
      ),
    };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category #${categoryId} not found`);
    }

    if (category.subcategories && category.subcategories.length > 0) {
      for (const subcategory of category.subcategories) {
        await this.deleteCategory(subcategory.id);
      }
    }

    await this.categoriesRepository.remove(category);
  }


}
