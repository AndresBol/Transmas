export interface Specialty {
  id: number;
  name: string;
  description: string;
  isAvailable: boolean;
  isActive?: boolean;
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface SpecialtyCreateDto {
  name: string;
  description: string;
  isAvailable: boolean;
}

export type SpecialtyUpdateDto = Partial<SpecialtyCreateDto>;
