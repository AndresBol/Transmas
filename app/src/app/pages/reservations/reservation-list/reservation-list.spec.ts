import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReservationList } from './reservation-list';

describe('ReservationList', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ReservationList], providers: [provideHttpClient(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ReservationList).componentInstance).toBeTruthy();
  });
});
