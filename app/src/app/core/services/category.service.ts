import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, CategoryCreateDto, CategoryUpdateDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  list() {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`);
  }

  create(data: CategoryCreateDto) {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, data);
  }

  update(id: number, data: CategoryUpdateDto) {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, data);
  }

  updateAvailability(id: number, isAvailable: boolean) {
    return this.http.patch<ApiResponse<Category>>(`${this.apiUrl}/${id}/availability`, {
      isAvailable,
    });
  }
}
