import { District } from './district.model';
import { Specialty } from './specialty.model';
import type { Modality } from './transportation-service.model';
import { User } from './user.model';

export type { Modality } from './transportation-service.model';

export interface ProfessionalProfileSpecialty {
  professionalProfileId?: number;
  specialtyId: number;
  isActive?: boolean;
  specialty: Specialty;
}

export interface ProfessionalProfile {
  id: number;
  professionalTitle: string;
  description: string;
  experienceYears: number;
  modality: Modality;
  baseRate: number | string;
  isAvailable: boolean;
  isActive?: boolean;
  profilePictureUrl: string;
  professionalId: number;
  districtId: number;
  professional?: User;
  district?: District;
  specialties?: ProfessionalProfileSpecialty[];
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface ProfessionalFormModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  professionalTitle: string;
  description: string;
  experienceYears: number;
  modality: Modality | null;
  districtId: number | null;
  baseRate: number;
  isAvailable: boolean;
  profilePictureUrl: string;
  specialtyIds: number[];
}

export interface ProfessionalCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  professionalTitle: string;
  description: string;
  experienceYears: number;
  modality: Modality;
  districtId: number;
  baseRate: number;
  isAvailable: boolean;
  profilePictureUrl: string;
  specialtyIds: number[];
}

export type ProfessionalUpdateDto = Omit<ProfessionalCreateDto, 'password'>;
