import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../../entity/category.entity';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async createCategory(data: CreateCategoryDto): Promise<{
    id: string;
    name: string;
    content?: string;
    parentCategoryId?: string | null;
  }> {
    const category = new Category();
    category.name = data.name;
    category.content = data.content || null;

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
    } else {
      category.parentCategory = null;
    }

    const savedCategory = await this.categoriesRepository.save(category);

    return {
      id: savedCategory.id,
      name: savedCategory.name,
      content: savedCategory.content,
      parentCategoryId: savedCategory.parentCategory
        ? savedCategory.parentCategory.id
        : null,
    };
  }
  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
  ): Promise<{
    id: string;
    name: string;
    content?: string;
    parentCategoryId?: string | null;
  }> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parentCategory'],
    });

    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    // Update name and content if provided
    category.name = data.name;
    if (data.content !== undefined) {
      category.content = data.content;
    }

    // Update parent category if parentCategoryId is provided
    if (data.parentCategoryId !== undefined) {
      if (data.parentCategoryId === null) {
        category.parentCategory = null;
      } else {
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

    const savedCategory = await this.categoriesRepository.save(category);

    return {
      id: savedCategory.id,
      name: savedCategory.name,
      content: savedCategory.content,
      parentCategoryId: savedCategory.parentCategory?.id || null,
    };
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  async findSubcategoryContent(subcategoryId: string): Promise<{
    id: string;
    name: string;
    content?: string;
    parentId?: string;
  }> {
    const subcategory = await this.categoriesRepository.findOne({
      where: { id: subcategoryId },
      relations: ['parentCategory'],
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory #${subcategoryId} not found`);
    }

    return {
      id: subcategory.id,
      name: subcategory.name,
      content: subcategory.content,
      parentId: subcategory.parentCategory?.id || null,
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
      id: category.id,
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
