import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  TransportationService,
  TransportationServiceCreateDto,
  TransportationServiceUpdateDto,
} from '../models/transportation-service.model';

@Injectable({ providedIn: 'root' })
export class TransportationServiceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transportationServices`;

  list() {
    return this.http.get<ApiResponse<TransportationService[]>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<TransportationService>>(`${this.apiUrl}/${id}`);
  }

  create(data: TransportationServiceCreateDto) {
    return this.http.post<ApiResponse<TransportationService>>(this.apiUrl, data);
  }

  update(id: number, data: TransportationServiceUpdateDto) {
    return this.http.put<ApiResponse<TransportationService>>(`${this.apiUrl}/${id}`, data);
  }

  updateAvailability(id: number, isAvailable: boolean) {
    return this.http.patch<ApiResponse<TransportationService>>(
      `${this.apiUrl}/${id}/availability`,
      { isAvailable },
    );
  }
}
