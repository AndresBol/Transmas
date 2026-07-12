import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updates access with isBlocked without changing the soft-delete flag', () => {
    const user: User = {
      id: 7,
      firstName: 'Ana',
      lastName: 'Solis',
      email: 'ana@example.com',
      phoneNumber: '8888-7777',
      role: 'CLIENT',
      isBlocked: false,
      isActive: true,
    };

    service.updateStatus(user.id, true).subscribe((response) => {
      expect(response.data.isBlocked).toBe(true);
      expect(response.data.isActive).toBe(true);
    });

    const request = http.expectOne(`${environment.apiUrl}/users/${user.id}/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ isBlocked: true });
    request.flush({ success: true, data: { ...user, isBlocked: true } });
  });
});
