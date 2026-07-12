import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { District } from '../models/district.model';

@Injectable({ providedIn: 'root' })
export class DistrictService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/districts`;

  list() {
    return this.http.get<ApiResponse<District[]>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<District>>(`${this.apiUrl}/${id}`);
  }
}
