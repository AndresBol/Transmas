import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api-response.model';
import { Reservation, ReservationCreateDto } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  list() {
    return this.http.get<ApiListResponse<Reservation>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`);
  }

  create(data: ReservationCreateDto) {
    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, data);
  }
}
