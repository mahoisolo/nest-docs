import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  parentCategoryId?: string;
}
