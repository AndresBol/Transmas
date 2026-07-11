import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ProfessionalCreateDto,
  ProfessionalProfile,
  ProfessionalUpdateDto,
} from '../models/professional-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfessionalProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/professionalProfiles`;

  list() {
    return this.http.get<ApiResponse<ProfessionalProfile[]>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<ProfessionalProfile>>(`${this.apiUrl}/${id}`);
  }

  create(data: ProfessionalCreateDto) {
    return this.http.post<ApiResponse<ProfessionalProfile>>(this.apiUrl, data);
  }

  update(id: number, data: ProfessionalUpdateDto) {
    return this.http.put<ApiResponse<ProfessionalProfile>>(`${this.apiUrl}/${id}`, data);
  }

  updateAvailability(id: number, isAvailable: boolean) {
    return this.http.patch<ApiResponse<ProfessionalProfile>>(
      `${this.apiUrl}/${id}/availability`,
      { isAvailable },
    );
  }
}
