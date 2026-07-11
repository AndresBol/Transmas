import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Specialty, SpecialtyCreateDto, SpecialtyUpdateDto } from '../models/specialty.model';

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/specialties`;

  list() {
    return this.http.get<ApiResponse<Specialty[]>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Specialty>>(`${this.apiUrl}/${id}`);
  }

  create(data: SpecialtyCreateDto) {
    return this.http.post<ApiResponse<Specialty>>(this.apiUrl, data);
  }

  update(id: number, data: SpecialtyUpdateDto) {
    return this.http.put<ApiResponse<Specialty>>(`${this.apiUrl}/${id}`, data);
  }

  updateAvailability(id: number, isAvailable: boolean) {
    return this.http.patch<ApiResponse<Specialty>>(`${this.apiUrl}/${id}/availability`, {
      isAvailable,
    });
  }
}
