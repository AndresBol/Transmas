import { District } from './district.model';
import { ProfessionalProfile } from './professional-profile.model';
import { Status } from './status.model';
import { Modality, TransportationService } from './transportation-service.model';
import { User } from './user.model';

export interface Reservation {
  id: number;
  description: string;
  pickupLatitude: number | string;
  pickupLongitude: number | string;
  pickupAddress: string;
  dropoffLatitude: number | string;
  dropoffLongitude: number | string;
  dropoffAddress: string;
  passengerCount: number;
  startDate: string;
  endDate: string;
  modality: Modality;
  clientId: number;
  professionalProfileId?: number;
  transportationServiceId: number;
  pickupDistrictId: number;
  dropoffDistrictId: number;
  statusId: number;
  isActive: boolean;
  createdOn?: string;
  client: User;
  professionalProfile?: ProfessionalProfile;
  transportationService: TransportationService;
  pickupDistrict: District;
  dropoffDistrict: District;
  status: Status;
}

export interface ReservationFormModel {
  clientId: number | null;
  professionalProfileId: number | null;
  transportationServiceId: number | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  modality: Modality;
  description: string;
  passengerCount: number;
  pickupAddress: string;
  pickupDistrictId: number | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  dropoffAddress: string;
  dropoffDistrictId: number | null;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
}

export interface ReservationCreateDto {
  clientId: number;
  professionalProfileId: number;
  transportationServiceId: number;
  startDate: string;
  endDate: string;
  modality: Modality;
  description: string;
  passengerCount: number;
  pickupAddress: string;
  pickupDistrictId: number;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffDistrictId: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
}
