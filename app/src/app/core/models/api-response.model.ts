export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiPaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: ApiPaginationMeta;
}

export type ApiListResponse<T> = ApiPaginatedResponse<T>;
