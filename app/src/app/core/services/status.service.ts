import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api-response.model';
import { Status } from '../models/status.model';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/status`;

  list() {
    return this.http.get<ApiListResponse<Status>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Status>>(`${this.apiUrl}/${id}`);
  }
}
