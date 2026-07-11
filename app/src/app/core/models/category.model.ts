export interface Category {
  id: number;
  name: string;
  description: string;
  isAvailable: boolean;
  isActive?: boolean;
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface CategoryCreateDto {
  name: string;
  description: string;
  isAvailable: boolean;
}

export type CategoryUpdateDto = Partial<CategoryCreateDto>;
