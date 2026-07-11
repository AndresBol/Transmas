import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ImageUploadResponse } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/images`;

  upload(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getImageUrl(imageName?: string | null): string {
    const resolvedName = imageName?.trim() || 'image-not-found.svg';
    return `${environment.imageUrl}/${encodeURIComponent(resolvedName)}`;
  }

  list() {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/files`);
  }
}
