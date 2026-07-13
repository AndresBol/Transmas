import { TestBed } from '@angular/core/testing';
import { UserService } from '../../../core/services/user.service';
import { ReservationForm } from './reservation-form';

describe('ReservationForm', () => {
  const userService = {
    fullName: (user: { firstName: string; lastName: string }) =>
      `${user.firstName} ${user.lastName}`.trim(),
  };

  it('creates the form', async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationForm],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();
    expect(TestBed.createComponent(ReservationForm).componentInstance).toBeTruthy();
  });
});
