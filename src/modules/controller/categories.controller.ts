import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '../service/categories.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upsertCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createOrUpdateCategoryOrSubcategory(
      createCategoryDto,
    );
  }

  @Get('all')
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Get()
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get('/content/:id')
  async findSubcategoryContent(@Param('id') id: string) {
      return  this.categoriesService.findSubcategoryContent(id);
    }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.categoriesService.deleteCategory(id);
    } catch (e) {
      throw new BadRequestException('Invalid ID format or not found');
    }
  }

}