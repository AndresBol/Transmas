import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Array<{ message?: string }>;
  validationErrors?: Array<{ field?: string; message?: string }>;
}

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as ApiErrorBody | undefined;
      const validationItems = body?.validationErrors ?? body?.errors ?? [];
      const validationMessage = validationItems.map((item) => item.message).filter(Boolean).join('. ');
      const defaults: Record<number, string> = {
        0: 'The server is unavailable. Verify that the API is running.',
        400: 'The request could not be processed.',
        401: 'Authentication is required.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        409: 'The request conflicts with an existing record.',
        422: 'Some submitted values are invalid.',
        500: 'The server encountered an unexpected error.',
        503: 'The service is temporarily unavailable.',
      };
      const message = validationMessage || body?.message || body?.error || defaults[error.status]
        || 'An unexpected error occurred.';

      notifications.error(message, error.status ? `Error ${error.status}` : 'Connection error');
      return throwError(() => error);
    }),
  );
};
