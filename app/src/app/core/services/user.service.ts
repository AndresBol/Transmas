import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api-response.model';
import { User, UserStatusDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  list() {
    return this.http.get<ApiListResponse<User>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, isBlocked: boolean) {
    const body: UserStatusDto = { isBlocked };
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/status`, body);
  }

  fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }
}
