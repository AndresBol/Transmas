import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReservationCreatePage } from './reservation-create-page';

describe('ReservationCreatePage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCreatePage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ReservationCreatePage).componentInstance).toBeTruthy();
  });
});
