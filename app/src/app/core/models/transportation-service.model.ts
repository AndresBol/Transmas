import { Category } from './category.model';
import { ProfessionalProfile } from './professional-profile.model';
import { Specialty } from './specialty.model';

export type Modality = 'IN_PERSON' | 'VIRTUAL';

export interface TransportationServiceSpecialty {
  transportationServiceId?: number;
  specialtyId: number;
  isActive?: boolean;
  specialty: Specialty;
}

export interface TransportationService {
  id: number;
  name: string;
  description: string;
  price: number | string;
  estimatedDuration: number;
  modality: Modality;
  isAvailable: boolean;
  isActive?: boolean;
  professionalProfileId: number;
  categoryId: number;
  professionalProfile?: ProfessionalProfile;
  category?: Category;
  specialties?: TransportationServiceSpecialty[];
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface TransportationServiceFormModel {
  professionalProfileId: number | null;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  estimatedDuration: number;
  modality: Modality | null;
  isAvailable: boolean;
  specialtyIds: number[];
}

export interface TransportationServiceCreateDto {
  professionalProfileId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  estimatedDuration: number;
  modality: Modality;
  isAvailable: boolean;
  specialtyIds: number[];
}

export type TransportationServiceUpdateDto = TransportationServiceCreateDto;
