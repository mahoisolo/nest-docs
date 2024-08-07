import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsNumber()
  id?: string;

  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @IsOptional()
  parentCategoryId: string;
}
