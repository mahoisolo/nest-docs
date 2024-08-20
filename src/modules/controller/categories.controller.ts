import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Put,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '../service/categories.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  insertCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Get('/tree')
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get(':id')
  async findSubcategoryContent(@Param('id') id: string) {
    return this.categoriesService.findSubcategoryContent(id);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, data);
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