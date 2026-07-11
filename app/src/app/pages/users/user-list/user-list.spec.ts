import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { UserList } from './user-list';

describe('UserList', () => {
  const user: User = {
    id: 3,
    firstName: 'Luis',
    lastName: 'Mora',
    email: 'luis@example.com',
    phoneNumber: '8888-3333',
    role: 'PROFESSIONAL',
    isBlocked: false,
    isActive: true,
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            list: () => of({ success: true, data: [user] }),
          },
        },
        { provide: NotificationService, useValue: { success: () => undefined } },
      ],
    }).compileComponents();
  });

  it('creates the page', () => {
    expect(TestBed.createComponent(UserList).componentInstance).toBeTruthy();
  });

  it('derives Active and Inactive labels from isBlocked while isActive remains true', () => {
    const fixture = TestBed.createComponent(UserList);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('td.mat-column-status').textContent).toContain('Active');
    expect(fixture.nativeElement.querySelector('td.mat-column-actions').textContent).toContain('Deactivate');

    fixture.componentInstance.users.set([{ ...user, isBlocked: true }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.users()[0].isActive).toBe(true);
    expect(fixture.nativeElement.querySelector('td.mat-column-status').textContent).toContain('Inactive');
    expect(fixture.nativeElement.querySelector('td.mat-column-actions').textContent).toContain('Activate');
  });
});
