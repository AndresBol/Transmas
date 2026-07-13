import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReservationDetail } from './reservation-detail';

describe('ReservationDetail', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationDetail],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ReservationDetail).componentInstance).toBeTruthy();
  });
});
